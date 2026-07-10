"use client";

import { useState, useEffect } from "react";
import { updateProfile, generateOTP, verifyOTPAndCommit, updatePassword } from "./actions";
import LogoutButton from "@/components/LogoutButton";
import { User, Shield, KeyRound, Smartphone, Mail, Settings2, Image as ImageIcon, Upload, Sun, Moon } from "lucide-react";
import { useRef } from "react";

type UserData = {
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
    avatar: string | null;
};

export default function SettingsForm({ initialUser }: { initialUser: UserData }) {
    // Theme State
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const savedTheme = localStorage.getItem("remindly-theme") as "dark" | "light" || "dark";
        setTheme(savedTheme);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        localStorage.setItem("remindly-theme", nextTheme);
        if (nextTheme === "light") {
            document.documentElement.classList.add("theme-light");
        } else {
            document.documentElement.classList.remove("theme-light");
        }
    };

    // Basic Profile State
    const [name, setName] = useState(initialUser.name || "");
    const [avatar, setAvatar] = useState(initialUser.avatar || "");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(initialUser.avatar || "");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state if server revalidates data
    useEffect(() => {
        setName(initialUser.name || "");
        setAvatar(initialUser.avatar || "");
        setPreviewUrl(initialUser.avatar || "");
        setEmail(initialUser.email || "");
        setPhone(initialUser.phoneNumber || "");
    }, [initialUser]);

    // Email/Phone OTP State
    const [email, setEmail] = useState(initialUser.email || "");
    const [phone, setPhone] = useState(initialUser.phoneNumber || "");
    const [optIdentifier, setOtpIdentifier] = useState<string | null>(null);
    const [otpCode, setOtpCode] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isSecurityLoading, setIsSecurityLoading] = useState(false);

    // Password State
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    const handleProfileSubmit = async () => {
        setIsUpdatingProfile(true);
        const formData = new FormData();
        formData.append("name", name);
        if (avatarFile) {
            formData.append("avatarFile", avatarFile);
        }
        
        const res = await updateProfile(formData);
        alert(res.message);
        setIsUpdatingProfile(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleIdentifierRequest = async (target: string) => {
        if (!target) return alert("Please enter an email or phone number to verify.");
        setIsSecurityLoading(true);
        const res = await generateOTP(target);
        if (res.success) {
            setOtpIdentifier(target);
            setIsOtpSent(true);
            alert(res.message); // Instructs them to check console log
        } else {
            alert(res.message);
        }
        setIsSecurityLoading(false);
    };

    const handleIdentifierCommit = async () => {
        if (!optIdentifier || !otpCode) return;
        setIsSecurityLoading(true);
        const res = await verifyOTPAndCommit(optIdentifier, otpCode);
        alert(res.message);
        if (res.success) {
            setIsOtpSent(false);
            setOtpCode("");
            setOtpIdentifier(null);
        }
        setIsSecurityLoading(false);
    };

    const handlePasswordSubmit = async () => {
        if (newPassword !== confirmPassword) {
            return alert("New passwords do not match.");
        }
        setIsPasswordLoading(true);
        const res = await updatePassword(oldPassword, newPassword);
        alert(res.message);
        if (res.success) {
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
        setIsPasswordLoading(false);
    };

    return (
        <div className="space-y-space-10 pb-space-20">

            {/* Section 1: Profile */}
            <section className="bg-bg-surface border border-border-subtle rounded-2xl p-space-6 md:p-space-8 shadow-xl">
                <div className="flex items-center gap-space-3 mb-space-6">
                    <User className="w-6 h-6 text-accent-primary" />
                    <h2 className="h2-premium text-text-main">Public Profile</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
                    <div className="space-y-space-4">
                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-bg-primary border border-border-subtle rounded-xl text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-accent-primary transition"
                            />
                        </div>
                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2">Profile Picture</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                                <button
                                    type="button"
                                    onClick={() => {}}
                                    className="w-full flex items-center justify-center gap-space-2 px-space-4 py-space-2.5 bg-bg-primary border border-border-subtle hover:border-text-muted rounded-xl text-text-muted hover:text-text-main transition focus:outline-none focus:border-accent-primary cursor-pointer"
                                >
                                    <Upload className="w-4 h-4" />
                                    Choose Image...
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-space-6 border-2 border-dashed border-border-subtle rounded-xl bg-bg-primary/50 relative overflow-hidden group">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/20 shadow-lg" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-bg-surface flex items-center justify-center shadow-lg">
                                <User className="w-10 h-10 text-text-muted" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 invisible group-hover:visible flex items-center justify-center transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <span className="caption-premium font-medium text-text-muted mt-space-4 uppercase tracking-wider">Avatar Preview</span>
                    </div>
                </div>

                <div className="mt-space-8 flex justify-end">
                    <button
                        disabled={isUpdatingProfile}
                        onClick={handleProfileSubmit}
                        className="px-space-6 py-space-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 cursor-pointer"
                    >
                        {isUpdatingProfile ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </section>

            {/* Section 2: Security */}
            <section className="bg-bg-surface border border-border-subtle rounded-2xl p-space-6 md:p-space-8 shadow-xl">
                <div className="flex items-center gap-space-3 mb-space-6">
                    <Shield className="w-6 h-6 text-emerald-400" />
                    <h2 className="h2-premium text-text-main">Security & Identifiers</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space-8 gap-y-space-10">

                    {/* Unique Identifier Changes */}
                    <div className="space-y-space-6">
                        <h3 className="caption-premium font-semibold uppercase tracking-wider text-text-muted">Primary Contact</h3>

                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2 flex items-center gap-space-2"><Mail className="w-4 h-4 text-text-muted" /> Email Address</label>
                            <div className="flex gap-space-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-bg-primary border border-border-subtle rounded-xl text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-emerald-500 transition"
                                />
                                <button onClick={() => handleIdentifierRequest(email)} disabled={isSecurityLoading || email === initialUser.email} className="px-4 bg-bg-primary hover:bg-bg-surface text-text-muted border border-border-subtle rounded-xl text-sm font-medium transition disabled:opacity-50 cursor-pointer">
                                    Change
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2 flex items-center gap-space-2"><Smartphone className="w-4 h-4 text-text-muted" /> Phone Number</label>
                            <div className="flex gap-space-2">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-bg-primary border border-border-subtle rounded-xl text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-emerald-500 transition"
                                />
                                <button onClick={() => handleIdentifierRequest(phone)} disabled={isSecurityLoading || phone === initialUser.phoneNumber} className="px-4 bg-bg-primary hover:bg-bg-surface text-text-muted border border-border-subtle rounded-xl text-sm font-medium transition disabled:opacity-50 cursor-pointer">
                                    Change
                                </button>
                            </div>
                        </div>

                        {/* Animated OTP Dropdown */}
                        {isOtpSent && optIdentifier && (
                            <div className="p-space-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-space-4 animate-in slide-in-from-top-4 fade-in">
                                <label className="block body-premium text-emerald-300 mb-space-2 font-medium">Validation Code sent to {optIdentifier}</label>
                                <div className="flex gap-space-2">
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        className="w-full px-4 py-2 bg-bg-primary/50 border border-emerald-500/30 rounded-lg text-emerald-100 placeholder:text-emerald-900/50 focus:outline-none font-mono tracking-widest text-center text-lg"
                                    />
                                    <button onClick={handleIdentifierCommit} disabled={isSecurityLoading || otpCode.length < 5} className="px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer">
                                        Verify
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Password Shift */}
                    <div className="space-y-space-6">
                        <h3 className="caption-premium font-semibold uppercase tracking-wider text-text-muted">Authentication</h3>

                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2 flex items-center gap-space-2"><KeyRound className="w-4 h-4 text-text-muted" /> Current Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-bg-primary border border-border-subtle rounded-xl text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-emerald-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-bg-primary border border-border-subtle rounded-xl text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-emerald-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-bg-primary border border-border-subtle rounded-xl text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-emerald-500 transition"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                disabled={isPasswordLoading || !oldPassword || !newPassword}
                                onClick={handlePasswordSubmit}
                                className="px-space-6 py-space-2.5 bg-bg-primary hover:bg-bg-surface text-text-muted border border-border-subtle rounded-xl text-sm font-medium transition disabled:opacity-50 cursor-pointer"
                            >
                                {isPasswordLoading ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </div>

                </div>
            </section>

            {/* Section 3: Theme Preferences */}
            <section className="bg-bg-surface border border-border-subtle rounded-2xl p-space-6 md:p-space-8 shadow-xl mt-space-12">
                <div className="flex items-center gap-space-3 mb-space-6">
                    <Sun className="w-6 h-6 text-amber-400" />
                    <h2 className="h2-premium text-text-main">Appearance</h2>
                </div>

                <div className="p-space-6 bg-bg-primary/50 border border-border-subtle border-l-4 border-l-amber-500/50 rounded-r-xl flex items-center justify-between">
                    <div>
                        <h3 className="h3-premium text-text-main">Interface Theme</h3>
                        <p className="body-premium text-text-muted mt-space-1">Switch between Dark Mode and Light Mode.</p>
                    </div>
                    <div className="pl-6">
                        <button
                            onClick={toggleTheme}
                            className="px-space-4 py-space-2 bg-bg-primary hover:bg-bg-surface text-text-muted border border-border-subtle rounded-xl text-sm font-medium transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
                        >
                            {theme === "dark" ? (
                                <>
                                    <Sun className="w-4 h-4 text-amber-400" />
                                    Light Mode
                                </>
                            ) : (
                                <>
                                    <Moon className="w-4 h-4 text-indigo-400" />
                                    Dark Mode
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* Section 4: Account Actions */}
            <section className="bg-bg-surface border border-border-subtle rounded-2xl p-space-6 md:p-space-8 shadow-xl mt-space-12 !border-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl" />

                <div className="relative">
                    <div className="flex items-center gap-space-3 mb-space-6">
                        <Settings2 className="w-6 h-6 text-red-400" />
                        <h2 className="h2-premium text-text-main">Account Actions</h2>
                    </div>

                    <div className="p-space-6 bg-bg-primary/50 border border-border-subtle border-l-4 border-l-red-500/50 rounded-r-xl flex items-center justify-between">
                        <div>
                            <h3 className="h3-premium text-text-main">Logout</h3>
                            <p className="body-premium text-text-muted mt-space-1">This will instantly sign you out of your account on this device. Protected pages will no longer be available until you authenticate again.</p>
                        </div>
                        <div className="pl-6">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
