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
        <main className="flex-1 overflow-y-auto bg-gray-900 min-h-screen text-white">
            <div className="p-8 max-w-5xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-gray-800 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Trung tâm Đồng bộ</h1>
                        <p className="text-gray-400">Quản lý kết nối lịch Google và Outlook để theo dõi công việc liền mạch.</p>
                    </div>
                </div>

                <SyncCenterClient 
                    googleAccount={googleAccount} 
                    outlookAccount={outlookAccount} 
                    initialAutoSync={user?.autoSyncCalendars || false}
                />
            </div>
        </main>
    );
}
