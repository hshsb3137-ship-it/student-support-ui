import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { GrievanceListPage } from "@/components/grievance/GrievanceListPage";
import { useStudentData } from "@/lib/student-store";

export const Route = createFileRoute("/student/grievances")({
  head: () => ({
    meta: [
      { title: "My Grievances — Student Portal" },
      {
        name: "description",
        content: "Filter and review every grievance you have raised with the university.",
      },
      { property: "og:title", content: "My Grievances — Student Portal" },
      {
        property: "og:description",
        content: "Filter and review every grievance you have raised with the university.",
      },
    ],
  }),
  component: MyGrievances,
});

function MyGrievances() {
  const { mine, withdrawGrievance, reopenGrievance, addFeedback, submitInfo } = useStudentData();

  return (
    <GrievanceListPage
      title="My grievances"
      description="Every case you have raised, with live status and history."
      crumbs={[{ label: "Student Portal", to: "/student" }, { label: "My Grievances" }]}
      rows={mine}
      showDepartmentFilter
      studentActions
      onWithdraw={(id) => {
        withdrawGrievance(id);
        toast.success("Grievance withdrawn", { description: id });
      }}
      onReopen={(id, reason) => {
        reopenGrievance(id, reason);
        toast.success("Grievance reopened", { description: id });
      }}
      onFeedback={(id, rating, comment) => {
        addFeedback(id, rating, comment);
        toast.success("Thanks for your feedback", { description: `${rating}/5 for ${id}` });
      }}
      onSubmitInfo={(id, info) => {
        submitInfo(id, info);
        toast.success("Information submitted to reviewer", {
          description: `Case ${id} returned for review.`,
        });
      }}
      emptyTitle="No grievances yet"
      emptyDescription="Submit a grievance and it will appear here."
    />
  );
}
