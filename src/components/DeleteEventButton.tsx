"use client";

import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEventAction } from "@/app/(app)/events/edit/[id]/actions";

export default function DeleteEventButton({ eventId }: { eventId: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Ngăn trigger các onClick của thẻ cha
        e.stopPropagation();

        if (!confirm("Delete this event?")) return;

        setIsDeleting(true);
        try {
            await deleteEventAction(eventId);
            router.refresh();
        } catch (error) {
            alert("Failed to delete event.");
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 bg-gray-800 hover:bg-red-500/20 rounded-md text-gray-400 hover:text-red-400 transition ml-1"
            title="Delete Event"
        >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
    );
}
