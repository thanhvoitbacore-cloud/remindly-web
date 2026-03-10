"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Tag, CalendarClock, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function DashboardFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [q, setQ] = useState(searchParams.get("q") || "");
    const [priority, setPriority] = useState(searchParams.get("priority") || "");
    const [tag, setTag] = useState(searchParams.get("tag") || "");

    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (priority) params.set("priority", priority);
        if (tag) params.set("tag", tag);

        router.push(`/dashboard?${params.toString()}`);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-5 mb-6 flex flex-col md:flex-row gap-4 items-end shadow-md">
            <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-semibold uppercase text-gray-500 flex gap-1 items-center">
                    <Search className="w-3.5 h-3.5" /> Search Keyword
                </label>
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                    placeholder="Search titles, descriptions..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
            </div>

            <div className="w-full md:w-48 space-y-1.5 shrink-0">
                <label className="text-xs font-semibold uppercase text-gray-500 flex gap-1 items-center">
                    <Tag className="w-3.5 h-3.5" /> Category Tag
                </label>
                <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                    placeholder="E.g. Work, Health..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
            </div>

            <div className="w-full md:w-48 space-y-1.5 shrink-0">
                <label className="text-xs font-semibold uppercase text-gray-500 flex gap-1 items-center">
                    <AlertCircle className="w-3.5 h-3.5" /> Priority Level
                </label>
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white hover:border-gray-700 transition appearance-none"
                >
                    <option value="">All Priorities</option>
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                </select>
            </div>

            <button
                onClick={handleApplyFilters}
                className="w-full md:w-auto shrink-0 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
            >
                <Filter className="w-4 h-4" /> Apply Filter
            </button>
        </div>
    );
}
