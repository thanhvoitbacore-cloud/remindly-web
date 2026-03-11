"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomDatePicker({
    name,
    defaultValue,
    required,
    value,
    onChange,
    disabled
}: {
    name: string,
    defaultValue?: string,
    required?: boolean,
    value?: string,
    onChange?: (val: string) => void,
    disabled?: boolean
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // parse "YYYY-MM-DD"
    const parseDateStr = (str?: string) => {
        if (!str) return null;
        const parts = str.split("-").map(p => parseInt(p, 10));
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        return null;
    };

    const initialDate = parseDateStr(value || defaultValue);
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
    
    // View month
    const [viewDate, setViewDate] = useState<Date>(initialDate || new Date());

    useEffect(() => {
        if (value !== undefined) {
            const parsed = parseDateStr(value);
            setSelectedDate(parsed);
            if (parsed) setViewDate(parsed);
        }
    }, [value]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                // Reset view to selected date when closing
                if (selectedDate && !isOpen) {
                    setViewDate(selectedDate);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedDate, isOpen]);

    // Format for submission
    let submitValue = "";
    if (selectedDate) {
        submitValue = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    }

    // Trigger external onChange
    useEffect(() => {
        if (onChange) {
            onChange(submitValue);
        }
    }, [submitValue, onChange]);

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    // Calendar logic
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();
    
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    const blankDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const today = new Date();

    const handleSelectDay = (day: number) => {
        const newD = new Date(viewYear, viewMonth, day);
        setSelectedDate(newD);
        setIsOpen(false);
        const str = `${newD.getFullYear()}-${(newD.getMonth() + 1).toString().padStart(2, '0')}-${newD.getDate().toString().padStart(2, '0')}`;
        if (onChange) onChange(str);
    };

    const handleSetToday = () => {
        setSelectedDate(new Date());
        setViewDate(new Date());
        setIsOpen(false);
        const str = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        if (onChange) onChange(str);
    };

    const handleClear = () => {
        setSelectedDate(null);
        setIsOpen(false);
        if (onChange) onChange("");
    };

    const formatDateForDisplay = (d: Date | null) => {
        if (!d) return "Select date...";
        return `${monthNames[d.getMonth()].substring(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
    };

    return (
        <div className={`relative w-full ${disabled ? 'opacity-70 pointer-events-none' : ''}`} ref={containerRef}>
            <input type="hidden" name={name} value={submitValue} required={required} />

            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white transition flex items-center justify-between shadow-sm ${isOpen ? 'ring-2 ring-indigo-500/50 bg-gray-700' : 'hover:bg-gray-700'} ${disabled ? 'bg-gray-900 cursor-not-allowed' : ''}`}
            >
                <span className={`font-medium tracking-wide text-sm ${!selectedDate ? 'text-gray-500 font-normal' : ''}`}>
                    {formatDateForDisplay(selectedDate)}
                </span>
                <CalendarIcon className={`w-4 h-4 ${selectedDate ? 'text-indigo-400' : 'text-gray-500'}`} />
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[280px] bg-[#11131a] border border-gray-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-[100] animate-in fade-in zoom-in-95 slide-in-from-top-2 p-4 ring-1 ring-white/5">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="text-sm font-bold text-gray-200">
                            {monthNames[viewMonth]} {viewYear}
                        </div>
                        <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {weekDays.map(wd => (
                            <div key={wd} className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {wd}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {blankDays.map(b => <div key={`blank-${b}`} />)}
                        {monthDays.map(day => {
                            const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === viewMonth && selectedDate?.getFullYear() === viewYear;
                            const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;

                            let btnClass = "h-8 w-full rounded-lg text-sm flex items-center justify-center transition-all ";
                            if (isSelected) {
                                btnClass += "bg-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-105";
                            } else if (isToday) {
                                btnClass += "text-indigo-400 font-bold bg-indigo-500/10 hover:bg-indigo-500/20 ring-1 ring-indigo-500/30";
                            } else {
                                btnClass += "text-gray-300 hover:bg-gray-800 hover:text-white";
                            }

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleSelectDay(day); }}
                                    className={btnClass}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800/60">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleClear(); }} className="text-xs text-gray-500 hover:text-gray-300 font-medium transition">
                            Clear
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleSetToday(); }} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition flex items-center gap-1">
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
