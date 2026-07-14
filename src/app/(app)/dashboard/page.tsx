import { CalendarIcon, Clock, MapPin, Tag } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import DashboardFilter from "@/components/DashboardFilter";
import DeleteEventButton from "@/components/DeleteEventButton";
import { parseTag } from "@/utils/tagParser";
import { Suspense } from "react";
import Skeleton from "@/components/ui/Skeleton";

export const dynamic = "force-dynamic";

export default async function DashboardPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
    return null;
  }

  const normalizedUserEmail = session.user.email || "";

  // Fetch available tags statically (doesn't depend on search query filters, so it loads instantly)
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

  return (
    <div className="space-y-space-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-4 pb-space-6 border-b border-border-subtle">
        <div>
          <h2 className="h1-premium text-text-main">
            Welcome back!
          </h2>
          <p className="body-premium text-text-muted mt-space-1">Here is your schedule for today.</p>
        </div>
      </header>

      <div className="max-w-7xl space-y-space-4">
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-space-4 gap-space-4">
            <h3 className="h2-premium flex items-center gap-space-2 text-text-main">
              <Clock className="w-5 h-5 text-accent-primary" />
              Upcoming Agenda
            </h3>
            <Link href="/events/create" className="px-space-4 py-space-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)] w-full md:w-auto text-center">
              + New Event
            </Link>
          </div>

          <DashboardFilter availableTags={availableTags} />

          {/* Suspense key updates when filters update, immediately rendering the skeleton */}
          <Suspense key={JSON.stringify(searchParams)} fallback={<EventsListSkeleton />}>
            <EventsList 
              searchParams={searchParams} 
              userId={session.user.id} 
              userEmail={normalizedUserEmail} 
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Subcomponent to fetch and render events asynchronously
async function EventsList({ 
  searchParams, 
  userId, 
  userEmail 
}: { 
  searchParams: any; 
  userId: string; 
  userEmail: string; 
}) {
  const q = searchParams.q;
  const priorityParam = searchParams.priority as "LOW" | "MEDIUM" | "HIGH" | undefined;
  const tagParam = searchParams.tag;

  // Build dynamic Where Object for upcoming events
  let dynamicWhere: any = {
    OR: [
      { ownerId: userId },
      { meetings: { some: { participantEmail: userEmail, rsvpStatus: "ACCEPTED" } } }
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

  const events = await prisma.event.findMany({
    where: dynamicWhere,
    orderBy: { startTime: 'asc' },
    include: { meetings: true }
  });

  if (events.length === 0) {
    return (
      <div className="p-space-8 text-center rounded-2xl bg-bg-surface border border-border-subtle flex flex-col items-center justify-center animate-in fade-in duration-300">
        <CalendarIcon className="w-12 h-12 text-text-muted mb-space-4" />
        <h3 className="h2-premium text-text-main">No events found</h3>
        <p className="body-premium text-text-muted mt-space-2 max-w-sm">
          You don&apos;t have any upcoming events. Create a new event or sync your external calendars to see them here.
        </p>
        <div className="flex gap-space-4 mt-space-6">
          <Link href="/events/create" className="px-space-4 py-space-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            Create Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-space-4 animate-in fade-in duration-300">
      {events.map(event => {
        const parsedTag = event.categoryTag ? parseTag(event.categoryTag) : null;
        return (
          <div key={event.id} className="p-space-6 rounded-2xl bg-bg-surface border border-border-subtle hover:border-accent-primary/50 transition self-start group relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${parsedTag ? parsedTag.color : 'bg-text-muted'}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-space-2 md:mb-space-1 gap-space-2 md:gap-0">
                <h4 className="h3-premium text-text-main truncate pr-0 md:pr-space-4">{event.title}</h4>
                <div className="flex items-center shrink-0">
                  {event.priority === "HIGH" && (
                    <span className="px-space-2 py-0.5 mr-space-2 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
                      High
                    </span>
                  )}
                  <Link
                    href={`/events/edit/${event.id}`}
                    className="p-1.5 bg-bg-primary hover:bg-accent-primary rounded-md text-text-muted hover:text-white transition"
                    title="Edit Event"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z" /></svg>
                  </Link>
                  <DeleteEventButton eventId={event.id} />
                </div>
              </div>
            </div>
            {event.categoryTag && (
              <div className="mt-space-2 mb-space-3">
                <span className="inline-flex items-center gap-space-2 px-space-2 py-0.5 rounded bg-bg-primary border border-border-subtle caption-premium text-text-main">
                  <span className={`w-2 h-2 rounded-full ${parsedTag ? parsedTag.color : 'bg-text-muted'}`} />
                  {parsedTag ? parsedTag.label : event.categoryTag}
                </span>
              </div>
            )}
            {event.description && (
              <p className="body-premium text-text-muted mb-space-4 line-clamp-2 relative">
                {event.description}
              </p>
            )}
            <div className="flex items-center gap-space-4 caption-premium text-text-muted relative mt-space-4">
              <div className="flex items-center gap-space-2">
                <CalendarIcon className="w-4 h-4" />
                {format(event.startTime, "MMM d, h:mm a")} - {format(event.endTime, "h:mm a")}
              </div>
              {event.location && (
                <div className="flex items-center gap-space-2">
                  <MapPin className="w-4 h-4" /> {event.location}
                </div>
              )}
              {event.meetings.length > 0 && (
                <div className="flex items-center gap-space-2 text-accent-primary">
                  Virtual Meeting ({event.meetings[0].provider})
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Shimmering skeleton loader mimicking event cards structure
function EventsListSkeleton() {
  return (
    <div className="space-y-space-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-space-6 rounded-2xl bg-bg-surface border border-border-subtle flex flex-col gap-3 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <Skeleton className="h-6 w-1/3" />
            <div className="flex items-center gap-2 self-end md:self-auto">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <Skeleton className="h-5 w-24 mt-2" />
          <Skeleton className="h-14 w-full mt-2" />
          <div className="flex flex-wrap gap-4 mt-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}