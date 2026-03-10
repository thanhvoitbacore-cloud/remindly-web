import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LayoutDashboard, Users, CalendarDays, LogOut } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // 1. Check if authenticated
    if (!session || !session.user || !session.user.id) {
        redirect("/login");
    }

    let isAdmin = false;
    let displayName = session.user.email || "Admin User";

    if (session.user.id === "admin-hardcoded") {
        isAdmin = true;
        displayName = "System Admin";
    } else {
        // 2. Fetch the user's role from the database for normal users
        const userRoleInfo = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true, name: true, email: true },
        });

        if (userRoleInfo && userRoleInfo.role === "ADMIN") {
            isAdmin = true;
            displayName = userRoleInfo.name || userRoleInfo.email || session.user.email || "Admin User";
        }
    }

    // 3. User must be an Administrator
    if (!isAdmin) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col md:flex-row font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col pt-20 md:pt-6 h-auto md:h-screen sticky top-0 md:fixed md:left-0 z-10 transition-all">
                <div className="p-6 md:pb-8 flex-1">
                    <h2 className="text-xl font-bold text-white mb-2 hidden md:block">
                        Remindly Admin
                    </h2>
                    <p className="text-sm text-gray-500 mb-8 hidden md:block">
                        {displayName}
                    </p>

                    <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                        <Link
                            href="/admin/overview"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="font-medium whitespace-nowrap">Overview</span>
                        </Link>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors"
                        >
                            <Users className="w-5 h-5" />
                            <span className="font-medium whitespace-nowrap">Users</span>
                        </Link>
                        <Link
                            href="/admin/events"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 text-gray-300 hover:text-white transition-colors"
                        >
                            <CalendarDays className="w-5 h-5" />
                            <span className="font-medium whitespace-nowrap">Events</span>
                        </Link>
                    </nav>
                </div>

                <div className="p-6 border-t border-gray-800 hidden md:block">
                    <form
                        action={async () => {
                            "use server";
                            const { signOut } = await import("@/auth");
                            await signOut({ redirectTo: "/login" });
                        }}
                    >
                        <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 text-gray-400 hover:text-red-400 transition-colors">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Exit Admin</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-64 p-6 md:p-10 pt-6 md:pt-24 min-h-screen">
                {children}
            </main>
        </div>
    );
}
