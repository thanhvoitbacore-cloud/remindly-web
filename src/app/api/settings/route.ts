import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { autoSyncCalendars } = body;

        if (typeof autoSyncCalendars !== "boolean") {
            return NextResponse.json({ error: "Invalid value" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { autoSyncCalendars }
        });

        return NextResponse.json({ autoSyncCalendars: updatedUser.autoSyncCalendars });
    } catch (error) {
        console.error("Failed to update settings:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
