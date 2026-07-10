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
        <div className="max-w-4xl mx-auto space-y-space-8 animate-in fade-in duration-500">
            <div>
                <Link href="/dashboard" className="text-accent-primary hover:opacity-80 text-sm font-medium mb-space-4 inline-block transition">
                    &larr; Back to Dashboard
                </Link>
                <h1 className="h1-premium text-text-main mb-space-2">Create New Event</h1>
                <p className="body-premium text-text-muted">Schedule your upcoming tasks, appointments, or remainders.</p>
            </div>

            {error && (
                <div className="p-space-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-space-3 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="body-premium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-space-6 bg-bg-surface border border-border-subtle p-space-8 rounded-2xl shadow-xl">
                <div className="space-y-space-4">
                    {/* Title */}
                    <div>
                        <label className="block body-premium font-medium text-text-muted mb-space-2 flex items-center gap-space-2">
                            <Bookmark className="w-4 h-4 text-accent-primary" /> Event Title *
                        </label>
                        <input
                            required
                            type="text"
                            name="title"
                            placeholder="Engineering Sync, Doctor Appointment..."
                            className="w-full bg-bg-primary border border-border-subtle outline-none focus:ring-2 focus:ring-accent-primary/30 rounded-xl p-3.5 text-text-main placeholder:text-text-muted/50 transition"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block body-premium font-medium text-text-muted mb-space-2 flex items-center gap-space-2">
                            <AlignLeft className="w-4 h-4 text-accent-primary" /> Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Add notes or location details here..."
                            className="w-full bg-bg-primary border border-border-subtle outline-none focus:ring-2 focus:ring-accent-primary/30 rounded-xl p-3.5 text-text-main placeholder:text-text-muted/50 transition resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
                        {/* Priority */}
                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2 flex items-center gap-space-2">
                                <AlertCircle className="w-4 h-4 text-orange-400" /> Priority Level
                            </label>
                            <select
                                name="priority"
                                defaultValue="MEDIUM"
                                className="w-full bg-bg-primary border border-border-subtle outline-none focus:ring-2 focus:ring-accent-primary/30 rounded-xl p-3.5 text-text-main transition appearance-none"
                            >
                                <option value="LOW">Low - Whenever possible</option>
                                <option value="MEDIUM">Medium - Normal schedule</option>
                                <option value="HIGH">High - Urgent / Critical</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2 flex items-center gap-space-2">
                                <Tag className="w-4 h-4 text-emerald-400" /> Category Tag
                            </label>
                            <CustomTagSelector name="categoryTag" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-6 pt-space-2">
                        {/* Date */}
                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2 flex items-center gap-space-2">
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
                            <label className="block body-premium font-medium text-text-muted mb-space-2 flex items-center gap-space-2">
                                <Clock className="w-4 h-4 text-purple-400" /> Start Time *
                            </label>
                            <CustomTimePicker name="startTime" required />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block body-premium font-medium text-text-muted mb-space-2 flex items-center gap-space-2">
                                <Clock className="w-4 h-4 text-purple-400" /> End Time *
                            </label>
                            <CustomTimePicker name="endTime" required />
                        </div>
                    </div>
                </div>

                <div className="pt-space-6 border-t border-border-subtle flex flex-col-reverse md:flex-row items-center justify-end gap-space-3 md:gap-space-4">
                    {/* Hành động Save As Draft */}
                    <button
                        type="submit"
                        name="action"
                        value="draft"
                        disabled={loading}
                        className="w-full md:w-auto px-space-6 py-space-3 rounded-xl font-medium text-sm text-text-muted bg-bg-primary hover:bg-bg-surface border border-border-subtle hover:text-text-main transition disabled:opacity-50 cursor-pointer"
                    >
                        Save as Draft
                    </button>

                    {/* Hành động Publish Chính thức */}
                    <button
                        type="submit"
                        name="action"
                        value="publish"
                        disabled={loading}
                        className="w-full md:w-auto flex justify-center items-center gap-space-2 px-space-6 py-space-3 rounded-xl font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
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
        <Suspense fallback={<div className="p-space-8 text-center text-gray-400 animate-pulse">Loading form...</div>}>
            <CreateEventForm />
        </Suspense>
    );
}
