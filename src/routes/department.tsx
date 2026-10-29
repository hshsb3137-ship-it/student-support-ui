import { createFileRoute } from "@tanstack/react-router";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { DepartmentDataProvider } from "@/lib/department-store";

export const Route = createFileRoute("/department")({
  head: () => ({
    meta: [
      { title: "Department Desk — Grievance Resolution System" },
      {
        name: "description",
        content: "Review, action and escalate grievances assigned to your department.",
      },
      { property: "og:title", content: "Department Desk — Grievance Resolution System" },
      {
        property: "og:description",
        content: "Review, action and escalate grievances assigned to your department.",
      },
    ],
  }),
  component: () => (
    <DepartmentDataProvider>
      <RoleLayout role="department" />
    </DepartmentDataProvider>
  ),
});
