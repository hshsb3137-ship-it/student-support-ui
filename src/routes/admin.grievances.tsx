import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, Filter, FilterX, Search } from "lucide-react";
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
import { DEPARTMENTS, GRIEVANCE_STATUSES, PRIORITIES, STATUS_LABELS } from "@/lib/types";

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

const GFM_OUTCOME_OPTIONS = [
  { value: "all", label: "All GFM Outcomes" },
  { value: "pending", label: "Pending GFM Review" },
  { value: "accepted", label: "Accepted & Forwarded" },
  { value: "info_requested", label: "Information Requested" },
  { value: "rejected", label: "Rejected by GFM" },
] as const;

export function AllGrievances() {
  const { grievances } = useAdminData();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [cat, setCat] = useState("all");
  const [pri, setPri] = useState("all");
  const [status, setStatus] = useState("all");
  const [gfmOutcome, setGfmOutcome] = useState("all");
  const [assignedStaff, setAssignedStaff] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState<string>("Newest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(grievances.map((g) => g.category).filter(Boolean))).sort(),
    [grievances],
  );

  const staffMembers = useMemo(
    () =>
      Array.from(
        new Set(grievances.map((g) => g.assignedTo).filter(Boolean)),
      ).sort() as string[],
    [grievances],
  );

  const hasActiveFilters = Boolean(
    q ||
      dept !== "all" ||
      cat !== "all" ||
      pri !== "all" ||
      status !== "all" ||
      gfmOutcome !== "all" ||
      assignedStaff !== "all" ||
      fromDate ||
      toDate,
  );

  function clearAllFilters() {
    setQ("");
    setDept("all");
    setCat("all");
    setPri("all");
    setStatus("all");
    setGfmOutcome("all");
    setAssignedStaff("all");
    setFromDate("");
    setToDate("");
    setSort("Newest");
    setPage(1);
  }

  const reset = (fn: (v: string) => void) => (e: { target: { value: string } }) => {
    fn(e.target.value);
    setPage(1);
  };

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = grievances.filter((g) => {
      // Keyword search
      const matchesSearch =
        !term ||
        g.id.toLowerCase().includes(term) ||
        g.submittedBy.toLowerCase().includes(term) ||
        g.studentId.toLowerCase().includes(term) ||
        g.category.toLowerCase().includes(term) ||
        g.title.toLowerCase().includes(term);
      if (!matchesSearch) return false;

      // Department filter
      if (dept !== "all" && g.department !== dept) return false;

      // Category filter
      if (cat !== "all" && g.category !== cat) return false;

      // Priority filter
      if (pri !== "all" && g.priority !== pri) return false;

      // Canonical Status filter
      if (status !== "all" && g.status !== status) return false;

      // GFM review outcome filter
      if (gfmOutcome !== "all") {
        if (gfmOutcome === "pending" && g.status !== "GFM_REVIEW" && g.status !== "Submitted")
          return false;
        if (
          gfmOutcome === "accepted" &&
          g.status !== "DEPARTMENT_ASSIGNED" &&
          g.status !== "GFM_ACCEPTED" &&
          !(g.gfmReviewDate && g.status !== "GFM_REJECTED" && g.status !== "GFM_INFORMATION_REQUESTED")
        )
          return false;
        if (gfmOutcome === "info_requested" && g.status !== "GFM_INFORMATION_REQUESTED")
          return false;
        if (gfmOutcome === "rejected" && g.status !== "GFM_REJECTED" && g.status !== "Rejected")
          return false;
      }

      // Assigned staff member
      if (assignedStaff === "unassigned") {
        if (g.assignedTo) return false;
      } else if (assignedStaff !== "all" && g.assignedTo !== assignedStaff) {
        return false;
      }

      // Submission date range filter
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
  }, [grievances, q, dept, cat, pri, status, gfmOutcome, assignedStaff, fromDate, toDate, sort]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * PAGE, current * PAGE);
  const selected = grievances.find((g) => g.id === selectedId) ?? null;

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

          {/* Department */}
          <NativeSelect
            aria-label="Department"
            value={dept}
            onChange={reset(setDept)}
            options={DEPARTMENTS}
            allLabel="All departments"
          />

          {/* Category */}
          <NativeSelect
            aria-label="Category"
            value={cat}
            onChange={reset(setCat)}
            options={categories}
            allLabel="All categories"
          />

          {/* Priority */}
          <NativeSelect
            aria-label="Priority"
            value={pri}
            onChange={reset(setPri)}
            options={PRIORITIES}
            allLabel="All priorities"
          />

          {/* Canonical Status with friendly label rendering */}
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={status}
            onChange={reset(setStatus)}
            aria-label="Canonical Status"
          >
            <option value="all">All statuses</option>
            {GRIEVANCE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>

          {/* GFM Review Outcome */}
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={gfmOutcome}
            onChange={reset(setGfmOutcome)}
            aria-label="GFM Review Outcome"
          >
            {GFM_OUTCOME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Assigned Staff Member */}
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={assignedStaff}
            onChange={reset(setAssignedStaff)}
            aria-label="Assigned Officer"
          >
            <option value="all">All assigned officers</option>
            <option value="unassigned">Unassigned</option>
            {staffMembers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <NativeSelect
            aria-label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={SORTS}
          />
        </div>

        {/* Date Range Sub-Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <span className="font-medium">Submitted Date Range:</span>
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

          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground ml-auto sm:ml-0"
              onClick={clearAllFilters}
            >
              <FilterX className="mr-1 size-3.5" />
              Reset filters
            </Button>
          )}

          <span className="ml-auto text-xs text-muted-foreground font-medium">
            Showing {rows.length} of {grievances.length} grievance{grievances.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No grievances match your criteria"
          description="Try adjusting your department, status, category, date, or keyword filters."
          action={
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Reset all filters
            </Button>
          }
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                      <td className={`${tdClass} text-xs font-medium`}>
                        {g.gfmReviewerName || (
                          <span className="text-muted-foreground italic">
                            {g.status === "GFM_REVIEW" || g.status === "Submitted" ? "Pending Review" : "Dr. Priya Sharma"}
                          </span>
                        )}
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
        </div>
      )}

      {/* Detail Drawer */}
      <AdminGrievanceDrawer
        grievance={selected}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
