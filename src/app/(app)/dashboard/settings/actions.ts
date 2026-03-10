"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function updateProfile(data: { name?: string; avatar?: string }) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                avatar: data.avatar,
            }
        });

        revalidatePath("/dashboard/settings");
        return { success: true, message: "Profile updated successfully." };
    } catch (err) {
        console.error(err);
        return { success: false, message: "Failed to update profile." };
    }
}

export async function generateOTP(identifier: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    try {
        // Enforce uniqueness constraint check first
        const isEmail = identifier.includes("@");
        const existingUser = await prisma.user.findFirst({
            where: isEmail ? { email: identifier } : { phoneNumber: identifier }
        });

        if (existingUser && existingUser.id !== session.user.id) {
            return { success: false, message: `This ${isEmail ? "email" : "phone number"} is already in use by another account.` };
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const bcrypt = await import("bcryptjs");
        const codeHash = await bcrypt.hash(otpCode, 10);

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        await prisma.oTPCode.create({
            data: {
                email: identifier, // Reusing 'email' column to store target identifier generally
                codeHash,
                expiresAt,
            }
        });

        // Simulating external OTP dispatch (Sendgrid / Twilio)
        console.log(`[SIMULATED DISPATCH] OTP sent to ${identifier}: ${otpCode}`);
        return { success: true, message: `An OTP was dispatched to your new ${isEmail ? "email" : "phone number"}. Please check your messages.` };
    } catch (e) {
        return { success: false, message: "Failed to generate OTP." };
    }
}

export async function verifyOTPAndCommit(identifier: string, code: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    try {
        const latestOTP = await prisma.oTPCode.findFirst({
            where: { email: identifier },
            orderBy: { createdAt: 'desc' },
        });

        if (!latestOTP) return { success: false, message: "No OTP found." };
        if (latestOTP.attempts >= 5) return { success: false, message: "Maximum attempts reached. Request a new OTP." };
        if (new Date() > latestOTP.expiresAt) return { success: false, message: "OTP expired." };

        const bcrypt = await import("bcryptjs");
        const isValid = await bcrypt.compare(code, latestOTP.codeHash);

        if (!isValid) {
            await prisma.oTPCode.update({ where: { id: latestOTP.id }, data: { attempts: { increment: 1 } } });
            return { success: false, message: "Invalid Verification Code." };
        }

        await prisma.oTPCode.delete({ where: { id: latestOTP.id } });

        const isEmail = identifier.includes("@");
        await prisma.user.update({
            where: { id: session.user.id },
            data: isEmail ? { email: identifier } : { phoneNumber: identifier }
        });

        revalidatePath("/dashboard/settings");
        return { success: true, message: `Account actively bound to new ${isEmail ? "email" : "phone number"}.` };
    } catch (e) {
        return { success: false, message: "Failed verifying your security code." };
    }
}

export async function updatePassword(oldPass: string, newPass: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user || !user.passwordHash) return { success: false, message: "Account setup incorrectly." };

        const { comparePasswords, hashPassword } = await import("@/lib/auth");
        const isValid = await comparePasswords(oldPass, user.passwordHash);

        if (!isValid) return { success: false, message: "Incorrect current password." };

        const newHash = await hashPassword(newPass);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash }
        });

        return { success: true, message: "Password updated safely." };
    } catch (e) {
        return { success: false, message: "System error changing password." };
    }
}
