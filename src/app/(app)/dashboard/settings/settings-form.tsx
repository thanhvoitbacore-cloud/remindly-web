"use client";

import { useState, useEffect } from "react";
import { updateProfile, generateOTP, verifyOTPAndCommit, updatePassword } from "./actions";
import LogoutButton from "@/components/LogoutButton";
import { User, Shield, KeyRound, Smartphone, Mail, Settings2, Image as ImageIcon, Upload } from "lucide-react";
import { useRef } from "react";

type UserData = {
    name: string | null;
    email: string | null;
    phoneNumber: string | null;
    avatar: string | null;
};

export default function SettingsForm({ initialUser }: { initialUser: UserData }) {
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
        <div className="space-y-10 pb-20">

            {/* Section 1: Profile */}
            <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <User className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-xl font-bold text-white">Public Profile</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Profile Picture</label>
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
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-xl text-gray-300 hover:text-white transition focus:outline-none focus:border-indigo-500"
                                >
                                    <Upload className="w-4 h-4" />
                                    Choose Image...
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-800 rounded-xl bg-gray-950/50 relative overflow-hidden group">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500/20 shadow-lg" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center shadow-lg">
                                <User className="w-10 h-10 text-gray-600" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 invisible group-hover:visible flex items-center justify-center transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 mt-4 uppercase tracking-wider">Avatar Preview</span>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        disabled={isUpdatingProfile}
                        onClick={handleProfileSubmit}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
                    >
                        {isUpdatingProfile ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </section>

            {/* Section 2: Security */}
            <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">Security & Identifiers</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">

                    {/* Unique Identifier Changes */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Primary Contact</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" /> Email Address</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition"
                                />
                                <button onClick={() => handleIdentifierRequest(email)} disabled={isSecurityLoading || email === initialUser.email} className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition disabled:opacity-50">
                                    Change
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><Smartphone className="w-4 h-4 text-gray-500" /> Phone Number</label>
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="flex-1 px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition"
                                />
                                <button onClick={() => handleIdentifierRequest(phone)} disabled={isSecurityLoading || phone === initialUser.phoneNumber} className="px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition disabled:opacity-50">
                                    Change
                                </button>
                            </div>
                        </div>

                        {/* Animated OTP Dropdown */}
                        {isOtpSent && optIdentifier && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-4 animate-in slide-in-from-top-4 fade-in">
                                <label className="block text-sm text-emerald-300 mb-2 font-medium">Validation Code sent to {optIdentifier}</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-950/50 border border-emerald-500/30 rounded-lg text-emerald-100 placeholder:text-emerald-900/50 focus:outline-none font-mono tracking-widest text-center text-lg"
                                    />
                                    <button onClick={handleIdentifierCommit} disabled={isSecurityLoading || otpCode.length < 5} className="px-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                                        Verify
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Password Shift */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Authentication</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><KeyRound className="w-4 h-4 text-gray-500" /> Current Password</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                disabled={isPasswordLoading || !oldPassword || !newPassword}
                                onClick={handlePasswordSubmit}
                                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition disabled:opacity-50"
                            >
                                {isPasswordLoading ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </div>

                </div>
            </section>

            {/* Section 3: Account Actions */}
            <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl mt-12 !border-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                        <Settings2 className="w-6 h-6 text-red-400" />
                        <h2 className="text-xl font-bold text-white">Account Actions</h2>
                    </div>

                    <div className="p-6 bg-gray-950/50 border-l-4 border-red-500/50 rounded-r-xl flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-gray-200">Logout</h3>
                            <p className="text-sm text-gray-500 mt-1">This will instantly sign you out of your account on this device. Protected pages will no longer be available until you authenticate again.</p>
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
