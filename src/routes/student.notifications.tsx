import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/common/NotificationsPage";

export const Route = createFileRoute("/student/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Student Portal" },
      { name: "description", content: "Status changes and messages about your grievances." },
      { property: "og:title", content: "Notifications — Student Portal" },
      {
        property: "og:description",
        content: "Status changes and messages about your grievances.",
      },
    ],
  }),
  component: () => <NotificationsPage role="student" crumbLabel="Student Portal" />,
});
