import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, Filter, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect, tdClass, thClass } from "@/components/admin/AdminUI";
import { AdminGrievanceDrawer } from "@/components/admin/AdminGrievanceDrawer";
import { useAdminData } from "@/lib/admin-store";
import { downloadFile, generateAllGrievancesCSV } from "@/lib/admin-data";
import { PRIORITY_ORDER } from "@/lib/department-data";
import { DEPARTMENTS, GRIEVANCE_STATUSES, PRIORITIES } from "@/lib/types";

export const Route = createFileRoute("/admin/grievances")({
  head: () => ({
    meta: [
      { title: "All Grievances — Administration" },
      { name: "description", content: "Master register of every grievance across the university." },
      { property: "og:title", content: "All Grievances — Administration" },
      { property: "og:description", content: "Master register of every grievance across the university." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AllGrievances,
});

const PAGE = 10;
const SORTS = ["Newest", "Oldest", "Priority", "Last updated"] as const;
const GFM_STATUS_FILTER_OPTIONS = [
  "Pending GFM Review",
  "Accepted & Forwarded",
  "Information Requested",
  "Rejected by GFM",
];

export function AllGrievances() {
  const { grievances } = useAdminData();
  const [q, setQ] = useState("");
  const [gfmStatus, setGfmStatus] = useState("all");
  const [dept, setDept] = useState("all");
  const [cat, setCat] = useState("all");
  const [pri, setPri] = useState("all");
  const [status, setStatus] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState<string>("Newest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cats = useMemo(() => [...new Set(grievances.map((g) => g.category))].sort(), [grievances]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = grievances.filter((g) => {
      // Search
      const matchesSearch =
        !term ||
        g.id.toLowerCase().includes(term) ||
        g.submittedBy.toLowerCase().includes(term) ||
        g.studentId.toLowerCase().includes(term) ||
        g.title.toLowerCase().includes(term);
      if (!matchesSearch) return false;

      // Department
      if (dept !== "all" && g.department !== dept) return false;

      // Category
      if (cat !== "all" && g.category !== cat) return false;

      // Priority
      if (pri !== "all" && g.priority !== pri) return false;

      // Current Status
      if (status !== "all" && g.status !== status) return false;

      // GFM Status Filter
      if (gfmStatus !== "all") {
        if (gfmStatus === "Pending GFM Review" && g.status !== "GFM_REVIEW" && g.status !== "Submitted")
          return false;
        if (
          gfmStatus === "Accepted & Forwarded" &&
          g.status !== "DEPARTMENT_ASSIGNED" &&
          g.status !== "GFM_ACCEPTED" &&
          !(g.gfmReviewDate && g.status !== "GFM_REJECTED" && g.status !== "GFM_INFORMATION_REQUESTED")
        )
          return false;
        if (gfmStatus === "Information Requested" && g.status !== "GFM_INFORMATION_REQUESTED")
          return false;
        if (gfmStatus === "Rejected by GFM" && g.status !== "GFM_REJECTED" && g.status !== "Rejected")
          return false;
      }

      // Date Range
      if (fromDate && g.submittedAt < fromDate) return false;
      if (toDate && g.submittedAt > toDate) return false;

      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === "Oldest") return a.submittedAt.localeCompare(b.submittedAt);
      if (sort === "Priority") return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      if (sort === "Last updated") return b.updatedAt.localeCompare(a.updatedAt);
      return b.submittedAt.localeCompare(a.submittedAt);
    });
  }, [grievances, q, gfmStatus, dept, cat, pri, status, fromDate, toDate, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * PAGE, current * PAGE);
  const selected = grievances.find((g) => g.id === selectedId) ?? null;

  const reset = (fn: (v: string) => void) => (e: { target: { value: string } }) => {
    fn(e.target.value);
    setPage(1);
  };

  function exportCSV() {
    try {
      const csv = generateAllGrievancesCSV(rows);
      downloadFile(csv, "all-grievances.csv", "text/csv;charset=utf-8");
      toast.success(`Exported ${rows.length} grievances to CSV`);
    } catch {
      toast.error("Could not export CSV");
    }
  }

  return (
    <>
      <PageHeader
        title="All Grievances"
        description="Master institutional register of all student grievances, GFM triage decisions, and department assignments."
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "All Grievances" }]}
        actions={
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={rows.length === 0}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        }
      />

      {/* Multi-Criteria Filters Bar */}
      <div className="surface-card mb-4 p-4 space-y-3">
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 h-9 text-xs"
              placeholder="Search by ID, student, roll number, or title..."
              value={q}
              onChange={reset(setQ)}
              aria-label="Search grievances"
            />
          </div>
          <NativeSelect
            aria-label="GFM Status"
            value={gfmStatus}
            onChange={reset(setGfmStatus)}
            options={GFM_STATUS_FILTER_OPTIONS}
            allLabel="All GFM Statuses"
          />
          <NativeSelect
            aria-label="Department"
            value={dept}
            onChange={reset(setDept)}
            options={DEPARTMENTS}
            allLabel="All departments"
          />
          <NativeSelect
            aria-label="Category"
            value={cat}
            onChange={reset(setCat)}
            options={cats}
            allLabel="All categories"
          />
          <NativeSelect
            aria-label="Priority"
            value={pri}
            onChange={reset(setPri)}
            options={PRIORITIES}
            allLabel="All priorities"
          />
          <NativeSelect
            aria-label="Status"
            value={status}
            onChange={reset(setStatus)}
            options={GRIEVANCE_STATUSES}
            allLabel="All current statuses"
          />
          <NativeSelect
            aria-label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={SORTS}
          />
        </div>

        {/* Date Range Sub-Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <span className="font-medium">Submission Date Range:</span>
          <Input
            type="date"
            className="h-8 w-36 text-xs"
            value={fromDate}
            onChange={reset(setFromDate)}
            aria-label="From Date"
          />
          <span>to</span>
          <Input
            type="date"
            className="h-8 w-36 text-xs"
            value={toDate}
            onChange={reset(setToDate)}
            aria-label="To Date"
          />
          {(fromDate || toDate || q || gfmStatus !== "all" || dept !== "all" || cat !== "all" || pri !== "all" || status !== "all") && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => {
                setQ("");
                setGfmStatus("all");
                setDept("all");
                setCat("all");
                setPri("all");
                setStatus("all");
                setFromDate("");
                setToDate("");
                setPage(1);
              }}
            >
              Reset filters
            </Button>
          )}
          <span className="ml-auto font-medium">
            Showing {rows.length} result{rows.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No grievances match your criteria"
          description="Try adjusting your filters, date range, or search keyword."
        />
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className={thClass}>Grievance #</th>
                <th className={thClass}>Student</th>
                <th className={thClass}>Title</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>GFM Status</th>
                <th className={thClass}>GFM Reviewer</th>
                <th className={thClass}>Department</th>
                <th className={thClass}>Priority</th>
                <th className={thClass}>Current Status</th>
                <th className={thClass}>Submitted</th>
                <th className={thClass}>Last Updated</th>
                <th className={thClass}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((g) => {
                const gfmLabel =
                  g.status === "GFM_REVIEW" || g.status === "Submitted"
                    ? "Pending Review"
                    : g.status === "GFM_REJECTED" || g.status === "Rejected"
                      ? "Rejected"
                      : g.status === "GFM_INFORMATION_REQUESTED"
                        ? "Info Requested"
                        : "Accepted & Forwarded";

                return (
                  <tr key={g.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className={`${tdClass} font-mono text-xs font-semibold text-primary`}>
                      {g.id}
                    </td>
                    <td className={tdClass}>
                      <span className="font-medium block">{g.submittedBy}</span>
                      <span className="text-xs text-muted-foreground">{g.studentId}</span>
                    </td>
                    <td className={`${tdClass} max-w-[200px]`}>
                      <span className="line-clamp-1 font-medium">{g.title}</span>
                    </td>
                    <td className={tdClass}>{g.category}</td>
                    <td className={tdClass}>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          gfmLabel === "Accepted & Forwarded"
                            ? "bg-success/15 text-success"
                            : gfmLabel === "Rejected"
                              ? "bg-critical/15 text-critical"
                              : gfmLabel === "Info Requested"
                                ? "bg-info/15 text-info"
                                : "bg-warning/15 text-warning-foreground"
                        }`}
                      >
                        {gfmLabel}
                      </span>
                    </td>
                    <td className={`${tdClass} text-xs text-muted-foreground`}>
                      {g.gfmReviewerName || "Dr. Priya Sharma"}
                    </td>
                    <td className={tdClass}>{g.department}</td>
                    <td className={tdClass}>
                      <PriorityBadge priority={g.priority} />
                    </td>
                    <td className={tdClass}>
                      <StatusBadge status={g.status} />
                    </td>
                    <td className={`${tdClass} text-xs text-muted-foreground whitespace-nowrap`}>
                      {g.submittedAt}
                    </td>
                    <td className={`${tdClass} text-xs text-muted-foreground whitespace-nowrap`}>
                      {g.updatedAt}
                    </td>
                    <td className={tdClass}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-xs"
                        onClick={() => setSelectedId(g.id)}
                      >
                        <Eye className="size-3.5" />
                        Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Bar */}
          {pages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
              <span>
                Page {current} of {pages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={current <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={current >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grievance Details Drawer */}
      <AdminGrievanceDrawer grievance={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}
