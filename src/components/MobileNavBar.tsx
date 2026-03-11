"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, FileEdit, BellRing, Settings } from "lucide-react";

export default function MobileNavBar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
        { href: "/calendar", icon: CalendarDays, label: "Calendar" },
        { href: "/meetings/create", icon: Users, label: "Meetings" },
        { href: "/notifications", icon: BellRing, label: "Alerts" },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pb-safe z-50 px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-around py-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all ${
                                isActive ? "text-indigo-400" : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
                            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
