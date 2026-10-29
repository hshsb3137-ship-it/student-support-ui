import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students moved — Administration" },
      { name: "description", content: "Student accounts are managed from User Management." },
      { property: "og:title", content: "Students moved — Administration" },
      { property: "og:description", content: "Student accounts are managed from User Management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/admin/users" });
  },
});
