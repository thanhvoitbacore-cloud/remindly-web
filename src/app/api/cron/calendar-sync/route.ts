import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncUserCalendars } from "@/services/calendarSyncService";

export async function GET() {
    try {
        // Fetch all users with autoSyncCalendars = true
        const usersToSync = await prisma.user.findMany({
            where: { autoSyncCalendars: true },
            select: { id: true }
        });

        // Run sync for each user asynchronously
        const syncPromises = usersToSync.map(user => syncUserCalendars(user.id));
        await Promise.allSettled(syncPromises);

        return NextResponse.json({ success: true, message: `Initated sync for ${usersToSync.length} users` });
    } catch (error) {
        console.error("Automated cron sync failed:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
