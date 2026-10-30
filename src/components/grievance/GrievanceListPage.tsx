import { useMemo, useState } from "react";
import { FilterX, Search } from "lucide-react";
import { PageHeader, type Crumb } from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GrievanceTable } from "./GrievanceTable";
import { GrievanceDetailModal } from "./GrievanceDetailModal";
import { DEPARTMENTS, type Grievance } from "@/lib/types";

interface Props {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  rows: Grievance[];
  showStudent?: boolean;
  showDepartmentFilter?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  studentActions?: boolean;
  onWithdraw?: (id: string) => void;
  onReopen?: (id: string, reason: string) => void;
  onFeedback?: (id: string, rating: number, comment: string) => void;
  onSubmitInfo?: (id: string, info: string) => void;
}

export const STUDENT_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending_gfm", label: "Pending GFM Review" },
  { value: "info_requested", label: "Information Requested" },
  { value: "assigned_dept", label: "Assigned to Department" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
  { value: "escalated", label: "Escalated" },
] as const;

export function matchStudentStatus(gStatus: string, filterVal: string): boolean {
  if (filterVal === "all") return true;
  switch (filterVal) {
    case "pending_gfm":
      return gStatus === "GFM_REVIEW" || gStatus === "Submitted";
    case "info_requested":
      return (
        gStatus === "GFM_INFORMATION_REQUESTED" ||
        gStatus === "INFORMATION_REQUESTED" ||
        gStatus === "Waiting for Student"
      );
    case "assigned_dept":
      return (
        gStatus === "DEPARTMENT_ASSIGNED" ||
        gStatus === "GFM_ACCEPTED" ||
        gStatus === "Acknowledged"
      );
    case "in_progress":
      return (
        gStatus === "In Progress" ||
        gStatus === "STAFF_REVIEW" ||
        gStatus === "Under Review"
      );
    case "resolved":
      return gStatus === "Resolved" || gStatus === "Resolution Proposed";
    case "rejected":
      return gStatus === "Rejected" || gStatus === "GFM_REJECTED";
    case "escalated":
      return gStatus === "Escalated" || gStatus === "ESCALATED_TO_ADMIN";
    default:
      return gStatus === filterVal;
  }
}

export function GrievanceListPage({
  title,
  description,
  crumbs,
  rows,
  showStudent,
  showDepartmentFilter,
  emptyTitle,
  emptyDescription,
  studentActions,
  onWithdraw,
  onReopen,
  onFeedback,
  onSubmitInfo,
}: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [department, setDepartment] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((g) => g.id === selectedId) ?? null;

  const categories = useMemo(() => {
    return Array.from(new Set(rows.map((g) => g.category).filter(Boolean))).sort();
  }, [rows]);

  const hasActiveFilters = Boolean(
    query ||
      status !== "all" ||
      category !== "all" ||
      department !== "all" ||
      fromDate ||
      toDate,
  );

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setCategory("all");
    setDepartment("all");
    setFromDate("");
    setToDate("");
    setSort("newest");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((g) => {
      // Status filter with friendly label mapping
      if (!matchStudentStatus(g.status, status)) return false;

      // Category filter
      if (category !== "all" && g.category !== category) return false;

      // Department filter
      if (department !== "all" && g.department !== department) return false;

      // Submission date range filter
      if (fromDate && g.submittedAt < fromDate) return false;
      if (toDate && g.submittedAt > toDate) return false;

      // Text search
      if (!q) return true;
      return (
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q))
      );
    });

    return [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.submittedAt.localeCompare(b.submittedAt);
        case "updated":
          return b.updatedAt.localeCompare(a.updatedAt);
        default:
          return b.submittedAt.localeCompare(a.submittedAt);
      }
    });
  }, [rows, query, status, category, department, fromDate, toDate, sort]);

  return (
    <>
      <PageHeader title={title} description={description} crumbs={crumbs} />

      <div className="surface-card mb-5 p-4 space-y-3">
        {/* Main Filters Bar */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, title, or keyword..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-full sm:w-[190px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STUDENT_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {categories.length > 0 && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9 w-full sm:w-[170px] text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showDepartmentFilter ? (
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="h-9 w-full sm:w-[170px] text-xs">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-9 w-full sm:w-[160px] text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="updated">Recently updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range & Reset Sub-Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <span className="font-medium">Submitted Between:</span>
          <Input
            type="date"
            className="h-8 w-36 text-xs"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label="From Date"
          />
          <span>to</span>
          <Input
            type="date"
            className="h-8 w-36 text-xs"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
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
            Showing {filtered.length} of {rows.length} grievance{rows.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <GrievanceTable
        rows={filtered}
        showStudent={showStudent}
        onRowClick={(g) => setSelectedId(g.id)}
        emptyTitle={rows.length === 0 ? emptyTitle : "No matching grievances"}
        emptyDescription={
          rows.length === 0
            ? emptyDescription
            : "No grievances match your selected status, category, or date criteria. Try resetting filters."
        }
      />

      <GrievanceDetailModal
        grievance={selected}
        onClose={() => setSelectedId(null)}
        studentActions={studentActions}
        onWithdraw={onWithdraw}
        onReopen={onReopen}
        onFeedback={onFeedback}
        onSubmitInfo={onSubmitInfo}
      />
    </>
  );
}
