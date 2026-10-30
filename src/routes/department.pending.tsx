import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DepartmentScopeBadge } from "@/components/department/DepartmentCaseTable";
import { StaffCaseModal } from "@/components/department/StaffCaseModal";
import { useDepartmentData } from "@/lib/department-store";
import { slaDaysLeft } from "@/lib/department-data";
import type { Grievance } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/department/pending")({
  head: () => ({
    meta: [
      { title: "Pending Actions — Department Desk" },
      { name: "description", content: "Grievances awaiting a response from your department." },
      { property: "og:title", content: "Pending Actions — Department Desk" },
      { property: "og:description", content: "Grievances awaiting a response from your department." },
    ],
  }),
  component: PendingPage,
});

const CLOSED = [
  "Resolved",
  "RESOLVED",
  "Rejected",
  "GFM_REJECTED",
  "Escalated",
  "ESCALATED",
  "ESCALATED_TO_ADMIN",
];

function PendingPage() {
  const { cases } = useDepartmentData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const open = cases.filter((g) => !CLOSED.includes(g.status));
  const groups: { title: string; tone: string; rows: Grievance[] }[] = [
    { title: "Overdue", tone: "border-critical", rows: open.filter((g) => slaDaysLeft(g) < 0) },
    { title: "Nearing SLA deadline", tone: "border-warning", rows: open.filter((g) => { const d = slaDaysLeft(g); return d >= 0 && d <= 2; }) },
    { title: "High priority", tone: "border-critical", rows: open.filter((g) => g.priority === "High" || g.priority === "Critical") },
    { title: "New assigned grievances", tone: "border-info", rows: open.filter((g) => g.status === "DEPARTMENT_ASSIGNED" || g.status === "Submitted" || g.status === "SUBMITTED") },
    { title: "Waiting for review", tone: "border-accent", rows: open.filter((g) => ["Acknowledged", "Under Review", "STAFF_REVIEW"].includes(g.status)) },
    { title: "Waiting for response", tone: "border-primary", rows: open.filter((g) => ["Waiting for Student", "INFORMATION_REQUESTED", "Resolution Proposed"].includes(g.status)) },
  ];
  const selected = cases.find((g) => g.id === selectedId);

  return (
    <>
      <PageHeader
        title="Pending actions"
        description="Cases still waiting on a decision, ordered by urgency."
        crumbs={[{ label: "Department Desk", to: "/department" }, { label: "Pending" }]}
        actions={<DepartmentScopeBadge />}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((grp) => (
          <section key={grp.title} className={cn("surface-card border-l-4 p-4", grp.tone)}>
            <h2 className="mb-3 flex items-center justify-between font-display text-base font-semibold">
              {grp.title}
              <span className="rounded-full bg-secondary px-2 text-xs">{grp.rows.length}</span>
            </h2>
            {grp.rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing here.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {grp.rows.map((g) => {
                  const d = slaDaysLeft(g);
                  return (
                    <li key={g.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(g.id)}
                        className="flex w-full flex-wrap items-center gap-2 rounded-lg border p-3 text-left hover:bg-secondary/50"
                      >
                        <span className="font-mono text-xs">{g.id}</span>
                        <span className="flex-1 truncate text-sm font-medium">{g.title}</span>
                        <PriorityBadge priority={g.priority} />
                        <StatusBadge status={g.status} />
                        <span className={cn("text-xs", d < 0 ? "text-critical" : "text-muted-foreground")}>
                          {d < 0 ? `${-d}d overdue` : `${d}d left`}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
      <StaffCaseModal grievance={selected} open={!!selected} onOpenChange={(v) => !v && setSelectedId(null)} />
    </>
  );
}
