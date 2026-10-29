import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CardTone = "default" | "info" | "warning" | "success" | "critical" | "accent";

const TONE_STYLES: Record<CardTone, { icon: string; value: string }> = {
  default: { icon: "bg-primary/10 text-primary", value: "text-foreground" },
  info: { icon: "bg-info/10 text-info", value: "text-foreground" },
  warning: { icon: "bg-warning/15 text-warning-foreground", value: "text-foreground" },
  success: { icon: "bg-success/12 text-success", value: "text-foreground" },
  critical: { icon: "bg-critical/12 text-critical", value: "text-critical" },
  accent: { icon: "bg-accent/20 text-accent-foreground", value: "text-foreground" },
};

interface DashboardCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: CardTone;
  hint?: string;
  onClick?: () => void;
}

export function DashboardCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
  onClick,
}: DashboardCardProps) {
  const styles = TONE_STYLES[tone];
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      onClick={onClick}
      className={cn(
        "surface-card group flex w-full items-start gap-4 p-5 text-left transition-all",
        onClick && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)]",
      )}
    >
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", styles.icon)}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-muted-foreground">{label}</span>
        <span
          className={cn("mt-1 block font-display text-3xl font-semibold leading-none", styles.value)}
        >
          {value}
        </span>
        {hint ? <span className="mt-2 block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </Comp>
  );
}
