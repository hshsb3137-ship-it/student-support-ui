import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SearchX } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { GrievanceProgress } from "@/components/grievance/GrievanceProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudentData } from "@/lib/student-store";
import type { Grievance } from "@/lib/types";

export const Route = createFileRoute("/student/track")({
  head: () => ({
    meta: [
      { title: "Track a Grievance — Student Portal" },
      {
        name: "description",
        content: "Enter a grievance reference ID to see its current status and full timeline.",
      },
      { property: "og:title", content: "Track a Grievance — Student Portal" },
      {
        property: "og:description",
        content: "Enter a grievance reference ID to see its current status and full timeline.",
      },
    ],
  }),
  component: TrackGrievance,
});

function TrackGrievance() {
  const { findById } = useStudentData();
  const [id, setId] = useState("");
  const [result, setResult] = useState<Grievance | null>(null);
  const [searched, setSearched] = useState(false);

  function search(e: React.FormEvent) {
    e.preventDefault();
    setResult(findById(id) ?? null);
    setSearched(true);
  }

  return (
    <>
      <PageHeader
        title="Track a grievance"
        description="Use the reference ID from your acknowledgement email, e.g. GRV-2026-0142."
        crumbs={[{ label: "Student Portal", to: "/student" }, { label: "Track Grievance" }]}
      />

      <form onSubmit={search} className="surface-card mb-5 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="GRV-2026-0142"
            className="pl-9 font-mono"
          />
        </div>
        <Button type="submit">Track</Button>
      </form>

      {result ? (
        <div className="surface-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-muted-foreground">{result.id}</p>
              <h2 className="mt-1 font-display text-xl font-semibold">{result.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.category} · {result.department} · submitted {result.submittedAt}
              </p>
            </div>
            <div className="flex gap-2">
              <PriorityBadge priority={result.priority} />
              <StatusBadge status={result.status} />
            </div>
          </div>

          <div className="mt-6">
            <GrievanceProgress status={result.status} />
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 rounded-lg border bg-secondary/40 p-4 text-sm sm:grid-cols-4">
            {[
              ["Current status", result.status],
              ["Assigned department", result.department],
              ["Handled by", result.assignedTo ?? "Awaiting assignment"],
              ["Last update", result.updatedAt],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-0.5 font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{result.description}</p>

          <h3 className="mt-7 mb-3 font-display text-base font-semibold">Timeline</h3>
          <ol className="relative space-y-5 border-l pl-6">
            {result.timeline.map((t) => (
              <li key={t.id} className="relative">
                <span className="absolute -left-[1.9rem] top-1 size-3 rounded-full border-2 border-background bg-primary" />
                <p className="text-sm font-semibold">{t.label}</p>
                <p className="text-xs text-muted-foreground">
                  {t.actor} · {t.date}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{t.note}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : searched ? (
        <EmptyState
          icon={SearchX}
          title="No grievance found"
          description="Check the reference ID and try again."
        />
      ) : (
        <EmptyState
          icon={Search}
          title="Enter a reference ID"
          description="Your grievance status and timeline will appear here."
        />
      )}
    </>
  );
}
