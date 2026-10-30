import { grievances as baseGrievances, notifications as baseNotifications } from "./mock-data";
import { departmentSeed, departmentNotificationSeed, seedEscalations } from "./department-data";
import { adminEscalations as baseAdminEscalations } from "./admin-data";
import type { AppNotification, Grievance, Role, Escalation } from "./types";
import type { AdminEscalation } from "./admin-data";

/**
 * Shared in-memory mock store that links Student, GFM, Department Staff, and Admin modules.
 * Changes made in one module immediately propagate to all other active modules via subscriptions.
 */

// Initial seed merging
const initialGrievances: Grievance[] = (() => {
  const map = new Map<string, Grievance>();
  [...baseGrievances, ...departmentSeed].forEach((g) => {
    map.set(g.id, g);
  });
  return [...map.values()];
})();

const initialNotifications: AppNotification[] = [
  ...baseNotifications,
  ...departmentNotificationSeed,
  {
    id: "gfm-notif-seed-1",
    title: "New grievance pending GFM review",
    message: "GRV-2026-0160 (Marks Discrepancy) is awaiting first-level review.",
    date: "2026-10-20 09:30",
    read: false,
    tone: "info",
    audience: ["gfm", "admin"],
  },
  {
    id: "gfm-notif-seed-2",
    title: "Information submitted by student",
    message: "Fatima Sheikh provided details on GRV-2026-0158.",
    date: "2026-10-21 14:15",
    read: false,
    tone: "info",
    audience: ["gfm", "admin"],
  },
];

let sharedGrievances: Grievance[] = [...initialGrievances];
let sharedNotifications: AppNotification[] = [...initialNotifications];
let sharedEscalations: AdminEscalation[] = [...baseAdminEscalations];

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Shared store listener error:", e);
    }
  });
}

export function subscribeToSharedStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSharedGrievances(): Grievance[] {
  return sharedGrievances;
}

export function getSharedNotifications(): AppNotification[] {
  return sharedNotifications;
}

export function getSharedEscalations(): AdminEscalation[] {
  return sharedEscalations;
}

export function addGrievanceToSharedStore(g: Grievance): void {
  sharedGrievances = [g, ...sharedGrievances];
  // Broadcast a notification for GFM and Admin
  addNotificationToSharedStore({
    id: `notif-sub-${Date.now()}`,
    title: "New Grievance Submitted",
    message: `${g.id} (${g.title}) submitted by ${g.submittedBy} is awaiting GFM review.`,
    date: new Date().toISOString().slice(0, 16).replace("T", " "),
    read: false,
    tone: "info",
    audience: ["gfm", "admin", "student"],
  });
  notify();
}

export function updateGrievanceInSharedStore(
  id: string,
  updater: (g: Grievance) => Grievance,
): void {
  let changed = false;
  sharedGrievances = sharedGrievances.map((g) => {
    if (g.id === id) {
      changed = true;
      return updater(g);
    }
    return g;
  });
  if (changed) {
    notify();
  }
}

export function addNotificationToSharedStore(notif: AppNotification): void {
  sharedNotifications = [notif, ...sharedNotifications];
  notify();
}

export function markNotificationReadInSharedStore(id: string): void {
  sharedNotifications = sharedNotifications.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );
  notify();
}

export function markAllNotificationsReadInSharedStore(role?: Role): void {
  sharedNotifications = sharedNotifications.map((n) => {
    if (!role || n.audience.includes(role)) {
      return { ...n, read: true };
    }
    return n;
  });
  notify();
}

export function addEscalationToSharedStore(e: AdminEscalation): void {
  sharedEscalations = [e, ...sharedEscalations];
  notify();
}

export function updateEscalationInSharedStore(
  id: string,
  updater: (e: AdminEscalation) => AdminEscalation,
): void {
  sharedEscalations = sharedEscalations.map((e) => (e.id === id ? updater(e) : e));
  notify();
}

