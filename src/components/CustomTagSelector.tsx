"use client";

import { useState, useRef, useEffect } from "react";
import { Tag, Plus, X, Check } from "lucide-react";
import { parseTag, PREDEFINED_TAGS, CUSTOM_COLORS } from "@/utils/tagParser";

interface CustomTagSelectorProps {
    name: string;
    defaultValue?: string;
    disabled?: boolean;
}

export default function CustomTagSelector({ name, defaultValue = "", disabled = false }: CustomTagSelectorProps) {
    const [selectedTag, setSelectedTag] = useState<string>(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [isCreatingCustom, setIsCreatingCustom] = useState(false);
    
    const [customLabel, setCustomLabel] = useState("");
    const [customColor, setCustomColor] = useState(CUSTOM_COLORS[0]);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsCreatingCustom(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectTag = (tagStr: string) => {
        setSelectedTag(tagStr);
        setIsOpen(false);
    };

    const handleCreateCustom = () => {
        const trimmed = customLabel.trim();
        if (trimmed) {
            const tagStr = `${trimmed}|${customColor}`;
            setSelectedTag(tagStr);
            setIsOpen(false);
            setIsCreatingCustom(false);
            setCustomLabel("");
        }
    };

    const parsedCurrent = parseTag(selectedTag);

    return (
        <div className="relative" ref={dropdownRef}>
            <input type="hidden" name={name} value={selectedTag} />
            
            <button
                type="button"
                className={`w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-left transition-all ${
                    disabled ? "opacity-70 cursor-not-allowed" : "hover:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-500" />
                </div>
                
                {parsedCurrent ? (
                    <span className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${parsedCurrent.color}`}></span>
                        <span className="text-white">{parsedCurrent.label}</span>
                    </span>
                ) : (
                    <span className="text-gray-600">No category selected...</span>
                )}
            </button>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden p-2 animate-in fade-in slide-in-from-top-2">
                    {!isCreatingCustom ? (
                        <div className="space-y-1">
                            {/* Empty option to clear */}
                            <button
                                type="button"
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 text-gray-400 text-sm transition"
                                onClick={() => handleSelectTag("")}
                            >
                                <X className="w-4 h-4" /> None
                            </button>
                            
                            {PREDEFINED_TAGS.map(tag => (
                                <button
                                    key={tag.label}
                                    type="button"
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 text-white text-sm transition"
                                    onClick={() => handleSelectTag(tag.label)}
                                >
                                    <span className={`w-3 h-3 rounded-full ${tag.color}`}></span>
                                    {tag.label}
                                    {selectedTag === tag.label && <Check className="w-4 h-4 ml-auto text-indigo-400" />}
                                </button>
                            ))}

                            {/* Divider */}
                            <div className="h-px bg-gray-800 my-2"></div>

                            {/* Create Custom */}
                            <button
                                type="button"
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 text-sm font-medium transition font-semibold"
                                onClick={() => setIsCreatingCustom(true)}
                            >
                                <Plus className="w-4 h-4" /> Create Custom Tag
                            </button>
                        </div>
                    ) : (
                        <div className="p-3 space-y-4">
                            <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                <Plus className="w-4 h-4 text-indigo-400" />
                                Custom Tag
                            </h4>
                            
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5">Tag Name</label>
                                <input
                                    type="text"
                                    value={customLabel}
                                    onChange={(e) => setCustomLabel(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. Flight, Gym..."
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCustom())}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-2">Color Label</label>
                                <div className="flex flex-wrap gap-2">
                                    {CUSTOM_COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setCustomColor(color)}
                                            className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${color} ${
                                                customColor === color ? "border-white scale-110" : "border-transparent"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingCustom(false)}
                                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateCustom}
                                    disabled={!customLabel.trim()}
                                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
