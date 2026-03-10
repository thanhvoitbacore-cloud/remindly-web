import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Bell, Sparkles, AlertCircle, Info, CalendarDays, CheckCheck, Users } from "lucide-react";
import { revalidatePath } from "next/cache";
import NotificationClientList from "./NotificationClientList";
import { markAllNotificationsAsRead } from "./actions";

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
            <header className="flex items-center justify-between pb-6 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Thông báo của bạn</h1>
                    <p className="text-gray-400">Xem lại các thư mời tham gia Cuộc họp, sự cố Sync Lịch, và Alert hệ thống.</p>
                </div>

                {/* Nút Đọc Hết được import từ action */}
                <form action={markAllNotificationsAsRead}>
                    <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 border border-gray-800 hover:bg-gray-800 hover:text-white text-gray-400 rounded-xl text-sm font-medium transition shadow-inner">
                        <CheckCheck className="w-4 h-4" /> Đánh Dấu Đã Đọc
                    </button>
                </form>
            </header>

            <NotificationClientList notifications={notifications} />
        </div>
    );
}
