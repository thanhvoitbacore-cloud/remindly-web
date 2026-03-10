import { CalendarIcon, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import SyncCalendarButton from "@/components/SyncCalendarButton";
import LogoutButton from "@/components/LogoutButton";
import DashboardFilter from "@/components/DashboardFilter";
import DeleteEventButton from "@/components/DeleteEventButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
    return null;
  }

  if (session.user.id === "admin-hardcoded") {
    redirect("/admin/overview");
    return null;
  }

  const q = searchParams.q;
  const priorityParam = searchParams.priority as "LOW" | "MEDIUM" | "HIGH" | undefined;
  const tagParam = searchParams.tag;

  // Build dynamic Where Object for upcoming events
  let dynamicWhere: any = {
    ownerId: session.user.id,
    isDraft: false
  };

  if (q) {
    dynamicWhere.OR = [
      { title: { contains: q as string, mode: "insensitive" } },
      { description: { contains: q as string, mode: "insensitive" } }
    ];
  }
  if (priorityParam) dynamicWhere.priority = priorityParam;
  if (tagParam) dynamicWhere.categoryTag = { contains: tagParam as string, mode: "insensitive" };

  const events = await prisma.event.findMany({
    where: dynamicWhere,
    orderBy: { startTime: 'asc' },
    include: { meetings: true },
    take: 5
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between pb-6 border-b border-gray-800">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
            Welcome back!
          </h2>
          <p className="text-gray-400 mt-1">Here is your schedule for today.</p>
        </div>
        <div className="flex gap-3 items-center">
          <SyncCalendarButton />
          <Link href="/events/create" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            + New Event
          </Link>
        </div>
      </header>

      <div className="max-w-4xl space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Upcoming Agenda
          </h3>

          <DashboardFilter />

          {events.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-gray-900 border border-gray-800 flex flex-col items-center justify-center">
              <CalendarIcon className="w-12 h-12 text-gray-700 mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No events found</h3>
              <p className="text-gray-500 text-sm mt-2 max-w-sm">
                You don&apos;t have any upcoming events. Create a new event or sync your external calendars to see them here.
              </p>
              <div className="flex gap-4 mt-6">
                <Link href="/events/create" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                  Create Event
                </Link>
                {/* The sync button is always enabled even if no data */}
                <SyncCalendarButton variant="secondary" />
              </div>
            </div>
          ) : (
            events.map(event => (
              <div key={event.id} className="p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 transition self-start group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium truncate pr-4">{event.title}</h4>
                    <div className="flex items-center shrink-0">
                      {event.priority === "HIGH" && (
                        <span className="px-2 py-0.5 mr-2 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
                          High
                        </span>
                      )}
                      <Link
                        href={`/events/edit/${event.id}`}
                        className="p-1.5 bg-gray-800 hover:bg-indigo-600 rounded-md text-gray-400 hover:text-white transition"
                        title="Edit Event"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z" /></svg>
                      </Link>
                      <DeleteEventButton eventId={event.id} />
                    </div>
                  </div>
                </div>
                {event.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 relative">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500 relative mt-4">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4" />
                    {format(event.startTime, "MMM d, h:mm a")} - {format(event.endTime, "h:mm a")}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {event.location}
                    </div>
                  )}
                  {event.meetings.length > 0 && (
                    <div className="flex items-center gap-1.5 text-blue-400">
                      Virtual Meeting ({event.meetings[0].provider})
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}