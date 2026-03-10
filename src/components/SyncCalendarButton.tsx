"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function SyncCalendarButton({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState("");

    const handleSync = async () => {
        setIsSyncing(true);
        setSyncMessage("");

        try {
            const res = await fetch("/api/calendar/sync", {
                method: "POST"
            });
            const data = await res.json();

            if (res.ok) {
                setSyncMessage("Calendars synced!");
                setTimeout(() => setSyncMessage(""), 3000);
            } else {
                setSyncMessage(data.error || "Sync failed");
                setTimeout(() => setSyncMessage(""), 3000);
            }
        } catch (error) {
            setSyncMessage("Sync failed");
            setTimeout(() => setSyncMessage(""), 3000);
        } finally {
            setIsSyncing(false);
        }
    };

    const baseClass = "px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 group whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed";
    const primaryClass = "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700";
    const secondaryClass = "bg-gray-950/50 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white";

    const buttonClass = `${baseClass} ${variant === "primary" ? primaryClass : secondaryClass}`;

    return (
        <div className="relative">
            <button
                onClick={handleSync}
                disabled={isSyncing}
                className={buttonClass}
            >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync Calendars"}
            </button>
            {syncMessage && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-xs rounded text-gray-300 shadow-lg whitespace-nowrap z-10">
                    {syncMessage}
                </div>
            )}
        </div>
    );
}
