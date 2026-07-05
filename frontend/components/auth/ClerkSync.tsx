"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * ClerkSync: Syncs Clerk user data to the backend Neon DB on login.
 * No longer stores any tokens in localStorage — the Clerk JWT is used directly.
 */
export default function ClerkSync() {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        const syncUser = async () => {
            if (!isLoaded || !user) return;

            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
            const syncUrl = `${baseUrl.replace(/\/$/, "")}/auth/sync`;

            const payload = {
                clerk_id: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                full_name: user.fullName || user.username || "User",
            };

            try {
                const response = await fetch(syncUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errData = await response.text();
                    console.error("ClerkSync: backend sync failed:", errData);
                } else {
                    console.log("ClerkSync: user synced to Neon DB successfully.");
                }
            } catch (error) {
                console.error("ClerkSync: failed to sync user. Is the backend running?", error);
            }
        };

        syncUser();
    }, [user, isLoaded]);

    return null;
}
