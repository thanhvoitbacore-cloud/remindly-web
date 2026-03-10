import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash the OTP before storing
        const salt = await bcrypt.genSalt(10);
        const codeHash = await bcrypt.hash(otp, salt);

        // Set expiration to 5 minutes from now
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Save to database
        await prisma.oTPCode.create({
            data: {
                email,
                codeHash,
                expiresAt,
            },
        });

        // In a real app, send the email here using standard libraries like `nodemailer` or `resend`
        // For development, print it to the server console.
        console.log(`\n============================`);
        console.log(`Development OTP generated!`);
        console.log(`To: ${email}`);
        console.log(`Code: ${otp}`);
        console.log(`Expires in: 5 minutes`);
        console.log(`============================\n`);

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
