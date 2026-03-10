import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const proxy = auth((req) => {
    // Apply Role-Based Protection specifically to the Admin Portal domain
    if (req.nextUrl.pathname.startsWith("/admin")) {
        // Unauthenticated Users drop backwards into /login
        if (!req.auth || !req.auth.user) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Authenticated users missing the explicit ADMIN role flag get met with HTTP 403
        if ((req.auth.user as any).role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }
    }

    return NextResponse.next();
});

// Ensure the middleware strictly fires uniquely upon standard admin paths and backend API interactions
export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"]
};
