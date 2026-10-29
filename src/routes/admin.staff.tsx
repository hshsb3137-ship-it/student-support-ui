import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({
    meta: [
      { title: "Staff moved — Administration" },
      { name: "description", content: "Staff accounts are managed from User Management." },
      { property: "og:title", content: "Staff moved — Administration" },
      { property: "og:description", content: "Staff accounts are managed from User Management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/admin/users" });
  },
});
