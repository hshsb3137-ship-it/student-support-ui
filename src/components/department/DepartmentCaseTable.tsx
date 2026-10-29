import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { StaffCaseModal } from "./StaffCaseModal";
import { useDepartmentData } from "@/lib/department-store";
import { analysisFor, lookupStudent } from "@/lib/department-data";
import { GRIEVANCE_STATUSES, type Grievance } from "@/lib/types";
import { Inbox } from "lucide-react";

const PAGE = 8;
const sel = "h-9 rounded-md border border-input bg-background px-2 text-sm";

export function DepartmentScopeBadge() {
  const { department } = useDepartmentData();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
      <ShieldCheck className="size-3.5" /> Current Department: {department}
    </span>
  );
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
  const [from, setFrom] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.category))), [rows]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    const list = rows.filter(
      (g) =>
        (!s ||
          g.id.toLowerCase().includes(s) ||
          g.title.toLowerCase().includes(s) ||
          g.submittedBy.toLowerCase().includes(s) ||
          g.studentId.toLowerCase().includes(s)) &&
        (status === "all" || g.status === status) &&
        (priority === "all" || g.priority === priority) &&
        (category === "all" || g.category === category) &&
        (!from || g.submittedAt >= from),
    );
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
  }, [rows, q, status, priority, category, from, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * PAGE, cur * PAGE);
  const selected = selectedId ? store.findById(selectedId) : undefined;

  return (
    <div className="surface-card p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search ID, title, student…"
            className="pl-8"
          />
        </div>
        <select className={sel} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
          <option value="all">All statuses</option>
          {GRIEVANCE_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className={sel} value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} aria-label="Priority">
          <option value="all">All priorities</option>
          {["Critical", "High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className={sel} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label="Category">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input type="date" className={sel} value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} aria-label="Submitted from" />
        <select className={sel} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priority">Priority</option>
          <option value="updated">Recently updated</option>
        </select>
      </div>

      {slice.length === 0 ? (
        <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                {["ID", "Student", "Student ID", "Title", "Category", "AI Classification", "Priority", "Status", "Submitted", "Assigned", "Updated", "Action"].map((h) => (
                  <th key={h} className="px-2 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((g) => {
                const ai = analysisFor(g);
                const st = lookupStudent(g.studentId, g.submittedBy);
                const assigned = g.timeline.find((t) => /assign/i.test(t.label))?.date ?? g.submittedAt;
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
                    <td className="px-2 py-2 whitespace-nowrap text-xs">{assigned}</td>
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
