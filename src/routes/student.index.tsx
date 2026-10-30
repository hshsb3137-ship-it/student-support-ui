import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Inbox,
  Loader2,
  Search,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { Notification } from "@/components/common/Notification";
import { GrievanceTable } from "@/components/grievance/GrievanceTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useStudentData } from "@/lib/student-store";
import { notifications } from "@/lib/mock-data";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — Grievance Portal" },
      {
        name: "description",
        content: "Overview of your submitted, in-progress and resolved university grievances.",
      },
      { property: "og:title", content: "Student Dashboard — Grievance Portal" },
      {
        property: "og:description",
        content: "Overview of your submitted, in-progress and resolved university grievances.",
      },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user } = useAuth();
  const { mine } = useStudentData();

  const ownCount = mine.length;
  const pendingCount = mine.filter(
    (g) =>
      g.status === "GFM_REVIEW" ||
      g.status === "Submitted" ||
      g.status === "SUBMITTED" ||
      g.status === "GFM_INFORMATION_REQUESTED" ||
      g.status === "DEPARTMENT_ASSIGNED" ||
      g.status === "STAFF_REVIEW" ||
      g.status === "Under Review" ||
      g.status === "Acknowledged",
  ).length;
  const inProgressCount = mine.filter(
    (g) =>
      g.status === "In Progress" ||
      g.status === "IN_PROGRESS" ||
      g.status === "Waiting for Student" ||
      g.status === "INFORMATION_REQUESTED" ||
      g.status === "Resolution Proposed",
  ).length;
  const resolvedCount = mine.filter(
    (g) => g.status === "Resolved" || g.status === "RESOLVED",
  ).length;
  const escalatedCount = mine.filter(
    (g) =>
      g.status === "Escalated" ||
      g.status === "ESCALATED" ||
      g.status === "ESCALATED_TO_ADMIN",
  ).length;

  const feed = notifications.filter((n) => n.audience.includes("student")).slice(0, 4);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Student"}`}
        description="Track every grievance you have raised and see what happens next."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/student/track">
                <Search className="mr-2 size-4" />
                Track grievance
              </Link>
            </Button>
            <Button asChild>
              <Link to="/student/submit">
                <FileText className="mr-2 size-4" />
                Submit grievance
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardCard label="Own Grievances" value={ownCount} icon={ClipboardList} />
        <DashboardCard label="Pending" value={pendingCount} icon={Clock} tone="warning" />
        <DashboardCard label="In Progress" value={inProgressCount} icon={Loader2} tone="info" />
        <DashboardCard
          label="Resolved"
          value={resolvedCount}
          icon={CheckCircle2}
          tone="success"
        />
        <DashboardCard
          label="Escalated"
          value={escalatedCount}
          icon={ShieldAlert}
          tone="critical"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent grievances</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/student/grievances">View all</Link>
            </Button>
          </div>
          <GrievanceTable
            rows={mine.slice(0, 5)}
            emptyTitle="No grievances yet"
            emptyDescription="Submit your first grievance to get started."
          />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Latest updates</h2>
          <div className="surface-card flex flex-col gap-2 p-3">
            {feed.map((n) => (
              <Notification key={n.id} notification={n} compact />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
