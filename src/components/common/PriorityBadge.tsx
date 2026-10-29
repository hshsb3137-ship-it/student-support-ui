import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-info/10 text-info border-info/30",
  High: "bg-warning/15 text-warning-foreground border-warning/40",
  Critical: "bg-critical/12 text-critical border-critical/35",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        PRIORITY_STYLES[priority],
        className,
      )}
    >
      {priority}
    </span>
  );
}
