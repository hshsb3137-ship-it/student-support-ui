import { createFileRoute } from "@tanstack/react-router";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { AdminDataProvider } from "@/lib/admin-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — Grievance Resolution System" },
      {
        name: "description",
        content:
          "University-wide oversight of grievances, departments, escalations and resolution analytics.",
      },
      { property: "og:title", content: "Administration — Grievance Resolution System" },
      {
        property: "og:description",
        content:
          "University-wide oversight of grievances, departments, escalations and resolution analytics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminDataProvider>
      <RoleLayout role="admin" />
    </AdminDataProvider>
  );
}
