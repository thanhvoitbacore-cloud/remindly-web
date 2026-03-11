import { CalendarIcon, Clock, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import DashboardFilter from "@/components/DashboardFilter";
import DeleteEventButton from "@/components/DeleteEventButton";
import { parseTag } from "@/utils/tagParser";

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

  const normalizedUserEmail = session.user.email || "";

  // Build dynamic Where Object for upcoming events
  let dynamicWhere: any = {
    OR: [
      { ownerId: session.user.id },
      { meetings: { some: { participantEmail: normalizedUserEmail, rsvpStatus: "ACCEPTED" } } }
    ],
    isDraft: false
  };

  if (q) {
    if (!dynamicWhere.AND) dynamicWhere.AND = [];
    dynamicWhere.AND.push({
      OR: [
        { title: { contains: q as string, mode: "insensitive" } },
        { description: { contains: q as string, mode: "insensitive" } }
      ]
    });
  }
  if (priorityParam) dynamicWhere.priority = priorityParam;
  
  if (tagParam) {
    if (!dynamicWhere.AND) dynamicWhere.AND = [];
    dynamicWhere.AND.push({
      categoryTag: { equals: tagParam as string }
    });
  }

  const allUserEvents = await prisma.event.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { meetings: { some: { participantEmail: normalizedUserEmail, rsvpStatus: "ACCEPTED" } } }
      ],
      isDraft: false
    },
    select: { categoryTag: true }
  });

  const availableTagsSet = new Set<string>();
  allUserEvents.forEach(e => {
    if (e.categoryTag) availableTagsSet.add(e.categoryTag);
  });
  const availableTags = Array.from(availableTagsSet);

  const events = await prisma.event.findMany({
    where: dynamicWhere,
    orderBy: { startTime: 'asc' },
    include: { meetings: true }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
            Welcome back!
          </h2>
          <p className="text-gray-400 mt-1">Here is your schedule for today.</p>
        </div>
      </header>

      <div className="max-w-4xl space-y-4">
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Upcoming Agenda
            </h3>
            <Link href="/events/create" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)] w-full md:w-auto text-center">
              + New Event
            </Link>
          </div>

          <DashboardFilter availableTags={availableTags} />

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
              </div>
            </div>
          ) : (
            events.map(event => {
              const parsedTag = event.categoryTag ? parseTag(event.categoryTag) : null;
              return (
              <div key={event.id} className="p-5 pl-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 transition self-start group relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${parsedTag ? parsedTag.color : 'bg-gray-700'}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 md:mb-1 gap-2 md:gap-0">
                    <h4 className="text-white font-medium truncate pr-0 md:pr-4">{event.title}</h4>
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
                {event.categoryTag && (
                  <div className="mt-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-950 border border-gray-800 text-[10px] font-medium text-gray-300">
                      <span className={`w-2 h-2 rounded-full ${parsedTag ? parsedTag.color : 'bg-gray-500'}`} />
                      {parsedTag ? parsedTag.label : event.categoryTag}
                    </span>
                  </div>
                )}
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
            )})
          )}
        </div>
      </div>
    </div>
  );
}