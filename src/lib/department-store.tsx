import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CURRENT_DEPARTMENT_STAFF,
  departmentActivity,
  departmentNotificationSeed,
  departmentSeed,
  seedEscalations,
} from "./department-data";
import { grievances as baseGrievances } from "./mock-data";
import type {
  ActivityEntry,
  AppNotification,
  Escalation,
  Grievance,
  GrievanceStatus,
  TimelineEntry,
} from "./types";

const TODAY = "2026-09-15";

function stamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

interface DepartmentContextValue {
  department: string;
  staff: typeof CURRENT_DEPARTMENT_STAFF;
  cases: Grievance[];
  escalations: Escalation[];
  activity: ActivityEntry[];
  notifications: AppNotification[];
  findById: (id: string) => Grievance | undefined;
  acknowledge: (id: string) => void;
  updateStatus: (id: string, status: GrievanceStatus, comment: string) => void;
  requestInformation: (id: string, required: string, message: string) => void;
  resolve: (id: string, summary: string, actionTaken: string, date: string) => void;
  escalate: (
    id: string,
    reason: string,
    escalatedTo: Escalation["escalatedTo"],
    comments: string,
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const Ctx = createContext<DepartmentContextValue | null>(null);

export function DepartmentDataProvider({ children }: { children: ReactNode }) {
  const staff = CURRENT_DEPARTMENT_STAFF;

  /** Only statuses that appear after GFM forwards a grievance to a department */
  const DEPT_VISIBLE_STATUSES: GrievanceStatus[] = [
    "DEPARTMENT_ASSIGNED",
    "STAFF_REVIEW",
    "Acknowledged",
    "Under Review",
    "In Progress",
    "Waiting for Student",
    "Resolution Proposed",
    "Resolved",
    "Rejected",
    "Escalated",
    "INFORMATION_REQUESTED",
    "ESCALATED_TO_ADMIN",
  ];

  const [cases, setCases] = useState<Grievance[]>(() =>
    [...departmentSeed, ...baseGrievances]
      .filter((g) => g.department === staff.department)
      .filter(
        (g) =>
          DEPT_VISIBLE_STATUSES.includes(g.status) ||
          g.assignedDepartment === staff.department,
      ),
  );
  const [escalations, setEscalations] = useState<Escalation[]>(seedEscalations);
  const [activity, setActivity] = useState<ActivityEntry[]>(departmentActivity);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    departmentNotificationSeed,
  );

  const log = useCallback((label: string, detail: string, tone: ActivityEntry["tone"]) => {
    setActivity((prev) => [
      { id: `a-${Date.now()}`, label, detail, date: stamp(), tone },
      ...prev,
    ]);
  }, []);

  const apply = useCallback(
    (id: string, status: GrievanceStatus, entry: Omit<TimelineEntry, "id" | "date">) => {
      setCases((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                status,
                assignedTo: g.assignedTo ?? staff.name,
                updatedAt: TODAY,
                timeline: [
                  ...g.timeline,
                  { ...entry, id: `t-${Date.now()}`, date: TODAY },
                ],
              }
            : g,
        ),
      );
    },
    [staff.name],
  );

  const value = useMemo<DepartmentContextValue>(
    () => ({
      department: staff.department,
      staff,
      cases,
      escalations,
      activity,
      notifications,
      findById: (id) => cases.find((g) => g.id === id),
      acknowledge: (id) => {
        apply(id, "Acknowledged", {
          label: "Acknowledged",
          actor: staff.name,
          note: "Case accepted by the department desk.",
        });
        log("Grievance acknowledged", `${id} accepted by ${staff.name}`, "info");
      },
      updateStatus: (id, status, comment) => {
        apply(id, status, {
          label: status,
          actor: staff.name,
          note: comment || `Status changed to ${status}.`,
        });
        log("Status updated", `${id} moved to ${status}`, "warning");
      },
      requestInformation: (id, required, message) => {
        apply(id, "Waiting for Student", {
          label: "Information requested",
          actor: staff.name,
          note: `${required} — ${message}`,
        });
        log("Information requested", `${id} · ${required}`, "warning");
      },
      resolve: (id, summary, actionTaken, date) => {
        setCases((prev) =>
          prev.map((g) =>
            g.id === id
              ? {
                  ...g,
                  status: "Resolved" as GrievanceStatus,
                  updatedAt: date,
                  timeline: [
                    ...g.timeline,
                    {
                      id: `t-${Date.now()}`,
                      label: "Resolved",
                      actor: staff.name,
                      note: `${summary} · Action taken: ${actionTaken}`,
                      date,
                    },
                  ],
                }
              : g,
          ),
        );
        log("Grievance resolved", `${id} marked resolved — student notified`, "success");
      },
      escalate: (id, reason, escalatedTo, comments) => {
        apply(id, "Escalated", {
          label: "Escalated",
          actor: staff.name,
          note: `${reason} — escalated to ${escalatedTo}.`,
        });
        setEscalations((prev) => [
          {
            id: `e-${Date.now()}`,
            grievanceId: id,
            reason,
            escalatedTo,
            comments,
            date: TODAY,
            by: staff.name,
          },
          ...prev,
        ]);
        log("Case escalated", `${id} escalated to ${escalatedTo}`, "critical");
      },
      markNotificationRead: (id) =>
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
      markAllNotificationsRead: () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    }),
    [staff, cases, escalations, activity, notifications, apply, log],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDepartmentData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDepartmentData must be used within DepartmentDataProvider");
  return ctx;
}
