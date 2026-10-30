import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileDown,
  FileSpreadsheet,
  CheckCircle2,
  ClipboardList,
  Hourglass,
  Percent,
  ShieldAlert,
  TimerReset,
  FileText,
  UserCheck,
  Building,
  CheckSquare,
  AlertOctagon,
} from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, Panel, tdClass, thClass } from "@/components/admin/AdminUI";
import { useAdminData } from "@/lib/admin-store";
import {
  computeStats,
  downloadFile,
  MONTHS,
  monthKey,
  toCSV,
  toExcelXML,
  generateAllGrievancesCSV,
  generateGFMReviewsCSV,
  generateDepartmentPerformanceCSV,
  generateResolutionReportCSV,
  generateEscalationReportCSV,
} from "@/lib/admin-data";
import { DEPARTMENTS, GRIEVANCE_STATUSES, STATUS_LABELS } from "@/lib/types";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Institutional Reports & Exports — Administration" },
      { name: "description", content: "Export comprehensive CSV reports for all grievances, GFM triage, department performance, resolutions, and escalations." },
      { property: "og:title", content: "Institutional Reports & Exports — Administration" },
      { property: "og:description", content: "Export comprehensive CSV reports for all grievances, GFM triage, department performance, resolutions, and escalations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 };

function ReportsPage() {
  const { grievances, departments, escalations } = useAdminData();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dept, setDept] = useState("all");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(grievances.map((g) => g.category).filter(Boolean))).sort(),
    [grievances],
  );

  const list = useMemo(
    () =>
      grievances.filter(
        (g) =>
          (!from || g.submittedAt >= from) &&
          (!to || g.submittedAt <= to) &&
          (dept === "all" || g.department === dept) &&
          (cat === "all" || g.category === cat) &&
          (status === "all" || g.status === status),
      ),
    [grievances, from, to, dept, cat, status],
  );

  const s = computeStats(list);
  const group = (keys: string[], pick: (g: (typeof list)[number]) => string) =>
    keys
      .map((k) => ({ name: k, ...computeStats(list.filter((g) => pick(g) === k)) }))
      .filter((r) => r.total > 0);
  const deptRows = group([...DEPARTMENTS], (g) => g.department);
  const catRows = group([...new Set(list.map((g) => g.category))].sort(), (g) => g.category);
  const monthly = MONTHS.map((m) => ({
    month: m,
    Submitted: list.filter((g) => monthKey(g.submittedAt) === m).length,
    Resolved: list.filter((g) => g.status === "Resolved" && monthKey(g.updatedAt) === m).length,
  }));

  const handleExport = (reportType: "all" | "gfm" | "dept" | "resolution" | "escalation") => {
    try {
      let csvContent = "";
      let filename = "";
      switch (reportType) {
        case "all":
          csvContent = generateAllGrievancesCSV(list);
          filename = `all-grievances-report-${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        case "gfm":
          csvContent = generateGFMReviewsCSV(list);
          filename = `gfm-review-report-${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        case "dept":
          csvContent = generateDepartmentPerformanceCSV(departments, list);
          filename = `department-performance-report-${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        case "resolution":
          csvContent = generateResolutionReportCSV(list);
          filename = `resolution-report-${new Date().toISOString().slice(0, 10)}.csv`;
          break;
        case "escalation":
          csvContent = generateEscalationReportCSV(escalations);
          filename = `escalation-report-${new Date().toISOString().slice(0, 10)}.csv`;
          break;
      }
      downloadFile(csvContent, filename, "text/csv;charset=utf-8");
      toast.success(`${filename} downloaded successfully`);
    } catch {
      toast.error("Failed to generate CSV export file.");
    }
  };

  return (
    <>
      <PageHeader
        title="Institutional Reports & CSV Exports"
        description="Generate and export audit-ready CSV reports across all grievance lifecycle stages. No authentication credentials or personal tokens are exported."
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "Reports" }]}
      />

      {/* CSV Export Hub Cards */}
      <div className="surface-card mb-6 p-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
          Available Institutional CSV Exports
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="rounded-lg border bg-muted/20 p-3.5 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <FileText className="size-4" /> All Grievances
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Full lifecycle data: IDs, students, categories, priorities, statuses, and reviewer assignments.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => handleExport("all")}
            >
              <FileDown className="mr-1 size-3.5" /> Export CSV
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3.5 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <UserCheck className="size-4" /> GFM Review Report
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                GFM triage decisions, acceptances, rejections, info requests, and reviewer audit trails.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => handleExport("gfm")}
            >
              <FileDown className="mr-1 size-3.5" /> Export CSV
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3.5 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                <Building className="size-4" /> Department Performance
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Workload quotas, staffing, resolution rates, and post-GFM active caseload by department.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => handleExport("dept")}
            >
              <FileDown className="mr-1 size-3.5" /> Export CSV
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3.5 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckSquare className="size-4" /> Resolution Report
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Resolved tickets, turnaround durations (days), resolver summary notes, and satisfaction ratings.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => handleExport("resolution")}
            >
              <FileDown className="mr-1 size-3.5" /> Export CSV
            </Button>
          </div>

          <div className="rounded-lg border bg-muted/20 p-3.5 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                <AlertOctagon className="size-4" /> Escalation Report
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                High-level administrative escalations, assigned authorities, reasons, and disposition logs.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => handleExport("escalation")}
            >
              <FileDown className="mr-1 size-3.5" /> Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="surface-card mb-5 flex flex-wrap items-end gap-3 p-3">
        <div className="space-y-1">
          <Label htmlFor="r-from" className="text-xs">
            From Date
          </Label>
          <Input
            id="r-from"
            type="date"
            className="h-9"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="r-to" className="text-xs">
            To Date
          </Label>
          <Input
            id="r-to"
            type="date"
            className="h-9"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="r-dept" className="text-xs">
            Department Scope
          </Label>
          <NativeSelect
            id="r-dept"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            options={DEPARTMENTS}
            allLabel="All departments"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="r-cat" className="text-xs">
            Category Scope
          </Label>
          <NativeSelect
            id="r-cat"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            options={categories}
            allLabel="All categories"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="r-status" className="text-xs">
            Status Scope
          </Label>
          <select
            id="r-status"
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All statuses</option>
            {GRIEVANCE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setFrom("");
            setTo("");
            setDept("all");
            setCat("all");
            setStatus("all");
          }}
        >
          Reset Filters
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No grievances match the selected filter"
          description="Adjust or reset the date and department filters to inspect records."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DashboardCard label="Filtered Scope Grievances" value={s.total} icon={ClipboardList} />
            <DashboardCard
              label="Scope Resolution Rate"
              value={`${s.resolutionRate}%`}
              icon={Percent}
              tone="success"
            />
            <DashboardCard label="Resolved Cases" value={s.resolved} icon={CheckCircle2} tone="success" />
            <DashboardCard label="Pending Cases" value={s.pending} icon={Hourglass} tone="warning" />
            <DashboardCard label="Escalated Cases" value={s.escalated} icon={ShieldAlert} tone="critical" />
            <DashboardCard
              label="Avg Turnaround (Days)"
              value={`${s.avgResolutionDays} d`}
              icon={TimerReset}
              tone="info"
            />
          </div>

          <Panel title="Scope Monthly Trends" className="mt-5">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis allowDecimals={false} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="Submitted" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Resolved" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {[
              ["Department Breakdown", deptRows],
              ["Category Breakdown", catRows],
            ].map(([title, rows]) => (
              <Panel key={title as string} title={title as string}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b bg-muted/40">
                      <tr>
                        <th className={thClass}>Segment</th>
                        <th className={thClass}>Total</th>
                        <th className={thClass}>Resolved</th>
                        <th className={thClass}>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(rows as any[]).map((r) => (
                        <tr key={r.name} className="border-b last:border-0 hover:bg-muted/10">
                          <td className={`${tdClass} font-medium`}>{r.name}</td>
                          <td className={tdClass}>{r.total}</td>
                          <td className={`${tdClass} text-emerald-600 dark:text-emerald-400 font-semibold`}>
                            {r.resolved}
                          </td>
                          <td className={tdClass}>{r.resolutionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            ))}
          </div>
        </>
      )}
    </>
  );
}

