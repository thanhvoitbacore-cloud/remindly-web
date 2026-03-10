import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        redirect("/login");
        return null;
    }

    if (session.user.id === "admin-hardcoded") {
        redirect("/admin/overview");
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            phoneNumber: true,
            avatar: true,
        }
    });

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Account Settings</h1>
                <p className="text-gray-400">Manage your profile, security preferences, and personal details.</p>
            </div>

            {/* We extract the interactive UI to a Client Component to manage the complex OTP and Password states cleanly */}
            <SettingsForm initialUser={user} />
        </div>
    );
}
