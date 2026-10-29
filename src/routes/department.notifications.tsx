import { createFileRoute } from "@tanstack/react-router";
import { BellOff, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Notification } from "@/components/common/Notification";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useDepartmentData } from "@/lib/department-store";

export const Route = createFileRoute("/department/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Department Desk" },
      { name: "description", content: "Assignment alerts and SLA warnings for your department." },
      { property: "og:title", content: "Notifications — Department Desk" },
      { property: "og:description", content: "Assignment alerts and SLA warnings for your department." },
    ],
  }),
  component: DeptNotifications,
});

function DeptNotifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDepartmentData();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread update${unread > 1 ? "s" : ""}` : "You are all caught up."}
        crumbs={[{ label: "Department Desk", to: "/department" }, { label: "Notifications" }]}
        actions={
          <Button variant="outline" size="sm" disabled={!unread} onClick={markAllNotificationsRead}>
            <CheckCheck className="mr-2 size-4" /> Mark all read
          </Button>
        }
      />
      {notifications.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" description="Department alerts will appear here." />
      ) : (
        <div className="surface-card flex flex-col gap-2 p-3">
          {notifications.map((n) => (
            <Notification key={n.id} notification={n} onClick={() => markNotificationRead(n.id)} />
          ))}
        </div>
      )}
    </>
  );
}
