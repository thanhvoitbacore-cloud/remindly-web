import { BellRing, CalendarIcon, LayoutDashboard, Settings, User, CalendarDays, Users, FileEdit } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
import MobileNavBar from "@/components/MobileNavBar";
import Sidebar from "@/components/Sidebar";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar 
                session={session} 
                notificationBell={
                    <Suspense fallback={<div className="w-8 h-8 rounded-full bg-border-subtle/50 animate-pulse shrink-0" />}>
                        {/* @ts-ignore Async Server Component */}
                        <NotificationBell />
                    </Suspense>
                } 
            />

            {/* App Content */}
            <main className="flex-1 overflow-y-auto bg-bg-primary px-space-6 py-space-4 sm:p-space-6 md:p-space-8 min-h-full pb-space-12 md:pb-space-8">
                {children}
            </main>

            <MobileNavBar />
        </div>
    );
}
