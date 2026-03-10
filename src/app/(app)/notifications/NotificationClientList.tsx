"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, Sparkles, Info, CalendarDays, Users, X, AlertOctagon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotificationClientList({ notifications }: { notifications: any[] }) {
    const router = useRouter();
    const [selectedNote, setSelectedNote] = useState<any | null>(null);

    const handleNoteClick = (note: any) => {
        if (note.actionUrl) {
            router.push(note.actionUrl);
        } else if (note.metadata) {
            setSelectedNote(note);
        }
    };

    if (notifications.length === 0) {
        return (
            <div className="p-12 text-center rounded-2xl bg-gray-900 border border-gray-800 flex flex-col items-center justify-center">
                <Bell className="w-12 h-12 text-gray-700 mb-4" />
                <h3 className="text-xl font-medium text-gray-300">Không có thông báo nào</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-sm">Hòm thư của bạn trống trơn. Chúng tôi sẽ báo cho bạn khi có lịch Meeting mới hoặc cập nhật Hệ thống.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 relative">
            {notifications.map((note) => {
                const isUnread = !note.isRead;
                const isClickable = !!note.actionUrl || !!note.metadata;

                let Icon = Info;
                let colorClass = "text-blue-400 bg-blue-500/10 border-blue-500/20";

                if (note.type === "INVITE") {
                    Icon = Users;
                    colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                } else if (note.type === "REMINDER") {
                    Icon = CalendarDays;
                    colorClass = "text-orange-400 bg-orange-500/10 border-orange-500/20";
                } else {
                    Icon = Sparkles;
                    colorClass = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
                    if (note.title.toLowerCase().includes("failed") || note.title.toLowerCase().includes("error")) {
                        Icon = AlertOctagon;
                        colorClass = "text-red-400 bg-red-500/10 border-red-500/20";
                    }
                }

                return (
                    <div
                        key={note.id}
                        onClick={() => isClickable && handleNoteClick(note)}
                        className={`p-5 rounded-2xl border transition relative overflow-hidden flex items-start gap-4 
                            ${isUnread ? 'bg-gray-800/80 border-gray-700 hover:border-indigo-500/50' : 'bg-gray-900 border-gray-800 hover:bg-gray-800'}
                            ${isClickable ? 'cursor-pointer hover:shadow-lg' : ''}
                        `}
                    >
                        {isUnread && (
                            <div className="absolute top-0 right-0 p-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(79,70,229,1)]" />
                            </div>
                        )}

                        <div className={`p-3 rounded-xl border shrink-0 ${colorClass}`}>
                            <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1 mt-0.5">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-base font-medium ${isUnread ? 'text-white' : 'text-gray-300'}`}>
                                    {note.title}
                                </h4>
                                <span className="text-xs text-gray-500 shrink-0 mt-1 whitespace-nowrap">
                                    {format(new Date(note.createdAt), "h:mm a · MMM d")}
                                </span>
                            </div>
                            <p className={`text-sm ${isUnread ? 'text-gray-300' : 'text-gray-500'} ${isClickable && !note.metadata ? 'line-clamp-2' : ''}`}>
                                {note.message}
                            </p>
                            {isClickable && (
                                <p className="text-xs text-indigo-400 mt-2 font-medium">
                                    {note.actionUrl ? "Click to view event →" : "Click to view error log →"}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Error Detail Modal */}
            {selectedNote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <AlertOctagon className="w-5 h-5 text-red-500" /> System Report Log
                            </h3>
                            <button onClick={() => setSelectedNote(null)} className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-[#0a0a0a]">
                            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{selectedNote.message}</p>

                            <div className="bg-black border border-gray-800 rounded-xl p-4 overflow-x-auto">
                                <pre className="text-xs text-rose-300 font-mono">
                                    {JSON.stringify(selectedNote.metadata, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-800 bg-gray-900 text-right shrink-0">
                            <button onClick={() => setSelectedNote(null)} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition">
                                Close Log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
