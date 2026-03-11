"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Settings, User, Users, FileEdit, ChevronLeft, ChevronRight, History, Link as LinkIcon, Hexagon } from "lucide-react";

export default function Sidebar({ session, notificationBell }: { session: any, notificationBell?: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "text-gray-400" },
        { href: "/calendar", icon: CalendarDays, label: "Master Calendar", color: "text-indigo-400" },
        { href: "/meetings/create", icon: Users, label: "Meetings", color: "text-emerald-400" },
        { href: "/drafts", icon: FileEdit, label: "Drafts", color: "text-amber-400" },
        { href: "/sync-center", icon: LinkIcon, label: "Sync Center", color: "text-cyan-400" },
        { href: "/notifications", icon: History, label: "Notifications", color: "text-gray-400" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings", color: "text-gray-400" }
    ];

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-gray-900 border-r border-gray-800 flex-col justify-between hidden md:flex transition-all duration-300 relative shrink-0 z-50`}>
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -right-3 top-8 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white rounded-full p-1 z-50 transition shadow-md"
                title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
                {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <div className="overflow-visible w-full">
                <div className={`p-6 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} overflow-visible`}>
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Hexagon className={`w-6 h-6 fill-indigo-500 text-indigo-400 shrink-0 ${!isOpen && 'mb-2'}`} />
                        {isOpen && <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer truncate">Remindly.</h1>}
                    </Link>
                    {isOpen && notificationBell}
                </div>

                {!isOpen && (
                   <div className="flex justify-center mb-4">
                       {notificationBell}
                   </div>
                )}

                <nav className={`mt-2 ${isOpen ? 'px-4' : 'px-2'} space-y-2`}>
                    {navItems.map(item => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href} 
                                className={`flex items-center gap-3 py-3 rounded-xl transition ${isActive ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'} ${isOpen ? 'px-4' : 'justify-center px-0'}`} 
                                title={!isOpen ? item.label : undefined}
                            >
                                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? item.color : ''} ${!isActive && item.color !== 'text-gray-400' ? item.color : ''}`} />
                                {isOpen && <span className={`truncate ${isActive ? 'font-medium' : ''}`}>{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className={`p-6 border-t border-gray-800 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30 overflow-hidden">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt="User Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 shrink-0" />
                        )}
                    </div>
                    {isOpen && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{session?.user?.name || "User"}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
