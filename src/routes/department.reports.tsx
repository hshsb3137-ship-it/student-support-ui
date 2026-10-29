import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, CheckCircle2, Clock, FileSpreadsheet, FileText, ShieldAlert, Timer } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { Button } from "@/components/ui/button";
import { useDepartmentData } from "@/lib/department-store";
import type { Grievance } from "@/lib/types";

export const Route = createFileRoute("/department/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Department Desk" },
      { name: "description", content: "Workload and resolution reports for your department." },
      { property: "og:title", content: "Reports — Department Desk" },
      { property: "og:description", content: "Workload and resolution reports for your department." },
    ],
  }),
  component: DepartmentReports,
});

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Grievance[], sep = ",") {
  const head = ["ID", "Title", "Category", "Priority", "Status", "Student ID", "Submitted", "Updated"];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [head.join(sep), ...rows.map((g) =>
    [g.id, g.title, g.category, g.priority, g.status, g.studentId, g.submittedAt, g.updatedAt].map(esc).join(sep),
  )].join("\n");
}

function Dist({ title, data }: { title: string; data: [string, number][] }) {
  const max = Math.max(1, ...data.map((d) => d[1]));
  return (
    <section className="surface-card p-5">
      <h2 className="mb-4 font-display text-base font-semibold">{title}</h2>
      <div className="flex flex-col gap-3">
        {data.map(([k, v]) => (
          <div key={k}>
            <div className="mb-1 flex justify-between text-xs"><span>{k}</span><span className="font-semibold">{v}</span></div>
            <div className="h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${(v / max) * 100}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DepartmentReports() {
  const { cases, department } = useDepartmentData();
  const resolved = cases.filter((g) => g.status === "Resolved");
  const escalated = cases.filter((g) => g.status === "Escalated").length;
  const pending = cases.length - resolved.length - escalated;
  const avg = resolved.length
    ? (resolved.reduce((s, g) => s + (new Date(g.updatedAt).getTime() - new Date(g.submittedAt).getTime()) / 86400000, 0) / resolved.length).toFixed(1)
    : "—";
  const count = (key: (g: Grievance) => string) => {
    const m = new Map<string, number>();
    cases.forEach((g) => m.set(key(g), (m.get(key(g)) ?? 0) + 1));
    return [...m.entries()];
  };
  const priorities = (["Critical", "High", "Medium", "Low"] as const).map((p) => [p, cases.filter((g) => g.priority === p).length] as [string, number]);
  const monthly = count((g) => g.submittedAt.slice(0, 7)).sort((a, b) => a[0].localeCompare(b[0]));
  const stamp = "2026-09";

  return (
    <>
      <PageHeader
        title="Reports"
        description={`Performance summary for the ${department} desk.`}
        crumbs={[{ label: "Department Desk", to: "/department" }, { label: "Reports" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { download(`${department}-grievances.xls`, toCsv(cases, "\t"), "application/vnd.ms-excel"); toast.success("Excel export downloaded"); }}>
              <FileSpreadsheet className="mr-2 size-4" /> Export Excel
            </Button>
            <Button size="sm" variant="outline" onClick={() => { download(`${department}-grievances.csv`, toCsv(cases), "text/csv"); toast.success("CSV export downloaded"); }}>
              <FileText className="mr-2 size-4" /> Export CSV
            </Button>
            <Button size="sm" onClick={() => {
              const txt = `${department} — Monthly Grievance Report (${stamp})\n\nTotal: ${cases.length}\nResolved: ${resolved.length}\nPending: ${pending}\nEscalated: ${escalated}\nAverage resolution time: ${avg} days\n`;
              download(`${department}-monthly-report-${stamp}.txt`, txt, "text/plain");
              toast.success("Monthly report generated");
            }}>
              <CalendarRange className="mr-2 size-4" /> Generate Monthly Report
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Resolved" value={resolved.length} icon={CheckCircle2} tone="success" />
        <DashboardCard label="Pending" value={pending} icon={Clock} tone="warning" />
        <DashboardCard label="Escalated" value={escalated} icon={ShieldAlert} tone="critical" />
        <DashboardCard label="Avg. resolution (days)" value={avg} icon={Timer} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Dist title="Priority distribution" data={priorities} />
        <Dist title="Category distribution" data={count((g) => g.category)} />
        <Dist title="Monthly trend" data={monthly} />
      </div>
    </>
  );
}
