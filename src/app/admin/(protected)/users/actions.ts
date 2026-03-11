"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteUser(userId: string) {
    const session = await auth();

    // 1. Authenticate Action Executor
    if (!session || !session.user) {
        return { success: false, message: "Unauthorized. Please log in." };
    }

    // 2. Authorize Action Executor (Must be ADMIN)
    let isAdmin = false;
    
    if (session.user.id === "admin-hardcoded") {
        isAdmin = true;
    } else {
        try {
            const executor = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { role: true },
            });
            if (executor?.role === "ADMIN") {
                isAdmin = true;
            }
        } catch (e) {
            console.error("Executor ID lookup failure:", e);
        }
    }

    if (!isAdmin) {
        return { success: false, message: "Forbidden. Admin privileges required." };
    }

    // 3. Guards
    if (userId === session.user.id) {
        return { success: false, message: "Action denied. You cannot delete yourself." };
    }

    // 4. Execute Deletion using a safe transaction to sweep loose references
    try {
        const userToDelete = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (userToDelete) {
            await prisma.$transaction(async (tx) => {
                // Delete orphaned ActivityLog records since it uses a soft relation `entityId`
                await tx.activityLog.deleteMany({
                    where: { entityId: userId }
                });

                // Clear out their loose email associations
                if (userToDelete.email) {
                    await tx.meeting.deleteMany({
                        where: { participantEmail: userToDelete.email }
                    });
                    await tx.oTPCode.deleteMany({
                        where: { email: userToDelete.email }
                    });
                }

                // Delete the core user (Prisma handles Event, CalendarAccount, Notifications cascade)
                await tx.user.delete({
                    where: { id: userId },
                });
            });
        }

        // Revalidate the pages
        revalidatePath("/admin/users");
        revalidatePath("/admin/sync-history");
        return { success: true, message: "User successfully deleted." };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, message: "An error occurred while deleting the user." };
    }
}
