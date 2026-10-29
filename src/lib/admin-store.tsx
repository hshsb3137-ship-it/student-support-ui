import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  adminDepartments,
  adminEscalations,
  adminNoticeSeed,
  adminPolicies,
  adminUsers,
  allGrievances,
  type AdminDepartment,
  type AdminEscalation,
  type AdminNotice,
  type AdminUser,
  type EscalationStatus,
  type Policy,
} from "./admin-data";
import type { Grievance, GrievanceStatus } from "./types";

export interface AdminComment {
  id: string;
  author: string;
  note: string;
  date: string;
}

export interface AdminPrefs {
  displayName: string;
  email: string;
  emailAlerts: boolean;
  escalationAlerts: boolean;
  weeklyDigest: boolean;
  slaWarnings: boolean;
}

const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString().slice(0, 16).replace("T", " ");
const ADMIN_NAME = "Dr. Anjali Kamat";

interface Ctx {
  grievances: Grievance[];
  updateGrievance: (id: string, fn: (g: Grievance) => Grievance) => void;
  updateGrievanceStatus: (id: string, status: GrievanceStatus) => void;
  comments: Record<string, AdminComment[]>;
  addGrievanceComment: (id: string, note: string) => void;
  users: AdminUser[];
  saveUser: (u: AdminUser, isNew: boolean) => void;
  toggleUser: (id: string) => void;
  departments: AdminDepartment[];
  saveDepartment: (d: AdminDepartment, isNew: boolean) => void;
  toggleDepartmentStatus: (id: string) => void;
  escalations: AdminEscalation[];
  assignEscalation: (id: string, officer: string) => void;
  updateEscalationStatus: (id: string, status: EscalationStatus) => void;
  addEscalationComment: (id: string, note: string, status?: EscalationStatus) => void;
  policies: Policy[];
  savePolicy: (p: Policy, isNew: boolean) => void;
  deletePolicy: (id: string) => void;
  processPolicy: (id: string) => void;
  togglePolicy: (id: string) => void;
  notices: AdminNotice[];
  markNotice: (id: string, read: boolean) => void;
  markAllNotices: () => void;
  prefs: AdminPrefs;
  setPrefs: (p: AdminPrefs) => void;
}

const AdminCtx = createContext<Ctx | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [grievances, setGrievances] = useState<Grievance[]>(allGrievances);
  const [comments, setComments] = useState<Record<string, AdminComment[]>>({});
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [departments, setDepartments] = useState<AdminDepartment[]>(adminDepartments);
  const [escalations, setEscalations] = useState<AdminEscalation[]>(adminEscalations);
  const [policies, setPolicies] = useState<Policy[]>(adminPolicies);
  const [notices, setNotices] = useState<AdminNotice[]>(adminNoticeSeed);
  const [prefs, setPrefs] = useState<AdminPrefs>({
    displayName: ADMIN_NAME,
    email: "registrar@university.edu",
    emailAlerts: true,
    escalationAlerts: true,
    weeklyDigest: false,
    slaWarnings: true,
  });

  const value = useMemo<Ctx>(
    () => ({
      grievances,
      updateGrievance: (id, fn) =>
        setGrievances((list) => list.map((g) => (g.id === id ? fn(g) : g))),
      updateGrievanceStatus: (id, status) =>
        setGrievances((list) =>
          list.map((g) =>
            g.id === id
              ? {
                  ...g,
                  status,
                  updatedAt: today(),
                  timeline: [
                    ...g.timeline,
                    {
                      id: `t-${Date.now()}`,
                      label: `Status: ${status}`,
                      actor: `${ADMIN_NAME} (Admin)`,
                      note: `Status updated to ${status} by administrator.`,
                      date: today(),
                    },
                  ],
                }
              : g,
          ),
        ),
      comments,
      addGrievanceComment: (id, note) =>
        setComments((c) => ({
          ...c,
          [id]: [...(c[id] ?? []), { id: crypto.randomUUID(), author: ADMIN_NAME, note, date: now() }],
        })),
      users,
      saveUser: (u, isNew) =>
        setUsers((list) => (isNew ? [u, ...list] : list.map((x) => (x.id === u.id ? u : x)))),
      toggleUser: (id) =>
        setUsers((list) =>
          list.map((x) => (x.id === id ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x)),
        ),
      departments,
      saveDepartment: (d, isNew) =>
        setDepartments((list) => (isNew ? [d, ...list] : list.map((x) => (x.id === d.id ? d : x)))),
      toggleDepartmentStatus: (id) =>
        setDepartments((list) =>
          list.map((d) => (d.id === id ? { ...d, status: d.status === "Active" ? "Inactive" : "Active" } : d)),
        ),
      escalations,
      assignEscalation: (id, officer) =>
        setEscalations((list) =>
          list.map((e) =>
            e.id === id
              ? {
                  ...e,
                  assignedOfficer: officer,
                  history: [
                    ...e.history,
                    {
                      id: crypto.randomUUID(),
                      date: today(),
                      actor: `${ADMIN_NAME} (Admin)`,
                      note: `Assigned case to ${officer} for high-level administrative review.`,
                    },
                  ],
                }
              : e,
          ),
        ),
      updateEscalationStatus: (id, status) =>
        setEscalations((list) =>
          list.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status,
                  history: [
                    ...e.history,
                    {
                      id: crypto.randomUUID(),
                      date: today(),
                      actor: `${ADMIN_NAME} (Admin)`,
                      note: `Status marked as "${status}".`,
                    },
                  ],
                }
              : e,
          ),
        ),
      addEscalationComment: (id, note, status) =>
        setEscalations((list) =>
          list.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: status ?? e.status,
                  history: [
                    ...e.history,
                    { id: crypto.randomUUID(), date: today(), actor: `${ADMIN_NAME} (Admin)`, note },
                  ],
                }
              : e,
          ),
        ),
      policies,
      savePolicy: (p, isNew) =>
        setPolicies((list) => (isNew ? [p, ...list] : list.map((x) => (x.id === p.id ? p : x)))),
      deletePolicy: (id) =>
        setPolicies((list) => list.filter((p) => p.id !== id)),
      processPolicy: (id) =>
        setPolicies((list) =>
          list.map((p) =>
            p.id === id
              ? {
                  ...p,
                  processingStatus: "Processed",
                  lastProcessed: now(),
                  chunkCount: Math.floor(Math.random() * 30) + 20,
                }
              : p,
          ),
        ),
      togglePolicy: (id) =>
        setPolicies((list) =>
          list.map((p) => (p.id === id ? { ...p, active: !p.active, updatedAt: today() } : p)),
        ),
      notices,
      markNotice: (id, read) => setNotices((l) => l.map((n) => (n.id === id ? { ...n, read } : n))),
      markAllNotices: () => setNotices((l) => l.map((n) => ({ ...n, read: true }))),
      prefs,
      setPrefs,
    }),
    [grievances, comments, users, departments, escalations, policies, notices, prefs],
  );

  return <AdminCtx.Provider value={value}>{children}</AdminCtx.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdminData must be used inside AdminDataProvider");
  return ctx;
}

export { today as adminToday };
