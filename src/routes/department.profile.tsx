import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/common/ProfilePage";

export const Route = createFileRoute("/department/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Department Desk" },
      { name: "description", content: "Manage your staff account details and contact info." },
      { property: "og:title", content: "Profile — Department Desk" },
      {
        property: "og:description",
        content: "Manage your staff account details and contact info.",
      },
    ],
  }),
  component: () => <ProfilePage role="department" crumbLabel="Department Desk" />,
});
