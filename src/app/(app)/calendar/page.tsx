import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ClientCalendar from "./ClientCalendar";

export default async function CalendarPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
        return null;
    }

    // Load tất cả events ngoại trừ Draft
    const events = await prisma.event.findMany({
        where: {
            ownerId: session.user.id,
            isDraft: false
        },
        include: {
            meetings: true
        }
    });

    // Parse Data sang Object chuẩn của BigCalendar { title, start, end, ...props }
    const formattedEvents = events.map(e => ({
        id: e.id,
        title: e.title,
        start: e.startTime,
        end: e.endTime,
        description: e.description,
        type: e.meetings.length > 0 ? "MEETING" : "EVENT",
        priority: e.priority,
        location: e.location
    }));

    return (
        <div className="max-w-[1400px] w-full mx-auto space-y-6 animate-in fade-in duration-500 h-[calc(100vh-theme(spacing.24))]">
            <header className="flex items-center justify-between pb-4 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Master Calendar</h1>
                    <p className="text-gray-400">View and manage all your events, meetings, and schedules across the platform.</p>
                </div>
            </header>

            {/* Gọi Render UI tĩnh ở Client để tương tác Map/View  */}
            <ClientCalendar initialEvents={formattedEvents} />
        </div>
    );
}
