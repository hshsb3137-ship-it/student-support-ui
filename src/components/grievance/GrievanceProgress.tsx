import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GrievanceStatus } from "@/lib/types";

const STEPS = [
  "Submitted",
  "Under Review",
  "Department Assigned",
  "In Progress",
  "Resolution Proposed",
  "Resolved",
] as const;

const NEXT_ACTION: Record<GrievanceStatus, string> = {
  Submitted: "Waiting for the grievance cell to review your case.",
  Acknowledged: "The department has acknowledged your case and will begin the review shortly.",
  "Waiting for Student": "The department needs additional information from you to continue.",
  "Under Review": "The grievance cell is verifying details before assigning a department.",
  "In Progress": "The assigned department is working on a resolution.",
  "Resolution Proposed": "Review the proposed resolution and share your feedback.",
  Resolved: "Closed. You can reopen it within 7 days if the issue persists.",
  Rejected: "Closed without action. Reopen with more details if needed.",
  Escalated: "Escalated to the administration for priority handling.",
};

function stepIndex(status: GrievanceStatus) {
  switch (status) {
    case "Submitted":
      return 0;
    case "Under Review":
      return 1;
    case "In Progress":
      return 3;
    case "Resolution Proposed":
      return 4;
    case "Resolved":
      return 5;
    case "Escalated":
      return 3;
    case "Rejected":
      return 1;
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
