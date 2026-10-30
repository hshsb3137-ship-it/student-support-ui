import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENT_DEPARTMENT_STAFF,
  departmentActivity,
  seedEscalations,
} from "./department-data";
import {
  addEscalationToSharedStore,
  addNotificationToSharedStore,
  getSharedGrievances,
  getSharedNotifications,
  markAllNotificationsReadInSharedStore,
  markNotificationReadInSharedStore,
  subscribeToSharedStore,
  updateGrievanceInSharedStore,
} from "./shared-grievance-store";
import type {
  ActivityEntry,
  AppNotification,
  Escalation,
  Grievance,
  GrievanceStatus,
  TimelineEntry,
} from "./types";

const today = () => new Date().toISOString().slice(0, 10);
const stamp = () => new Date().toISOString().slice(0, 16).replace("T", " ");

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

/** Only statuses that appear after GFM forwards a grievance to a department */
const DEPT_VISIBLE_STATUSES: GrievanceStatus[] = [
  "DEPARTMENT_ASSIGNED",
  "STAFF_REVIEW",
  "Acknowledged",
  "Under Review",
  "In Progress",
  "IN_PROGRESS",
  "Waiting for Student",
  "Resolution Proposed",
  "Resolved",
  "RESOLVED",
  "Rejected",
  "Escalated",
  "ESCALATED",
  "INFORMATION_REQUESTED",
  "ESCALATED_TO_ADMIN",
];

const GFM_EXCLUDED_STATUSES = new Set([
  "GFM_REVIEW",
  "GFM_REJECTED",
  "GFM_INFORMATION_REQUESTED",
  "SUBMITTED",
  "Submitted",
]);

export function DepartmentDataProvider({ children }: { children: ReactNode }) {
  const staff = CURRENT_DEPARTMENT_STAFF;

  const [allGrievances, setAllGrievances] = useState<Grievance[]>(getSharedGrievances);
  const [notifications, setNotifications] = useState<AppNotification[]>(getSharedNotifications);
  const [escalations, setEscalations] = useState<Escalation[]>(seedEscalations);
  const [activity, setActivity] = useState<ActivityEntry[]>(departmentActivity);

  useEffect(() => {
    return subscribeToSharedStore(() => {
      setAllGrievances([...getSharedGrievances()]);
      setNotifications([...getSharedNotifications()]);
    });
  }, []);

  const cases = useMemo(() => {
    return allGrievances.filter((g) => {
      const isMyDept =
        g.department === staff.department || g.assignedDepartment === staff.department;
      if (!isMyDept) return false;
      if (GFM_EXCLUDED_STATUSES.has(g.status)) return false;
      return DEPT_VISIBLE_STATUSES.includes(g.status);
    });
  }, [allGrievances, staff.department]);

  const log = useCallback((label: string, detail: string, tone: ActivityEntry["tone"]) => {
    setActivity((prev) => [
      { id: `a-${Date.now()}`, label, detail, date: stamp(), tone },
      ...prev,
    ]);
  }, []);

  const apply = useCallback(
    (id: string, status: GrievanceStatus, entry: Omit<TimelineEntry, "id" | "date">) => {
      const d = today();
      updateGrievanceInSharedStore(id, (g) => ({
        ...g,
        status,
        assignedTo: g.assignedTo ?? staff.name,
        updatedAt: d,
        timeline: [
          ...g.timeline,
          { ...entry, id: `t-${Date.now()}`, date: d },
        ],
      }));
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
      notifications: notifications.filter((n) => n.audience.includes("department")),
      findById: (id) => cases.find((g) => g.id.toLowerCase() === id.trim().toLowerCase()),

      acknowledge: (id) => {
        apply(id, "STAFF_REVIEW", {
          label: "Staff Review Started",
          actor: staff.name,
          note: `Investigation initiated by ${staff.name} (${staff.designation}).`,
        });
        log("Grievance Review Commenced", `${id} under review by ${staff.name}`, "info");

        addNotificationToSharedStore({
          id: `notif-staff-start-${Date.now()}`,
          title: "Staff Review Started",
          message: `${staff.name} (${staff.department}) commenced review on grievance ${id}.`,
          date: stamp(),
          read: false,
          tone: "info",
          audience: ["student", "department", "admin"],
        });
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
        apply(id, "INFORMATION_REQUESTED", {
          label: "Information Requested",
          actor: staff.name,
          note: `${required} — ${message}`,
        });
        log("Information requested", `${id} · ${required}`, "warning");

        addNotificationToSharedStore({
          id: `notif-dept-info-${Date.now()}`,
          title: "Department Information Request",
          message: `The ${staff.department} department requested additional details for grievance ${id}: ${required}`,
          date: stamp(),
          read: false,
          tone: "warning",
          audience: ["student", "department", "admin"],
        });
      },

      resolve: (id, summary, actionTaken, date) => {
        const d = date || today();
        updateGrievanceInSharedStore(id, (g) => ({
          ...g,
          status: "RESOLVED",
          updatedAt: d,
          timeline: [
            ...g.timeline,
            {
              id: `t-${Date.now()}`,
              label: "Resolved",
              actor: staff.name,
              note: `${summary} · Action taken: ${actionTaken}`,
              date: d,
            },
          ],
        }));

        log("Grievance resolved", `${id} marked resolved — student notified`, "success");

        addNotificationToSharedStore({
          id: `notif-res-${Date.now()}`,
          title: "Grievance Resolved",
          message: `Your grievance ${id} has been resolved by the ${staff.department} department.`,
          date: stamp(),
          read: false,
          tone: "success",
          audience: ["student", "department", "admin"],
        });
      },

      escalate: (id, reason, escalatedTo, comments) => {
        const d = today();
        apply(id, "ESCALATED", {
          label: "Escalated",
          actor: staff.name,
          note: `${reason} — escalated to ${escalatedTo}.`,
        });

        const esc: Escalation = {
          id: `e-${Date.now()}`,
          grievanceId: id,
          reason,
          escalatedTo,
          comments,
          date: d,
          by: staff.name,
        };
        setEscalations((prev) => [esc, ...prev]);

        // Also add to shared escalations for Admin
        addEscalationToSharedStore({
          id: `ESC-${Date.now().toString().slice(-4)}`,
          grievanceId: id,
          fromDepartment: staff.department,
          escalatedTo,
          ...(escalatedTo === "Administrator" ? { assignedOfficer: "Campus Registrar" } : {}),
          reason,
          priority: "High",
          date: d,
          status: "Under Authority Review",
          history: [
            {
              id: `h-${Date.now()}`,
              date: d,
              actor: staff.name,
              note: `Escalated to ${escalatedTo}: ${reason}. ${comments || ""}`.trim(),
            },
          ],
        });

        log("Case escalated", `${id} escalated to ${escalatedTo}`, "critical");

        addNotificationToSharedStore({
          id: `notif-esc-${Date.now()}`,
          title: "Grievance Escalated",
          message: `Grievance ${id} was escalated to ${escalatedTo} by ${staff.name}.`,
          date: stamp(),
          read: false,
          tone: "critical",
          audience: ["student", "department", "admin"],
        });
      },

      markNotificationRead: (id) => markNotificationReadInSharedStore(id),
      markAllNotificationsRead: () => markAllNotificationsReadInSharedStore("department"),
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
