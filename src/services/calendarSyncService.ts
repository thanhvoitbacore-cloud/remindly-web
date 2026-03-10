import { prisma } from "@/lib/prisma";

export async function syncGoogleCalendar(userId: string, accessToken: string) {
    try {
        const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=" + new Date().toISOString(), {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.error("Google Calendar API error", await response.text());
            return;
        }

        const data = await response.json();
        const events = data.items || [];

        for (const item of events) {
            if (item.status === "cancelled") continue;

            const startTimeStr = item.start?.dateTime || item.start?.date;
            const endTimeStr = item.end?.dateTime || item.end?.date;

            if (!startTimeStr || !endTimeStr) continue;

            const existingEvent = await (prisma.event as any).findFirst({
                where: { ownerId: userId, externalId: item.id }
            });

            if (existingEvent) {
                await prisma.event.update({
                    where: { id: existingEvent.id } as any,
                    data: {
                        title: item.summary || "Untitled Event",
                        description: item.description || null,
                        startTime: new Date(startTimeStr),
                        endTime: new Date(endTimeStr),
                        location: item.location || null,
                    }
                });
            } else {
                await (prisma.event as any).create({
                    data: {
                        title: item.summary || "Untitled Event",
                        description: item.description || null,
                        startTime: new Date(startTimeStr),
                        endTime: new Date(endTimeStr),
                        location: item.location || null,
                        ownerId: userId,
                        externalId: item.id,
                        source: "google",
                        isDraft: false,
                    }
                });
            }

        }
    } catch (error) {
        console.error("Failed to sync Google Calendar:", error);
    }
}

export async function syncOutlookCalendar(userId: string, accessToken: string) {
    try {
        const response = await fetch("https://graph.microsoft.com/v1.0/me/events?$select=subject,body,bodyPreview,organizer,attendees,start,end,location", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.error("Microsoft Graph API error", await response.text());
            return;
        }

        const data = await response.json();
        const events = data.value || [];

        for (const item of events) {
            const startTimeStr = item.start?.dateTime;
            const endTimeStr = item.end?.dateTime;

            if (!startTimeStr || !endTimeStr) continue;

            const existingEvent = await (prisma.event as any).findFirst({
                where: { ownerId: userId, externalId: item.id }
            });

            if (existingEvent) {
                await prisma.event.update({
                    where: { id: existingEvent.id },
                    data: {
                        title: item.subject || "Untitled Event",
                        description: item.bodyPreview || null,
                        startTime: new Date(startTimeStr + "Z"), // Outlook returns times in UTC but sometimes missing Z
                        endTime: new Date(endTimeStr + "Z"),
                        location: item.location?.displayName || null,
                    }
                });
            } else {
                await (prisma.event as any).create({
                    data: {
                        title: item.subject || "Untitled Event",
                        description: item.bodyPreview || null,
                        startTime: new Date(startTimeStr + "Z"),
                        endTime: new Date(endTimeStr + "Z"),
                        location: item.location?.displayName || null,
                        ownerId: userId,
                        externalId: item.id,
                        source: "outlook",
                        isDraft: false,
                    }
                });
            }
        }
    } catch (error) {
        console.error("Failed to sync Outlook Calendar:", error);
    }
}

export async function syncUserCalendars(userId: string) {
    const accounts = await (prisma as any).calendarAccount.findMany({
        where: { userId }
    });

    for (const account of accounts) {
        if (!account.accessToken) continue;

        // In a real app we'd refresh the token if account.expiry is past Date.now()
        // using the refresh token.

        if (account.provider === "GOOGLE") {
            await syncGoogleCalendar(userId, account.accessToken);
        } else if (account.provider === "OUTLOOK") {
            await syncOutlookCalendar(userId, account.accessToken);
        }

        await (prisma as any).calendarAccount.update({
            where: { id: account.id },
            data: { lastSyncTime: new Date() }
        });
    }
}
