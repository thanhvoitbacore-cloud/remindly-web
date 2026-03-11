"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function unlinkCalendar(providerStr: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.calendarAccount.deleteMany({
        where: {
            userId: session.user.id,
            provider: providerStr as any
        }
    });

    await prisma.activityLog.create({
        data: {
            action: `UNLINK_${providerStr}_CALENDAR`,
            entityId: session.user.id,
            ipAddress: "server-action"
        }
    });

    revalidatePath("/sync-center");
    return { success: true };
}

export async function mockConnectCalendar(providerStr: string, email: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.calendarAccount.upsert({
        where: {
            userId_provider: {
                userId: session.user.id,
                provider: providerStr as any
            }
        },
        update: {
            externalCalendarId: email,
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
            lastSyncTime: new Date()
        },
        create: {
            userId: session.user.id,
            provider: providerStr as any,
            externalCalendarId: email,
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
            lastSyncTime: new Date()
        }
    });

    await prisma.activityLog.create({
        data: {
            action: `MOCK_CONNECT_${providerStr}_CALENDAR`,
            entityId: session.user.id,
            ipAddress: "server-action"
        }
    });

    await prisma.notification.create({
        data: {
            userId: session.user.id,
            title: "Mock Connection Established",
            message: `Mock connection to ${providerStr} has been saved via ${email}.`,
            type: "SYSTEM"
        }
    });

    revalidatePath("/sync-center");
    return { success: true };
}

export async function toggleAutoSync(enabled: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.user.update({
        where: { id: session.user.id },
        data: { autoSyncCalendars: enabled }
    });

    await prisma.notification.create({
        data: {
            userId: session.user.id,
            title: enabled ? "Auto-Sync Enabled" : "Auto-Sync Disabled",
            message: enabled 
                ? "Thành công kịch hoạt Đồng bộ lịch tự động mỗi 10 phút. Hệ thống sẽ mô phỏng kéo events về cho bạn." 
                : "Đã tắt Đồng bộ lịch tự động.",
            type: "SYSTEM"
        }
    });

    revalidatePath("/sync-center");
    return { success: true };
}
