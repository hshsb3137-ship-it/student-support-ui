import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/common/ProfilePage";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Student Portal" },
      { name: "description", content: "Manage your student account details and contact info." },
      { property: "og:title", content: "Profile — Student Portal" },
      {
        property: "og:description",
        content: "Manage your student account details and contact info.",
      },
    ],
  }),
  component: () => <ProfilePage role="student" crumbLabel="Student Portal" />,
});
