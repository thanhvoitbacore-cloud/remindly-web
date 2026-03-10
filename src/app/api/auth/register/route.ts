import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        // Basic validation
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "A user with this email already exists" },
                { status: 409 }
            );
        }

        // Hash the password
        const passwordHash = await hashPassword(password);

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                name: name || null,
                email,
                passwordHash,
                accountStatus: "ACTIVE", // Or PENDING_VERIFICATION if you have email verification implementation
            },
        });

        // Don't return the password hash in the response
        const { passwordHash: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(
            { message: "User registered successfully", user: userWithoutPassword },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "An error occurred during registration" },
            { status: 500 }
        );
    }
}
