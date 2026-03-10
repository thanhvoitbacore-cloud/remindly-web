import { BellRing, CalendarIcon, LayoutDashboard, Settings, User, CalendarDays, Users, FileEdit } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar Navigation Exclusive to Authenticated User App Routes */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="p-6 flex items-center justify-between">
                        <Link href="/dashboard">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2 cursor-pointer">
                                <BellRing className="w-6 h-6 text-indigo-400" />
                                Remindly.
                            </h1>
                        </Link>
                        {/* @ts-ignore Async Server Component */}
                        <NotificationBell />
                    </div>

                    <nav className="mt-6 px-4 space-y-2">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition text-gray-300 hover:text-white">
                            <LayoutDashboard className="w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link href="/calendar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition text-gray-300 hover:text-white">
                            <CalendarDays className="w-5 h-5 text-indigo-400" />
                            <span className="font-medium text-white">Master Calendar</span>
                        </Link>
                        <Link href="/meetings/create" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition text-gray-300 hover:text-white">
                            <Users className="w-5 h-5 text-emerald-400" />
                            <span>Meetings</span>
                        </Link>
                        <Link href="/drafts" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition text-gray-300 hover:text-white">
                            <FileEdit className="w-5 h-5 text-amber-400" />
                            <span>Drafts</span>
                        </Link>

                        <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition text-gray-300 hover:text-white">
                            <BellRing className="w-5 h-5" />
                            <span>Notifications History</span>
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800 transition text-gray-300 hover:text-white">
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </Link>
                    </nav>
                </div>

                <div className="p-6 border-t border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30 overflow-hidden">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="User Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5" />
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{session?.user?.name || "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* App Content */}
            <main className="flex-1 overflow-y-auto bg-gray-950 p-6 md:p-8 max-w-7xl w-full mx-auto min-h-full">
                {children}
            </main>
        </div>
    );
}
