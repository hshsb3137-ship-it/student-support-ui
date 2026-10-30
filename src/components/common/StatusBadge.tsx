import { cn } from "@/lib/utils";
import type { GrievanceStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const STATUS_STYLES: Record<GrievanceStatus, string> = {
  // Canonical uppercase
  SUBMITTED: "bg-muted text-muted-foreground border-border",
  GFM_REVIEW: "bg-warning/15 text-warning-foreground border-warning/30",
  GFM_ACCEPTED: "bg-success/12 text-success border-success/30",
  GFM_INFORMATION_REQUESTED: "bg-info/10 text-info border-info/30",
  GFM_REJECTED: "bg-destructive/10 text-destructive border-destructive/25",
  DEPARTMENT_ASSIGNED: "bg-primary/10 text-primary border-primary/25",
  STAFF_REVIEW: "bg-info/10 text-info border-info/30",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/25",
  INFORMATION_REQUESTED: "bg-warning/15 text-warning-foreground border-warning/30",
  RESOLVED: "bg-success/12 text-success border-success/30",
  ESCALATED: "bg-critical/12 text-critical border-critical/30",
  // Legacy / titlecase
  Submitted: "bg-muted text-muted-foreground border-border",
  Acknowledged: "bg-secondary text-secondary-foreground border-border",
  "Waiting for Student": "bg-warning/15 text-warning-foreground border-warning/30",
  "Under Review": "bg-info/10 text-info border-info/30",
  "In Progress": "bg-primary/10 text-primary border-primary/25",
  "Resolution Proposed": "bg-accent/20 text-accent-foreground border-accent/40",
  Resolved: "bg-success/12 text-success border-success/30",
  Rejected: "bg-destructive/10 text-destructive border-destructive/25",
  Escalated: "bg-critical/12 text-critical border-critical/30",
  ESCALATED_TO_ADMIN: "bg-critical/12 text-critical border-critical/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: GrievanceStatus;
  className?: string;
}) {
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
