"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createEventAction } from "./actions";
import { CalendarIcon, Clock, Tag, AlignLeft, AlertCircle, Bookmark, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import CustomTimePicker from "@/components/CustomTimePicker";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomTagSelector from "@/components/CustomTagSelector";

function CreateEventForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultDate = searchParams.get("date") || "";

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Xử lý nộp form
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        // Xác định nút bấm nào kích hoạt submit
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        if (submitter) {
            formData.append("actionType", submitter.value);
        } else {
            formData.append("actionType", "publish");
        }

        try {
            await createEventAction(formData);
            if (submitter?.value === "draft") {
                router.push("/drafts");
            } else {
                router.push("/calendar");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred.");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mb-4 inline-block transition">
                    &larr; Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create New Event</h1>
                <p className="text-gray-400">Schedule your upcoming tasks, appointments, or remainders.</p>
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
                            <Bookmark className="w-4 h-4 text-indigo-400" /> Event Title *
                        </label>
                        <input
                            required
                            type="text"
                            name="title"
                            placeholder="Engineering Sync, Doctor Appointment..."
                            className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white placeholder:text-gray-600 transition"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4 text-indigo-400" /> Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Add notes or location details here..."
                            className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white placeholder:text-gray-600 transition resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-400" /> Priority Level
                            </label>
                            <select
                                name="priority"
                                defaultValue="MEDIUM"
                                className="w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white transition appearance-none"
                            >
                                <option value="LOW">Low - Whenever possible</option>
                                <option value="MEDIUM">Medium - Normal schedule</option>
                                <option value="HIGH">High - Urgent / Critical</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-emerald-400" /> Category Tag
                            </label>
                            <CustomTagSelector name="categoryTag" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-purple-400" /> Date *
                            </label>
                            <CustomDatePicker
                                name="date"
                                required
                                defaultValue={defaultDate}
                            />
                        </div>

                        {/* Start Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" /> Start Time *
                            </label>
                            <CustomTimePicker name="startTime" required />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" /> End Time *
                            </label>
                            <CustomTimePicker name="endTime" required />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-800 flex flex-col-reverse md:flex-row items-center justify-end gap-3 md:gap-4">
                    {/* Hành động Save As Draft */}
                    <button
                        type="submit"
                        name="action"
                        value="draft"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 rounded-xl font-medium text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white transition disabled:opacity-50"
                    >
                        Save as Draft
                    </button>

                    {/* Hành động Publish Chính thức */}
                    <button
                        type="submit"
                        name="action"
                        value="publish"
                        disabled={loading}
                        className="w-full md:w-auto flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {loading ? "Saving..." : "Create Event"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function CreateEventPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400 animate-pulse">Loading form...</div>}>
            <CreateEventForm />
        </Suspense>
    );
}
