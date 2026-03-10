import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminRootPage() {
    const session = await auth();
    if (session?.user) {
        redirect("/admin/overview");
    } else {
        redirect("/login");
    }
}
