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
