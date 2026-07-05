"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Loader2, HeartPulse, UserCircle, Lock, Mail } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to register");
            }

            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="neo-glass bg-white/70 backdrop-blur-xl p-10 rounded-[2rem] border border-white/60 shadow-2xl shadow-blue-900/10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl mb-6 shadow-lg shadow-blue-600/30">
                            <HeartPulse className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an Account</h1>
                        <p className="text-slate-500 mt-2 font-medium">Join MediLens to safely store and instantly analyze your lab results securely.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                            <div className="relative">
                                <UserCircle className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl h-12 pl-12 pr-4 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] flex items-center justify-center mt-2"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up Securely"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium text-slate-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-blue-600 font-bold hover:underline">
                            Log in instead
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
