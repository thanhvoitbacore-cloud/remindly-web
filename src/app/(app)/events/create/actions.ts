"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEventAction(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    // Map dates locally 
    const date = formData.get("date") as string;
    const startTimeStr = formData.get("startTime") as string;
    const endTimeStr = formData.get("endTime") as string;
    const priority = formData.get("priority") as "LOW" | "MEDIUM" | "HIGH";
    const categoryTag = formData.get("categoryTag") as string;
    // Dữ liệu "isDraft" lấy qua button submit "action" (Draft vs Publish)
    const isDraft = formData.get("actionType") === "draft";

    if (!title || !date || !startTimeStr || !endTimeStr) {
        throw new Error("Vui lòng điền đủ Tên Sự kiên, Ngày và Giờ");
    }

    // Kết hợp date và time thành Javascript ISO DateTime
    const startTime = new Date(`${date}T${startTimeStr}`);
    const endTime = new Date(`${date}T${endTimeStr}`);

    await prisma.event.create({
        data: {
            title,
            description,
            startTime,
            endTime,
            priority: priority || "MEDIUM",
            categoryTag,
            isDraft,
            ownerId: session.user.id,
            source: "local"
        }
    });

    // Revalidate tuỳ theo đường dẫn để cập nhật Calendar/Sidebar.
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    revalidatePath("/drafts");

    return { success: true };
}
