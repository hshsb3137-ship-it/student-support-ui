import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GrievanceStatus } from "@/lib/types";

const STEPS = [
  "Submitted",
  "GFM Review",
  "Department Assigned",
  "Staff Review",
  "In Progress",
  "Resolved",
] as const;

const NEXT_ACTION: Record<GrievanceStatus, string> = {
  SUBMITTED: "Your grievance has been submitted and is awaiting GFM first-level review.",
  Submitted: "Your grievance has been submitted and is awaiting GFM first-level review.",
  GFM_REVIEW: "Awaiting first-level review by the Grievance Forwarding Member (GFM).",
  GFM_ACCEPTED: "Accepted by GFM and assigned to the relevant department.",
  GFM_INFORMATION_REQUESTED: "GFM requested additional information. Please submit the requested details.",
  GFM_REJECTED: "Grievance was rejected by GFM. Please inspect the rejection reason.",
  DEPARTMENT_ASSIGNED: "Forwarded to the department desk. Awaiting department staff review.",
  STAFF_REVIEW: "Department staff has commenced review on your grievance.",
  IN_PROGRESS: "The assigned department is actively resolving your grievance.",
  "In Progress": "The assigned department is actively resolving your grievance.",
  Acknowledged: "The department has acknowledged your case and will begin review shortly.",
  "Under Review": "Department staff is investigating and working on the case.",
  "Waiting for Student": "The department needs additional information from you to continue.",
  INFORMATION_REQUESTED: "The department requested additional information from you.",
  "Resolution Proposed": "Review the proposed resolution and share your feedback.",
  RESOLVED: "Grievance has been resolved. You can submit feedback or reopen if needed.",
  Resolved: "Grievance has been resolved. You can submit feedback or reopen if needed.",
  Rejected: "Closed without action. Reopen with more details if needed.",
  ESCALATED: "Escalated to senior administration for priority handling.",
  Escalated: "Escalated to senior administration for priority handling.",
  ESCALATED_TO_ADMIN: "Escalated to senior administration for high-level review.",
};

function stepIndex(status: GrievanceStatus) {
  switch (status) {
    case "SUBMITTED":
    case "Submitted":
      return 0;
    case "GFM_REVIEW":
    case "GFM_INFORMATION_REQUESTED":
    case "GFM_REJECTED":
      return 1;
    case "GFM_ACCEPTED":
    case "DEPARTMENT_ASSIGNED":
      return 2;
    case "STAFF_REVIEW":
    case "Acknowledged":
    case "Under Review":
      return 3;
    case "IN_PROGRESS":
    case "In Progress":
    case "Waiting for Student":
    case "INFORMATION_REQUESTED":
    case "Resolution Proposed":
    case "ESCALATED":
    case "Escalated":
    case "ESCALATED_TO_ADMIN":
      return 4;
    case "RESOLVED":
    case "Resolved":
      return 5;
    default:
      return 0;
  }
}

export function GrievanceProgress({ status }: { status: GrievanceStatus }) {
  const current = stepIndex(status);

  return (
    <div>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={step} className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-2">
              <div className="flex items-center sm:w-full">
                <span className="hidden h-0.5 flex-1 bg-border sm:block first:invisible" />
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-primary/10 text-primary ring-4 ring-primary/10",
                    !done && !active && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden h-0.5 flex-1 sm:block",
                    done ? "bg-primary" : "bg-border",
                    i === STEPS.length - 1 && "invisible",
                  )}
                />
              </div>
              <p
                className={cn(
                  "text-xs sm:px-1 sm:text-center",
                  active ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {step}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 rounded-lg border bg-secondary/40 p-3 text-sm">
        <p className="font-medium">Current status: {status}</p>
        <p className="mt-0.5 text-muted-foreground">{NEXT_ACTION[status]}</p>
      </div>
    </div>
  );
}
