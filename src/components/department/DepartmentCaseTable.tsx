import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, FilterX, Inbox, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { StaffCaseModal } from "./StaffCaseModal";
import { useDepartmentData } from "@/lib/department-store";
import { analysisFor, lookupStudent } from "@/lib/department-data";
import { PRIORITIES, type Grievance } from "@/lib/types";

const PAGE = 8;
const sel = "h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DepartmentScopeBadge() {
  const { department } = useDepartmentData();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
      <ShieldCheck className="size-3.5" /> Current Department: {department}
    </span>
  );
}

export const DEPT_STAFF_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "dept_assigned", label: "Assigned to Department" },
  { value: "staff_review", label: "Staff Review" },
  { value: "in_progress", label: "In Progress" },
  { value: "info_requested", label: "Information Requested" },
  { value: "resolved", label: "Resolved" },
  { value: "escalated", label: "Escalated" },
] as const;

export function matchDeptStatus(gStatus: string, filterVal: string): boolean {
  if (filterVal === "all") return true;
  switch (filterVal) {
    case "dept_assigned":
      return gStatus === "DEPARTMENT_ASSIGNED" || gStatus === "Acknowledged";
    case "staff_review":
      return gStatus === "STAFF_REVIEW" || gStatus === "Under Review";
    case "in_progress":
      return gStatus === "In Progress";
    case "info_requested":
      return (
        gStatus === "INFORMATION_REQUESTED" ||
        gStatus === "Waiting for Student"
      );
    case "resolved":
      return gStatus === "Resolved" || gStatus === "Resolution Proposed";
    case "escalated":
      return gStatus === "Escalated" || gStatus === "ESCALATED_TO_ADMIN";
    default:
      return gStatus === filterVal;
  }
}

export function DepartmentCaseTable({
  rows,
  emptyTitle = "No grievances",
  emptyDescription = "Nothing matches the current filters.",
}: {
  rows: Grievance[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const store = useDepartmentData();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [assignedStaff, setAssignedStaff] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.category).filter(Boolean))).sort();
  }, [rows]);

  const staffMembers = useMemo(() => {
    return Array.from(
      new Set(rows.map((r) => r.assignedTo).filter(Boolean)),
    ).sort() as string[];
  }, [rows]);

  const hasActiveFilters = Boolean(
    q ||
      status !== "all" ||
      priority !== "all" ||
      category !== "all" ||
      assignedStaff !== "all" ||
      fromDate ||
      toDate,
  );

  function resetFilters() {
    setQ("");
    setStatus("all");
    setPriority("all");
    setCategory("all");
    setAssignedStaff("all");
    setFromDate("");
    setToDate("");
    setSort("newest");
    setPage(1);
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = rows.filter((g) => {
      // Keyword search
      if (
        s &&
        !(
          g.id.toLowerCase().includes(s) ||
          g.title.toLowerCase().includes(s) ||
          g.submittedBy.toLowerCase().includes(s) ||
          g.category.toLowerCase().includes(s) ||
          g.studentId.toLowerCase().includes(s)
        )
      ) {
        return false;
      }

      // Department-specific status matching
      if (!matchDeptStatus(g.status, status)) return false;

      // Priority
      if (priority !== "all" && g.priority !== priority) return false;

      // Category
      if (category !== "all" && g.category !== category) return false;

      // Assigned staff member
      if (assignedStaff === "unassigned") {
        if (g.assignedTo) return false;
      } else if (assignedStaff !== "all" && g.assignedTo !== assignedStaff) {
        return false;
      }

      // Date range filter
      if (fromDate && g.submittedAt < fromDate) return false;
      if (toDate && g.submittedAt > toDate) return false;

      return true;
    });

    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;
    list.sort((a, b) =>
      sort === "oldest"
        ? a.submittedAt.localeCompare(b.submittedAt)
        : sort === "priority"
          ? order[a.priority] - order[b.priority]
          : sort === "updated"
            ? b.updatedAt.localeCompare(a.updatedAt)
            : b.submittedAt.localeCompare(a.submittedAt),
    );
    return list;
  }, [rows, q, status, priority, category, assignedStaff, fromDate, toDate, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * PAGE, cur * PAGE);
  const selected = selectedId ? store.findById(selectedId) : undefined;

  return (
    <div className="surface-card p-4 space-y-3">
      {/* Primary Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search ID, title, student, category…"
            className="pl-8 h-9 text-xs"
          />
        </div>

        {/* Department-only Status (excludes GFM-only review statuses) */}
        <select
          className={sel}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          aria-label="Department Status"
        >
          {DEPT_STAFF_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Priority */}
        <select
          className={sel}
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          aria-label="Priority"
        >
          <option value="all">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Category */}
        {categories.length > 0 && (
          <select
            className={sel}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Category"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        {/* Assigned Staff Member */}
        <select
          className={sel}
          value={assignedStaff}
          onChange={(e) => {
            setAssignedStaff(e.target.value);
            setPage(1);
          }}
          aria-label="Assigned Staff"
        >
          <option value="all">All Officers</option>
          <option value="unassigned">Unassigned</option>
          {staffMembers.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          className={sel}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">By Priority</option>
          <option value="updated">Recently updated</option>
        </select>
      </div>

      {/* Date Range Sub-Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
        <span className="font-medium">Submitted Between:</span>
        <Input
          type="date"
          className="h-8 w-36 text-xs"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
          aria-label="From Date"
        />
        <span>to</span>
        <Input
          type="date"
          className="h-8 w-36 text-xs"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
          aria-label="To Date"
        />

        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground ml-auto sm:ml-0"
            onClick={resetFilters}
          >
            <FilterX className="mr-1 size-3.5" />
            Reset filters
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground font-medium">
          Showing {filtered.length} of {rows.length} assigned case{rows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {slice.length === 0 ? (
        <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                {["ID", "Student", "Student ID", "Title", "Category", "AI Classification", "Priority", "Status", "Submitted", "Assigned Officer", "Updated", "Action"].map((h) => (
                  <th key={h} className="px-2 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((g) => {
                const ai = analysisFor(g);
                const st = lookupStudent(g.studentId, g.submittedBy);
                return (
                  <tr key={g.id} className="border-b last:border-0 hover:bg-secondary/40">
                    <td className="px-2 py-2 font-mono text-xs whitespace-nowrap">{g.id}</td>
                    <td className="px-2 py-2 whitespace-nowrap">{st.name}</td>
                    <td className="px-2 py-2 font-mono text-xs">{g.studentId}</td>
                    <td className="px-2 py-2 max-w-[220px] truncate" title={g.title}>{g.title}</td>
                    <td className="px-2 py-2">{g.category}</td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">{ai.detectedCategory}</td>
                    <td className="px-2 py-2"><PriorityBadge priority={g.priority} /></td>
                    <td className="px-2 py-2"><StatusBadge status={g.status} /></td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">{g.submittedAt}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-foreground">
                      {g.assignedTo || <span className="text-muted-foreground italic">Unassigned</span>}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">{g.updatedAt}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedId(g.id)} aria-label={`View ${g.id}`}>
                          <Eye className="size-4" />
                        </Button>
                        {g.status === "Submitted" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { store.acknowledge(g.id); toast.success(`${g.id} accepted`); }}
                          >
                            <CheckCircle2 className="mr-1 size-3.5" /> Accept
                          </Button>
                        )}
                        {!["Resolved", "Rejected"].includes(g.status) && (
                          <Button size="sm" onClick={() => setSelectedId(g.id)}>Manage</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" className="size-8" disabled={cur <= 1} onClick={() => setPage(cur - 1)} aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </Button>
          <span>Page {cur} of {pages}</span>
          <Button size="icon" variant="outline" className="size-8" disabled={cur >= pages} onClick={() => setPage(cur + 1)} aria-label="Next page">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <StaffCaseModal grievance={selected} open={!!selected} onOpenChange={(v) => !v && setSelectedId(null)} />
    </div>
  );
}
