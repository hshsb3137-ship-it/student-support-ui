import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import type { Grievance } from "@/lib/types";

interface Props {
  rows: Grievance[];
  onRowClick?: ((row: Grievance) => void) | undefined;
  loading?: boolean | undefined;
  showStudent?: boolean | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
}

export function GrievanceTable({
  rows,
  onRowClick,
  loading,
  showStudent,
  emptyTitle = "No grievances found",
  emptyDescription = "Try adjusting the filters or search terms.",
}: Props) {
  const columns: Column<Grievance>[] = [
    {
      key: "id",
      header: "ID",
      className: "font-mono text-xs whitespace-nowrap",
      cell: (g) => g.id,
    },
    {
      key: "title",
      header: "Grievance",
      cell: (g) => (
        <div className="min-w-[220px]">
          <p className="font-medium leading-snug">{g.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {g.category}
            {showStudent ? ` · ${g.submittedBy} (${g.studentId})` : ""}
          </p>
        </div>
      ),
    },
    { key: "department", header: "Department", cell: (g) => g.department },
    { key: "priority", header: "Priority", cell: (g) => <PriorityBadge priority={g.priority} /> },
    { key: "status", header: "Status", cell: (g) => <StatusBadge status={g.status} /> },
    {
      key: "updated",
      header: "Last updated",
      className: "whitespace-nowrap text-muted-foreground",
      cell: (g) => g.updatedAt,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(g) => g.id}
      onRowClick={onRowClick}
      loading={loading}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  );
}
