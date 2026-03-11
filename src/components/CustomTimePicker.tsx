"use client";

import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

export default function CustomTimePicker({
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

    // Parse initial value "HH:mm" to 12-hour format
    const initHour = defaultValue ? (parseInt(defaultValue.split(':')[0]) % 12 || 12).toString().padStart(2, '0') : "12";
    const initMin = defaultValue ? defaultValue.split(':')[1] : "00";
    const initPeriod = defaultValue ? (parseInt(defaultValue.split(':')[0]) >= 12 ? "PM" : "AM") : "AM";

    const [hour, setHour] = useState(initHour);
    const [minute, setMinute] = useState(initMin);
    const [period, setPeriod] = useState(initPeriod);

    const containerRef = useRef<HTMLDivElement>(null);
    const hourRef = useRef<HTMLDivElement>(null);
    const minRef = useRef<HTMLDivElement>(null);

    // Sync external `value` prop (for controlled components like Meeting AI Scheduler)
    useEffect(() => {
        if (value) {
            const hrInt = parseInt(value.split(':')[0]);
            if (!isNaN(hrInt)) {
                setHour((hrInt % 12 || 12).toString().padStart(2, '0'));
                setMinute(value.split(':')[1] || "00");
                setPeriod(hrInt >= 12 ? "PM" : "AM");
            }
        }
    }, [value]);

    // Compute backend 24-hour style for submission
    let submitHour = parseInt(hour, 10);
    if (period === "PM" && submitHour !== 12) submitHour += 12;
    if (period === "AM" && submitHour === 12) submitHour = 0;
    const submitValue = `${submitHour.toString().padStart(2, '0')}:${minute}`;

    // Trigger external onChange callback
    useEffect(() => {
        if (onChange) {
            onChange(submitValue);
        }
    }, [submitValue, onChange]);

    // Auto-scroll logic so the selected item is near the middle
    useEffect(() => {
        if (isOpen) {
            const hBtn = hourRef.current?.querySelector(`button[data-val="${hour}"]`) as HTMLElement;
            if (hBtn) hourRef.current!.scrollTop = hBtn.offsetTop - 80;

            const mBtn = minRef.current?.querySelector(`button[data-val="${minute}"]`) as HTMLElement;
            if (mBtn) minRef.current!.scrollTop = mBtn.offsetTop - 80;
        }
    }, [isOpen, hour, minute]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    return (
        <div className={`relative w-full ${disabled ? 'opacity-70 pointer-events-none' : ''}`} ref={containerRef}>
            <input type="hidden" name={name} value={submitValue} required={required} />

            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-xl p-3.5 text-white transition flex items-center justify-between shadow-sm ${isOpen ? 'ring-2 ring-indigo-500/50 bg-gray-700' : 'hover:bg-gray-700'} ${disabled ? 'bg-gray-900 cursor-not-allowed' : ''}`}
            >
                <span className="font-medium tracking-wide font-mono text-sm">{hour}:{minute} {period}</span>
                <Clock className="w-4 h-4 text-indigo-400" />
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[220px] bg-[#11131a] border border-gray-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-[100] flex animate-in fade-in zoom-in-95 slide-in-from-top-2 p-2 gap-2 h-[260px] ring-1 ring-white/5 overflow-hidden">
                    
                    {/* H O U R S */}
                    <div ref={hourRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scroll-smooth flex flex-col gap-1 pr-1 border-r border-gray-800/60 pb-10">
                        {hoursList.map(h => (
                            <button
                                key={h}
                                data-val={h}
                                type="button"
                                onClick={() => setHour(h)}
                                className={`shrink-0 h-10 rounded-lg text-sm font-medium transition-all ${h === hour ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-105' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                            >
                                {h}
                            </button>
                        ))}
                    </div>

                    {/* M I N U T E S */}
                    <div ref={minRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scroll-smooth flex flex-col gap-1 pr-1 border-r border-gray-800/60 pb-10">
                        {minutesList.map(m => (
                            <button
                                key={m}
                                data-val={m}
                                type="button"
                                onClick={() => setMinute(m)}
                                className={`shrink-0 h-10 rounded-lg text-sm font-medium transition-all ${m === minute ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-105' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* A M / P M */}
                    <div className="flex-1 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => setPeriod("AM")}
                            className={`flex-1 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${period === "AM" ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] ring-1 ring-indigo-400/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white bg-gray-900/50'}`}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            onClick={() => setPeriod("PM")}
                            className={`flex-1 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${period === "PM" ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] ring-1 ring-indigo-400/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white bg-gray-900/50'}`}
                        >
                            PM
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
