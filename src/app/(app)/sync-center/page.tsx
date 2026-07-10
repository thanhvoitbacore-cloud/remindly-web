import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SyncCenterClient from "./SyncCenterClient";

export const metadata = {
    title: "Sync Center | Remindly",
    description: "Manage your external calendar integrations.",
};

export default async function SyncCenterPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const accounts = await prisma.calendarAccount.findMany({
        where: { userId: session.user.id }
    });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { autoSyncCalendars: true }
    });

    const googleAccount = accounts.find(a => a.provider === "GOOGLE") || null;
    const outlookAccount = accounts.find(a => a.provider === "OUTLOOK") || null;

    return (
        <div className="max-w-5xl mx-auto space-y-space-8 animate-in fade-in duration-500 pb-space-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between pb-space-6 border-b border-border-subtle gap-space-4">
                <div>
                    <h1 className="h1-premium text-text-main mb-space-2">Trung tâm Đồng bộ</h1>
                    <p className="body-premium text-text-muted">Quản lý kết nối lịch Google và Outlook để theo dõi công việc liền mạch.</p>
                </div>
            </header>

            <SyncCenterClient 
                googleAccount={googleAccount} 
                outlookAccount={outlookAccount} 
                initialAutoSync={user?.autoSyncCalendars || false}
            />
        </div>
    );
}
