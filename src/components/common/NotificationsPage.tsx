import { useEffect, useMemo, useState } from "react";
import { BellOff, CheckCheck } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { Notification } from "./Notification";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import {
  getSharedNotifications,
  markAllNotificationsReadInSharedStore,
  markNotificationReadInSharedStore,
  subscribeToSharedStore,
} from "@/lib/shared-grievance-store";
import type { Role } from "@/lib/types";

export function NotificationsPage({ role, crumbLabel }: { role: Role; crumbLabel: string }) {
  const [allNotifs, setAllNotifs] = useState(getSharedNotifications);

  useEffect(() => {
    return subscribeToSharedStore(() => {
      setAllNotifs([...getSharedNotifications()]);
    });
  }, []);

  const items = useMemo(() => allNotifs.filter((n) => n.audience.includes(role)), [allNotifs, role]);
  const unread = items.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={
          unread > 0 ? `${unread} unread update${unread > 1 ? "s" : ""}` : "You are all caught up."
        }
        crumbs={[{ label: crumbLabel, to: `/${role}` }, { label: "Notifications" }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={unread === 0}
            onClick={() => markAllNotificationsReadInSharedStore(role)}
          >
            <CheckCheck className="mr-2 size-4" />
            Mark all read
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No notifications"
          description="Updates about your grievances will appear here."
        />
      ) : (
        <div className="surface-card flex flex-col gap-2 p-3">
          {items.map((n) => (
            <Notification
              key={n.id}
              notification={n}
              onClick={() => markNotificationReadInSharedStore(n.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
