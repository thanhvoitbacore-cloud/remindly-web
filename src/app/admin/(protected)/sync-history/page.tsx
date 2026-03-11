import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function SyncHistoryAdminPage() {
    const session = await auth();

    // Verify Admin Status
    if (!session || !session.user || !session.user.id) redirect("/login");
    
    let isAdmin = false;
    if (session.user.id === "admin-hardcoded") {
        isAdmin = true;
    } else {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user && user.role === "ADMIN") isAdmin = true;
    }

    if (!isAdmin) redirect("/");

    // Fetch Sync-related Activity Logs
    const syncLogs = await prisma.activityLog.findMany({
        where: {
            OR: [
                { action: { startsWith: "MOCK_CONNECT_" } },
                { action: { startsWith: "UNLINK_" } },
                { action: "SYNC_CALENDARS" },
                { action: "TOGGLE_AUTO_SYNC" }
            ]
        },
        orderBy: { timestamp: "desc" },
        take: 100
    });

    // Extract user IDs from entityId
    const userIds = Array.from(new Set(syncLogs.map(log => log.entityId).filter(id => id !== null) as string[]));
    
    // Fetch users mapping
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true }
    });
    
    const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, { name: string | null; email: string | null }>);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Sync History Logs</h1>
                <p className="text-gray-400">Monitor external calendar connection activities across all users.</p>
            </header>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-auto max-h-[65vh]">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-950/50 text-xs uppercase text-gray-500">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">User</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Action</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">IP Address</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {syncLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No recent sync activities found.
                                    </td>
                                </tr>
                            ) : (
                                syncLogs.map((log) => {
                                    // Parse Action formatting
                                    let actionBadgeClass = "bg-gray-500/10 text-gray-400 border-gray-500/20";
                                    let readableAction = log.action;
                                    
                                    if (log.action.includes("MOCK_CONNECT")) {
                                        actionBadgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                                        readableAction = "Mock Connection Established (" + log.action.split('_')[2] + ")";
                                    } else if (log.action.includes("UNLINK")) {
                                        actionBadgeClass = "bg-red-500/10 text-red-400 border-red-500/20";
                                        readableAction = "Calendar Unlinked (" + log.action.split('_')[1] + ")";
                                    } else if (log.action === "SYNC_CALENDARS") {
                                        actionBadgeClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
                                        readableAction = "Manual Global Sync";
                                    }

                                    const relatedUser = log.entityId ? userMap[log.entityId] : null;

                                    return (
                                        <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-white">{relatedUser?.name || "Unknown"}</div>
                                                <div className="text-xs text-gray-500 leading-tight mt-0.5">{relatedUser?.email || "N/A"}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border uppercase tracking-wide ${actionBadgeClass}`}>
                                                    {readableAction}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                                                {log.ipAddress || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                                                {format(new Date(log.timestamp), "MMM do, yyyy · HH:mm:ss")}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
