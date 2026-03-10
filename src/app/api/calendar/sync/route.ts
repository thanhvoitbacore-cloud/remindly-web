import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from "@/lib/prisma";
import { syncUserCalendars } from '@/services/calendarSyncService';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Call service đồng bộ
        await syncUserCalendars(session.user.id);

        // Gán thông báo Record thành công (hoặc rỗng) 
        await prisma.notification.create({
            data: {
                userId: session.user.id,
                title: "Calendar Sync Complete",
                message: `Successfully checked and imported external events from Google/Outlook.`,
                type: "SYSTEM"
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Calendar sync route error:', error);

        // Khởi tạo lại session nếu bị crash trước đó lấy hụt
        const session = await auth();

        // Ghi nhận lỗi cho user biết nếu Sync đứt kết nối
        if (session?.user?.id) {
            await prisma.notification.create({
                data: {
                    userId: session.user.id,
                    title: "Calendar Sync Failed",
                    message: "An error occurred while attempting to fetch your external calendars. Click to review details.",
                    type: "SYSTEM",
                    metadata: { error: String(error) }
                }
            });
        }

        return NextResponse.json({ error: 'Internal server error during calendar sync' }, { status: 500 });
    }
}
