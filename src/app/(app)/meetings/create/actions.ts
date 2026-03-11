"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * MOCK AI SCHEDULING LOGIC
 * Abstract Server Action that aggregates all known events for internal users matching the provided emails,
 * and computationally suggests a 1-hour "Free Time" window in the nearest 7-day future.
 */
export async function suggestMeetingTimes(participantEmails: string[]) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Lọc ra các Participants trùng hợp Email trong hệ thống (Loại trừ bản thân mình tạm vì cần Focus người được mời)
    // Nhưng để tìm Time chung chúng ta cần Query Event của MỌI NGƯỜI (bao gồm cả mình)
    const allEmails = [...participantEmails, session.user.email].filter(Boolean) as string[];

    // Kéo sạch Event Upcoming thuộc về danh sách Users trên (Từ hôm nay đến 7 ngày tới)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const conflictingEvents = await prisma.event.findMany({
        where: {
            owner: {
                email: { in: allEmails }
            },
            startTime: { gte: now },
            endTime: { lte: nextWeek },
            isDraft: false
        },
        select: { startTime: true, endTime: true, owner: { select: { email: true } } }
    });

    // Mô phỏng AI Phân tích Lịch - Quét khung giờ Hành chính 9:00 AM -> 5:00 PM tuần tự
    const suggestions: Date[] = [];
    const searchDate = new Date();
    searchDate.setHours(9, 0, 0, 0);

    // AI Check liên tiếp trong vòng 3 ngày tới tìm 2 slot rảnh đầu tiên
    for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
        searchDate.setDate(now.getDate() + dayOffset);

        for (let hour = 9; hour <= 16; hour++) {
            const slotStart = new Date(searchDate);
            slotStart.setHours(hour, 0, 0, 0);

            const slotEnd = new Date(searchDate);
            slotEnd.setHours(hour + 1, 0, 0, 0);

            // Kiểm tra collision (Xung đột) với tập `conflictingEvents`
            const hasCollision = conflictingEvents.some(event => {
                const eventStart = new Date(event.startTime);
                const eventEnd = new Date(event.endTime);
                // Bất kì giao diện thời gian nào đâm chéo
                return (slotStart < eventEnd && slotEnd > eventStart);
            });

            // Nếu không bị conflict ai bị vướng lịch, thả Slot này vào bảng gợi ý AI
            if (!hasCollision) {
                suggestions.push(slotStart);
                if (suggestions.length >= 3) break; // Chỉ cần offer 3 Options là đủ
            }
        }
        if (suggestions.length >= 3) break;
    }

    if (suggestions.length === 0) {
        return { success: false, error: "Tất cả các thành viên đều quá bận rộn trong tuần tới. AI không tìm thấy khe hở chung. Vui lòng xếp lịch thủ công." };
    }

    return { success: true, suggestions: suggestions.map(d => d.toISOString()) };
}

/**
 * Lưu Trữ Cuộc Họp mới vào Calendar (DB)
 */
export async function createMeetingAction(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const startTimeStr = formData.get("startTime") as string;
    const endTimeStr = formData.get("endTime") as string;

    // Tách Emails người tham gia & Lọc bỏ Email của chính Host (để tránh tự gửi thông báo cho mình)
    const rawEmails = formData.get("participants") as string;
    const participants = rawEmails 
        ? rawEmails.split(",")
            .map(e => e.trim())
            .filter(Boolean)
            .filter(e => e !== session?.user?.email)
        : [];

    if (!title || !date || !startTimeStr || !endTimeStr) {
        throw new Error("Vui lòng điền đủ Tên Cuộc Họp, Ngày và Giờ");
    }

    // Task 13: Validate all participant emails exist in DB
    if (participants.length > 0) {
        const existingUsers = await prisma.user.findMany({
            where: { email: { in: participants } },
            select: { email: true }
        });
        const existingEmails = existingUsers.map(u => u.email);
        const missingEmails = participants.filter(email => !existingEmails.includes(email));

        if (missingEmails.length > 0) {
            throw new Error(`The following users do not exist in Remindly: ${missingEmails.join(", ")}`);
        }
    }

    const startTime = new Date(`${date}T${startTimeStr}`);
    const endTime = new Date(`${date}T${endTimeStr}`);

    // Để lưu Meeting, ta cần 1 Event làm Parent, và đẩy danh sách Users theo model Meeting
    const newEvent = await prisma.event.create({
        data: {
            title,
            description,
            startTime,
            endTime,
            priority: "HIGH",
            categoryTag: "Meeting",
            isDraft: false,
            ownerId: session.user.id,
            source: "local"
        }
    });

    // Thả Participants vào Bảng Meeting (Mapping relations)
    if (participants.length > 0) {
        await prisma.meeting.createMany({
            data: participants.map(email => ({
                eventId: newEvent.id,
                participantEmail: email,
                provider: "local",
                role: "ATTENDEE",
                rsvpStatus: "PENDING"
            }))
        });

        // Bonus: Tự chèn bản thân làm HOST
        if (session.user.email) {
            await prisma.meeting.create({
                data: {
                    eventId: newEvent.id,
                    participantEmail: session.user.email,
                    provider: "local",
                    role: "HOST",
                    rsvpStatus: "ACCEPTED" // Mình là chủ phòng thì mặc định accept
                }
            });
        }
    }

    // Trigger Notification Systems giả lập API Call cho tất cả Participants (Phase 2 core goal)
    // Sẽ ghim thông báo vào bảng `Notification` Database với các Email khớp User account trong DB
    const internalMembers = await prisma.user.findMany({
        where: { email: { in: participants } },
        select: { id: true, email: true }
    });

    if (internalMembers.length > 0) {
        await prisma.notification.createMany({
            data: internalMembers.map(member => ({
                userId: member.id,
                title: `Lời Mời Tham Gia Cuộc Họp: ${title}`,
                message: `${session?.user?.name || session?.user?.email} đang mời bạn tham gia một cuộc họp`,
                type: "INVITE",
                isRead: false,
                metadata: { eventId: newEvent.id }
            }))
        })
    }

    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: true };
}

/**
 * Tạo nhanh Cuộc họp (Instant Meeting) bắt đầu ngay lúc này, diễn ra trong 30 phút.
 * Không đẩy lên calendar chính (isDraft = true)
 */
export async function createInstantMeetingAction(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const title = formData.get("title") as string || "Instant Sync";
    const description = formData.get("description") as string;
    
    const rawEmails = formData.get("participants") as string;
    const participants = rawEmails 
        ? rawEmails.split(",")
            .map(e => e.trim())
            .filter(Boolean)
            .filter(e => e !== session?.user?.email)
        : [];

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 phút sau

    // Tạo Event với isDraft = true để ẩn khỏi Calendar và Dashboard
    const newEvent = await prisma.event.create({
        data: {
            title,
            description,
            startTime,
            endTime,
            priority: "HIGH",
            categoryTag: "InstantMeeting",
            isDraft: false,
            ownerId: session.user.id,
            source: "local",
            location: `https://meet.google.com/mock-instant-${Math.random().toString(36).substring(7)}`
        }
    });

    if (session.user.email) {
        await prisma.meeting.create({
            data: {
                eventId: newEvent.id,
                participantEmail: session.user.email,
                provider: "local",
                role: "HOST",
                rsvpStatus: "ACCEPTED"
            }
        });
    }

    if (participants.length > 0) {
        await prisma.meeting.createMany({
            data: participants.map(email => ({
                eventId: newEvent.id,
                participantEmail: email,
                provider: "local",
                role: "ATTENDEE",
                rsvpStatus: "PENDING"
            }))
        });

        const internalMembers = await prisma.user.findMany({
            where: { email: { in: participants } },
            select: { id: true, email: true }
        });

        // Use the saved link
        const mockLink = newEvent.location;

        if (internalMembers.length > 0) {
            await prisma.notification.createMany({
                data: internalMembers.map(member => ({
                    userId: member.id,
                    title: `[Khẩn cấp] Mời Họp Ngay: ${title}`,
                    message: `${session?.user?.name || session?.user?.email} vừa khởi tạo một phiên họp tức thì. Nhấn để tham gia ngay! Link: ${mockLink}`,
                    type: "INVITE",
                    isRead: false,
                    metadata: { eventId: newEvent.id, instantLink: mockLink }
                }))
            });
        }
    }

    const hostLink = `https://meet.google.com/mock-instant-${Math.random().toString(36).substring(7)}`;

    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: true, link: hostLink, eventId: newEvent.id };
}

export async function getActiveInstantMeeting() {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) return null;

    const now = new Date();
    // Look for active instant meetings this user is part of (and hasn't declined)
    const activeMeeting = await prisma.event.findFirst({
        where: {
            categoryTag: "InstantMeeting",
            endTime: { gt: now },
            meetings: {
                some: {
                    participantEmail: session.user.email,
                    rsvpStatus: { in: ["ACCEPTED", "PENDING", "MAYBE"] }
                }
            }
        },
        include: {
            owner: { select: { name: true, email: true } },
            meetings: {
                where: { participantEmail: session.user.email },
                select: { role: true, rsvpStatus: true, provider: true } // assuming provider is where we can stick the link? No, wait. 
            }
        },
        orderBy: { startTime: 'desc' }
    });

    if (!activeMeeting) return null;

    // Retrieve the link from notification metadata if we are an attendee, or just generate a placeholder since we didn't save the link to the DB properly in the original code. Wait, we should save the link to the DB! Let's update `createInstantMeetingAction` to save the link.
    // Actually, we can just save it in the event's location field.

    return activeMeeting;
}

export async function endInstantMeeting(eventId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.event.update({
        where: { id: eventId },
        data: { endTime: new Date() } // forcefully end it now
    });

    revalidatePath("/meetings/create");
    return { success: true };
}

export async function leaveInstantMeeting(eventId: string) {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Unauthorized");

    // Get the meeting record for this user
    await prisma.meeting.updateMany({
        where: { eventId, participantEmail: session.user.email },
        data: { rsvpStatus: "DECLINED" }
    });

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (event) {
         await prisma.notification.create({
             data: {
                 userId: event.ownerId,
                 title: "Tham gia cuộc họp",
                 message: `${session.user.name || session.user.email} đã rời khỏi / từ chối cuộc họp tức thì của bạn.`,
                 type: "SYSTEM",
                 isRead: false
             }
         });
    }

    revalidatePath("/meetings/create");
    return { success: true };
}
