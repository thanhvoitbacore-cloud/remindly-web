"use client";

import Link from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email || !password) {
            setErrorMsg("Email and password are required");
            return;
        }

        if (password.length < 6) {
            setErrorMsg("Password must be at least 6 characters long");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || "Failed to register");
            } else {
                // Automatically log the user in after successful registration or redirect them to login
                // Here we redirect them to login with their email populated (optional)
                router.push("/login?email=" + encodeURIComponent(email));
            }
        } catch (err: unknown) {
            console.error(err);
            setErrorMsg("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = (provider: "google" | "microsoft-entra-id") => {
        signIn(provider, { callbackUrl: "/dashboard" });
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center translate-y-[-2rem] mt-12">
            <div className="w-full max-w-md p-8 rounded-3xl bg-gray-900/80 backdrop-blur-xl border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />

                <div className="relative">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/20">
                        <UserPlus className="w-6 h-6 text-pink-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Create an Account</h2>
                    <p className="text-gray-400 text-sm mb-8">Join Remindly to simplify your schedule.</p>

                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name (Optional)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jimi Hendrix"
                                className="w-full px-4 py-2.5 bg-gray-950/50 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-2.5 bg-gray-950/50 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 bg-gray-950/50 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition"
                            />
                        </div>
                        <button
                            disabled={isLoading}
                            className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] text-white rounded-xl font-medium transition flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                            {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-900/80 text-gray-500 backdrop-blur-xl">Or continue with</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => handleOAuthSignIn("google")}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-950/50 border border-gray-800 hover:border-gray-700 rounded-xl text-gray-300 hover:text-white transition disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOAuthSignIn("microsoft-entra-id")}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-950/50 border border-gray-800 hover:border-gray-700 rounded-xl text-gray-300 hover:text-white transition disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 21 21">
                                <path fill="#f25022" d="M1 1h9v9H1z" />
                                <path fill="#00a4ef" d="M1 11h9v9H1z" />
                                <path fill="#7fba00" d="M11 1h9v9h-9z" />
                                <path fill="#ffb900" d="M11 11h9v9h-9z" />
                            </svg>
                            Microsoft Outlook
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-pink-400 hover:text-pink-300 transition font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
