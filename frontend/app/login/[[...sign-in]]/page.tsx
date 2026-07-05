"use client";

import AuthLayout from "../../../components/auth/AuthLayout";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
    return (
        <AuthLayout
            title="Unlock the Blueprint of Health"
            subtitle="Log in to access your personalized medical insights and track your health journey."
        >
            <div className="w-full flex justify-center">
                <SignIn
                    appearance={{
                        elements: {
                            formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm font-bold shadow-none',
                            card: 'shadow-none border-none p-0',
                            headerTitle: 'text-2xl font-extrabold text-slate-900',
                            headerSubtitle: 'text-slate-500',
                            socialButtonsBlockButton: 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium',
                            dividerRow: 'text-slate-500',
                            formFieldLabel: 'text-slate-600 font-medium',
                            formFieldInput: 'rounded-xl border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/20',
                            footerActionLink: 'text-indigo-600 font-semibold hover:text-indigo-700',
                            identityPreviewText: 'text-slate-900',
                            formResendCodeLink: 'text-indigo-600',
                        }
                    }}
                    routing="path"
                    path="/login"
                    signUpUrl="/signup"
                />
            </div>
        </AuthLayout>
    );
}
