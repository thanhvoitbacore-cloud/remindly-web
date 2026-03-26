import { BellRing, CalendarIcon, LayoutDashboard, Settings, User, CalendarDays, Users, FileEdit } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
import MobileNavBar from "@/components/MobileNavBar";
import Sidebar from "@/components/Sidebar";
import NextTopLoader from "nextjs-toploader";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar session={session} notificationBell={/* @ts-ignore Async Server Component */ <NotificationBell />} />

            {/* App Content */}
            <main className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-8 max-w-7xl w-full mx-auto min-h-full pb-24 md:pb-8">
                {children}
            </main>

            <MobileNavBar />
        </div>
    );
}
