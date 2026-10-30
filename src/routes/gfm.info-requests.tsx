import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, Calendar, Info, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGFMData } from "@/lib/gfm-store";

export const Route = createFileRoute("/gfm/info-requests")({
  head: () => ({
    meta: [
      { title: "Information Requests — GFM Portal" },
      {
        name: "description",
        content: "Track student grievances where additional documentation or clarification was requested.",
      },
    ],
  }),
  component: GFMInfoRequests,
});

function GFMInfoRequests() {
  const { queue } = useGFMData();
  const [query, setQuery] = useState("");

  const infoRequests = useMemo(() => {
    return queue.filter((g) => g.status === "GFM_INFORMATION_REQUESTED");
  }, [queue]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return infoRequests;
    return infoRequests.filter(
      (g) =>
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.submittedBy.toLowerCase().includes(q) ||
        (g.gfmInfoRequest && g.gfmInfoRequest.toLowerCase().includes(q)),
    );
  }, [infoRequests, query]);

  return (
    <>
      <PageHeader
        title="Information Requests"
        description={`${infoRequests.length} case${infoRequests.length !== 1 ? "s" : ""} awaiting additional clarification or documentation from students.`}
        crumbs={[{ label: "GFM Dashboard", to: "/gfm" }, { label: "Information Requests" }]}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, title, student, requested detail..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Info}
          title={infoRequests.length === 0 ? "No pending info requests" : "No matching requests"}
          description={
            infoRequests.length === 0
              ? "When you request additional details or proofs from students, those cases will be tracked here."
              : "Try adjusting your search query."
          }
          action={
            infoRequests.length === 0 ? (
              <Button asChild variant="outline">
                <Link to="/gfm/pending">Review pending queue</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Grievance & Student</th>
                    <th className="px-4 py-3 text-left font-medium">Requested Information</th>
                    <th className="px-4 py-3 text-left font-medium">Response Deadline</th>
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
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="line-clamp-1 font-medium">{g.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.submittedBy} ({g.studentId})
                        </p>
                      </td>
                      <td className="px-4 py-3 max-w-[260px]">
                        <p className="line-clamp-2 text-xs text-foreground/90 italic">
                          "{g.gfmInfoRequest || "Additional documentation required"}"
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {g.gfmInfoRequestDeadline ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="size-3.5 text-info" />
                            <span>{g.gfmInfoRequestDeadline}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No deadline specified</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={g.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={g.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/gfm/$grievanceId" params={{ grievanceId: g.id }}>Review</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
