"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { X, CalendarIcon, Users, Clock, AlignLeft, AlertCircle } from "lucide-react";
import { parseTag } from "@/utils/tagParser";

const TW_BACKGROUND_COLORS: Record<string, string> = {
    "bg-blue-500": "#3b82f6",
    "bg-orange-500": "#f97316",
    "bg-emerald-500": "#10b981",
    "bg-rose-500": "#f43f5e",
    "bg-amber-500": "#f59e0b",
    "bg-red-500": "#ef4444",
    "bg-pink-500": "#ec4899",
    "bg-purple-500": "#a855f7",
    "bg-indigo-500": "#6366f1",
    "bg-cyan-500": "#06b6d4",
    "bg-teal-500": "#14b8a6",
    "bg-lime-500": "#84cc16",
    "bg-yellow-500": "#eab308",
    "bg-gray-500": "#6b7280"
};

const locales = {
    "en-US": enUS
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
});

interface ParsedEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    description: string | null;
    type: "MEETING" | "EVENT";
    priority: "LOW" | "MEDIUM" | "HIGH";
    location?: string | null;
    categoryTag?: string | null;
}

interface CalendarProps {
    initialEvents: ParsedEvent[];
}

export default function ClientCalendar({ initialEvents }: CalendarProps) {
    const [view, setView] = useState<View>("month");
    const [date, setDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<ParsedEvent | null>(null);

    // Fix toggle flashing bug for calendar "+X more" popups natively
    useEffect(() => {
        let preventClick = false;

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && target.closest('.rbc-show-more')) {
                const overlay = document.querySelector('.rbc-overlay');
                if (overlay) {
                    preventClick = true;
                }
            }
        };

        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target && target.closest('.rbc-show-more') && preventClick) {
                e.stopPropagation();
                e.preventDefault();
                preventClick = false;
            }
        };

        window.addEventListener('mousedown', handleMouseDown, true);
        window.addEventListener('click', handleClick, true);
        return () => {
            window.removeEventListener('mousedown', handleMouseDown, true);
            window.removeEventListener('click', handleClick, true);
        };
    }, []);

    // Fix Event parsing bug: Server components serialize dates to Strings in Next 15 sometimes.
    // Also fix timezone offset bugs: Server formats dates using UTC locally, while browser client shifts them.
    // By extracting the UTC components, we "float" the server time into the local browser time correctly.
    const mappedEvents = initialEvents.map(e => {
        const startRaw = new Date(e.start);
        const endRaw = new Date(e.end);
        return {
            ...e,
            start: new Date(startRaw.getUTCFullYear(), startRaw.getUTCMonth(), startRaw.getUTCDate(), startRaw.getUTCHours(), startRaw.getUTCMinutes()),
            end: new Date(endRaw.getUTCFullYear(), endRaw.getUTCMonth(), endRaw.getUTCDate(), endRaw.getUTCHours(), endRaw.getUTCMinutes())
        };
    });

    const handleSelectSlot = ({ start }: { start: Date }) => {
        // Rediect to create page with prefilled Date
        const prefilledDate = format(start, "yyyy-MM-dd");
        window.location.href = `/events/create?date=${prefilledDate}`;
    };

    // Custom UI Component cho Calendar Cells
    const eventStyleGetter = (event: ParsedEvent) => {
        let backgroundColor = "#8b5cf6"; // Vivid Violet (Default Events)
        let borderLeft = "4px solid #a78bfa"; // Light Violet

        if (event.categoryTag) {
            const parsed = parseTag(event.categoryTag);
            if (parsed && TW_BACKGROUND_COLORS[parsed.color]) {
                backgroundColor = TW_BACKGROUND_COLORS[parsed.color];
                borderLeft = `4px solid ${TW_BACKGROUND_COLORS[parsed.color]}`;
            }
        } else if (event.type === "MEETING") {
            backgroundColor = "#059669"; // Emerald 
            borderLeft = "4px solid #34d399";
        }

        if (event.priority === "HIGH") {
            borderLeft = "4px solid #ef4444"; // Red for high priority
        }

        return {
            style: {
                backgroundColor,
                color: "white",
                border: "none",
                borderRadius: "6px",
                borderLeft,
                opacity: 0.9,
                fontSize: "12px",
                fontWeight: 500,
                padding: "2px 6px"
            }
        };
    };

    return (
        <div className="h-full min-h-[600px] w-full relative flex flex-col pt-2 pb-10">
            {/* Wrapper CSS Overrides cho chế độ Dark Mode của react-big-calendar */}
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-4 overflow-hidden calendar-dark-theme">
                <style jsx global>{`
                    .calendar-dark-theme .rbc-calendar { 
                        font-family: inherit; 
                        color: #e5e7eb; 
                    }
                    .calendar-dark-theme .rbc-month-view, 
                    .calendar-dark-theme .rbc-time-view, 
                    .calendar-dark-theme .rbc-agenda-view { 
                        border: 1px solid #1f2937; 
                        border-radius: 12px; 
                        overflow: hidden; 
                        background-color: #111827;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    }
                    .calendar-dark-theme .rbc-header { 
                        border-bottom: 1px solid #1f2937; 
                        border-left: 1px solid #1f2937;
                        font-weight: 600; 
                        padding: 12px 0; 
                        color: #9ca3af; 
                        text-transform: uppercase; 
                        font-size: 11px; 
                        letter-spacing: 0.05em;
                        background-color: #030712;
                    }
                    .calendar-dark-theme .rbc-day-bg { 
                        border-left: 1px solid #1f2937; 
                        transition: background-color 0.2s ease;
                    }
                    .calendar-dark-theme .rbc-day-bg + .rbc-day-bg {
                        border-left: 1px solid #1f2937;
                    }
                    .calendar-dark-theme .rbc-day-bg:hover {
                        background-color: rgba(31, 41, 55, 0.4);
                    }
                    .calendar-dark-theme .rbc-month-row { 
                        border-top: 1px solid #1f2937; 
                        overflow: visible !important;
                        flex: 1 0 160px; /* Force minimum height to allow stacking up to 4 events */
                    }
                    .calendar-dark-theme .rbc-month-row + .rbc-month-row {
                        border-top: 1px solid #1f2937;
                    }
                    .calendar-dark-theme .rbc-row-content {
                        z-index: 4;
                    }
                    /* style the '+X more' text */
                    .calendar-dark-theme .rbc-show-more {
                        color: #6366f1;
                        font-weight: 600;
                        font-size: 11px;
                        padding: 2px 8px;
                        margin-top: 2px;
                        background-color: rgba(99, 102, 241, 0.1);
                        border-radius: 4px;
                        display: inline-block;
                        transition: all 0.2s;
                    }
                    .calendar-dark-theme .rbc-show-more:hover {
                        background-color: rgba(99, 102, 241, 0.2);
                        color: #818cf8;
                    }
                    .calendar-dark-theme .rbc-off-range-bg { 
                        background-color: #030712; 
                    }
                    .calendar-dark-theme .rbc-today { 
                        background-color: rgba(99, 102, 241, 0.05); 
                    }
                    .calendar-dark-theme .rbc-date-cell { 
                        padding: 8px 12px; 
                        font-weight: 500; 
                        font-size: 14px;
                        color: #9ca3af;
                    }
                    .calendar-dark-theme .rbc-date-cell.rbc-now {
                        color: #818cf8;
                        font-weight: 700;
                    }
                    
                    /* Toolbar Styling */
                    .calendar-dark-theme .rbc-toolbar {
                        margin-bottom: 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .calendar-dark-theme .rbc-toolbar-label {
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #f3f4f6;
                    }
                    .calendar-dark-theme .rbc-btn-group {
                        display: flex;
                        gap: 4px;
                        background-color: #111827;
                        padding: 4px;
                        border-radius: 10px;
                        border: 1px solid #1f2937;
                    }
                    .calendar-dark-theme .rbc-btn-group button { 
                        color: #9ca3af; 
                        border: none;
                        border-radius: 6px;
                        background: transparent; 
                        padding: 6px 16px;
                        font-size: 13px;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    }
                    .calendar-dark-theme .rbc-btn-group button:hover { 
                        background-color: #374151; 
                        color: white; 
                    }
                    .calendar-dark-theme .rbc-btn-group button.rbc-active { 
                        background-color: #4f46e5; 
                        color: white; 
                        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    }
                    .calendar-dark-theme .rbc-toolbar button:active, 
                    .calendar-dark-theme .rbc-toolbar button:focus { 
                        outline: none; 
                        box-shadow: none; 
                    }

                    /* Event Cells */
                    .calendar-dark-theme .rbc-event {
                        padding: 4px 8px;
                        border-radius: 6px;
                        margin-bottom: 4px;
                        margin-top: 2px;
                        transition: opacity 0.2s, transform 0.1s;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                        border: 1px solid rgba(255,255,255,0.1) !important;
                    }
                    .calendar-dark-theme .rbc-event:hover {
                        opacity: 1;
                        filter: brightness(1.1);
                        transform: translateY(-1px);
                    }
                    .calendar-dark-theme .rbc-event-content {
                        font-size: 11.5px;
                        font-weight: 500;
                        letter-spacing: 0.01em;
                        box-sizing: border-box;
                        line-height: 1.4;
                    }

                    /* Timeline Mode */
                    .calendar-dark-theme .rbc-time-content { 
                        border-top: 1px solid #1f2937; 
                        background-color: #111827;
                    }
                    .calendar-dark-theme .rbc-time-content > * + * > * {
                         border-left: 1px solid #1f2937;
                    }
                    .calendar-dark-theme .rbc-timeslot-group { 
                        border-bottom: 1px solid #1f2937; 
                        min-height: 60px; 
                    }
                    .calendar-dark-theme .rbc-time-gutter {
                        color: #9ca3af; 
                        font-size: 12px; 
                        background-color: #030712; 
                        border-right: 1px solid #1f2937;
                    }
                    .calendar-dark-theme .rbc-day-slot .rbc-time-slot { 
                        border-top: 1px dotted #374151; 
                    }
                    .calendar-dark-theme .rbc-current-time-indicator { 
                        background-color: #ef4444; 
                        height: 2px; 
                    }
                    .calendar-dark-theme .rbc-current-time-indicator::before {
                        content: '';
                        position: absolute;
                        left: -4px;
                        top: -3px;
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background-color: #ef4444;
                    }

                    /* Fix Calendar popup (minilist) overlay styling */
                    .rbc-overlay {
                        position: absolute;
                        z-index: 50;
                        background-color: #111827 !important; /* gray-900 */
                        border: 1px solid #374151 !important; /* gray-700 */
                        border-radius: 12px !important;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4) !important;
                        padding: 10px !important;
                        min-width: 180px;
                    }
                    .rbc-overlay > .rbc-overlay-header {
                        border-bottom: 1px solid #374151 !important;
                        margin: -10px -10px 10px -10px !important;
                        padding: 12px 14px !important;
                        font-weight: 700 !important;
                        font-size: 14px !important;
                        color: #ffffff !important; 
                        background-color: #1f2937 !important; /* gray-800 */
                        border-top-left-radius: 11px !important;
                        border-top-right-radius: 11px !important;
                    }
                `}</style>

                <Calendar
                    localizer={localizer}
                    events={mappedEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    view={view}
                    views={["month", "week", "day", "agenda"]}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={(e) => setSelectedEvent(e)}
                    tooltipAccessor="title"
                    selectable={true}
                    onSelectSlot={handleSelectSlot}
                    popup={true}
                />
            </div>

            {/* Event Detail Modal POPUP */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        {/* Header Image Gradient */}
                        <div className={`h-24 p-6 relative ${selectedEvent.type === "MEETING" ? "bg-gradient-to-tr from-emerald-600 to-teal-900" : "bg-gradient-to-tr from-indigo-600 to-purple-900"}`}>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white/80 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute -bottom-6 left-6 p-3 bg-gray-900 rounded-xl border border-gray-800 shadow-lg">
                                {selectedEvent.type === "MEETING" ? <Users className="w-6 h-6 text-emerald-400" /> : <CalendarIcon className="w-6 h-6 text-indigo-400" />}
                            </div>
                        </div>

                        {/* Body Details */}
                        <div className="p-6 pt-10 space-y-5 relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1.5">{selectedEvent.title}</h3>
                                    <div className="flex gap-2 text-xs font-semibold uppercase tracking-wider">
                                        <span className={selectedEvent.type === "MEETING" ? "text-emerald-500" : "text-indigo-500"}>
                                            {selectedEvent.type}
                                        </span>
                                        {selectedEvent.priority === "HIGH" && (
                                            <span className="text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5" /> High Priority
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <a
                                    href={`/events/edit/${selectedEvent.id}`}
                                    className="p-2 bg-gray-800 hover:bg-indigo-600 rounded-lg text-gray-400 hover:text-white transition shadow-sm"
                                    title="Edit Event"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z" /></svg>
                                </a>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-start gap-3 text-sm text-gray-300">
                                    <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-white">{format(selectedEvent.start, "EEEE, MMMM do, yyyy")}</p>
                                        <p className="text-gray-400 mt-0.5">{format(selectedEvent.start, "h:mm a")} - {format(selectedEvent.end, "h:mm a")}</p>
                                    </div>
                                </div>

                                {selectedEvent.description && (
                                    <div className="flex items-start gap-3 text-sm text-gray-300">
                                        <AlignLeft className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                                        <p className="whitespace-pre-wrap leading-relaxed">{selectedEvent.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-end">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
