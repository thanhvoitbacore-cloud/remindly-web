import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import DeleteUserButton from "./delete-button";

export default async function AdminUsersPage() {
    const session = await auth();
    const currentUserId = session?.user?.id;

    const allUsers = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            accountStatus: true,
            createdAt: true,
        },
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
                <p className="text-gray-400 mt-2 text-lg">View and manage all registered accounts on the platform.</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">All Users ({allUsers.length})</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-800/30 text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-6 py-4 font-medium">ID</th>
                                <th className="px-6 py-4 font-medium">Name & Email</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {allUsers.map((user) => {
                                const isSelf = currentUserId === user.id;

                                return (
                                    <tr key={user.id} className={`hover:bg-gray-800/20 transition-colors ${isSelf ? 'bg-blue-900/10' : ''}`}>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {user.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white flex items-center gap-2">
                                                {user.name || <span className="text-gray-500 italic">No name provided</span>}
                                                {isSelf && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase">You</span>}
                                            </div>
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
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${user.accountStatus === "ACTIVE"
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                                }`}>
                                                {user.accountStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DeleteUserButton userId={user.id} isSelf={isSelf} />
                                        </td>
                                    </tr>
                                )
                            })}
                            {allUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
