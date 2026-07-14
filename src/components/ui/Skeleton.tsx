import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    variant?: "text" | "circular" | "rectangular" | "rounded";
    animate?: "pulse" | "shimmer" | "none";
}

export default function Skeleton({
    className,
    variant = "rounded",
    animate = "shimmer",
    ...props
}: SkeletonProps) {
    return (
        <div
            className={twMerge(
                "bg-border-subtle/80 rounded-xl",
                variant === "text" && "h-4 w-full rounded",
                variant === "circular" && "rounded-full",
                variant === "rectangular" && "rounded-none",
                variant === "rounded" && "rounded-2xl",
                animate === "pulse" && "animate-pulse",
                animate === "shimmer" && "animate-shimmer",
                className
            )}
            {...props}
        />
    );
}
