import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { History, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { DepartmentScopeBadge } from "@/components/department/DepartmentCaseTable";
import { useDepartmentData } from "@/lib/department-store";
import { lookupStudent } from "@/lib/department-data";

export const Route = createFileRoute("/department/escalated")({
  head: () => ({
    meta: [
      { title: "Escalated Cases — Department Desk" },
      { name: "description", content: "Cases escalated beyond the department SLA window." },
      { property: "og:title", content: "Escalated Cases — Department Desk" },
      { property: "og:description", content: "Cases escalated beyond the department SLA window." },
    ],
  }),
  component: EscalatedPage,
});

function EscalatedPage() {
  const { escalations, findById, department } = useDepartmentData();
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const rows = escalations.filter((e) => findById(e.grievanceId));
  const history = escalations.filter((e) => e.grievanceId === historyFor);
  const hg = historyFor ? findById(historyFor) : undefined;

  return (
    <>
      <PageHeader
        title="Escalated cases"
        description="Grievances moved to a higher authority, with full escalation history."
        crumbs={[{ label: "Department Desk", to: "/department" }, { label: "Escalated" }]}
        actions={<DepartmentScopeBadge />}
      />
      {rows.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No escalations" description="Your department has no escalated cases." />
      ) : (
        <div className="surface-card overflow-x-auto p-4">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                {["ID", "Student", "Reason", "Current Dept.", "Escalated To", "Date", "Priority", "Status", "Action"].map((h) => (
                  <th key={h} className="px-2 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const g = findById(e.grievanceId)!;
                return (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="px-2 py-2 font-mono text-xs">{g.id}</td>
                    <td className="px-2 py-2">{lookupStudent(g.studentId, g.submittedBy).name}</td>
                    <td className="px-2 py-2 max-w-[240px] truncate" title={e.reason}>{e.reason}</td>
                    <td className="px-2 py-2">{department}</td>
                    <td className="px-2 py-2">{e.escalatedTo}</td>
                    <td className="px-2 py-2 text-xs">{e.date}</td>
                    <td className="px-2 py-2"><PriorityBadge priority={g.priority} /></td>
                    <td className="px-2 py-2"><StatusBadge status={g.status} /></td>
                    <td className="px-2 py-2">
                      <Button size="sm" variant="outline" onClick={() => setHistoryFor(g.id)}>
                        <History className="mr-1 size-3.5" /> History
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!hg} onOpenChange={(v) => !v && setHistoryFor(null)} title={`Escalation history · ${historyFor ?? ""}`} description={hg?.title}>
        <ol className="flex flex-col gap-3">
          {history.map((e) => (
            <li key={e.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">Escalated to {e.escalatedTo}</p>
              <p className="text-muted-foreground">{e.reason}</p>
              {e.comments && <p className="mt-1 text-xs">{e.comments}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{e.date} · by {e.by}</p>
            </li>
          ))}
        </ol>
      </Modal>
    </>
  );
}
