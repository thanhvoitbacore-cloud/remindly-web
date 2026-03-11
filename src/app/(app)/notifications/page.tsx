import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Bell, Sparkles, AlertCircle, Info, CalendarDays, CheckCheck, Users, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import NotificationClientList from "./NotificationClientList";
import { markAllNotificationsAsRead, deleteAllNotificationsAction } from "./actions";

export default async function NotificationsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
        return null; // TS Guard
    }

    // Load tất cả Notifications của User
    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Lịch sử thông báo</h1>
                    <p className="text-gray-400">Trình quản lý các hoạt động đồng bộ sự kiện, thông báo hệ thống và lời mời họp.</p>
                </div>

                {/* Nút Đọc Hết và Nút Xóa Hết */}
                <div className="flex gap-3 w-full md:w-auto">
                    <form action={markAllNotificationsAsRead} className="flex-1 md:flex-none">
                        <button type="submit" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 hover:text-white text-gray-400 rounded-xl text-sm font-medium transition shadow-inner w-full">
                            <CheckCheck className="w-4 h-4" /> Đánh Dấu Đã Đọc
                        </button>
                    </form>
                    <form action={deleteAllNotificationsAction} className="flex-1 md:flex-none">
                        <button type="submit" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-medium transition shadow-inner w-full">
                            <Trash2 className="w-4 h-4" /> Xóa Tất Cả
                        </button>
                    </form>
                </div>
            </header>

            <NotificationClientList notifications={notifications} />
        </div>
    );
}
