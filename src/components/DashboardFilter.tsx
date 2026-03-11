"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Tag, AlertCircle } from "lucide-react";
import { useState } from "react";
import { parseTag } from "@/utils/tagParser";

export default function DashboardFilter({ availableTags }: { availableTags: string[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [q, setQ] = useState(searchParams.get("q") || "");
    const [priority, setPriority] = useState(searchParams.get("priority") || "");
    const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "");

    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (priority) params.set("priority", priority);
        if (selectedTag) params.set("tag", selectedTag);

        router.push(`/dashboard?${params.toString()}`);
    };

    const handleTagToggle = (tagStr: string) => {
        const isSelected = selectedTag === tagStr;
        const newTag = isSelected ? "" : tagStr;
        setSelectedTag(newTag);
        
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (priority) params.set("priority", priority);
        if (newTag) params.set("tag", newTag);
        
        router.push(`/dashboard?${params.toString()}`);
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-5 mb-6 flex flex-col gap-4 shadow-md">
            {/* Top Row: Search and Priority */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-1.5 min-w-[200px]">
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
                        <AlertCircle className="w-3.5 h-3.5" /> Priority
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
                    className="w-full md:w-auto shrink-0 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                >
                    <Filter className="w-4 h-4" /> Apply Filter
                </button>
            </div>

            {/* Bottom Row: Category Chips */}
            <div className="w-full space-y-2 pt-2 border-t border-gray-800">
                <label className="text-xs font-semibold uppercase text-gray-500 flex gap-1 items-center">
                    <Tag className="w-3.5 h-3.5" /> Active Categories
                </label>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleTagToggle(selectedTag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            !selectedTag ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                        All
                    </button>
                    {availableTags.map(tagStr => {
                        const parsed = parseTag(tagStr);
                        const isSelected = selectedTag === tagStr;
                        return (
                            <button
                                key={tagStr}
                                onClick={() => handleTagToggle(tagStr)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
                                    isSelected 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {parsed && <span className={`w-2.5 h-2.5 rounded-full ${parsed.color}`}></span>}
                                {parsed ? parsed.label : tagStr}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
