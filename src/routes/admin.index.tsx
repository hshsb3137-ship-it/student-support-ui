import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileSpreadsheet,
  Hourglass,
  Info,
  Loader,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  TimerReset,
  UserCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { Button } from "@/components/ui/button";
import { CHART_COLORS, Panel } from "@/components/admin/AdminUI";
import { useAdminData } from "@/lib/admin-store";
import { computeStats, MONTHS, monthKey } from "@/lib/admin-data";
import { PRIORITIES, STATUS_LABELS, type GrievanceStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Grievance Portal" },
      {
        name: "description",
        content: "University-wide grievance volume, escalations, GFM triage, and department performance.",
      },
      { property: "og:title", content: "Admin Dashboard — Grievance Portal" },
      {
        property: "og:description",
        content: "University-wide grievance volume, escalations, GFM triage, and department performance.",
      },
    ],
  }),
  component: AdminDashboard,
});

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

export function AdminDashboard() {
  const { grievances, departments } = useAdminData();
  const s = computeStats(grievances);

  const count = (f: (g: (typeof grievances)[number]) => boolean) => grievances.filter(f).length;

  // 10 Cards required by Section 2
  const totalCount = grievances.length;
  const pendingGFMCount = count(
    (g) => g.status === "GFM_REVIEW" || g.status === "Submitted",
  );
  const gfmAcceptedCount = count(
    (g) =>
      g.status === "DEPARTMENT_ASSIGNED" ||
      g.status === "GFM_ACCEPTED" ||
      (!!g.gfmReviewDate && g.status !== "GFM_REJECTED" && g.status !== "GFM_INFORMATION_REQUESTED"),
  );
  const gfmRejectedCount = count(
    (g) => g.status === "GFM_REJECTED" || g.status === "Rejected",
  );
  const gfmInfoRequestedCount = count(
    (g) => g.status === "GFM_INFORMATION_REQUESTED",
  );
  const deptAssignedCount = count(
    (g) =>
      g.status === "DEPARTMENT_ASSIGNED" ||
      g.status === "STAFF_REVIEW" ||
      g.status === "Under Review" ||
      g.status === "In Progress",
  );
  const inProgressCount = count(
    (g) =>
      g.status === "In Progress" ||
      g.status === "IN_PROGRESS" ||
      g.status === "Under Review" ||
      g.status === "STAFF_REVIEW",
  );
  const resolvedCount = count(
    (g) => g.status === "Resolved" || g.status === "RESOLVED",
  );
  const escalatedCount = count(
    (g) =>
      g.status === "Escalated" ||
      g.status === "ESCALATED" ||
      g.status === "ESCALATED_TO_ADMIN",
  );
  const highPriorityCount = count(
    (g) => g.priority === "High" || g.priority === "Critical",
  );

  // Department Performance Chart Data (Excludes GFM-pending and rejected cases from department load)
  const byDept = departments.map((d) => {
    const deptCases = grievances.filter(
      (g) =>
        g.department === d.key &&
        g.status !== "GFM_REVIEW" &&
        g.status !== "GFM_REJECTED" &&
        g.status !== "GFM_INFORMATION_REQUESTED" &&
        g.status !== "Submitted" &&
        g.status !== "SUBMITTED",
    );
    const resolved = deptCases.filter(
      (g) => g.status === "Resolved" || g.status === "RESOLVED",
    ).length;
    return {
      name: d.name,
      Assigned: deptCases.length,
      Resolved: resolved,
    };
  });

  // Category Distribution
  const cats = [...new Set(grievances.map((g) => g.category))];
  const byCat = cats
    .map((c) => ({ name: c, value: count((g) => g.category === c) }))
    .sort((a, b) => b.value - a.value);

  // Priority Distribution
  const byPriority = PRIORITIES.map((p, idx) => ({
    name: p,
    value: count((g) => g.priority === p),
    color: CHART_COLORS[idx % CHART_COLORS.length],
  }));

  // Status Distribution (Grouped into friendly main categories)
  const statusGroups = [
    { name: "Pending GFM", value: pendingGFMCount, color: "#f59e0b" },
    { name: "Info Requested", value: gfmInfoRequestedCount, color: "#06b6d4" },
    { name: "Dept Active", value: inProgressCount, color: "#3b82f6" },
    { name: "Resolved", value: resolvedCount, color: "#10b981" },
    { name: "Escalated", value: escalatedCount, color: "#ef4444" },
    { name: "Rejected", value: gfmRejectedCount, color: "#64748b" },
  ].filter((s) => s.value > 0);

  // Monthly trends
  const monthly = MONTHS.map((m) => ({
    month: m,
    Submitted: count((g) => monthKey(g.submittedAt) === m),
    Resolved: count((g) => (g.status === "Resolved" || g.status === "RESOLVED") && monthKey(g.updatedAt) === m),
  }));

  return (
    <>
      <PageHeader
        title="Institutional Administration"
        description="University-wide grievance volume, GFM triage efficiency, escalations, and department metrics."
        crumbs={[{ label: "Administration" }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Demo Data
            </span>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/reports">
                <FileSpreadsheet className="mr-1.5 size-4" />
                Reports & Export
              </Link>
            </Button>
          </div>
        }
      />

      {/* Demo Data Disclaimer Banner */}
      <div className="mb-6 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200">
        <span className="flex items-center gap-2">
          <Info className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Demo Data Active:</strong> All displayed counts, performance rates, and resolution analytics are calculated dynamically from mock system records.
          </span>
        </span>
        <Link to="/admin/analytics" className="font-semibold text-amber-700 underline dark:text-amber-300 hover:opacity-80">
          View deep analytics →
        </Link>
      </div>

      {/* 10 Required Summary Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <DashboardCard
          label="Total Grievances"
          value={totalCount}
          icon={ClipboardList}
        />
        <DashboardCard
          label="Pending GFM Review"
          value={pendingGFMCount}
          icon={Clock}
          tone="warning"
        />
        <DashboardCard
          label="GFM Accepted"
          value={gfmAcceptedCount}
          icon={CheckCircle2}
          tone="success"
        />
        <DashboardCard
          label="GFM Rejected"
          value={gfmRejectedCount}
          icon={ShieldX}
          tone="critical"
        />
        <DashboardCard
          label="GFM Info Requested"
          value={gfmInfoRequestedCount}
          icon={Hourglass}
          tone="info"
        />
        <DashboardCard
          label="Department Assigned"
          value={deptAssignedCount}
          icon={Building2}
          tone="accent"
        />
        <DashboardCard
          label="In Progress"
          value={inProgressCount}
          icon={Loader}
          tone="accent"
        />
        <DashboardCard
          label="Resolved"
          value={resolvedCount}
          icon={ShieldCheck}
          tone="success"
        />
        <DashboardCard
          label="Escalated"
          value={escalatedCount}
          icon={ShieldAlert}
          tone="critical"
        />
        <DashboardCard
          label="High Priority"
          value={highPriorityCount}
          icon={AlertTriangle}
          tone="critical"
        />
      </div>

      {/* Charts Grid */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Department Performance */}
        <Panel title="Department Performance (Assigned vs Resolved)">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byDept} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" fontSize={11} interval={0} angle={-25} textAnchor="end" height={45} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="Assigned" name="Assigned Cases" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resolved" name="Resolved" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Grievance Category Distribution */}
        <Panel title="Grievances by Category">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byCat} layout="vertical" margin={{ left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" allowDecimals={false} fontSize={11} />
                <YAxis type="category" dataKey="name" fontSize={11} width={110} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Grievances" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Monthly Submission & Resolution Trends */}
        <Panel title="Monthly Volume & Resolution Trends">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="Submitted" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Resolved" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Status & Priority Breakdown */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Panel title="Status Distribution">
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={40} />
                  <Pie data={statusGroups} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {statusGroups.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Priority Distribution">
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={40} />
                  <Pie data={byPriority} dataKey="value" nameKey="name" outerRadius={65} paddingAngle={3}>
                    {byPriority.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
