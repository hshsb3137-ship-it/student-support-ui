import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useGFMData } from "@/lib/gfm-store";

export const Route = createFileRoute("/gfm/pending")({
  head: () => ({ meta: [{ title: "Pending Review — GFM Portal" }] }),
  component: GFMPending,
});

function GFMPending() {
  const { queue } = useGFMData();
  const pending = queue.filter((g) => g.status === "GFM_REVIEW");

  return (
    <>
      <PageHeader
        title="Pending Review"
        description={`${pending.length} grievance${pending.length !== 1 ? "s" : ""} awaiting your first-level review`}
        crumbs={[{ label: "GFM Dashboard", to: "/gfm" }, { label: "Pending Review" }]}
      />
      {pending.length === 0 ? (
        <EmptyState icon={Clock} title="All clear!" description="No grievances awaiting review." />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Submitted</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pending.map((g) => (
                  <tr key={g.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{g.id}</td>
                    <td className="px-4 py-3 max-w-[200px]"><span className="line-clamp-1 font-medium">{g.title}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{g.submittedBy}</td>
                    <td className="px-4 py-3 text-muted-foreground">{g.category}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={g.priority} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{g.submittedAt}</td>
                    <td className="px-4 py-3"><Button asChild variant="ghost" size="sm"><Link to={"/gfm/" + g.id}>Review</Link></Button></td>
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
