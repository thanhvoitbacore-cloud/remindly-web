"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateEventAction(eventId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Lọc quyền sỡ hữu Event
    const existingEvent = await prisma.event.findFirst({
        where: { id: eventId, ownerId: session.user.id }
    });
    if (!existingEvent) throw new Error("Event not found or unauthorized");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const startTimeStr = formData.get("startTime") as string;
    const endTimeStr = formData.get("endTime") as string;
    const priority = formData.get("priority") as "LOW" | "MEDIUM" | "HIGH";
    const categoryTag = formData.get("categoryTag") as string;

    // Nút nào được bấm: Draft hay Update
    const actionType = formData.get("actionType");
    const isDraft = actionType === "draft";

    if (!title || !date || !startTimeStr || !endTimeStr) {
        throw new Error("Vui lòng nhập Tên Sự kiện, Ngày và Giờ");
    }

    const startTime = new Date(`${date}T${startTimeStr}`);
    const endTime = new Date(`${date}T${endTimeStr}`);

    await prisma.event.update({
        where: { id: eventId },
        data: {
            title,
            description,
            startTime,
            endTime,
            priority,
            categoryTag,
            isDraft
        }
    });

    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    revalidatePath("/drafts");

    return { success: true };
}

export async function deleteEventAction(eventId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // CASCADE xoá sẽ tự lo liệu Meeting con, ta chỉ việc xoá Record mẹ
    await prisma.event.delete({
        where: {
            id: eventId,
            ownerId: session.user.id // Bắt buộc trùng chủ
        }
    });

    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    revalidatePath("/drafts");

    return { success: true };
}
