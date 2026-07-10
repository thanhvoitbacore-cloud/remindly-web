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
        <div className="max-w-4xl mx-auto space-y-space-8 animate-in fade-in duration-500">
            <div>
                <h1 className="h1-premium text-text-main mb-space-2">Account Settings</h1>
                <p className="body-premium text-text-muted">Manage your profile, security preferences, and personal details.</p>
            </div>

            {/* We extract the interactive UI to a Client Component to manage the complex OTP and Password states cleanly */}
            <SettingsForm initialUser={user} />
        </div>
    );
}
