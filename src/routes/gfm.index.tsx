import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle,
  ClipboardList,
  Clock,
  Info,
  ShieldX,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useGFMData } from "@/lib/gfm-store";
import type { GrievanceStatus } from "@/lib/types";

export const Route = createFileRoute("/gfm/")({
  head: () => ({
    meta: [
      { title: "GFM Dashboard — Grievance Portal" },
      {
        name: "description",
        content: "Overview of grievances pending GFM review and forwarding.",
      },
    ],
  }),
  component: GFMDashboard,
});

function count(queue: ReturnType<typeof useGFMData>["queue"], status: GrievanceStatus) {
  return queue.filter((g) => g.status === status).length;
}

function GFMDashboard() {
  const { user } = useAuth();
  const { queue, notifications } = useGFMData();
  const unread = notifications.filter((n) => !n.read).length;
  const pending = count(queue, "GFM_REVIEW");
  const infoReq = count(queue, "GFM_INFORMATION_REQUESTED");
  const accepted = count(queue, "DEPARTMENT_ASSIGNED") + count(queue, "GFM_ACCEPTED");
  const rejected = count(queue, "GFM_REJECTED");

  const recent = [...queue]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "GFM"}`}
        description="Grievance Forwarding Member · First-level review portal"
        actions={
          unread > 0 ? (
            <Link to="/gfm/notifications">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="size-4" />
                {unread} new notification{unread > 1 ? "s" : ""}
              </Button>
            </Link>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardCard label="Total in queue" value={queue.length} icon={ClipboardList} />
        <DashboardCard
          label="New Grievances"
          value={pending}
          icon={Clock}
          tone="warning"
        />
        <DashboardCard
          label="Information Requested"
          value={infoReq}
          icon={Info}
          tone="info"
        />
        <DashboardCard
          label="Accepted & Forwarded"
          value={accepted}
          icon={CheckCircle}
          tone="success"
        />
        <DashboardCard
          label="Rejected"
          value={rejected}
          icon={ShieldX}
          tone="critical"
        />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Grievance queue</h2>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/gfm/pending">View pending</Link>
            </Button>
          </div>
        </div>

        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Grievance ID</th>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Submitted</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No grievances in queue
                    </td>
                  </tr>
                ) : (
                  recent.map((g) => (
                    <tr key={g.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {g.id}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <span className="line-clamp-1 font-medium">{g.title}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{g.submittedBy}</td>
                      <td className="px-4 py-3 text-muted-foreground">{g.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{g.submittedAt}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={g.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/gfm/${g.id}`}>Review</Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/gfm/pending" className="surface-card group flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)]">
          <span className="grid size-10 place-items-center rounded-xl bg-warning/15 text-warning-foreground">
            <Clock className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-sm">Pending Review</p>
            <p className="text-xs text-muted-foreground">{pending} waiting</p>
          </div>
        </Link>
        <Link to="/gfm/info-requests" className="surface-card group flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)]">
          <span className="grid size-10 place-items-center rounded-xl bg-info/10 text-info">
            <Info className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-sm">Info Requested</p>
            <p className="text-xs text-muted-foreground">{infoReq} awaiting response</p>
          </div>
        </Link>
        <Link to="/gfm/accepted" className="surface-card group flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)]">
          <span className="grid size-10 place-items-center rounded-xl bg-success/12 text-success">
            <CheckCircle className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-sm">Accepted</p>
            <p className="text-xs text-muted-foreground">{accepted} forwarded</p>
          </div>
        </Link>
        <Link to="/gfm/rejected" className="surface-card group flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)]">
          <span className="grid size-10 place-items-center rounded-xl bg-critical/12 text-critical">
            <ShieldX className="size-5" />
          </span>
          <div>
            <p className="font-semibold text-sm">Rejected</p>
            <p className="text-xs text-muted-foreground">{rejected} rejected</p>
          </div>
        </Link>
      </div>
    </>
  );
}
