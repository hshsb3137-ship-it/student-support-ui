import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/common/ProfilePage";

export const Route = createFileRoute("/gfm/profile")({
  head: () => ({
    meta: [
      { title: "Profile — GFM Portal" },
      {
        name: "description",
        content: "Manage your GFM reviewer account details and contact preferences.",
      },
      { property: "og:title", content: "Profile — GFM Portal" },
      {
        property: "og:description",
        content: "Manage your GFM reviewer account details and contact preferences.",
      },
    ],
  }),
  component: () => <ProfilePage role="gfm" crumbLabel="GFM Portal" />,
});
