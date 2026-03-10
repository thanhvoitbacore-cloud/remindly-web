import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next.js config parameter defining this explicitly as an Edge/Serverless compatible endpoint
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    // 1. Check Security Header: Ensure this is triggered safely via Vercel Cron
    // In production, Vercel injects a Bearer auth token representing CRON ownership.
    const authHeader = request.headers.get("authorization");
    const adminCronToken = process.env.CRON_SECRET;

    // Validate only if CRON_SECRET is deployed
    if (adminCronToken && authHeader !== `Bearer ${adminCronToken}`) {
        return NextResponse.json({ error: "Unauthorized Cron Invocation" }, { status: 401 });
    }

    try {
        // 2. Identify Target Data: 30 days ago milestone
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 3. Purge Engine:
        // Wipe any Event/Draft where:
        // a. isDraft === true
        // b. updatedAt < (Now - 30 Days) -> nghĩa là 30 ngày không ai đụng vào
        const result = await prisma.event.deleteMany({
            where: {
                isDraft: true,
                updatedAt: {
                    lt: thirtyDaysAgo
                }
            }
        });

        console.log(`[CRON/DraftCleanup] Purged ${result.count} stale drafts.`);

        return NextResponse.json({
            success: true,
            message: `Successfully purged ${result.count} stale drafts matching the 30-day lifecycle rule.`,
            count: result.count
        });
    } catch (error) {
        console.error("[CRON/DraftCleanup] Exception:", error);
        return NextResponse.json({ error: "Internal Server Error executing Cron" }, { status: 500 });
    }
}
