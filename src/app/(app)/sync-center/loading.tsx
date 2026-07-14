import Skeleton from "@/components/ui/Skeleton";

export default function SyncCenterLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-space-8 animate-in fade-in duration-500 pb-space-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between pb-space-6 border-b border-border-subtle gap-space-4">
        <div className="space-y-2 w-full max-w-xl">
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Calendar Box */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 md:p-8 flex flex-col justify-between h-96 relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>

        {/* Outlook Calendar Box */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 md:p-8 flex flex-col justify-between h-96 relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>

      {/* Auto Sync Settings Card */}
      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-8 w-14 rounded-full shrink-0" />
      </div>
    </div>
  );
}
