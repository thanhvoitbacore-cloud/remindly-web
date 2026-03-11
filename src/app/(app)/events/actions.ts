"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function manageMeetingRSVP(eventId: string, rsvpStatus: "ACCEPTED" | "DECLINED") {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) return { success: false, message: "Unauthorized" };

    try {
        // Find the meeting record for this user
        const meetingLine = await prisma.meeting.findFirst({
            where: {
                eventId: eventId,
                participantEmail: session.user.email
            },
            include: { event: { select: { title: true, ownerId: true } } }
        });

        if (!meetingLine) return { success: false, message: "You are not invited to this meeting." };

        // Update the RSVP status
        await prisma.meeting.update({
            where: { id: meetingLine.id },
            data: { rsvpStatus }
        });

        // Notify the Host about the decision
        await prisma.notification.create({
            data: {
                userId: meetingLine.event.ownerId,
                title: `RSVP Updated: ${meetingLine.event.title}`,
                message: `${session.user.name || session.user.email} has ${rsvpStatus.toLowerCase()} your meeting invitation.`,
                type: "SYSTEM",
                isRead: false
            }
        });

        if (rsvpStatus === "DECLINED") {
            // Remove the meeting line immediately if they optionally declined it so it drops off their calendar
            await prisma.meeting.delete({ where: { id: meetingLine.id } });
        }

        revalidatePath("/dashboard");
        revalidatePath("/calendar");
        revalidatePath("/notifications");

        return { success: true, message: `Meeting invitation ${rsvpStatus.toLowerCase()}!` };
    } catch (error) {
        console.error("RSVP Error:", error);
        return { success: false, message: "Failed to update RSVP status." };
    }
}
