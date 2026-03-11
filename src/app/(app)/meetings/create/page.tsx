"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMeetingAction, createInstantMeetingAction } from "./actions";
import { Users, AlignLeft, CalendarIcon, Clock, AlertCircle, Zap, Video, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import MeetingAIScheduler from "@/components/MeetingAIScheduler";
import CustomTimePicker from "@/components/CustomTimePicker";
import CustomDatePicker from "@/components/CustomDatePicker";

export default function CreateMeetingPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const [meetingType, setMeetingType] = useState<"SCHEDULED" | "INSTANT">("SCHEDULED");
    const [instantLink, setInstantLink] = useState<string | null>(null);
    const [activeMeeting, setActiveMeeting] = useState<any>(null);
    const [loadingActive, setLoadingActive] = useState(true);

    useEffect(() => {
        import("./actions").then(m => m.getActiveInstantMeeting()).then(res => {
            setActiveMeeting(res);
            setLoadingActive(false);
            if (res) {
                setMeetingType("INSTANT");
                setInstantLink(res.location);
            }
        });
    }, []);

    // Controlled Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [participants, setParticipants] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setInstantLink(null);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("participants", participants);

        if (meetingType === "SCHEDULED") {
            formData.append("date", date);
            formData.append("startTime", startTime);
            formData.append("endTime", endTime);

            try {
                await createMeetingAction(formData);
                router.push("/dashboard");
            } catch (err: any) {
                setError(err.message || "Lỗi nạp Meeting mới");
                setLoading(false);
            }
        } else {
            // INSTANT
            try {
                const res = await createInstantMeetingAction(formData);
                if (res.success && res.eventId) {
                    const actions = await import("./actions");
                    const am = await actions.getActiveInstantMeeting();
                    setActiveMeeting(am);
                    setInstantLink(res.link || null);
                } else {
                    setError((res as any).error || "Lỗi tạo Instant Meeting");
                }
                setLoading(false);
            } catch (err: any) {
                setError(err.message || "Lỗi nạp Instant Meeting");
                setLoading(false);
            }
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
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Khởi Tạo Cuộc Họp</h1>
                <p className="text-gray-400 mb-6">Chọn lên lịch trước hoặc mở ngay một phiên họp tức thì.</p>

                {/* Tabs */}
                <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 w-full max-w-sm mb-8">
                    <button
                        onClick={() => setMeetingType("SCHEDULED")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${meetingType === "SCHEDULED" ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                    >
                        <CalendarIcon className="w-4 h-4" /> Lên Lịch Họp (Scheduled)
                    </button>
                    <button
                        onClick={() => setMeetingType("INSTANT")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${meetingType === "INSTANT" ? 'bg-amber-500 text-gray-900 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
                    >
                        <Zap className="w-4 h-4" /> Khởi Tạo Ngay (Instant)
                    </button>
                </div>
            </div>

            {instantLink && !activeMeeting && (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/50 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
                            <Video className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-emerald-400 mb-1 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5" /> Cuộc họp đã sẵn sàng!
                            </h3>
                            <p className="text-sm text-gray-300">Share link này cho những người khác hoặc click vào để chuyển hướng ngay.</p>
                            <a href={instantLink} target="_blank" rel="noreferrer" className="text-emerald-400 font-mono font-medium text-sm block mt-3 underline hover:text-emerald-300 transition break-all">
                                {instantLink}
                            </a>
                        </div>
                    </div>
                    <a href={instantLink} target="_blank" rel="noreferrer" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shrink-0 w-full md:w-auto text-center border border-emerald-500/50">
                        Tham Gia Ngay
                    </a>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="relative">
            {loadingActive ? (
                <div className="p-12 flex justify-center items-center bg-gray-900 border border-gray-800 rounded-2xl shadow-xl">
                    <div className="w-8 h-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                </div>
            ) : meetingType === "INSTANT" && activeMeeting ? (
                <div className="p-8 bg-gray-900 border border-emerald-500/50 rounded-2xl shadow-xl space-y-6 animate-in fade-in">
                    <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
                        <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                            <Video className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{activeMeeting.title || "Phiên Họp Tức Thì"}</h2>
                            <p className="text-gray-400">Host: {activeMeeting.owner?.name || activeMeeting.owner?.email || "Unknown"}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-300">Link tham gia cuộc họp:</p>
                        <div className="p-4 bg-black/50 border border-gray-800 rounded-xl font-mono text-emerald-400 break-all select-all">
                            {activeMeeting.location || instantLink}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-800">
                        <a href={activeMeeting.location || instantLink || "#"} target="_blank" rel="noreferrer" className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] text-center flex items-center justify-center gap-2">
                            <Video className="w-5 h-5" /> Tham Gia Ngay
                        </a>
                        
                        {activeMeeting.meetings?.some((m: any) => m.role === "HOST") ? (
                            <button onClick={async () => {
                                setLoadingActive(true);
                                const { endInstantMeeting } = await import("./actions");
                                await endInstantMeeting(activeMeeting.id);
                                setActiveMeeting(null);
                                setInstantLink(null);
                                setLoadingActive(false);
                            }} className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-xl transition border border-red-500/20 shrink-0 flex justify-center items-center gap-2">
                                <AlertCircle className="w-5 h-5" /> Kết thúc (End)
                            </button>
                        ) : (
                            <button onClick={async () => {
                                setLoadingActive(true);
                                const { leaveInstantMeeting } = await import("./actions");
                                await leaveInstantMeeting(activeMeeting.id);
                                setActiveMeeting(null);
                                setInstantLink(null);
                                setLoadingActive(false);
                            }} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition border border-gray-700 shrink-0 flex justify-center items-center gap-2">
                                <AlertCircle className="w-5 h-5" /> Rời khỏi (Leave)
                            </button>
                        )}
                    </div>
                </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4 text-indigo-400" /> Tên Cuộc Họp {meetingType === "SCHEDULED" && "*"}
                        </label>
                        <input
                            required={meetingType === "SCHEDULED"}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                            value={participants}
                            onChange={(e) => setParticipants(e.target.value)}
                            placeholder="user1@example.com, john@remindly.com..."
                            className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white placeholder:text-gray-600 transition"
                        />
                        <p className="text-xs text-gray-500 mt-2">Ngăn cách các Email bằng dấu phẩy. Sẽ tự động gửi thư {meetingType === "INSTANT" ? "mời họp ngay" : "hẹn lịch"}.</p>
                    </div>

                    {/* Component AI Phân Tích Lịch (Only for SCHEDULED) */}
                    {meetingType === "SCHEDULED" && (
                        <MeetingAIScheduler
                            participants={participants}
                            onSelectTime={handleAISuggestion}
                        />
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2 mt-6">
                            <AlignLeft className="w-4 h-4 text-blue-400" /> Mô tả ngắn gọn
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Agenda cuộc họp..."
                            className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white placeholder:text-gray-600 transition resize-none"
                        />
                    </div>

                    {meetingType === "SCHEDULED" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-gray-800 mt-6">
                            {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-purple-400" /> Ngày tổ chức *
                            </label>
                            <CustomDatePicker
                                name="date"
                                required
                                value={date}
                                onChange={setDate}
                            />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" /> Giờ bắt đầu *
                            </label>
                            <CustomTimePicker
                                name="startTime"
                                required
                                value={startTime}
                                onChange={setStartTime}
                            />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" /> Giờ kết thúc *
                            </label>
                            <CustomTimePicker
                                name="endTime"
                                required
                                value={endTime}
                                onChange={setEndTime}
                            />
                        </div>
                    </div>
                    )}
                </div>

                <div className="pt-6 mt-6 border-t border-gray-800 flex items-center justify-end">
                    {meetingType === "SCHEDULED" ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 w-full md:w-auto"
                        >
                            {loading ? "Đang lên lịch..." : "Lưu & Báo Cáo"}
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-xl font-bold text-sm text-gray-900 bg-amber-500 hover:bg-amber-400 transition shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50 w-full md:w-auto flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            {loading ? "Đang tạo..." : "Launch Instant Meeting"}
                        </button>
                    )}
                </div>
            </form>
            )}
            </div>
        </div>
    );
}
