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

    // Bỏ qua nếu không có email trong session (prevent Prisma type crash)
    const normalizedUserEmail = session.user.email || "";

    // Load tất cả events ngoại trừ Draft (Bao gồm của mình và được mời)
    const events = await prisma.event.findMany({
        where: {
            OR: [
                { ownerId: session.user.id },
                { meetings: { some: { participantEmail: normalizedUserEmail, rsvpStatus: "ACCEPTED" } } }
            ],
            isDraft: false
        },
        select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            description: true,
            location: true,
            priority: true,
            categoryTag: true,
            meetings: {
                select: {
                    id: true
                }
            }
        }
    });

    // Parse Data sang Object chuẩn của BigCalendar { title, start, end, ...props }
    const formattedEvents = events.map(e => ({
        id: e.id,
        title: e.title,
        start: e.startTime,
        end: e.endTime,
        description: e.description,
        type: (e.meetings.length > 0 ? "MEETING" : "EVENT") as "MEETING" | "EVENT",
        priority: e.priority,
        categoryTag: e.categoryTag,
        location: e.location
    }));

    return (
        <div className="max-w-[1400px] w-full mx-auto space-y-6 animate-in fade-in duration-500 h-[calc(100vh-theme(spacing.24))]">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Master Calendar</h1>
                    <p className="text-gray-400">View and manage all your events, meetings, and schedules across the platform.</p>
                </div>
                <div className="w-full md:w-auto">
                    <a href="/events/create" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)] w-full block md:inline-block text-center">
                        + New Event
                    </a>
                </div>
            </header>

            {/* Gọi Render UI tĩnh ở Client để tương tác Map/View  */}
            <ClientCalendar initialEvents={formattedEvents} />
        </div>
    );
}
