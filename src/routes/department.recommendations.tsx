import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { Button } from "@/components/ui/button";
import { DepartmentScopeBadge } from "@/components/department/DepartmentCaseTable";
import { StaffCaseModal } from "@/components/department/StaffCaseModal";
import { useDepartmentData } from "@/lib/department-store";
import { recommendationFor } from "@/lib/department-data";

export const Route = createFileRoute("/department/recommendations")({
  head: () => ({
    meta: [
      { title: "AI Recommendations — Department Desk" },
      { name: "description", content: "Demo AI resolution suggestions awaiting human review." },
      { property: "og:title", content: "AI Recommendations — Department Desk" },
      { property: "og:description", content: "Demo AI resolution suggestions awaiting human review." },
    ],
  }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { cases } = useDepartmentData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const open = cases.filter((g) => !["Resolved", "Rejected"].includes(g.status));
  const selected = cases.find((g) => g.id === selectedId);

  return (
    <>
      <PageHeader
        title="AI recommendations"
        description="Suggested resolutions for open cases. Every suggestion needs a staff decision — nothing is resolved automatically."
        crumbs={[{ label: "Department Desk", to: "/department" }, { label: "AI Recommendations" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning-foreground">
              AI Recommendation — Human Review Required
            </span>
            <DepartmentScopeBadge />
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {open.map((g) => {
          const r = recommendationFor(g);
          return (
            <article key={g.id} className="surface-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{g.id}</p>
                  <h2 className="font-display text-base font-semibold">{g.title}</h2>
                </div>
                <PriorityBadge priority={g.priority} />
              </div>
              <p className="flex items-start gap-2 text-sm">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
                {r.recommendedAction}
              </p>
              <p className="text-xs text-muted-foreground">Policy: {r.policy}</p>
              <div>
                <div className="mb-1 flex justify-between text-xs"><span>Confidence</span><span>{r.confidence}%</span></div>
                <div className="h-1.5 rounded-full bg-secondary">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${r.confidence}%` }} />
                </div>
              </div>
              <Button size="sm" variant="outline" className="self-start" onClick={() => setSelectedId(g.id)}>
                Review in case
              </Button>
            </article>
          );
        })}
      </div>
      <StaffCaseModal grievance={selected} open={!!selected} onOpenChange={(v) => !v && setSelectedId(null)} />
    </>
  );
}
