import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Filter, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGFMData } from "@/lib/gfm-store";
import { DEPARTMENTS } from "@/lib/types";

export const Route = createFileRoute("/gfm/accepted")({
  head: () => ({
    meta: [
      { title: "Accepted Grievances — GFM Portal" },
      {
        name: "description",
        content: "Grievances accepted and forwarded to academic and administrative departments.",
      },
    ],
  }),
  component: GFMAccepted,
});

function GFMAccepted() {
  const { queue } = useGFMData();
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  const acceptedList = useMemo(() => {
    return queue.filter(
      (g) => g.status === "DEPARTMENT_ASSIGNED" || g.status === "GFM_ACCEPTED",
    );
  }, [queue]);

  const filtered = useMemo(() => {
    return acceptedList.filter((g) => {
      const matchesDept = deptFilter === "all" || g.department === deptFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.submittedBy.toLowerCase().includes(q) ||
        g.department.toLowerCase().includes(q);
      return matchesDept && matchesQuery;
    });
  }, [acceptedList, deptFilter, query]);

  return (
    <>
      <PageHeader
        title="Accepted & Forwarded"
        description={`${acceptedList.length} grievance${acceptedList.length !== 1 ? "s" : ""} approved and forwarded to departments for resolution.`}
        crumbs={[{ label: "GFM Dashboard", to: "/gfm" }, { label: "Accepted" }]}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, title, student, department..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title={acceptedList.length === 0 ? "No accepted grievances yet" : "No matching grievances"}
          description={
            acceptedList.length === 0
              ? "Grievances you accept and forward to departments will appear here."
              : "Try adjusting your search query or department filter."
          }
          action={
            acceptedList.length === 0 ? (
              <Button asChild variant="outline">
                <Link to="/gfm/pending">Review pending queue</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Grievance</th>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Forwarded Department</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {g.id}
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      <span className="line-clamp-1 font-medium">{g.title}</span>
                      <span className="block text-xs text-muted-foreground">{g.category}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{g.submittedBy}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {g.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={g.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/gfm/$grievanceId" params={{ grievanceId: g.id }}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
