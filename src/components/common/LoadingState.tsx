import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ rows = 4, label }: { rows?: number; label?: string }) {
  return (
    <div className="surface-card space-y-3 p-5" role="status" aria-live="polite">
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-3.5 flex-1" />
          <Skeleton className="hidden h-3.5 w-24 sm:block" />
          <Skeleton className="hidden h-3.5 w-16 md:block" />
        </div>
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}
