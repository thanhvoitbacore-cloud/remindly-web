"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, Sparkles, Info, CalendarDays, Users, X, AlertOctagon, Trash2 } from "lucide-react";
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
            <div className="p-space-12 text-center rounded-2xl bg-bg-surface border border-border-subtle flex flex-col items-center justify-center">
                <Bell className="w-12 h-12 text-text-muted mb-space-4" />
                <h3 className="h2-premium text-text-main">Không có thông báo nào</h3>
                <p className="body-premium text-text-muted mt-space-2 max-w-sm">Hòm thư của bạn trống trơn. Chúng tôi sẽ báo cho bạn khi có lịch Meeting mới hoặc cập nhật Hệ thống.</p>
            </div>
        );
    }

    return (
        <div className="space-y-space-4 relative">
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
                        className={`p-space-5 rounded-2xl border transition relative overflow-hidden flex items-start gap-space-4 
                            ${isUnread ? 'bg-bg-primary/80 border-border-subtle hover:border-accent-primary/50' : 'bg-bg-surface border-border-subtle hover:bg-bg-primary'}
                            ${isClickable ? 'cursor-pointer hover:shadow-lg' : ''}
                        `}
                    >
                        {isUnread && (
                            <div className="absolute top-0 right-0 p-space-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            </div>
                        )}

                        <div className={`p-space-3 rounded-xl border shrink-0 ${colorClass}`}>
                            <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1 mt-0.5">
                            <div className="flex justify-between items-start mb-space-1 gap-space-2">
                                <h4 className={`h3-premium ${isUnread ? 'text-text-main' : 'text-text-main/80'}`}>
                                    {note.title}
                                </h4>
                                <div className="flex items-center gap-space-3 shrink-0">
                                    <span className="caption-premium text-text-muted whitespace-nowrap">
                                        {format(new Date(note.createdAt), "h:mm a · MMM d")}
                                    </span>
                                    {/* Delete Notification Button */}
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const { deleteNotificationAction } = await import("@/app/(app)/notifications/actions");
                                            await deleteNotificationAction(note.id);
                                        }}
                                        className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                                        title="Delete Notification from history"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className={`body-premium ${isUnread ? 'text-text-main/80' : 'text-text-muted'} ${isClickable && !note.metadata ? 'line-clamp-2' : ''}`}>
                                {note.message}
                            </p>
                            {note.type === "INVITE" && note.metadata?.eventId && (
                                <div className="flex gap-space-2 mt-space-3 cursor-default">
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const { handleInstantRsvpAction } = await import("./actions");
                                            const res = await handleInstantRsvpAction(note.id, note.metadata.eventId, true);
                                            if (res?.success) router.push('/meetings/create');
                                        }}
                                        className="px-space-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                                    >Tham gia</button>
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const { handleInstantRsvpAction } = await import("./actions");
                                            await handleInstantRsvpAction(note.id, note.metadata.eventId, false);
                                        }}
                                        className="px-space-4 py-1.5 bg-bg-primary hover:bg-bg-surface text-text-muted hover:text-text-main border border-border-subtle rounded-lg text-sm font-medium transition cursor-pointer"
                                    >Từ chối</button>
                                </div>
                            )}
                            {note.type !== "INVITE" && isClickable && (
                                <p className="caption-premium text-accent-primary mt-space-2 font-medium">
                                    {note.actionUrl ? "Click to view event →" : "Click to view error log →"}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Error Detail Modal */}
            {selectedNote && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-space-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-bg-surface border border-border-subtle rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
                        <div className="p-space-5 border-b border-border-subtle flex justify-between items-center bg-bg-surface">
                            <h3 className="h2-premium text-text-main flex items-center gap-space-2">
                                <AlertOctagon className="w-5 h-5 text-red-500" /> System Report Log
                            </h3>
                            <button onClick={() => setSelectedNote(null)} className="p-1.5 hover:bg-bg-primary rounded-lg text-text-muted hover:text-text-main transition cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-space-6 overflow-y-auto bg-bg-primary">
                            <p className="body-premium text-text-main mb-space-4 leading-relaxed">{selectedNote.message}</p>

                            <div className="bg-bg-primary border border-border-subtle p-space-4 overflow-x-auto rounded-xl">
                                <pre className="caption-premium text-rose-300 font-mono">
                                    {JSON.stringify(selectedNote.metadata, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="p-space-4 border-t border-border-subtle bg-bg-surface text-right shrink-0">
                            <button onClick={() => setSelectedNote(null)} className="px-space-4 py-space-2 bg-bg-primary hover:bg-bg-surface text-text-main border border-border-subtle rounded-xl text-sm font-medium transition cursor-pointer">
                                Close Log
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
