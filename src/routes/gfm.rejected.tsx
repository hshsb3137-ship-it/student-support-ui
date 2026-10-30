import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ShieldX } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGFMData } from "@/lib/gfm-store";

export const Route = createFileRoute("/gfm/rejected")({
  head: () => ({
    meta: [
      { title: "Rejected Grievances — GFM Portal" },
      {
        name: "description",
        content: "Grievances rejected during first-level review with recorded reasons.",
      },
    ],
  }),
  component: GFMRejected,
});

function GFMRejected() {
  const { queue } = useGFMData();
  const [query, setQuery] = useState("");

  const rejectedList = useMemo(() => {
    return queue.filter((g) => g.status === "GFM_REJECTED");
  }, [queue]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rejectedList;
    return rejectedList.filter(
      (g) =>
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.submittedBy.toLowerCase().includes(q) ||
        (g.gfmRejectionReason && g.gfmRejectionReason.toLowerCase().includes(q)),
    );
  }, [rejectedList, query]);

  return (
    <>
      <PageHeader
        title="Rejected Grievances"
        description={`${rejectedList.length} grievance${rejectedList.length !== 1 ? "s" : ""} rejected at first-level review.`}
        crumbs={[{ label: "GFM Dashboard", to: "/gfm" }, { label: "Rejected" }]}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, title, student, reason..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ShieldX}
          title={rejectedList.length === 0 ? "No rejected grievances" : "No matching grievances"}
          description={
            rejectedList.length === 0
              ? "Grievances that do not meet guidelines or are out-of-scope will be listed here after rejection."
              : "Try adjusting your search terms."
          }
        />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Grievance & Student</th>
                  <th className="px-4 py-3 text-left font-medium">Rejection Reason</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Reviewed On</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {g.id}
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="line-clamp-1 font-medium">{g.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {g.submittedBy} ({g.studentId}) · {g.category}
                      </p>
                    </td>
                    <td className="px-4 py-3 max-w-[320px]">
                      <p className="line-clamp-2 text-xs text-critical">
                        {g.gfmRejectionReason || "Criteria not met for acceptance."}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={g.priority} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {g.gfmReviewDate || g.updatedAt}
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
