import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, FilePlus2, Inbox, Loader, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { DepartmentCaseTable, DepartmentScopeBadge } from "@/components/department/DepartmentCaseTable";
import { useDepartmentData } from "@/lib/department-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/department/")({
  head: () => ({
    meta: [
      { title: "Department Dashboard — Grievance Portal" },
      { name: "description", content: "Workload snapshot for grievances assigned to your department desk." },
      { property: "og:title", content: "Department Dashboard — Grievance Portal" },
      { property: "og:description", content: "Workload snapshot for grievances assigned to your department desk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DepartmentDashboard,
});

function Bars({ title, data }: { title: string; data: { label: string; value: number; cls: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <section className="surface-card p-5">
      <h2 className="mb-4 font-display text-base font-semibold">{title}</h2>
      <div className="flex flex-col gap-3">
        {data.map((d) => (
          <div key={d.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{d.label}</span>
              <span className="font-semibold">{d.value}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div className={cn("h-2 rounded-full", d.cls)} style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const TONE_DOT = { info: "bg-info", success: "bg-success", warning: "bg-warning", critical: "bg-critical" } as const;

function DepartmentDashboard() {
  const { cases, staff, activity } = useDepartmentData();
  const by = (s: string) => cases.filter((g) => g.status === s).length;
  const inReview = by("Under Review") + by("Acknowledged");
  const high = cases.filter((g) => g.priority === "High" || g.priority === "Critical").length;
  const recent = [...cases].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 6);

  return (
    <>
      <PageHeader
        title={`Welcome, ${staff.name}`}
        description={`${staff.designation} · Staff ID ${staff.staffId} · ${staff.department} department`}
        actions={<DepartmentScopeBadge />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <DashboardCard label="Total assigned" value={cases.length} icon={Inbox} />
        <DashboardCard label="New" value={by("Submitted")} icon={FilePlus2} tone="info" />
        <DashboardCard label="Under review" value={inReview} icon={Clock} tone="accent" />
        <DashboardCard label="In progress" value={by("In Progress")} icon={Loader} tone="warning" />
        <DashboardCard label="High priority" value={high} icon={AlertTriangle} tone="critical" />
        <DashboardCard label="Resolved" value={by("Resolved")} icon={CheckCircle2} tone="success" />
        <DashboardCard label="Escalated" value={by("Escalated")} icon={ShieldAlert} tone="critical" />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent assigned grievances</h2>
          <Link to="/department/assigned" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        <DepartmentCaseTable rows={recent} />
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Bars
          title="Priority overview"
          data={(["Critical", "High", "Medium", "Low"] as const).map((p, i) => ({
            label: p,
            value: cases.filter((g) => g.priority === p).length,
            cls: ["bg-critical", "bg-warning", "bg-info", "bg-success"][i]!,
          }))}
        />
        <Bars
          title="Status overview"
          data={[
            { label: "New", value: by("Submitted"), cls: "bg-info" },
            { label: "Under Review", value: inReview, cls: "bg-accent" },
            { label: "In Progress", value: by("In Progress") + by("Waiting for Student") + by("Resolution Proposed"), cls: "bg-warning" },
            { label: "Resolved", value: by("Resolved"), cls: "bg-success" },
            { label: "Escalated", value: by("Escalated"), cls: "bg-critical" },
          ]}
        />
        <section className="surface-card p-5">
          <h2 className="mb-4 font-display text-base font-semibold">Recent activity</h2>
          <ul className="flex flex-col gap-3">
            {activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", TONE_DOT[a.tone])} />
                <div>
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.detail} · {a.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
