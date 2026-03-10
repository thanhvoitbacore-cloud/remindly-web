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
            isDraft: true
        },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between pb-6 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Draft Drawer</h1>
                    <p className="text-gray-400">Manage unfinished events. Drafts are automatically purged 30 days after their last modification.</p>
                </div>
            </header>

            {drafts.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-gray-900 border border-gray-800 flex flex-col items-center justify-center">
                    <PenLine className="w-12 h-12 text-gray-700 mb-4" />
                    <h3 className="text-xl font-medium text-gray-300">Your draft drawer is empty</h3>
                    <p className="text-gray-500 text-sm mt-2 max-w-sm">
                        You have published all of your stored iterations. Any unfinished forms saved later will appear here safely hidden from your calendar view.
                    </p>
                    <Link href="/events/create" className="mt-8 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                        Create New Event
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drafts.map(draft => (
                        <div key={draft.id} className="p-6 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between group h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <AlertTriangle className="w-24 h-24" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition mb-2">
                                    {draft.title || <span className="text-gray-500 italic">Untitled Event</span>}
                                </h3>
                                <div className="text-sm font-medium text-amber-500/80 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                    Draft Iteration
                                </div>

                                {draft.description && (
                                    <p className="text-sm text-gray-400 line-clamp-3 mb-6">
                                        {draft.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-800">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {format(draft.startTime, "MMM d, yyyy")}
                                    </div>
                                    <span className="opacity-60">Last saved: {format(draft.updatedAt, "MMM d")}</span>
                                </div>
                                <Link
                                    href={`/events/edit/${draft.id}`}
                                    className="block w-full py-3 text-center bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition"
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
