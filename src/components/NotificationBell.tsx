import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import NotificationBellClient from "./NotificationBellClient";

export default async function NotificationBell() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const unreadCount = await prisma.notification.count({
        where: {
            userId: session.user.id,
            isRead: false
        }
    });

    const latestNotes = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5
    });

    return (
        <NotificationBellClient initialNotes={latestNotes} initialUnreadCount={unreadCount} />
    );
}
