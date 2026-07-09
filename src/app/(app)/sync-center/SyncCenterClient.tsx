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
    const [oauthStep, setOauthStep] = useState<"account" | "consent">("account");
    const [selectedEmail, setSelectedEmail] = useState("");
    const [customEmail, setCustomEmail] = useState("");
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

    const handleOauthNext = (email: string) => {
        setMockError("");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setMockError("Email không đúng định dạng.");
            return;
        }
        setSelectedEmail(email);
        setOauthStep("consent");
    };

    const handleOauthSubmit = async () => {
        setIsConnecting(true);
        try {
            // Simulate network delay
            await new Promise(res => setTimeout(res, 1200));
            await mockConnectCalendar(mockModalProvider!.id, selectedEmail);
            setMockModalProvider(null);
            setSelectedEmail("");
            setCustomEmail("");
            setOauthStep("account");
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
            <div className={`flex flex-col p-space-6 rounded-2xl border ${isConnected ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-800/20 border-gray-800'} backdrop-blur-sm transition-all duration-300 hover:border-gray-600`}>
                <div className="flex items-start justify-between mb-space-6">
                    <div className="flex items-center gap-space-4">
                        <div className={`p-space-3 rounded-xl ${isConnected ? color : 'bg-gray-800 text-gray-400'}`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="h2-premium text-white">{name}</h3>
                            <div className="flex items-center gap-space-2 mt-space-1">
                                <span className="relative flex h-2.5 w-2.5">
                                    {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                                </span>
                                <span className={`body-premium font-medium ${isConnected ? 'text-emerald-400' : 'text-gray-500'}`}>
                                    {isConnected ? 'Đã kết nối' : 'Đã ngắt kết nối'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {isConnected && (
                    <div className="mt-auto mb-space-6 bg-gray-900/50 p-space-4 rounded-xl border border-gray-800">
                        <p className="caption-premium text-gray-400 mb-space-1">Đồng bộ lần cuối</p>
                        <p className="body-premium font-medium text-gray-200">{formatDate(account.lastSyncTime)}</p>
                    </div>
                )}
                
                {!isConnected && (
                    <div className="mt-auto mb-space-6 p-space-4">
                        <p className="body-premium text-gray-400">Kết nối tài khoản để tự động đồng bộ sự kiện vào hệ thống Remindly của bạn.</p>
                    </div>
                )}

                <div className="mt-auto pt-space-4 border-t border-gray-800">
                    {isConnected ? (
                        <button 
                            onClick={() => handleUnlink(provider)}
                            disabled={unlinkingProvider === provider}
                            className={`w-full py-space-2.5 flex items-center justify-center gap-space-2 rounded-lg text-sm font-medium transition-colors ${unlinkingProvider === provider ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'}`}
                        >
                            {unlinkingProvider === provider ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4" />}
                            Hủy kết nối
                        </button>
                    ) : (
                        <button 
                            onClick={() => {
                                setMockModalProvider({ name, id: provider });
                                setOauthStep("account");
                                setSelectedEmail("");
                                setCustomEmail("");
                                setMockError("");
                             }}
                            className={`w-full py-space-2.5 flex items-center justify-center gap-space-2 rounded-lg text-sm font-medium transition-colors text-white ${provider === 'GOOGLE' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-sky-600 hover:bg-sky-700'}`}
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
        <div className="space-y-space-8">
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 rounded-2xl p-space-6 flex flex-col md:flex-row items-center justify-between gap-space-6 backdrop-blur-sm">
                <div className="flex items-center gap-space-4 text-indigo-200">
                    <div className="p-space-3 bg-indigo-500/20 rounded-full">
                        <RefreshCw className={`w-6 h-6 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                        <h2 className="h3-premium text-white">Đồng bộ toàn cầu</h2>
                        <p className="body-premium text-indigo-300">Buộc đồng bộ tức thì cho tất cả các tài khoản đã kết nối của bạn.</p>
                    </div>
                </div>
                <button 
                    onClick={handleForceSync}
                    disabled={isSyncing || (!googleAccount && !outlookAccount)}
                    className="shrink-0 px-space-6 py-space-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition shadow-lg shadow-indigo-500/25 flex items-center gap-space-2"
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
                <div className={`p-space-4 rounded-xl flex items-center gap-space-3 animate-in fade-in slide-in-from-top-4 ${syncMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {syncMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                    <p className="body-premium font-medium">{syncMessage.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
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

            <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-space-6 flex flex-col md:flex-row items-center justify-between gap-space-6">
                <div>
                    <h3 className="h3-premium text-white">Đồng bộ tự động</h3>
                    <p className="body-premium text-gray-400 mt-space-1">Hệ thống sẽ giả định tự động kéo sự kiện về mỗi 10 phút liên tục 24/7 khi được bật.</p>
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

            <div className="bg-gray-800/30 border-l-4 border-amber-500 p-space-4 rounded-r-xl">
                <div className="flex gap-space-3">
                    <Lock className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="body-premium">
                        <p className="text-gray-300 font-medium mb-space-1">Quyền riêng tư & Bảo mật</p>
                        <p className="text-gray-400">Remindly chỉ yêu cầu quyền Đọc & Ghi lịch để đồng bộ sự kiện vào hệ thống. Chúng tôi không thu thập emails hay thông tin cá nhân khác.</p>
                    </div>
                </div>
            </div>

            {/* Mock Connection Modal */}
            {mockModalProvider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 font-sans relative">
                        {/* Header Branding */}
                        <div className="p-6 pb-2 flex flex-col items-center justify-center text-center">
                            <button 
                                onClick={() => setMockModalProvider(null)} 
                                className="absolute top-4 right-4 p-1.5 hover:bg-gray-800/80 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            {/* Logo Provider */}
                            <div className="mb-4">
                                {mockModalProvider.id === "GOOGLE" ? (
                                    <svg className="w-9 h-9" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                ) : (
                                    <svg className="w-8 h-8" viewBox="0 0 21 21">
                                        <path fill="#f25022" d="M1 1h9v9H1z" />
                                        <path fill="#00a4ef" d="M1 11h9v9H1z" />
                                        <path fill="#7fba00" d="M11 1h9v9h-9z" />
                                        <path fill="#ffb900" d="M11 11h9v9h-9z" />
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* MOCK GOOGLE FLOW */}
                        {mockModalProvider.id === "GOOGLE" && (
                            <div className="px-8 pb-8 flex-1 flex flex-col text-gray-200">
                                {oauthStep === "account" ? (
                                    <div className="space-y-6">
                                        <div className="text-center">
                                            <h3 className="text-xl font-medium text-white">Chọn một tài khoản</h3>
                                            <p className="text-sm text-gray-400 mt-1">để tiếp tục đến Remindly</p>
                                        </div>

                                        {mockError && (
                                            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">
                                                {mockError}
                                            </div>
                                        )}

                                        {/* Account List */}
                                        <div className="space-y-2 border border-[#3c4043] rounded-xl overflow-hidden bg-[#161616]">
                                            <button 
                                                onClick={() => handleOauthNext("thanhvoitbacore@gmail.com")}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/50 text-left border-b border-[#3c4043] transition-colors"
                                            >
                                                <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">T</div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-white truncate">thanhvoitbacore-cloud</p>
                                                    <p className="text-[10px] text-gray-400 truncate">thanhvoitbacore@gmail.com</p>
                                                </div>
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleOauthNext("user@remindly.com")}
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800/50 text-left border-b border-[#3c4043] transition-colors"
                                            >
                                                <div className="w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase">U</div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-white truncate">Remindly User</p>
                                                    <p className="text-[10px] text-gray-400 truncate">user@remindly.com</p>
                                                </div>
                                            </button>

                                            <div className="p-4 space-y-2">
                                                <p className="text-xs font-medium text-gray-300">Sử dụng tài khoản khác:</p>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="email" 
                                                        value={customEmail}
                                                        onChange={e => setCustomEmail(e.target.value)}
                                                        placeholder="name@example.com"
                                                        className="flex-1 px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-xs focus:outline-none focus:border-blue-500 text-white placeholder-gray-600"
                                                    />
                                                    <button 
                                                        onClick={() => handleOauthNext(customEmail)}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
                                                    >
                                                        Tiếp
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-gray-400 leading-relaxed">
                                            Để tiếp tục, Google sẽ chia sẻ tên, địa chỉ email, tùy chọn ngôn ngữ và ảnh hồ sơ của bạn với Remindly. Hãy xem <a href="#" className="text-blue-400 hover:underline">Chính sách bảo mật</a> và <a href="#" className="text-blue-400 hover:underline">Điều khoản dịch vụ</a> của Remindly.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-white text-center">Remindly muốn truy cập vào Tài khoản Google của bạn</h3>
                                            <div className="mt-3 flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-800/40 rounded-full border border-gray-800 self-center text-xs text-gray-300 max-w-fit mx-auto">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                {selectedEmail}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-xs text-gray-300 font-medium">Ứng dụng này sẽ có các quyền sau:</p>
                                            
                                            <div className="p-4 bg-[#161616] border border-[#3c4043] rounded-xl space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <input type="checkbox" defaultChecked disabled className="mt-1 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900" />
                                                    <div className="text-xs text-gray-200">
                                                        <p className="font-semibold text-white">Quản lý Google Lịch</p>
                                                        <p className="text-gray-400 mt-0.5">Xem, chỉnh sửa, chia sẻ và xóa vĩnh viễn tất cả lịch bạn có thể truy cập bằng Google Lịch.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[11px] text-gray-400 leading-relaxed">
                                                Hãy chắc chắn rằng bạn tin tưởng ứng dụng Remindly. Bạn có thể thay đổi hoặc thu hồi quyền truy cập này bất kỳ lúc nào trong tài khoản Google cá nhân.
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                                            <button 
                                                onClick={() => setOauthStep("account")}
                                                className="px-4 py-2 hover:bg-gray-800 text-blue-400 hover:text-blue-300 text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                Hủy
                                            </button>
                                            <button 
                                                onClick={handleOauthSubmit}
                                                disabled={isConnecting}
                                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                                            >
                                                {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                                                Cho phép
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MOCK MICROSOFT OUTLOOK FLOW */}
                        {mockModalProvider.id === "OUTLOOK" && (
                            <div className="px-8 pb-8 flex-1 flex flex-col text-gray-200">
                                {oauthStep === "account" ? (
                                    <div className="space-y-6">
                                        <div className="text-left">
                                            <h3 className="text-xl font-bold text-white">Đăng nhập</h3>
                                            <p className="text-sm text-gray-400 mt-1">để tiếp tục đến dịch vụ đồng bộ Remindly</p>
                                        </div>

                                        {mockError && (
                                            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">
                                                {mockError}
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                {/* Pre-fill Option */}
                                                <button 
                                                    onClick={() => handleOauthNext("thanhvoitbacore@outlook.com")}
                                                    className="w-full px-4 py-2.5 bg-gray-800/40 hover:bg-gray-800/80 border border-gray-800 rounded-lg flex items-center justify-between text-left text-xs text-white transition-colors"
                                                >
                                                    <div>
                                                        <p className="font-semibold">thanhvoitbacore@outlook.com</p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">Tài khoản Microsoft Remindly</p>
                                                    </div>
                                                    <span className="text-[10px] text-sky-400 font-medium">Chọn</span>
                                                </button>

                                                <div className="relative py-2">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-800"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-[10px]">
                                                        <span className="px-2 bg-[#1f1f1f] text-gray-500">Hoặc tự nhập tài khoản</span>
                                                    </div>
                                                </div>

                                                <input 
                                                    type="email" 
                                                    value={customEmail}
                                                    onChange={e => setCustomEmail(e.target.value)}
                                                    placeholder="Email, điện thoại hoặc Skype"
                                                    className="w-full px-3 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-sky-500"
                                                />
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                                                <a href="#" className="text-sky-400 hover:underline">Không thể truy cập tài khoản của bạn?</a>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                            <button 
                                                onClick={() => handleOauthNext(customEmail || "thanhvoitbacore@outlook.com")}
                                                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-sky-500/20"
                                            >
                                                Tiếp theo
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Yêu cầu các quyền</h3>
                                            <p className="text-xs text-gray-400 mt-1">Đồng bộ lịch Microsoft Outlook của bạn</p>
                                            <div className="mt-3 flex items-center justify-start gap-2 px-3 py-1.5 bg-gray-800/40 rounded-lg border border-gray-800 text-xs text-gray-300 max-w-fit">
                                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                                {selectedEmail}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-xs text-gray-300 font-medium">Remindly yêu cầu quyền để:</p>
                                            
                                            <div className="space-y-2.5 text-xs text-gray-400">
                                                <div className="flex gap-2">
                                                    <span className="text-sky-400 font-bold">•</span>
                                                    <p><strong className="text-gray-200">Đọc và ghi vào lịch của bạn:</strong> Ứng dụng có thể đồng bộ các sự kiện và cuộc họp mới nhất 24/7.</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="text-sky-400 font-bold">•</span>
                                                    <p><strong className="text-gray-200">Duy trì quyền truy cập vào dữ liệu:</strong> Ứng dụng có thể đồng bộ chạy ngầm kể cả khi bạn không mở web.</p>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-[11px] text-gray-500">
                                                Việc chấp nhận những quyền này cho phép ứng dụng Remindly đồng bộ dữ liệu lịch của bạn một cách bảo mật dựa trên <a href="#" className="text-sky-400 hover:underline">Điều khoản & Điều kiện</a>.
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                                            <button 
                                                onClick={() => setOauthStep("account")}
                                                className="px-4 py-2 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-semibold rounded-lg transition-colors border border-gray-800"
                                            >
                                                Từ chối
                                            </button>
                                            <button 
                                                onClick={handleOauthSubmit}
                                                disabled={isConnecting}
                                                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-1.5"
                                            >
                                                {isConnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                                                Chấp nhận
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
