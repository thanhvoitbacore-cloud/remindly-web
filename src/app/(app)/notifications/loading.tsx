import Skeleton from "@/components/ui/Skeleton";

export default function NotificationsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-space-8 animate-in fade-in duration-500 pb-space-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-4 pb-space-6 border-b border-border-subtle">
        <div className="space-y-2 w-full max-w-lg">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="flex gap-space-3 w-full md:w-auto shrink-0">
          <Skeleton className="h-10 w-full md:w-36 rounded-xl" />
          <Skeleton className="h-10 w-full md:w-28 rounded-xl" />
        </div>
      </header>

      {/* Notifications List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-space-5 rounded-2xl bg-bg-surface border border-border-subtle flex items-start gap-4 relative overflow-hidden">
            {/* Left status dot or icon */}
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            
            {/* Middle Content */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex justify-between items-start gap-4">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-20 shrink-0" />
              </div>
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-4 pt-1">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            
            {/* Right actions */}
            <div className="flex gap-1 shrink-0">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
