import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const events = await prisma.event.findMany({
            where: { ownerId: session.user.id },
            include: { meetings: true },
            orderBy: { startTime: 'asc' }
        });

        return NextResponse.json({ events });
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, startTime, endTime, provider, meetingLink, location, categoryTag, externalId, source } = body;

        if (!title || !startTime || !endTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newEvent = await prisma.event.create({
            data: {
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                location,
                categoryTag,
                ownerId: session.user.id,
                externalId,
                source: source || "local",
                isDraft: false
            }
        });

        if (provider) {
            await prisma.meeting.create({
                data: {
                    eventId: newEvent.id,
                    provider,
                    meetingLink,
                    participantEmail: session.user.email || ""
                }
            });
        }

        const eventWithMeeting = await prisma.event.findUnique({
            where: { id: newEvent.id },
            include: { meetings: true }
        })

        return NextResponse.json({ event: eventWithMeeting }, { status: 201 });
    } catch (error) {
        console.error("Failed to create event:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const existingEvent = await prisma.event.findFirst({
            where: { id, ownerId: session.user.id }
        });

        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        await prisma.event.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete event:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
