import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { EyeOff, Eye, Loader2 } from "lucide-react"
import AuthLayout from "./AuthLayout"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            // 1. Register User
            await api.post('/auth/register', {
                email,
                password,
                full_name: fullName
            })

            // 2. Automatically Log In (OAuth2 format requires Form Data)
            const formData = new URLSearchParams()
            formData.append('username', email)
            formData.append('password', password)

            const loginRes = await api.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })

            login(loginRes.data.access_token)
            navigate("/dashboard")
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            let errorMessage = "Failed to create account. Please try again.";
            if (typeof detail === 'string') {
                errorMessage = detail;
            } else if (Array.isArray(detail) && detail.length > 0) {
                errorMessage = detail[0].msg; // Handle Pydantic validation arrays
            } else if (err.message) {
                errorMessage = err.message; // Handle Network Errors/CORS
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Join HealthBridge AI"
            subtitle="Create an account to start automatically tracking and understanding your family's health reports."
        >
            <div className="w-full">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Sign Up</h2>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                        />
                    </div>
                    <div className="relative group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                        />
                    </div>
                    <div className="relative group">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 outline-none transition-colors"
                        >
                            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:bg-indigo-700 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500 font-medium">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                        Log in
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}
