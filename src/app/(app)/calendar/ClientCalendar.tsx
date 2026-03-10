"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { X, CalendarIcon, Users, Clock, AlignLeft, AlertCircle } from "lucide-react";

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
}

interface CalendarProps {
    initialEvents: ParsedEvent[];
}

export default function ClientCalendar({ initialEvents }: CalendarProps) {
    const [view, setView] = useState<View>("month");
    const [date, setDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<ParsedEvent | null>(null);

    // Custom UI Component cho Calendar Cells
    const eventStyleGetter = (event: ParsedEvent) => {
        let backgroundColor = "#4f46e5"; // Indigo (Default Events)
        let borderLeft = "4px solid #818cf8"; // Light Indigo

        if (event.type === "MEETING") {
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
                    .calendar-dark-theme .rbc-calendar { font-family: inherit; color: #d1d5db; }
                    .calendar-dark-theme .rbc-month-view, .calendar-dark-theme .rbc-time-view, .calendar-dark-theme .rbc-agenda-view { border-color: #374151; border-radius: 8px; overflow: hidden; }
                    .calendar-dark-theme .rbc-header { border-bottom-color: #374151; font-weight: 600; padding: 10px 0; color: #9ca3af; text-transform: uppercase; font-size: 12px; }
                    .calendar-dark-theme .rbc-day-bg { border-left-color: #374151; }
                    .calendar-dark-theme .rbc-month-row { border-top-color: #374151; }
                    .calendar-dark-theme .rbc-off-range-bg { background-color: #111827; }
                    .calendar-dark-theme .rbc-today { background-color: rgba(79, 70, 229, 0.1); }
                    .calendar-dark-theme .rbc-date-cell { padding: 8px; font-weight: 500; }
                    .calendar-dark-theme .rbc-btn-group button { color: #9ca3af; border-color: #374151; background: transparent; }
                    .calendar-dark-theme .rbc-btn-group button:hover { background-color: #374151; color: white; }
                    .calendar-dark-theme .rbc-btn-group button.rbc-active { background-color: #4f46e5; color: white; border-color: #4f46e5; }
                    .calendar-dark-theme .rbc-toolbar button:active, .calendar-dark-theme .rbc-toolbar button:focus { outline: none; box-shadow: none; }
                    .calendar-dark-theme .rbc-time-content { border-top-color: #374151; }
                    .calendar-dark-theme .rbc-timeslot-group { border-bottom-color: #374151; min-height: 50px; }
                    .calendar-dark-theme .rbc-time-gutter { color: #9ca3af; font-size: 12px; }
                    .calendar-dark-theme .rbc-day-slot .rbc-time-slot { border-top-color: #374151; }
                `}</style>

                <Calendar
                    localizer={localizer}
                    events={initialEvents}
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
