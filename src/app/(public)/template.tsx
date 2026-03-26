"use client";

import { usePathname } from "next/navigation";

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    return (
        <div key={pathname} className="animate-tab-enter w-full h-full">
            {children}
        </div>
    );
}
