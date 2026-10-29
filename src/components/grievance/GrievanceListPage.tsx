import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, type Crumb } from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GrievanceTable } from "./GrievanceTable";
import { GrievanceDetailModal } from "./GrievanceDetailModal";
import { DEPARTMENTS, GRIEVANCE_STATUSES, PRIORITIES, type Grievance } from "@/lib/types";

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
}: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [department, setDepartment] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((g) => g.id === selectedId) ?? null;

  const categories = useMemo(
    () => Array.from(new Set(rows.map((g) => g.category))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((g) => {
      if (status !== "all" && g.status !== status) return false;
      if (priority !== "all" && g.priority !== priority) return false;
      if (department !== "all" && g.department !== department) return false;
      if (category !== "all" && g.category !== category) return false;
      if (!q) return true;
      return (
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.submittedBy.toLowerCase().includes(q)
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
  }, [rows, query, status, priority, department, category, sort]);

  return (
    <>
      <PageHeader title={title} description={description} crumbs={crumbs} />

      <div className="surface-card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, title, category or student"
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {GRIEVANCE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="sm:w-[160px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showDepartmentFilter ? (
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="updated">Recently updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {rows.length} grievances
      </p>

      <GrievanceTable
        rows={filtered}
        showStudent={showStudent}
        onRowClick={(g) => setSelectedId(g.id)}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />

      <GrievanceDetailModal
        grievance={selected}
        onClose={() => setSelectedId(null)}
        studentActions={studentActions}
        onWithdraw={onWithdraw}
        onReopen={onReopen}
        onFeedback={onFeedback}
      />
    </>

  );
}
