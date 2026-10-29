import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export function NativeSelect({
  className,
  options,
  allLabel,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  options: readonly string[];
  allLabel?: string | undefined;
}) {
  return (
    <select
      className={cn(
        "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {allLabel ? <option value="all">{allLabel}</option> : null}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-critical">{error}</p> : null}
    </div>
  );
}

export function ActiveBadge({ active, labels = ["Active", "Inactive"] }: { active: boolean; labels?: [string, string] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        active ? "bg-success/12 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      {active ? labels[0] : labels[1]}
    </span>
  );
}

export function Panel({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("surface-card p-5", className)}>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)", "var(--accent)", "var(--muted-foreground)", "var(--info)"];

export const thClass = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
export const tdClass = "px-4 py-3 align-top";
