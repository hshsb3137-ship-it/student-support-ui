import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  UserCheck,
  Building,
  ShieldAlert,
  FileText,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/admin/AdminUI";
import { useAdminData } from "@/lib/admin-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Institutional Notifications — Administration" },
      { name: "description", content: "System-wide alerts, GFM triage notifications, department activity, and escalation warnings." },
      { property: "og:title", content: "Institutional Notifications — Administration" },
      { property: "og:description", content: "System-wide alerts, GFM triage notifications, department activity, and escalation warnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminNotifications,
});

function AdminNotifications() {
  const { notices, markNotice, markAllNotices } = useAdminData();
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const rows = notices.filter((n) => {
    const matchStatus = filter === "all" || (filter === "Unread" ? !n.read : n.read);
    const titleLower = n.title.toLowerCase();
    const matchType =
      typeFilter === "all" ||
      (typeFilter === "GFM Review" && (titleLower.includes("gfm") || titleLower.includes("review"))) ||
      (typeFilter === "Escalations" && (titleLower.includes("escalat") || titleLower.includes("critical"))) ||
      (typeFilter === "Department" && (titleLower.includes("department") || titleLower.includes("sla")));
    return matchStatus && matchType;
  });

  const unread = notices.filter((n) => !n.read).length;

  const getNoticeIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("escalat") || t.includes("critical")) return <ShieldAlert className="size-5 text-rose-600" />;
    if (t.includes("gfm") || t.includes("rejected")) return <UserCheck className="size-5 text-amber-600" />;
    if (t.includes("department") || t.includes("sla")) return <Building className="size-5 text-blue-600" />;
    return <Bell className="size-5 text-primary" />;
  };

  return (
    <>
      <PageHeader
        title="Institutional Notifications"
        description={`${unread} unread institutional alerts and activity logs`}
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "Notifications" }]}
        actions={
          <Button size="sm" variant="outline" disabled={!unread} onClick={markAllNotices}>
            <CheckCheck className="mr-1 size-4" /> Mark All Read
          </Button>
        }
      />

      <div className="surface-card mb-4 flex flex-wrap items-center justify-between gap-3 p-3 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <NativeSelect
            aria-label="Filter by status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={["Unread", "Read"]}
            allLabel="All statuses"
          />
          <NativeSelect
            aria-label="Filter by category"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={["GFM Review", "Escalations", "Department"]}
            allLabel="All categories"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{rows.length}</span> notifications
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No notifications found" description="No alerts match the selected criteria." />
      ) : (
        <ul className="space-y-2.5">
          {rows.map((n) => (
            <li
              key={n.id}
              className={cn(
                "surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-start transition-colors",
                !n.read ? "border-l-4 border-l-primary bg-primary/[0.02]" : "opacity-85 hover:opacity-100",
              )}
            >
              <div className="mt-0.5 shrink-0 rounded-full bg-muted/60 p-2">
                {getNoticeIcon(n.title)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground text-sm">{n.title}</p>
                  {!n.read && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      New
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Target: {n.recipient}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="size-3" /> {n.date}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="self-end sm:self-center shrink-0"
                onClick={() => markNotice(n.id, !n.read)}
              >
                {n.read ? "Mark unread" : "Mark read"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

