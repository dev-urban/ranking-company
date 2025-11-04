import { Skeleton } from "./ui/skeleton"

export function RankingCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-6 rounded-lg bg-slate-700/50 border border-slate-500/50">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full bg-slate-600/50" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-6 w-32 mb-2 bg-slate-600/50" />
          <Skeleton className="h-4 w-24 mb-1 bg-slate-600/50" />
          <Skeleton className="h-4 w-20 bg-slate-600/50" />
        </div>
      </div>
      <div className="text-right ml-2">
        <Skeleton className="h-8 w-16 mb-1 bg-slate-600/50" />
        <Skeleton className="h-4 w-20 bg-slate-600/50" />
      </div>
    </div>
  )
}

