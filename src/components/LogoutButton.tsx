"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "./actions";

export default function LogoutButton() {
    return (
        <form action={logoutAction}>
            <button
                type="submit"
                className="p-2.5 bg-gray-900 border border-gray-800 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-xl transition cursor-pointer"
                title="Log out"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </form>
    );
}
