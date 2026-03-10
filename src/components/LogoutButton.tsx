"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2.5 bg-gray-900 border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-xl transition"
            title="Log out"
        >
            <LogOut className="w-5 h-5" />
        </button>
    );
}
