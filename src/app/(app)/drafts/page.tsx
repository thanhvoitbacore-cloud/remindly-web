import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CalendarIcon, PenLine, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function DraftsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
        return null;
    }

    const drafts = await prisma.event.findMany({
        where: {
            ownerId: session.user.id,
            isDraft: true,
            categoryTag: { not: "InstantMeeting" }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-space-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-4 pb-space-6 border-b border-border-subtle">
                <div>
                    <h1 className="h1-premium text-text-main mb-space-2">Draft Drawer</h1>
                    <p className="body-premium text-text-muted">Manage unfinished events. Drafts are automatically purged 30 days after their last modification.</p>
                </div>
                <div className="w-full md:w-auto">
                    <Link href="/events/create" className="px-space-4 py-space-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)] whitespace-nowrap w-full block md:inline-block text-center">
                        + New Draft
                    </Link>
                </div>
            </header>

            {drafts.length === 0 ? (
                <div className="p-space-12 text-center rounded-2xl bg-bg-surface border border-border-subtle flex flex-col items-center justify-center">
                    <PenLine className="w-12 h-12 text-text-muted mb-space-4" />
                    <h3 className="h2-premium text-text-main">Your draft drawer is empty</h3>
                    <p className="body-premium text-text-muted mt-space-2 max-w-sm">
                        You have published all of your stored iterations. Any unfinished forms saved later will appear here safely hidden from your calendar view.
                    </p>
                    <Link href="/events/create" className="mt-space-8 px-space-4 py-space-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                        Create New Event
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-4">
                    {drafts.map(draft => (
                        <div key={draft.id} className="p-space-6 rounded-2xl bg-bg-surface border border-border-subtle flex flex-col justify-between group h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-space-4 opacity-5 pointer-events-none">
                                <AlertTriangle className="w-24 h-24 text-text-muted" />
                            </div>
                            <div>
                                <h3 className="h3-premium text-text-main group-hover:text-accent-primary transition mb-space-2">
                                    {draft.title || <span className="text-text-muted italic">Untitled Event</span>}
                                </h3>
                                <div className="body-premium font-medium text-amber-500/80 mb-space-4 flex items-center gap-space-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    Draft Iteration
                                </div>

                                {draft.description && (
                                    <p className="body-premium text-text-muted line-clamp-3 mb-space-6">
                                        {draft.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-space-4 pt-space-4 border-t border-border-subtle">
                                <div className="flex items-center justify-between caption-premium text-text-muted">
                                    <div className="flex items-center gap-space-2">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {format(draft.startTime, "MMM d, yyyy")}
                                    </div>
                                    <span className="opacity-60">Last saved: {format(draft.updatedAt, "MMM d")}</span>
                                </div>
                                <Link
                                    href={`/events/edit/${draft.id}`}
                                    className="block w-full py-3 text-center bg-bg-primary hover:bg-bg-surface text-text-muted hover:text-text-main rounded-xl text-sm font-medium transition border border-border-subtle"
                                >
                                    Resume Editing <ArrowRight className="w-4 h-4 ml-2 inline" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
