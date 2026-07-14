"use client";

import { ReactNode } from "react";

export default function InteractiveBackground({ 
    children, 
    title, 
    description,
    primaryColor = "indigo",
    secondaryColor = "purple"
}: { 
    children?: ReactNode,
    title: ReactNode,
    description: string,
    primaryColor?: "indigo" | "pink",
    secondaryColor?: "purple" | "indigo"
}) {
    const gradientClass = primaryColor === "pink" 
        ? "from-pink-900 via-purple-900 to-indigo-900"
        : "from-indigo-900 via-purple-900 to-gray-900";

    const orb1Class = primaryColor === "pink" ? "bg-pink-500/40" : "bg-indigo-500/40";
    const orb2Class = secondaryColor === "indigo" ? "bg-indigo-500/40" : "bg-purple-500/40";

    return (
        <div 
            className={`hidden lg:flex lg:w-1/2 relative bg-gradient-to-br ${gradientClass} items-center justify-center overflow-hidden`}
        >
            {/* Background Noise Layer */}
            <div className="absolute inset-0 w-full h-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            {/* Static Orbs */}
            <div 
                className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] ${orb1Class} rounded-full blur-[128px]`}
            />
            <div 
                className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] ${orb2Class} rounded-full blur-[128px]`}
            />

            {/* Glassmorphic Card */}
            <div 
                className="relative z-10 p-12 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl flex flex-col items-center text-center max-w-lg"
            >
                {/* Inner Content */}
                <div className="pointer-events-none">
                    <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-200/90 leading-relaxed font-medium drop-shadow-md">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </div>
    );
}
