import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, FilterX, Search } from "lucide-react";
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
import { PRIORITIES } from "@/lib/types";

export const Route = createFileRoute("/gfm/pending")({
  head: () => ({ meta: [{ title: "Review Queue — GFM Portal" }] }),
  component: GFMPending,
});

export function GFMPending() {
  const { queue } = useGFMData();
  const [stageFilter, setStageFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [query, setQuery] = useState("");

  // Focus strictly on grievances awaiting GFM action and permitted follow-up
  const reviewQueue = useMemo(() => {
    return queue.filter(
      (g) =>
        g.status === "GFM_REVIEW" ||
        g.status === "Submitted" ||
        g.status === "GFM_INFORMATION_REQUESTED",
    );
  }, [queue]);

  const categories = useMemo(() => {
    return Array.from(new Set(reviewQueue.map((g) => g.category).filter(Boolean))).sort();
  }, [reviewQueue]);

  const hasActiveFilters = Boolean(
    stageFilter !== "all" ||
    categoryFilter !== "all" ||
    priorityFilter !== "all" ||
    fromDate ||
    toDate ||
    query,
  );

  function resetFilters() {
    setStageFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setFromDate("");
    setToDate("");
    setQuery("");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviewQueue.filter((g) => {
      // Review queue filter
      if (stageFilter === "pending") {
        if (g.status !== "GFM_REVIEW" && g.status !== "Submitted") return false;
      } else if (stageFilter === "info_requested") {
        if (g.status !== "GFM_INFORMATION_REQUESTED") return false;
      }

      // Category filter
      if (categoryFilter !== "all" && g.category !== categoryFilter) return false;

      // Priority filter
      if (priorityFilter !== "all" && g.priority !== priorityFilter) return false;

      // Submission date range filter
      if (fromDate && g.submittedAt < fromDate) return false;
      if (toDate && g.submittedAt > toDate) return false;

      // Search keyword filter
      if (!q) return true;
      return (
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.submittedBy.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    });
  }, [reviewQueue, stageFilter, categoryFilter, priorityFilter, fromDate, toDate, query]);

  return (
    <>
      <PageHeader
        title="GFM Review Queue"
        description={`${reviewQueue.length} grievance${reviewQueue.length !== 1 ? "s" : ""} awaiting first-level triage, verification, or student follow-up`}
        crumbs={[{ label: "GFM Dashboard", to: "/gfm" }, { label: "Review Queue" }]}
      />

      {/* Filter Toolbar */}
      <div className="surface-card mb-5 p-4 space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, title, student..."
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>

          {/* Review Queue Filter */}
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[190px] text-xs">
              <SelectValue placeholder="Review queue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Review Queue</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="info_requested">Information Requested</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          {categories.length > 0 && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 w-full sm:w-[160px] text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
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
            Showing {filtered.length} of {reviewQueue.length} case{reviewQueue.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={reviewQueue.length === 0 ? "All clear!" : "No matching grievances"}
          description={
            reviewQueue.length === 0
              ? "No grievances are currently awaiting first-level GFM review."
              : "Try adjusting your queue stage, category, priority, or date filters."
          }
        />
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
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Submitted</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{g.id}</td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="line-clamp-1 font-medium">{g.title}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{g.submittedBy}</td>
                    <td className="px-4 py-3 text-muted-foreground">{g.category}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={g.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{g.submittedAt}</td>
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
      )}
    </>
  );
}
