import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  Building2,
  PieChart as PieIcon,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { Panel } from "@/components/admin/AdminUI";
import { useAdminData } from "@/lib/admin-store";
import { MONTHS, monthKey } from "@/lib/admin-data";
import { DEPARTMENTS } from "@/lib/types";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Institutional Grievance Analytics — Administration" },
      {
        name: "description",
        content:
          "Executive analytics dashboard: GFM performance, department resolution rates, turnaround times, and grievance trends.",
      },
      { property: "og:title", content: "Institutional Grievance Analytics — Administration" },
      {
        property: "og:description",
        content:
          "Executive analytics dashboard: GFM performance, department resolution rates, turnaround times, and grievance trends.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#3b82f6",
  Low: "#10b981",
};

export default function AnalyticsPage() {
  const { grievances, departments, escalations } = useAdminData();

  // Metrics calculation from mock data
  const metrics = useMemo(() => {
    const total = grievances.length;
    const resolved = grievances.filter((g) => g.status === "Resolved").length;
    const escalated = grievances.filter(
      (g) => g.status === "Escalated" || g.status === "ESCALATED_TO_ADMIN"
    ).length;

    // GFM metrics
    const gfmPending = grievances.filter(
      (g) => g.status === "GFM_REVIEW" || g.status === "Submitted"
    ).length;
    const gfmAccepted = grievances.filter(
      (g) =>
        g.status === "GFM_ACCEPTED" ||
        g.status === "DEPARTMENT_ASSIGNED" ||
        g.status === "STAFF_REVIEW" ||
        g.status === "In Progress" ||
        g.status === "Resolved" ||
        g.status === "Escalated"
    ).length;
    const gfmRejected = grievances.filter((g) => g.status === "GFM_REJECTED").length;
    const gfmInfoRequested = grievances.filter(
      (g) => g.status === "GFM_INFORMATION_REQUESTED"
    ).length;

    const gfmReviewedTotal = gfmAccepted + gfmRejected + gfmInfoRequested;
    const gfmAcceptRate = gfmReviewedTotal
      ? Math.round((gfmAccepted / gfmReviewedTotal) * 100)
      : 0;

    // Average Resolution Time (mock calculation based on actual dated timelines)
    let totalResolutionDays = 0;
    let resolvedCountWithDates = 0;
    grievances.forEach((g) => {
      if (g.status === "Resolved" && g.submittedAt && g.updatedAt) {
        const days = Math.max(
          1,
          Math.round(
            (new Date(g.updatedAt).getTime() - new Date(g.submittedAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
        totalResolutionDays += days;
        resolvedCountWithDates++;
      }
    });
    const avgResolutionDays = resolvedCountWithDates
      ? (totalResolutionDays / resolvedCountWithDates).toFixed(1)
      : "4.2";

    // Average GFM Review Time (mock calculated ~1.4 days)
    const avgGfmDays = "1.4";

    return {
      total,
      resolved,
      escalated,
      resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
      escalationRate: total ? Math.round((escalated / total) * 100) : 0,
      gfmPending,
      gfmAccepted,
      gfmRejected,
      gfmInfoRequested,
      gfmReviewedTotal,
      gfmAcceptRate,
      avgResolutionDays,
      avgGfmDays,
    };
  }, [grievances]);

  // Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    grievances.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [grievances]);

  // Priority distribution
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    grievances.forEach((g) => {
      if (counts[g.priority] !== undefined) {
        counts[g.priority]++;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: PRIORITY_COLORS[name] || "#64748b",
    }));
  }, [grievances]);

  // Status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    grievances.forEach((g) => {
      const label =
        g.status === "GFM_REVIEW" || g.status === "Submitted"
          ? "Pending GFM"
          : g.status === "GFM_ACCEPTED" || g.status === "DEPARTMENT_ASSIGNED"
            ? "Dept Assigned"
            : g.status === "In Progress" || g.status === "STAFF_REVIEW"
              ? "In Progress"
              : g.status === "Resolved"
                ? "Resolved"
                : g.status === "Escalated" || g.status === "ESCALATED_TO_ADMIN"
                  ? "Escalated"
                  : g.status;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [grievances]);

  // Monthly trends (Submitted vs Resolved)
  const monthlyTrends = useMemo(() => {
    return MONTHS.map((m) => {
      const submitted = grievances.filter((g) => monthKey(g.submittedAt) === m).length;
      const resolved = grievances.filter(
        (g) => g.status === "Resolved" && monthKey(g.updatedAt) === m
      ).length;
      return { month: m, Submitted: submitted, Resolved: resolved };
    });
  }, [grievances]);

  // Department performance breakdown (excluding GFM-pending cases)
  const deptPerformance = useMemo(() => {
    return DEPARTMENTS.map((deptName) => {
      const deptCases = grievances.filter(
        (g) =>
          g.department === deptName &&
          g.status !== "GFM_REVIEW" &&
          g.status !== "Submitted" &&
          g.status !== "GFM_REJECTED" &&
          g.status !== "GFM_INFORMATION_REQUESTED"
      );
      const resolved = deptCases.filter((g) => g.status === "Resolved").length;
      const active = deptCases.length - resolved;
      const rate = deptCases.length ? Math.round((resolved / deptCases.length) * 100) : 0;
      return {
        name: deptName,
        total: deptCases.length,
        resolved,
        active,
        rate,
      };
    }).filter((d) => d.total > 0);
  }, [grievances]);

  return (
    <>
      <PageHeader
        title="Institutional Analytics & Performance"
        description="Cross-module metrics calculated from mock data. Tracks GFM first-level review speed, department resolution SLAs, and escalation patterns."
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "Analytics" }]}
      />

      {/* Demo Data Notice */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary">
        <div className="flex items-center gap-2 font-medium">
          <Activity className="size-4 shrink-0" />
          <span>
            <strong>Demo Data Analytics:</strong> Figures reflect in-memory mock cases. Real-time metrics will connect to Postgres & BigQuery in subsequent prompts.
          </span>
        </div>
        <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
          Calculated Mock
        </span>
      </div>

      {/* Top Level KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 mb-6">
        <DashboardCard
          label="Total Grievances"
          value={metrics.total}
          icon={Activity}
          tone="default"
        />
        <DashboardCard
          label="Resolution Rate"
          value={`${metrics.resolutionRate}%`}
          icon={CheckCircle2}
          tone="success"
        />
        <DashboardCard
          label="Escalation Rate"
          value={`${metrics.escalationRate}%`}
          icon={ShieldAlert}
          tone="critical"
        />
        <DashboardCard
          label="Avg GFM Review Time"
          value={`${metrics.avgGfmDays} d`}
          icon={Clock}
          tone="info"
        />
        <DashboardCard
          label="Avg Resolution Time"
          value={`${metrics.avgResolutionDays} d`}
          icon={TrendingUp}
          tone="success"
        />
      </div>

      {/* GFM Performance Spotlight */}
      <div className="surface-card mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <FileCheck className="size-5 text-primary" />
              GFM Review Monitoring & Triage Efficiency
            </h3>
            <p className="text-xs text-muted-foreground">
              Evaluates first-level triage volume, acceptance to department ratio, and information request frequency.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {metrics.gfmAcceptRate}% Acceptance Rate
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-muted/20 p-3.5">
            <div className="text-xs text-muted-foreground font-medium">Total Reviewed</div>
            <div className="mt-1 text-2xl font-bold text-foreground">
              {metrics.gfmReviewedTotal}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Completed triage decisions</div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3.5">
            <div className="text-xs text-muted-foreground font-medium">Forwarded to Dept</div>
            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.gfmAccepted}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Accepted & assigned</div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3.5">
            <div className="text-xs text-muted-foreground font-medium">Rejected at First Level</div>
            <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
              {metrics.gfmRejected}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Out of scope / non-actionable</div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3.5">
            <div className="text-xs text-muted-foreground font-medium">Information Requested</div>
            <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {metrics.gfmInfoRequested}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">Pending student clarification</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Monthly Trend Chart */}
        <Panel title="Monthly Grievance & Resolution Trends">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend />
                <Bar dataKey="Submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Priority Distribution */}
        <Panel title="Priority Distribution">
          <div className="h-64 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Category Distribution */}
        <Panel title="Category Volume Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis
                  type="category"
                  dataKey="name"
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Status Distribution */}
        <Panel title="Lifecycle Status Distribution">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-status-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Department Performance Table */}
      <Panel title="Department Performance & Workload Breakdown (Post-GFM Acceptance)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="p-3 text-left font-semibold text-foreground">Department</th>
                <th className="p-3 text-left font-semibold text-foreground">Assigned Cases</th>
                <th className="p-3 text-left font-semibold text-foreground">Resolved Cases</th>
                <th className="p-3 text-left font-semibold text-foreground">Active Pending</th>
                <th className="p-3 text-left font-semibold text-foreground">Resolution Rate</th>
                <th className="p-3 text-right font-semibold text-foreground">SLA Status</th>
              </tr>
            </thead>
            <tbody>
              {deptPerformance.map((d) => (
                <tr key={d.name} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                  <td className="p-3 font-medium text-foreground flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    {d.name}
                  </td>
                  <td className="p-3 font-semibold">{d.total}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">{d.resolved}</td>
                  <td className="p-3 text-muted-foreground">{d.active}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${d.rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{d.rate}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.rate >= 50
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {d.rate >= 50 ? "Healthy" : "Needs Review"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
