import Skeleton from "@/components/ui/Skeleton";

export default function DraftsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-space-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-4 pb-space-6 border-b border-border-subtle">
        <div className="space-y-2 w-full max-w-xl">
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-10 w-full md:w-32 rounded-xl shrink-0" />
      </header>

      {/* Grid of Draft Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-space-6 rounded-2xl bg-bg-surface border border-border-subtle flex flex-col justify-between h-72 relative overflow-hidden">
            <div>
              <Skeleton className="h-6 w-3/4 mb-3" />
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-2 h-2 rounded-full bg-amber-500/40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border-subtle">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
