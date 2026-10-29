import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { DepartmentCaseTable, DepartmentScopeBadge } from "@/components/department/DepartmentCaseTable";
import { useDepartmentData } from "@/lib/department-store";

export const Route = createFileRoute("/department/assigned")({
  head: () => ({
    meta: [
      { title: "Assigned Grievances — Department Desk" },
      { name: "description", content: "Every grievance routed to your department desk." },
      { property: "og:title", content: "Assigned Grievances — Department Desk" },
      { property: "og:description", content: "Every grievance routed to your department desk." },
    ],
  }),
  component: AssignedPage,
});

function AssignedPage() {
  const { cases, department } = useDepartmentData();
  return (
    <>
      <PageHeader
        title="Assigned grievances"
        description={`All cases routed to the ${department} desk.`}
        crumbs={[{ label: "Department Desk", to: "/department" }, { label: "Assigned" }]}
        actions={<DepartmentScopeBadge />}
      />
      <DepartmentCaseTable
        rows={cases}
        emptyTitle="No assigned grievances"
        emptyDescription="New cases routed to your department will appear here."
      />
    </>
  );
}
