import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { grievances as seed, notifications as notifSeed } from "./mock-data";
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

/** Statuses GFM can see */
const GFM_VISIBLE_STATUSES: GrievanceStatus[] = [
  "GFM_REVIEW",
  "GFM_INFORMATION_REQUESTED",
  "GFM_ACCEPTED",
  "GFM_REJECTED",
  "DEPARTMENT_ASSIGNED",
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

function makeEntry(
  label: string,
  actor: string,
  note: string,
): TimelineEntry {
  return {
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label,
    actor,
    note,
    date: today(),
  };
}

function makeNotification(
  id: string,
  title: string,
  message: string,
  tone: AppNotification["tone"],
): AppNotification {
  return {
    id,
    title,
    message,
    date: stamp(),
    read: false,
    tone,
    audience: ["student", "gfm"],
  };
}

export function GFMDataProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Grievance[]>(seed);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "gn1",
      title: "New grievance pending review",
      message: "GRV-2026-0160 submitted by Nishant Bendale is awaiting GFM review.",
      date: "2026-10-20 09:30",
      read: false,
      tone: "info",
      audience: ["gfm"],
    },
    {
      id: "gn2",
      title: "Information submitted by student",
      message: "Fatima Sheikh responded to the information request on GRV-2026-0158.",
      date: "2026-10-21 14:15",
      read: false,
      tone: "info",
      audience: ["gfm"],
    },
    {
      id: "gn3",
      title: "High priority grievance",
      message: "GRV-2026-0160 (Marks Discrepancy) is flagged High priority.",
      date: "2026-10-20 09:31",
      read: true,
      tone: "warning",
      audience: ["gfm"],
    },
    ...notifSeed.filter((n) => (n.audience as string[]).includes("gfm")),
  ]);

  const update = useCallback((id: string, fn: (g: Grievance) => Grievance) => {
    setAll((prev) => prev.map((g) => (g.id === id ? fn(g) : g)));
  }, []);

  const addNotification = useCallback((notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  const value = useMemo<GFMContextValue>(
    () => ({
      all,
      queue: all.filter((g) => GFM_VISIBLE_STATUSES.includes(g.status)),
      notifications,
      findById: (id) => all.find((g) => g.id.toLowerCase() === id.trim().toLowerCase()),

      acceptAndForward: (id, department, comments) => {
        update(id, (g) => ({
          ...g,
          status: "DEPARTMENT_ASSIGNED" as GrievanceStatus,
          department,
          assignedDepartment: department,
          updatedAt: today(),
          gfmReviewerId: CURRENT_GFM.id,
          gfmReviewerName: CURRENT_GFM.name,
          gfmReviewDate: today(),
          gfmComments: comments || undefined,
          timeline: [
            ...g.timeline,
            makeEntry(
              "GFM Accepted",
              CURRENT_GFM.name,
              comments || "Grievance accepted by GFM.",
            ),
            makeEntry(
              "Department Assigned",
              CURRENT_GFM.name,
              `Grievance forwarded to the ${department} department.`,
            ),
          ],
        }));
        addNotification(
          makeNotification(
            `gn-accept-${Date.now()}`,
            "Your grievance has been accepted",
            `Grievance ${id} was accepted by GFM and forwarded to the ${department} department.`,
            "success",
          ),
        );
      },

      reject: (id, reason) => {
        update(id, (g) => ({
          ...g,
          status: "GFM_REJECTED" as GrievanceStatus,
          updatedAt: today(),
          gfmReviewerId: CURRENT_GFM.id,
          gfmReviewerName: CURRENT_GFM.name,
          gfmReviewDate: today(),
          gfmRejectionReason: reason,
          timeline: [
            ...g.timeline,
            makeEntry("Rejected by GFM", CURRENT_GFM.name, reason),
          ],
        }));
        addNotification(
          makeNotification(
            `gn-reject-${Date.now()}`,
            "Your grievance has been rejected",
            `Grievance ${id} was not accepted by GFM. Reason: ${reason}`,
            "critical",
          ),
        );
      },

      requestInfo: (id, message, deadline) => {
        update(id, (g) => ({
          ...g,
          status: "GFM_INFORMATION_REQUESTED" as GrievanceStatus,
          updatedAt: today(),
          gfmReviewerId: CURRENT_GFM.id,
          gfmReviewerName: CURRENT_GFM.name,
          gfmInfoRequest: message,
          gfmInfoRequestDeadline: deadline,
          timeline: [
            ...g.timeline,
            makeEntry(
              "Information Requested",
              CURRENT_GFM.name,
              deadline ? `${message} (Deadline: ${deadline})` : message,
            ),
          ],
        }));
        addNotification(
          makeNotification(
            `gn-info-${Date.now()}`,
            "Additional information required",
            `GFM has requested additional information for grievance ${id}. Please respond${
              deadline ? ` by ${deadline}` : ""
            }.`,
            "warning",
          ),
        );
      },

      markNotificationRead: (id) =>
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        ),
      markAllNotificationsRead: () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    }),
    [all, notifications, update, addNotification],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGFMData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGFMData must be used within GFMDataProvider");
  return ctx;
}
