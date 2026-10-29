import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Info,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardCard } from "@/components/common/DashboardCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminData } from "@/lib/admin-store";
import { downloadFile, generateGFMReviewsCSV } from "@/lib/admin-data";
import type { Grievance } from "@/lib/types";

export const Route = createFileRoute("/admin/gfm-reviews")({
  head: () => ({
    meta: [
      { title: "GFM Reviews — Administration" },
      {
        name: "description",
        content: "Supervise first-level grievance reviews, decisions, and department forwarding by GFM.",
      },
    ],
  }),
  component: AdminGFMReviews,
});

type FilterTab = "all" | "pending" | "accepted" | "rejected" | "info_requested";

export function AdminGFMReviews() {
  const { grievances } = useAdminData();
  const [tab, setTab] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedCase, setSelectedCase] = useState<Grievance | null>(null);

  // Filter cases that are in or have gone through GFM review
  const gfmReviews = useMemo(() => {
    return grievances.filter(
      (g) =>
        g.gfmReviewDate ||
        g.status === "GFM_REVIEW" ||
        g.status === "GFM_ACCEPTED" ||
        g.status === "GFM_REJECTED" ||
        g.status === "GFM_INFORMATION_REQUESTED" ||
        g.status === "DEPARTMENT_ASSIGNED" ||
        g.status === "Submitted",
    );
  }, [grievances]);

  // Statistics
  const pendingCount = useMemo(
    () => gfmReviews.filter((g) => g.status === "GFM_REVIEW" || g.status === "Submitted").length,
    [gfmReviews],
  );
  const acceptedCount = useMemo(
    () =>
      gfmReviews.filter(
        (g) =>
          g.status === "DEPARTMENT_ASSIGNED" ||
          g.status === "GFM_ACCEPTED" ||
          (g.gfmReviewDate && g.status !== "GFM_REJECTED" && g.status !== "GFM_INFORMATION_REQUESTED"),
      ).length,
    [gfmReviews],
  );
  const rejectedCount = useMemo(
    () => gfmReviews.filter((g) => g.status === "GFM_REJECTED" || g.status === "Rejected").length,
    [gfmReviews],
  );
  const infoReqCount = useMemo(
    () => gfmReviews.filter((g) => g.status === "GFM_INFORMATION_REQUESTED").length,
    [gfmReviews],
  );

  const filtered = useMemo(() => {
    return gfmReviews.filter((g) => {
      // Tab filter
      if (tab === "pending" && g.status !== "GFM_REVIEW" && g.status !== "Submitted") return false;
      if (
        tab === "accepted" &&
        g.status !== "DEPARTMENT_ASSIGNED" &&
        g.status !== "GFM_ACCEPTED" &&
        !(g.gfmReviewDate && g.status !== "GFM_REJECTED" && g.status !== "GFM_INFORMATION_REQUESTED")
      )
        return false;
      if (tab === "rejected" && g.status !== "GFM_REJECTED" && g.status !== "Rejected") return false;
      if (tab === "info_requested" && g.status !== "GFM_INFORMATION_REQUESTED") return false;

      // Department filter
      if (deptFilter !== "all" && g.department !== deptFilter) return false;

      // Query filter
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.submittedBy.toLowerCase().includes(q) ||
        (g.gfmReviewerName && g.gfmReviewerName.toLowerCase().includes(q)) ||
        (g.gfmComments && g.gfmComments.toLowerCase().includes(q)) ||
        (g.gfmRejectionReason && g.gfmRejectionReason.toLowerCase().includes(q))
      );
    });
  }, [gfmReviews, tab, deptFilter, query]);

  function exportCSV() {
    try {
      const csv = generateGFMReviewsCSV(filtered);
      downloadFile(csv, "gfm-reviews-report.csv", "text/csv;charset=utf-8");
      toast.success("GFM Reviews report exported as CSV");
    } catch {
      toast.error("Failed to generate CSV export");
    }
  }

  return (
    <>
      <PageHeader
        title="GFM Review Monitoring"
        description="Inspect first-level grievance reviews, decisions, and department assignments. Read-only audit portal."
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "GFM Reviews" }]}
        actions={
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          label="Pending Review"
          value={pendingCount}
          icon={Clock}
          tone="warning"
        />
        <DashboardCard
          label="Accepted & Forwarded"
          value={acceptedCount}
          icon={CheckCircle}
          tone="success"
        />
        <DashboardCard
          label="Info Requested"
          value={infoReqCount}
          icon={Info}
          tone="info"
        />
        <DashboardCard
          label="Rejected by GFM"
          value={rejectedCount}
          icon={ShieldX}
          tone="critical"
        />
      </div>

      {/* Filter and Tab Bar */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: `All Reviews (${gfmReviews.length})` },
              { id: "pending", label: `Pending (${pendingCount})` },
              { id: "accepted", label: `Accepted (${acceptedCount})` },
              { id: "info_requested", label: `Info Requested (${infoReqCount})` },
              { id: "rejected", label: `Rejected (${rejectedCount})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ID, student, reviewer..."
              className="pl-9 text-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[180px] text-xs">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {Array.from(new Set(grievances.map((g) => g.department))).map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Filter}
            title="No GFM reviews match your filter"
            description="Try switching the active tab or clearing your search keywords."
          />
        </div>
      ) : (
        <div className="surface-card mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Grievance #</th>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">GFM Reviewer</th>
                  <th className="px-4 py-3 text-left font-medium">Decision / Status</th>
                  <th className="px-4 py-3 text-left font-medium">Review Date</th>
                  <th className="px-4 py-3 text-left font-medium">Assigned Department</th>
                  <th className="px-4 py-3 text-left font-medium">Comments / Notes</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((g) => {
                  const isAccepted =
                    g.status === "DEPARTMENT_ASSIGNED" ||
                    g.status === "GFM_ACCEPTED" ||
                    (g.gfmReviewDate && g.status !== "GFM_REJECTED" && g.status !== "GFM_INFORMATION_REQUESTED");
                  const isRejected = g.status === "GFM_REJECTED" || g.status === "Rejected";
                  const isInfoReq = g.status === "GFM_INFORMATION_REQUESTED";
                  const isPending = g.status === "GFM_REVIEW" || g.status === "Submitted";

                  return (
                    <tr key={g.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                        {g.id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{g.submittedBy}</p>
                        <p className="text-xs text-muted-foreground">{g.studentId}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {g.gfmReviewerName || (
                          <span className="italic text-muted-foreground/70">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isAccepted && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                            <CheckCircle className="size-3" /> Accepted & Forwarded
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-critical/15 px-2.5 py-0.5 text-xs font-semibold text-critical">
                            <ShieldX className="size-3" /> Rejected
                          </span>
                        )}
                        {isInfoReq && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-info/15 px-2.5 py-0.5 text-xs font-semibold text-info">
                            <Info className="size-3" /> Info Requested
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning-foreground">
                            <Clock className="size-3" /> Pending Review
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                        {g.gfmReviewDate || (
                          <span className="italic text-muted-foreground/70">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {g.assignedDepartment || g.department ? (
                          <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                            {g.assignedDepartment || g.department}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[220px]">
                        {g.gfmRejectionReason ? (
                          <p className="line-clamp-2 text-xs font-medium text-critical">
                            Rejection: {g.gfmRejectionReason}
                          </p>
                        ) : g.gfmInfoRequest ? (
                          <p className="line-clamp-2 text-xs text-info">
                            Request: {g.gfmInfoRequest}
                          </p>
                        ) : g.gfmComments ? (
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {g.gfmComments}
                          </p>
                        ) : (
                          <p className="line-clamp-1 text-xs text-muted-foreground italic">
                            {g.title}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5 text-xs"
                          onClick={() => setSelectedCase(g)}
                        >
                          <Eye className="size-3.5" />
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Review Modal (Read-Only Audit Trail) */}
      <Modal
        open={!!selectedCase}
        onOpenChange={(open) => !open && setSelectedCase(null)}
        title={selectedCase ? `GFM Review Audit: ${selectedCase.id}` : ""}
        description="Administrative audit inspection of first-level review decision (read-only)."
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-muted-foreground italic">
              Admin cannot impersonate GFM or modify review decisions.
            </span>
            <Button variant="outline" size="sm" onClick={() => setSelectedCase(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedCase ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">{selectedCase.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    Filed by {selectedCase.submittedBy} ({selectedCase.studentId}) on{" "}
                    {selectedCase.submittedAt}
                  </p>
                </div>
                <StatusBadge status={selectedCase.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-md border p-2.5">
                <span className="font-semibold text-muted-foreground block">GFM Reviewer</span>
                <span className="font-medium mt-0.5 block">
                  {selectedCase.gfmReviewerName || "Pending Reviewer Allocation"}
                </span>
                <span className="text-muted-foreground block text-[11px]">
                  ID: {selectedCase.gfmReviewerId || "N/A"}
                </span>
              </div>
              <div className="rounded-md border p-2.5">
                <span className="font-semibold text-muted-foreground block">Review Timestamp</span>
                <span className="font-medium mt-0.5 block">
                  {selectedCase.gfmReviewDate || "Awaiting Review"}
                </span>
                <span className="text-muted-foreground block text-[11px]">
                  Priority: {selectedCase.priority}
                </span>
              </div>
            </div>

            {selectedCase.assignedDepartment ? (
              <div className="rounded-md border border-success/30 bg-success/5 p-3">
                <span className="flex items-center gap-1.5 font-semibold text-xs text-success">
                  <CheckCircle className="size-4" /> Forwarded Department
                </span>
                <p className="mt-1 text-xs font-medium">
                  {selectedCase.assignedDepartment} Department Desk
                </p>
                {selectedCase.gfmComments && (
                  <p className="mt-1 text-xs text-muted-foreground italic">
                    "{selectedCase.gfmComments}"
                  </p>
                )}
              </div>
            ) : null}

            {selectedCase.gfmRejectionReason ? (
              <div className="rounded-md border border-critical/30 bg-critical/5 p-3">
                <span className="flex items-center gap-1.5 font-semibold text-xs text-critical">
                  <ShieldAlert className="size-4" /> Rejection Statement
                </span>
                <p className="mt-1 text-xs text-critical font-medium">
                  {selectedCase.gfmRejectionReason}
                </p>
              </div>
            ) : null}

            {selectedCase.gfmInfoRequest ? (
              <div className="rounded-md border border-info/30 bg-info/5 p-3">
                <span className="flex items-center gap-1.5 font-semibold text-xs text-info">
                  <Info className="size-4" /> Requested Clarification
                </span>
                <p className="mt-1 text-xs text-foreground font-medium">
                  {selectedCase.gfmInfoRequest}
                </p>
                {selectedCase.gfmInfoRequestDeadline && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="size-3" /> Student deadline:{" "}
                    {selectedCase.gfmInfoRequestDeadline}
                  </p>
                )}
              </div>
            ) : null}

            <div>
              <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                Grievance Timeline
              </h5>
              <ol className="mt-2 space-y-2 border-l pl-3 text-xs">
                {selectedCase.timeline.map((t) => (
                  <li key={t.id}>
                    <p className="font-medium">{t.label}</p>
                    <p className="text-muted-foreground">{t.note}</p>
                    <p className="text-[11px] text-muted-foreground/75">
                      {t.actor} · {t.date}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
