"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Bell, Info, Users, CalendarDays, Sparkles, AlertOctagon, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Note {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
    actionUrl?: string | null;
    metadata?: any | null;
}

export default function NotificationBellClient({
    initialNotes,
    initialUnreadCount
}: {
    initialNotes: Note[],
    initialUnreadCount: number
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOpen = () => setIsOpen(!isOpen);

    const handleNoteClick = (note: Note) => {
        setIsOpen(false);
        if (note.actionUrl) {
            router.push(note.actionUrl);
        } else {
            // Nếu không có Link cụ thể, đẩy sang trang Notification List để xem Detail
            router.push('/notifications');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                className="relative p-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition group outline-none"
                title="View Notifications"
            >
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />

                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center px-1 bg-red-500 rounded-full text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse border-2 border-gray-950">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950/50">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {initialNotes.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No recent notifications</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {initialNotes.map(note => {
                                    let Icon = Info;
                                    let iconColor = "text-blue-400";
                                    if (note.type === "INVITE") {
                                        Icon = Users; iconColor = "text-emerald-400";
                                    } else if (note.type === "REMINDER") {
                                        Icon = CalendarDays; iconColor = "text-orange-400";
                                    } else {
                                        Icon = Sparkles; iconColor = "text-indigo-400";
                                        if (note.title.toLowerCase().includes("failed") || note.title.toLowerCase().includes("error")) {
                                            Icon = AlertOctagon; iconColor = "text-red-400";
                                        }
                                    }

                                    return (
                                        <div
                                            key={note.id}
                                            onClick={() => handleNoteClick(note)}
                                            className={`p-4 border-b border-gray-800/50 hover:bg-gray-800 transition cursor-pointer flex gap-3 ${!note.isRead ? 'bg-gray-800/30' : ''}`}
                                        >
                                            <div className={`mt-0.5 ${iconColor}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-medium truncate ${!note.isRead ? 'text-white' : 'text-gray-300'}`}>
                                                    {note.title}
                                                </h4>
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{note.message}</p>
                                                <p className="text-[10px] text-gray-500 mt-1.5 uppercase tracking-wider font-semibold">
                                                    {format(new Date(note.createdAt), "MMM d, h:mm a")}
                                                </p>
                                            </div>
                                            {!note.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 self-center shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-gray-800 bg-gray-950 flex justify-center">
                        <Link
                            href="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition"
                        >
                            View All History →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
