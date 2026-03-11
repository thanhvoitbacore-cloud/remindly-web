import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function AdminEventsPage() {
    await auth(); // Validates session (Layout enforces Admin)

    const allEvents = await prisma.event.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            owner: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">System Events</h1>
                <p className="text-gray-400 mt-2 text-lg">Browse all meetings and events created across the platform.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">All Events ({allEvents.length})</h2>
                </div>

                <div className="overflow-auto max-h-[65vh]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/30 text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-6 py-4 font-medium">Event Title</th>
                                <th className="px-6 py-4 font-medium">Owner</th>
                                <th className="px-6 py-4 font-medium">Source</th>
                                <th className="px-6 py-4 font-medium">Start Time</th>
                                <th className="px-6 py-4 font-medium">End Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {allEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{event.title}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-1">ID: {event.id.substring(0, 8)}...</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-300">
                                            {event.owner.name || <span className="italic text-gray-500">Unnamed User</span>}
                                        </div>
                                        <div className="text-xs text-gray-500">{event.owner.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium uppercase ${event.source === "local"
                                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                : event.source === "google"
                                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                    : "bg-blue-600/10 text-blue-500 border border-blue-600/20"
                                            }`}>
                                            {event.source}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {new Date(event.startTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {new Date(event.endTime).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {allEvents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No events found in the system.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
