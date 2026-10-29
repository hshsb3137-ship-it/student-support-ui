import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

const TONE = {
  info: { icon: Info, cls: "bg-info/10 text-info" },
  success: { icon: CheckCircle2, cls: "bg-success/12 text-success" },
  warning: { icon: AlertTriangle, cls: "bg-warning/15 text-warning-foreground" },
  critical: { icon: ShieldAlert, cls: "bg-critical/12 text-critical" },
} as const;

export function Notification({
  notification,
  onClick,
  compact,
}: {
  notification: AppNotification;
  onClick?: () => void;
  compact?: boolean;
}) {
  const { icon: Icon, cls } = TONE[notification.tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-secondary/60",
        notification.read ? "border-transparent bg-transparent" : "border-border bg-card",
      )}
    >
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", cls)}>
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{notification.title}</span>
          {!notification.read ? (
            <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />
          ) : null}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-xs text-muted-foreground",
            compact ? "line-clamp-2" : "",
          )}
        >
          {notification.message}
        </span>
        <span className="mt-1 block text-[11px] uppercase tracking-wide text-muted-foreground/70">
          {notification.date}
        </span>
      </span>
    </button>
  );
}
