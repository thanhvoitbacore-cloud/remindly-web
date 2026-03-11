"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, CalendarClock, Tag, AlignLeft, AlertCircle, FileEdit, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { updateEventAction, deleteEventAction } from "./actions";
import CustomTimePicker from "@/components/CustomTimePicker";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomTagSelector from "@/components/CustomTagSelector";

interface EditFormProps {
    eventId: string;
    initialData: {
        title: string;
        description: string;
        date: string;
        startTime: string;
        endTime: string;
        priority: "LOW" | "MEDIUM" | "HIGH";
        categoryTag: string;
        isDraft: boolean;
        userRole?: "HOST" | "ATTENDEE";
        currentRsvp?: string;
    }
}

export default function EditEventClientForm({ eventId, initialData }: EditFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFixedMeeting = initialData.categoryTag === "Meeting" || initialData.categoryTag === "Meeting|bg-yellow-200";

    async function handleUpdate(formData: FormData) {
        setIsSubmitting(true);
        setError(null);
        try {
            await updateEventAction(eventId, formData);
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
            setIsSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
        setIsDeleting(true);
        try {
            await deleteEventAction(eventId);
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError("Cannot delete event: " + err.message);
            setIsDeleting(false);
        }
    }

    return (
        <form action={handleUpdate} className="space-y-8 bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm flex gap-3 items-center animate-in fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {initialData.userRole === "ATTENDEE" && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-sm flex gap-3 items-center mb-6">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>You are an invitee to this event. You cannot edit its details, but you can manage your RSVP status below.</p>
                </div>
            )}

            {/* Thông tin Cơ bản */}
            <div className={`space-y-6 ${initialData.userRole === "ATTENDEE" ? "opacity-60 pointer-events-none" : ""}`}>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Event Title
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FileEdit className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            name="title"
                            defaultValue={initialData.title}
                            required
                            disabled={initialData.userRole === "ATTENDEE"}
                            className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-gray-600 disabled:opacity-70 disabled:bg-gray-900"
                            placeholder="Design Review Meeting"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                    </label>
                    <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                            <AlignLeft className="h-5 w-5 text-gray-500" />
                        </div>
                        <textarea
                            name="description"
                            defaultValue={initialData.description}
                            rows={4}
                            disabled={initialData.userRole === "ATTENDEE"}
                            className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-gray-600 resize-none disabled:opacity-70 disabled:bg-gray-900"
                            placeholder="Add details, agendas, or links (Optional)"
                        />
                    </div>
                </div>
            </div>

            {/* Phân loại Data */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 ${initialData.userRole === "ATTENDEE" ? "opacity-60 pointer-events-none" : ""}`}>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Priority Level
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <AlertCircle className="h-5 w-5 text-gray-500" />
                        </div>
                        <select
                            name="priority"
                            defaultValue={initialData.priority}
                            disabled={initialData.userRole === "ATTENDEE" || isFixedMeeting}
                            className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none disabled:opacity-70 disabled:bg-gray-900"
                        >
                            <option value="LOW">Low - No Rush</option>
                            <option value="MEDIUM">Medium - Normal</option>
                            <option value="HIGH">High - Urgent</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category Tag
                    </label>
                    <CustomTagSelector 
                        name="categoryTag" 
                        defaultValue={initialData.categoryTag} 
                        disabled={initialData.userRole === "ATTENDEE" || isFixedMeeting} 
                    />
                </div>
            </div>

            {/* Thời gian Setup */}
            <div className={`bg-gray-950/50 rounded-2xl p-6 border border-gray-800 space-y-6 ${initialData.userRole === "ATTENDEE" ? "opacity-60 pointer-events-none" : ""}`}>
                <h3 className="text-white font-medium flex gap-2 items-center">
                    <CalendarClock className="w-5 h-5 text-indigo-400" /> Time Setting
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Date</label>
                        <CustomDatePicker
                            name="date"
                            defaultValue={initialData.date}
                            required
                            disabled={initialData.userRole === "ATTENDEE"}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Start Time</label>
                        <CustomTimePicker 
                            name="startTime" 
                            defaultValue={initialData.startTime} 
                            required 
                            disabled={initialData.userRole === "ATTENDEE"} 
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">End Time</label>
                        <CustomTimePicker 
                            name="endTime" 
                            defaultValue={initialData.endTime} 
                            required 
                            disabled={initialData.userRole === "ATTENDEE"} 
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons Zone */}
            <div className="pt-6 border-t border-gray-800 flex flex-col-reverse md:flex-row items-center justify-between gap-4">
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={isSubmitting || isDeleting}
                        className="flex-1 md:flex-none justify-center items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 inline-flex"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>

                    {initialData.userRole === "HOST" && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSubmitting || isDeleting}
                            className="flex-1 md:flex-none justify-center items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-medium transition disabled:opacity-50 inline-flex group"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                            Delete
                        </button>
                    )}
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {initialData.userRole === "HOST" ? (
                        <>
                            {initialData.isDraft && (
                                <button
                                    type="submit"
                                    name="actionType"
                                    value="draft"
                                    disabled={isSubmitting || isDeleting}
                                    className="flex-1 md:flex-none justify-center items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition disabled:opacity-50 inline-flex"
                                >
                                    Keep Draft
                                </button>
                            )}
                            <button
                                type="submit"
                                name="actionType"
                                value="publish"
                                disabled={isSubmitting || isDeleting}
                                className="flex-1 md:flex-none justify-center items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 inline-flex"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {initialData.isDraft ? "Publish Event" : "Save Changes"}
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <span className="text-xs text-gray-500 mr-2 uppercase tracking-wide font-semibold flex items-center gap-2">
                                RSVP Status:
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                    initialData.currentRsvp === "ACCEPTED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                    initialData.currentRsvp === "DECLINED" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                    "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                }`}>
                                    {initialData.currentRsvp}
                                </span>
                            </span>

                            {initialData.currentRsvp !== "ACCEPTED" && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setIsSubmitting(true);
                                        const { manageMeetingRSVP } = await import("@/app/(app)/events/actions");
                                        await manageMeetingRSVP(eventId, "ACCEPTED");
                                        router.push("/dashboard");
                                        router.refresh();
                                    }}
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 inline-flex"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Accept
                                </button>
                            )}

                            {initialData.currentRsvp !== "DECLINED" && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setIsSubmitting(true);
                                        const { manageMeetingRSVP } = await import("@/app/(app)/events/actions");
                                        await manageMeetingRSVP(eventId, "DECLINED");
                                        router.push("/dashboard");
                                        router.refresh();
                                    }}
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-medium transition disabled:opacity-50 inline-flex"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Decline
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
