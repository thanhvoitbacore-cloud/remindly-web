import Skeleton from "@/components/ui/Skeleton";

export default function CalendarLoading() {
  return (
    <div className="max-w-7xl w-full mx-auto space-y-space-6 animate-in fade-in duration-500 h-[calc(100vh-theme(spacing.24))] flex flex-col pt-2 pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-4 pb-space-4 border-b border-border-subtle shrink-0">
        <div className="space-y-2 w-full max-w-md">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-10 w-full md:w-32 rounded-xl shrink-0" />
      </header>

      {/* Calendar Grid Skeleton */}
      <div className="flex-1 bg-bg-surface border border-border-subtle rounded-2xl p-4 flex flex-col gap-4 overflow-hidden">
        {/* Calendar Toolbar */}
        <div className="flex justify-between items-center shrink-0">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
          <Skeleton className="h-7 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>

        {/* Calendar Grid Header (Weekdays) */}
        <div className="grid grid-cols-7 gap-2 shrink-0">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <Skeleton key={day} className="h-8 w-full rounded-lg" />
          ))}
        </div>

        {/* Calendar Cells Grid (Month View mock) */}
        <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-2 min-h-0">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="border border-border-subtle/40 rounded-xl p-2 flex flex-col justify-between h-full bg-bg-primary/30 relative">
              <Skeleton className="h-4 w-6 self-end" />
              {/* Mock some events in specific cells to look real */}
              {i % 7 === 2 && (
                <Skeleton className="h-5 w-11/12 bg-indigo-500/20" />
              )}
              {i % 7 === 5 && (
                <Skeleton className="h-5 w-10/12 bg-emerald-500/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
