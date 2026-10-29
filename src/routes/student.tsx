import { createFileRoute } from "@tanstack/react-router";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { StudentDataProvider } from "@/lib/student-store";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Portal — Grievance Resolution System" },
      {
        name: "description",
        content: "Submit, track and follow up on your university grievances in one place.",
      },
      { property: "og:title", content: "Student Portal — Grievance Resolution System" },
      {
        property: "og:description",
        content: "Submit, track and follow up on your university grievances in one place.",
      },
    ],
  }),
  component: () => (
    <StudentDataProvider>
      <RoleLayout role="student" />
    </StudentDataProvider>
  ),
});
