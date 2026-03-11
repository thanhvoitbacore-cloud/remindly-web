"use client";

import Link from "next/link";
import { LogIn, ArrowRight, ArrowLeft, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { checkUserExists, requestPasswordResetOTP, verifyPasswordResetOTP, resetPasswordWithOTP } from "./actions";

export default function LoginPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<"login" | "forgot-password">("login");
    const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);

    // Login State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    // Forgot Password State
    const [resetIdentifier, setResetIdentifier] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Global State
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!username || !password) {
            setErrorMsg("Username and password are required");
            return;
        }

        setIsLoading(true);
        try {
            const res = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (res?.error) {
                setErrorMsg(res.error || "Lỗi đăng nhập.");
            } else {
                if (username === "admin@remindly") {
                    router.push("/admin/overview");
                } else {
                    router.push("/dashboard");
                }
                router.refresh();
            }
        } catch (err: unknown) {
            console.error(err);
            setErrorMsg("Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = (provider: "google" | "microsoft-entra-id") => {
        signIn(provider, { callbackUrl: "/dashboard" });
    };

    // --- FORGOT PASSWORD HANDLERS ---
    
    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        if (!resetIdentifier) return setErrorMsg("Vui lòng nhập email hoặc số điện thoại.");

        setIsLoading(true);
        const res = await checkUserExists(resetIdentifier);
        if (!res.success) {
            setErrorMsg(res.message || "Lỗi không xác định.");
            setIsLoading(false);
            return;
        }

        const otpRes = await requestPasswordResetOTP(resetIdentifier);
        setIsLoading(false);
        
        if (otpRes.success) {
            setSuccessMsg(otpRes.message);
            setForgotStep(2);
        } else {
            setErrorMsg(otpRes.message);
        }
    };

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        if (!otpCode || otpCode.length < 6) return setErrorMsg("Vui lòng nhập đủ 6 số OTP.");

        setIsLoading(true);
        const res = await verifyPasswordResetOTP(resetIdentifier, otpCode);
        setIsLoading(false);

        if (res.success) {
            setForgotStep(3);
        } else {
            setErrorMsg(res.message);
        }
    };

    const handleStep3Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        
        if (!newPassword || newPassword.length < 8) return setErrorMsg("Mật khẩu mới phải có ít nhất 8 ký tự.");
        if (newPassword !== confirmPassword) return setErrorMsg("Mật khẩu xác nhận không khớp.");

        setIsLoading(true);
        const res = await resetPasswordWithOTP(resetIdentifier, newPassword);
        setIsLoading(false);

        if (res.success) {
            setSuccessMsg("Thành công! Bạn có thể đăng nhập bằng mật khẩu mới.");
            // Reset state and switch back to login
            setResetIdentifier("");
            setOtpCode("");
            setNewPassword("");
            setConfirmPassword("");
            setViewMode("login");
            setForgotStep(1);
        } else {
            setErrorMsg(res.message);
        }
    };

    const resetView = () => {
        setViewMode("login");
        setForgotStep(1);
        setErrorMsg("");
        setSuccessMsg("");
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center translate-y-[-2rem] mt-12">
            <div className="w-full max-w-md p-8 rounded-3xl bg-gray-900/80 backdrop-blur-xl border border-gray-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />

                <div className="relative">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 shadow-inner">
                        <LogIn className="w-6 h-6 text-indigo-400" />
                    </div>
                    
                    {viewMode === "login" && (
                      <>
                        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                        <p className="text-gray-400 text-sm mb-8">Sign in to manage your events and reminders.</p>

                        {successMsg && (
                            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                {successMsg}
                            </div>
                        )}

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm shadow-sm">
                                {errorMsg}
                            </div>
                        )}

                    <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username (Email or Phone)</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="you@example.com, phone, or admin"
                                className="w-full px-4 py-2.5 bg-gray-950/50 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-gray-300">Password</label>
                                <button type="button" onClick={() => { setViewMode("forgot-password"); setErrorMsg(""); setSuccessMsg(""); }} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition">
                                    Forgot password?
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 bg-gray-950/50 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                            />
                        </div>
                        <button
                            disabled={isLoading}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] text-white rounded-xl font-medium transition flex items-center justify-center gap-2 group mt-4 disabled:opacity-50"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
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
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition font-medium">
                            Create one
                        </Link>
                    </p>
                  </>
                )}

                {viewMode === "forgot-password" && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <button onClick={resetView} className="mb-6 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                            <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-2">Khôi phục mật khẩu</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            {forgotStep === 1 && "Nhập email hoặc số điện thoại của bạn để nhận mã xác thực."}
                            {forgotStep === 2 && "Nhập mã gồm 6 chữ số chúng tôi vừa gửi cho bạn."}
                            {forgotStep === 3 && "Tạo mật khẩu mới cho tài khoản của bạn."}
                        </p>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm shadow-sm">
                                {errorMsg}
                            </div>
                        )}
                        {successMsg && forgotStep === 2 && (
                            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                {successMsg}
                            </div>
                        )}

                        {forgotStep === 1 && (
                            <form onSubmit={handleStep1Submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Tên đăng nhập (Email / SĐT)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={resetIdentifier}
                                            onChange={(e) => setResetIdentifier(e.target.value)}
                                            placeholder="you@example.com hoặc số ĐT"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-950/50 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    disabled={isLoading}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                                >
                                    {isLoading ? "Đang xác thực..." : "Tiếp tục"}
                                </button>
                            </form>
                        )}

                        {forgotStep === 2 && (
                            <form onSubmit={handleStep2Submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Mã OTP (có thể thử 123456)</label>
                                    <input
                                        type="text"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="X X X X X X"
                                        className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl text-xl tracking-[0.5em] text-center text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner font-mono"
                                        required
                                    />
                                </div>
                                <button
                                    disabled={isLoading || otpCode.length < 6}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                                >
                                    {isLoading ? "Đang kiểm tra..." : "Xác nhận mã OTP"}
                                </button>
                            </form>
                        )}

                        {forgotStep === 3 && (
                            <form onSubmit={handleStep3Submit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Mật khẩu mới</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <KeyRound className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Tối thiểu 8 ký tự"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-950/50 border border-gray-800 rounded-xl text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <KeyRound className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Nhập lại mật khẩu mới"
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-950/50 border border-gray-800 rounded-xl text-gray-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    disabled={isLoading || !newPassword || !confirmPassword}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                                >
                                    {isLoading ? "Đang cập nhật..." : "Đổi mật khẩu"}
                                </button>
                            </form>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
