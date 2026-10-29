import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellOff, CheckCheck, Filter } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Notification } from "@/components/common/Notification";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGFMData } from "@/lib/gfm-store";

export const Route = createFileRoute("/gfm/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — GFM Portal" },
      {
        name: "description",
        content: "Alerts, submission notices, and student updates for GFM review.",
      },
    ],
  }),
  component: GFMNotifications,
});

function GFMNotifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useGFMData();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  return (
    <>
      <PageHeader
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""} requiring your attention.`
            : "You are all caught up."
        }
        crumbs={[{ label: "GFM Dashboard", to: "/gfm" }, { label: "Notifications" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
            onClick={markAllNotificationsRead}
          >
            <CheckCheck className="mr-2 size-4" />
            Mark all read
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v: "all" | "unread" | "read") => setFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All notifications ({notifications.length})</SelectItem>
              <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
              <SelectItem value="read">Read ({notifications.length - unreadCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No notifications"
          description={
            filter === "unread"
              ? "You have no unread notifications."
              : "Updates regarding submitted grievances and student messages will appear here."
          }
        />
      ) : (
        <div className="surface-card flex flex-col gap-2 p-3">
          {filtered.map((n) => (
            <Notification
              key={n.id}
              notification={n}
              onClick={() => markNotificationRead(n.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
