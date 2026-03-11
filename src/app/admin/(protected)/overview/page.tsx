import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Users, CalendarDays, Activity } from "lucide-react";

export default async function AdminOverviewPage() {
    // Note: Authentication and route protection are handled cleanly by layout.tsx.

    // Fetch aggregate statistics concurrently for performance
    const [totalUsers, totalEvents, recentUsers] = await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        })
    ]);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                <p className="text-gray-400 mt-2 text-lg">A quick glance at your application's metrics and recent activity.</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400 tracking-wider uppercase mb-1">Total Users</p>
                        <p className="text-4xl font-bold text-white">{totalUsers}</p>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-xl text-blue-400">
                        <Users className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400 tracking-wider uppercase mb-1">Total Events</p>
                        <p className="text-4xl font-bold text-white">{totalEvents}</p>
                    </div>
                    <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-400">
                        <CalendarDays className="w-8 h-8" />
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400 tracking-wider uppercase mb-1">System Status</p>
                        <p className="text-4xl font-bold text-white">Online</p>
                    </div>
                    <div className="bg-purple-500/10 p-4 rounded-xl text-purple-400">
                        <Activity className="w-8 h-8" />
                    </div>
                </div>
            </div>

            {/* Recent Registrations Table snippet */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden mt-8">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Recent Registrations</h2>
                    <Link href="/admin/users" className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
                        View all <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="overflow-auto max-h-[65vh]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/30 text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {recentUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{user.name || <span className="text-gray-500 italic">No name provided</span>}</div>
                                        <div className="text-sm text-gray-400">{user.email || "N/A"}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${user.role === "ADMIN"
                                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                                : "bg-gray-800 text-gray-400 border border-gray-700"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {recentUsers.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        No users found.
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
