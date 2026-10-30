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
  addNotificationToSharedStore,
  getSharedGrievances,
  getSharedNotifications,
  markAllNotificationsReadInSharedStore,
  markNotificationReadInSharedStore,
  subscribeToSharedStore,
  updateGrievanceInSharedStore,
} from "./shared-grievance-store";
import type {
  AppNotification,
  DepartmentName,
  Grievance,
  GrievanceStatus,
  TimelineEntry,
} from "./types";

/** The mock GFM reviewer identity */
export const CURRENT_GFM = {
  id: "GFM-0001",
  name: "Dr. Priya Sharma",
  email: "gfm@university.edu",
  designation: "Grievance Forwarding Member",
  department: "Grievance Cell",
};

/** Statuses GFM can see in their active review portal */
const GFM_VISIBLE_STATUSES: GrievanceStatus[] = [
  "GFM_REVIEW",
  "GFM_INFORMATION_REQUESTED",
  "GFM_ACCEPTED",
  "GFM_REJECTED",
  "DEPARTMENT_ASSIGNED",
  "SUBMITTED",
  "Submitted",
];

export interface GFMContextValue {
  all: Grievance[];
  queue: Grievance[];
  notifications: AppNotification[];
  findById: (id: string) => Grievance | undefined;
  acceptAndForward: (id: string, department: DepartmentName, comments: string) => void;
  reject: (id: string, reason: string) => void;
  requestInfo: (id: string, message: string, deadline?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const Ctx = createContext<GFMContextValue | null>(null);

function today() {
  return new Date().toISOString().slice(0, 10);
}

function stamp() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

function makeEntry(label: string, actor: string, note: string): TimelineEntry {
  return {
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label,
    actor,
    note,
    date: today(),
  };
}

export function GFMDataProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Grievance[]>(getSharedGrievances);
  const [notifications, setNotifications] = useState<AppNotification[]>(getSharedNotifications);

  useEffect(() => {
    return subscribeToSharedStore(() => {
      setAll([...getSharedGrievances()]);
      setNotifications([...getSharedNotifications()]);
    });
  }, []);

  const acceptAndForward = useCallback((id: string, department: DepartmentName, comments: string) => {
    updateGrievanceInSharedStore(id, (g) => ({
      ...g,
      status: "DEPARTMENT_ASSIGNED",
      department,
      assignedDepartment: department,
      updatedAt: today(),
      gfmReviewerId: CURRENT_GFM.id,
      gfmReviewerName: CURRENT_GFM.name,
      gfmReviewDate: today(),
      ...(comments ? { gfmComments: comments } : {}),
      timeline: [
        ...g.timeline,
        makeEntry(
          "GFM Accepted",
          CURRENT_GFM.name,
          comments || "Grievance accepted and verified by GFM.",
        ),
        makeEntry(
          "Department Assigned",
          CURRENT_GFM.name,
          `Grievance forwarded to the ${department} department.`,
        ),
      ],
    }));

    addNotificationToSharedStore({
      id: `gn-accept-${Date.now()}`,
      title: "Grievance Accepted & Forwarded",
      message: `Grievance ${id} was accepted by GFM and assigned to ${department}.`,
      date: stamp(),
      read: false,
      tone: "success",
      audience: ["student", "department", "gfm", "admin"],
    });
  }, []);

  const reject = useCallback((id: string, reason: string) => {
    updateGrievanceInSharedStore(id, (g) => ({
      ...g,
      status: "GFM_REJECTED",
      updatedAt: today(),
      gfmReviewerId: CURRENT_GFM.id,
      gfmReviewerName: CURRENT_GFM.name,
      gfmReviewDate: today(),
      gfmRejectionReason: reason,
      timeline: [
        ...g.timeline,
        makeEntry("GFM Rejected", CURRENT_GFM.name, reason),
      ],
    }));

    addNotificationToSharedStore({
      id: `gn-reject-${Date.now()}`,
      title: "Grievance Rejected by GFM",
      message: `Grievance ${id} was rejected by GFM. Reason: ${reason}`,
      date: stamp(),
      read: false,
      tone: "critical",
      audience: ["student", "gfm", "admin"],
    });
  }, []);

  const requestInfo = useCallback((id: string, message: string, deadline?: string) => {
    updateGrievanceInSharedStore(id, (g) => ({
      ...g,
      status: "GFM_INFORMATION_REQUESTED",
      updatedAt: today(),
      gfmReviewerId: CURRENT_GFM.id,
      gfmReviewerName: CURRENT_GFM.name,
      gfmInfoRequest: message,
      ...(deadline ? { gfmInfoRequestDeadline: deadline } : {}),
      timeline: [
        ...g.timeline,
        makeEntry(
          "Information Requested",
          CURRENT_GFM.name,
          deadline ? `${message} (Deadline: ${deadline})` : message,
        ),
      ],
    }));

    addNotificationToSharedStore({
      id: `gn-info-${Date.now()}`,
      title: "Additional Information Required",
      message: `GFM requested additional information for grievance ${id}. Please respond${
        deadline ? ` by ${deadline}` : ""
      }.`,
      date: stamp(),
      read: false,
      tone: "warning",
      audience: ["student", "gfm", "admin"],
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    markNotificationReadInSharedStore(id);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    markAllNotificationsReadInSharedStore("gfm");
  }, []);

  const value = useMemo<GFMContextValue>(
    () => ({
      all,
      queue: all.filter((g) => GFM_VISIBLE_STATUSES.includes(g.status)),
      notifications: notifications.filter((n) => n.audience.includes("gfm")),
      findById: (id) => all.find((g) => g.id.toLowerCase() === id.trim().toLowerCase()),
      acceptAndForward,
      reject,
      requestInfo,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [all, notifications, acceptAndForward, reject, requestInfo, markNotificationRead, markAllNotificationsRead],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGFMData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGFMData must be used within GFMDataProvider");
  return ctx;
}
