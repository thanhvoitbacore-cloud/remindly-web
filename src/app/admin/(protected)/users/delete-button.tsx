"use client";

import { useTransition } from "react";
import { deleteUser } from "./actions";
import { Trash2 } from "lucide-react";

export default function DeleteUserButton({ userId, isSelf }: { userId: string, isSelf: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
            startTransition(async () => {
                const res = await deleteUser(userId);
                if (!res.success) {
                    alert(res.message);
                }
            });
        }
    };

    if (isSelf) {
        return (
            <button
                disabled
                className="p-2 text-gray-600 cursor-not-allowed opacity-50"
                title="You cannot delete yourself."
            >
                <Trash2 className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`p-2 transition-colors rounded hover:bg-red-500/10 ${isPending ? "text-gray-500 cursor-wait" : "text-red-400 hover:text-red-300"
                }`}
            title="Delete User"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    );
}
