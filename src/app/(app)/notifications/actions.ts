"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function markAllNotificationsAsRead() {
    const sessionPayload = await auth();
    if (sessionPayload?.user?.id) {
        await prisma.notification.updateMany({
            where: { userId: sessionPayload.user.id, isRead: false },
            data: { isRead: true }
        });
        revalidatePath("/notifications");
        revalidatePath("/", "layout"); // refresh lại Layout chứa count
    }
}

export async function markNotificationAsRead(id: string) {
    const sessionPayload = await auth();
    if (sessionPayload?.user?.id) {
        await prisma.notification.update({
            where: { id, userId: sessionPayload.user.id },
            data: { isRead: true }
        });
        revalidatePath("/notifications");
        revalidatePath("/", "layout"); 
    }
}

export async function deleteNotificationAction(id: string) {
    const sessionPayload = await auth();
    if (sessionPayload?.user?.id) {
        try {
            await prisma.notification.delete({
                where: { id, userId: sessionPayload.user.id }
            });
            revalidatePath("/notifications");
            revalidatePath("/", "layout");
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    }
}

export async function deleteAllNotificationsAction() {
    const sessionPayload = await auth();
    if (sessionPayload?.user?.id) {
        try {
            await prisma.notification.deleteMany({
                where: { userId: sessionPayload.user.id }
            });
            revalidatePath("/notifications");
            revalidatePath("/", "layout");
        } catch (error) {
            console.error("Failed to delete all notifications", error);
        }
    }
}

export async function handleInstantRsvpAction(notificationId: string, eventId: string, accept: boolean) {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) return;

    await prisma.meeting.updateMany({
        where: { eventId, participantEmail: session.user.email },
        data: { rsvpStatus: accept ? "ACCEPTED" : "DECLINED" }
    });

    await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (event) {
        await prisma.notification.create({
            data: {
                userId: event.ownerId,
                title: "Phản hồi lời mời",
                message: `${session.user.name || session.user.email} đã ${accept ? 'tham gia' : 'từ chối'} cuộc họp tức thì của bạn.`,
                type: "SYSTEM",
                isRead: false
            }
        });
    }

    revalidatePath("/notifications");
    revalidatePath("/meetings/create");
    return { success: true };
}
