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
    const executor = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });

    if (!executor || executor.role !== "ADMIN") {
        return { success: false, message: "Forbidden. Admin privileges required." };
    }

    // 3. Guards
    if (userId === session.user.id) {
        return { success: false, message: "Action denied. You cannot delete yourself." };
    }

    // 4. Execute Deletion
    try {
        await prisma.user.delete({
            where: { id: userId },
        });

        // Revalidate the users page so it updates instantly
        revalidatePath("/admin/users");
        return { success: true, message: "User successfully deleted." };
    } catch (error) {
        console.error("Failed to delete user:", error);
        return { success: false, message: "An error occurred while deleting the user." };
    }
}
