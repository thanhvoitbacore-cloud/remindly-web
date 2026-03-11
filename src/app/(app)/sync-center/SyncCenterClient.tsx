"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, Lock, MonitorSmartphone, CalendarDays, Link as LinkIcon, Unlink, X, Mail, KeyRound } from "lucide-react";
import { unlinkCalendar, mockConnectCalendar, toggleAutoSync } from "./actions";

type CalendarAccount = {
    id: string;
    provider: string;
    lastSyncTime: Date | null;
} | null;

export default function SyncCenterClient({ googleAccount, outlookAccount, initialAutoSync }: { googleAccount: CalendarAccount, outlookAccount: CalendarAccount, initialAutoSync: boolean }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
    const [autoSync, setAutoSync] = useState(initialAutoSync);
    
    // Modal states
    const [mockModalProvider, setMockModalProvider] = useState<{ name: string, id: string } | null>(null);
    const [mockEmail, setMockEmail] = useState("");
    const [mockPassword, setMockPassword] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [mockError, setMockError] = useState("");

    const handleToggleAutoSync = async () => {
        const newVal = !autoSync;
        setAutoSync(newVal);
        try {
            await toggleAutoSync(newVal);
        } catch {
            setAutoSync(!newVal);
            setSyncMessage({ type: 'error', text: 'Lỗi khi cập nhật cài đặt đồng bộ.' });
        }
    };

    const handleMockConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setMockError("");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mockEmail)) {
            setMockError("Email không hợp lệ.");
            return;
        }
        if (!mockPassword) {
            setMockError("Vui lòng nhập mật khẩu.");
            return;
        }

        setIsConnecting(true);
        try {
            // Simulate network delay
            await new Promise(res => setTimeout(res, 1000));
            await mockConnectCalendar(mockModalProvider!.id, mockEmail);
            setMockModalProvider(null);
            setMockEmail("");
            setMockPassword("");
            window.location.reload();
        } catch (error) {
            setMockError("Lỗi kết nối giả lập.");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleForceSync = async () => {
        setIsSyncing(true);
        setSyncProgress(10);
        setSyncMessage(null);
        
        const interval = setInterval(() => {
            setSyncProgress(prev => {
                if (prev >= 90) return prev;
                return prev + Math.floor(Math.random() * 15) + 5;
            });
        }, 500);

        try {
            const res = await fetch('/api/calendar/sync', { method: 'POST' });
            if (!res.ok) throw new Error("Sync failed");
            setSyncProgress(100);
            setSyncMessage({ type: 'success', text: "Đồng bộ thành công! Các sự kiện đã được cập nhật." });
        } catch (error) {
            setSyncMessage({ type: 'error', text: "Đồng bộ thất bại. Vui lòng thử lại sau." });
            setSyncProgress(0);
        } finally {
            clearInterval(interval);
            setTimeout(() => {
                setIsSyncing(false);
                setSyncProgress(0);
            }, 800);
            setTimeout(() => setSyncMessage(null), 5000);
        }
    };

    const handleUnlink = async (provider: string) => {
        if (!confirm(`Bạn có chắc muốn ngắt kết nối với ${provider}?`)) return;
        setUnlinkingProvider(provider);
        try {
            await unlinkCalendar(provider);
            window.location.reload();
        } catch (error) {
            alert("Lỗi khi ngắt kết nối. Vui lòng thử lại.");
            setUnlinkingProvider(null);
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "Chưa từng đồng bộ";
        return new Intl.DateTimeFormat('vi-VN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(date));
    };

    const ProviderCard = ({ 
        provider, 
        name, 
        account, 
        authUrl, 
        color, 
        icon: Icon 
    }: { 
        provider: string, 
        name: string, 
        account: CalendarAccount, 
        authUrl: string, 
        color: string, 
        icon: any 
    }) => {
        const isConnected = !!account;

        return (
            <div className={`flex flex-col p-6 rounded-2xl border ${isConnected ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/20 border-gray-800'} backdrop-blur-sm transition-all duration-300 hover:border-gray-600`}>
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${isConnected ? color : 'bg-gray-800 text-gray-400'}`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-white">{name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="relative flex h-2.5 w-2.5">
                                    {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                                </span>
                                <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    {isConnected ? 'Đã kết nối' : 'Đã ngắt kết nối'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {isConnected && (
                    <div className="mt-auto mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                        <p className="text-xs text-gray-400 mb-1">Đồng bộ lần cuối</p>
                        <p className="text-sm font-medium text-gray-200">{formatDate(account.lastSyncTime)}</p>
                    </div>
                )}
                
                {!isConnected && (
                    <div className="mt-auto mb-6 p-4">
                        <p className="text-sm text-gray-400">Kết nối tài khoản để tự động đồng bộ sự kiện vào hệ thống Remindly của bạn.</p>
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-800">
                    {isConnected ? (
                        <button 
                            onClick={() => handleUnlink(provider)}
                            disabled={unlinkingProvider === provider}
                            className={`w-full py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${unlinkingProvider === provider ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'}`}
                        >
                            {unlinkingProvider === provider ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                            Hủy kết nối
                        </button>
                    ) : (
                        <button 
                            onClick={() => setMockModalProvider({ name, id: provider })}
                            className={`w-full py-2.5 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors text-white ${provider === 'GOOGLE' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-sky-600 hover:bg-sky-700'}`}
                        >
                            <LinkIcon className="w-4 h-4" />
                            Kết nối {name}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
                <div className="flex items-center gap-4 text-indigo-200">
                    <div className="p-3 bg-indigo-500/20 rounded-full">
                        <RefreshCw className={`w-6 h-6 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg text-white">Đồng bộ toàn cầu</h2>
                        <p className="text-sm text-indigo-300">Buộc đồng bộ tức thì cho tất cả các tài khoản đã kết nối của bạn.</p>
                    </div>
                </div>
                <button 
                    onClick={handleForceSync}
                    disabled={isSyncing || (!googleAccount && !outlookAccount)}
                    className="shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                >
                    {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    {syncProgress === 100 ? "Hoàn tất!" : isSyncing ? `${syncProgress}% Đang đồng bộ...` : "Đồng bộ ngay"}
                </button>
            </div>
            
            {/* Visual Progress Bar overlay inside the sync block */}
            {isSyncing && (
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden absolute top-0 left-0 -translate-y-full mt-[-8px]">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
                        style={{ width: `${syncProgress}%` }}
                    />
                </div>
            )}

            {syncMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${syncMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {syncMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                    <p className="font-medium text-sm">{syncMessage.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProviderCard 
                    provider="GOOGLE"
                    name="Google Calendar"
                    account={googleAccount}
                    authUrl="/api/calendar/auth/google"
                    color="bg-blue-500/20 text-blue-400"
                    icon={CalendarDays}
                />
                
                <ProviderCard 
                    provider="OUTLOOK"
                    name="Outlook Calendar"
                    account={outlookAccount}
                    authUrl="/api/calendar/auth/outlook"
                    color="bg-sky-500/20 text-sky-400"
                    icon={MonitorSmartphone}
                />
            </div>

            <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Đồng bộ tự động</h3>
                    <p className="text-sm text-gray-400 mt-1">Hệ thống sẽ giả định tự động kéo sự kiện về mỗi 10 phút liên tục 24/7 khi được bật.</p>
                </div>
                <button
                    onClick={handleToggleAutoSync}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoSync ? 'bg-indigo-600' : 'bg-gray-600'}`}
                >
                    <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoSync ? 'translate-x-7' : 'translate-x-0'}`}
                    />
                </button>
            </div>

            <div className="bg-gray-800/30 border-l-4 border-amber-500 p-4 rounded-r-xl">
                <div className="flex gap-3">
                    <Lock className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="text-sm">
                        <p className="text-gray-300 font-medium mb-1">Quyền riêng tư & Bảo mật</p>
                        <p className="text-gray-400">Remindly chỉ yêu cầu quyền Đọc & Ghi lịch để đồng bộ sự kiện vào hệ thống. Chúng tôi không thu thập emails hay thông tin cá nhân khác.</p>
                    </div>
                </div>
            </div>

            {/* Mock Connection Modal */}
            {mockModalProvider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-white">Kết nối {mockModalProvider.name}</h3>
                                <p className="text-sm text-gray-400 mt-1">Vui lòng đăng nhập để cấp quyền.</p>
                            </div>
                            <button onClick={() => setMockModalProvider(null)} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleMockConnect} className="p-6 flex-1 overflow-y-auto w-full box-border">
                            {mockError && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                                    {mockError}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <input
                                            type="email"
                                            value={mockEmail}
                                            onChange={e => setMockEmail(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2.5 bg-gray-950 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500 w-full box-border"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Mật khẩu</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <KeyRound className="h-4 w-4 text-gray-500" />
                                        </div>
                                        <input
                                            type="password"
                                            value={mockPassword}
                                            onChange={e => setMockPassword(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2.5 bg-gray-950 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500 w-full box-border"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <button
                                    type="submit"
                                    disabled={isConnecting}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                                >
                                    {isConnecting ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Tiếp tục"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
