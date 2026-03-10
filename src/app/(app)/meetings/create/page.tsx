"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMeetingAction } from "./actions";
import { Users, AlignLeft, CalendarIcon, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import MeetingAIScheduler from "@/components/MeetingAIScheduler";

export default function CreateMeetingPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Controlled Form State
    const [participants, setParticipants] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        try {
            await createMeetingAction(formData);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Lỗi nạp Meeting mới");
            setLoading(false);
        }
    }

    // Callback từ AI Scheduler
    function handleAISuggestion(suggestedDate: string, suggestedTime: string) {
        setDate(suggestedDate);
        setStartTime(suggestedTime);
        // Default end time là 1 tiếng sau (ví dụ 09:00 -> 10:00)
        const [hr, min] = suggestedTime.split(":");
        const endHr = (parseInt(hr) + 1).toString().padStart(2, "0");
        setEndTime(`${endHr}:${min}`);
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div>
                <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mb-4 inline-block transition">
                    &larr; Quay lại
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Lên Lịch Cuộc Hỏi (Meeting)</h1>
                <p className="text-gray-400">Thêm người tham gia và sử dụng AI để dò tìn lịch họp chung phù hợp.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                            <Users className="w-4 h-4 text-indigo-400" /> Tên Cuộc Họp *
                        </label>
                        <input
                            required
                            type="text"
                            name="title"
                            placeholder="Design Review, Product Sync..."
                            className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white placeholder:text-gray-600 transition"
                        />
                    </div>

                    {/* Participants */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-400" /> Người tham dự (Email)
                        </label>
                        <input
                            type="text"
                            name="participants"
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value)}
                            placeholder="user1@example.com, john@remindly.com..."
                            className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white placeholder:text-gray-600 transition"
                        />
                        <p className="text-xs text-gray-500 mt-2">Ngăn cách các Email bằng dấu phẩy.</p>
                    </div>

                    {/* Component AI Phân Tích Lịch */}
                    <MeetingAIScheduler
                        participants={participants}
                        onSelectTime={handleAISuggestion}
                    />

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2 mt-6">
                            <AlignLeft className="w-4 h-4 text-blue-400" /> Mô tả ngắn gọn
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Agenda cuộc họp..."
                            className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white placeholder:text-gray-600 transition resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-gray-800 mt-6">
                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-purple-400" /> Ngày tổ chức *
                            </label>
                            <input
                                required
                                type="date"
                                name="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white transition color-scheme-dark"
                                style={{ colorScheme: "dark" }}
                            />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" /> Giờ bắt đầu *
                            </label>
                            <input
                                required
                                type="time"
                                name="startTime"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white transition"
                                style={{ colorScheme: "dark" }}
                            />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" /> Giờ kết thúc *
                            </label>
                            <input
                                required
                                type="time"
                                name="endTime"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white transition"
                                style={{ colorScheme: "dark" }}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-800 flex items-center justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 w-full md:w-auto"
                    >
                        {loading ? "Đang lên lịch..." : "Lưu & Báo Cáo"}
                    </button>
                </div>
            </form>
        </div>
    );
}
