import Skeleton from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-space-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-4 pb-space-6 border-b border-border-subtle">
        <div className="space-y-2 w-full max-w-xs">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </header>

      <div className="max-w-7xl space-y-space-4">
        <div>
          {/* Subheader */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-space-4 gap-space-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 w-full md:w-32 rounded-xl" />
          </div>

          {/* Filter Skeleton */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 md:p-5 mb-6 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="w-full md:w-48 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-10 w-full md:w-32 rounded-lg" />
            </div>
            <div className="w-full space-y-2 pt-4 border-t border-border-subtle">
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-8 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Events List Skeleton */}
          <div className="space-y-space-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-space-6 rounded-2xl bg-bg-surface border border-border-subtle flex flex-col gap-3 relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <Skeleton className="h-6 w-1/3" />
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
                <Skeleton className="h-5 w-24 mt-2" />
                <Skeleton className="h-14 w-full mt-2" />
                <div className="flex flex-wrap gap-4 mt-4">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
