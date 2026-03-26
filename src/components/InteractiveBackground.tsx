"use client";

import { useState, useRef, ReactNode } from "react";

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
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate mouse relative to center (-1 to 1)
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

        setMousePosition({ x, y });
    };

    const handleMouseLeave = () => {
        setMousePosition({ x: 0, y: 0 });
    };

    const gradientClass = primaryColor === "pink" 
        ? "from-pink-900 via-purple-900 to-indigo-900"
        : "from-indigo-900 via-purple-900 to-gray-900";

    const orb1Class = primaryColor === "pink" ? "bg-pink-500/40" : "bg-indigo-500/40";
    const orb2Class = secondaryColor === "indigo" ? "bg-indigo-500/40" : "bg-purple-500/40";

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`hidden lg:flex lg:w-1/2 relative bg-gradient-to-br ${gradientClass} items-center justify-center overflow-hidden`}
            style={{ perspective: "1000px" }}
        >
            {/* Background Noise Layer */}
            <div className="absolute inset-0 w-full h-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>

            {/* Parallax Orbs responding to cursor */}
            <div 
                className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] ${orb1Class} rounded-full blur-[128px] transition-transform duration-700 ease-out`}
                style={{ transform: `translate(${mousePosition.x * -60}px, ${mousePosition.y * -60}px)` }}
            />
            <div 
                className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] ${orb2Class} rounded-full blur-[128px] transition-transform duration-700 ease-out`}
                style={{ transform: `translate(${mousePosition.x * 60}px, ${mousePosition.y * 60}px)` }}
            />

            {/* 3D Tilted Card following the cursor */}
            <div 
                className="relative z-10 p-12 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl transition-transform duration-150 ease-out flex flex-col items-center text-center max-w-lg"
                style={{ 
                    transform: `rotateX(${-mousePosition.y * 15}deg) rotateY(${mousePosition.x * 15}deg) translateZ(40px)`,
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Dynamic highlight reflection */}
                <div 
                    className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
                    style={{ 
                        background: `radial-gradient(ellipse at ${50 + mousePosition.x * 50}% ${50 + mousePosition.y * 50}%, rgba(255,255,255,0.1) 0%, transparent 60%)`,
                        opacity: 0.5
                    }}
                />

                {/* Inner Content popping out in 3D */}
                <div style={{ transform: 'translateZ(50px)' }} className="pointer-events-none">
                    <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-200 leading-relaxed font-medium drop-shadow-md">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </div>
    );
}
