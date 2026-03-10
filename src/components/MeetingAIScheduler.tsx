"use client";

import { useState } from "react";
import { suggestMeetingTimes } from "@/app/(app)/meetings/create/actions";
import { Sparkles, XCircle, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface Props {
    participants: string; // Comma separated emails
    onSelectTime: (date: string, time: string) => void;
}

export default function MeetingAIScheduler({ participants, onSelectTime }: Props) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    async function handleSuggest() {
        if (!participants.trim()) {
            setError("Vui lòng thêm ít nhất 1 email người tham gia để AI phân tích.");
            return;
        }

        setError(null);
        setLoading(true);
        setSuggestions([]);

        try {
            const emailList = participants.split(",").map(e => e.trim()).filter(Boolean);
            const result = await suggestMeetingTimes(emailList);

            if (!result.success || !result.suggestions) {
                setError(result.error || "Không tìm thấy kết quả phù hợp.");
            } else {
                setSuggestions(result.suggestions);
            }
        } catch (err: any) {
            setError(err.message || "Quá trình nạp AI thất bại");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 mt-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-white tracking-wide">AI Auto-Scheduling</h4>
                        <p className="text-sm text-gray-400">Tự động tìm khung giờ trống dựa trên Lịch của mọi người.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleSuggest}
                    disabled={loading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
                >
                    {loading ? "Đang phân tích..." : "Gợi ý lịch"}
                </button>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="mt-6 space-y-3">
                    <p className="text-sm font-medium text-indigo-300">Các khung giờ hoàn hảo được AI đề xuất (Bấm để gán):</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {suggestions.map((isoString, idx) => {
                            const d = new Date(isoString);
                            // Set end time 1 hour defaults
                            const targetDate = format(d, "yyyy-MM-dd");
                            const targetTimeStr = format(d, "HH:mm");

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => onSelectTime(targetDate, targetTimeStr)}
                                    className="p-3 bg-gray-900 border border-indigo-500/30 hover:border-indigo-400 rounded-xl text-left transition flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="text-white font-medium text-sm flex items-center gap-1.5 mb-1">
                                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                            {format(d, "HH:mm a")}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {format(d, "EEEE, MMM d")}
                                        </div>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition" />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
