import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function getUserFromSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("remindly_token")?.value;
    if (!token) return null;
    return await verifyToken(token);
}
