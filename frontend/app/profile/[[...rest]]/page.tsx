"use client";

import { UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Manage your personal information, security preferences, and connected accounts.
                        </p>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex justify-center p-8">
                        <UserProfile
                            appearance={{
                                elements: {
                                    rootBox: "w-full max-w-full shadow-none",
                                    cardBox: "w-full max-w-full shadow-none border-0",
                                    navbar: "hidden md:flex",
                                    navbarButton: "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50",
                                    badge: "bg-indigo-100 text-indigo-700",
                                    profileSectionTitle: "text-lg font-semibold text-slate-900",
                                    profileSectionTitleText: "text-slate-900",
                                    profileSectionPrimaryButton: "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50",
                                    accordionTriggerButton: "text-indigo-600 hover:bg-indigo-50",
                                    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
                                    formButtonReset: "text-slate-600 hover:bg-slate-100",
                                    formFieldInput: "rounded-xl border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/20",
                                    formFieldLabel: "text-slate-700 font-medium",
                                    headerTitle: "text-slate-900 font-bold",
                                    headerSubtitle: "text-slate-500",
                                    dividerRow: "hidden", // Hide clerk's default dividers to use our own layout styling
                                    breadcrumbsItemActive: "text-indigo-600",
                                    breadcrumbsItem: "text-slate-500 hover:text-indigo-600",
                                }
                            }}
                            routing="path"
                            path="/profile"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
