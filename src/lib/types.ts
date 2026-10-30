export type Role = "student" | "gfm" | "department" | "admin";

/**
 * Full set of statuses used across the grievance lifecycle.
 * GFM-prefixed statuses cover the first-level review stage.
 * After DEPARTMENT_ASSIGNED, department staff drive the remaining statuses.
 */
export const GRIEVANCE_STATUSES = [
  // Canonical uppercase statuses
  "SUBMITTED",
  "GFM_REVIEW",
  "GFM_ACCEPTED",
  "GFM_INFORMATION_REQUESTED",
  "GFM_REJECTED",
  "DEPARTMENT_ASSIGNED",
  "STAFF_REVIEW",
  "IN_PROGRESS",
  "INFORMATION_REQUESTED",
  "RESOLVED",
  "ESCALATED",
  // Legacy / titlecase statuses kept for backward compatibility
  "Submitted",
  "Acknowledged",
  "Under Review",
  "In Progress",
  "Waiting for Student",
  "Resolution Proposed",
  "Resolved",
  "Rejected",
  "Escalated",
  "ESCALATED_TO_ADMIN",
] as const;

export type GrievanceStatus = (typeof GRIEVANCE_STATUSES)[number];

/** Human-readable labels for all statuses */
export const STATUS_LABELS: Record<GrievanceStatus, string> = {
  SUBMITTED: "Submitted",
  GFM_REVIEW: "Pending GFM Review",
  GFM_ACCEPTED: "GFM Accepted",
  GFM_INFORMATION_REQUESTED: "Information Requested",
  GFM_REJECTED: "Rejected by GFM",
  DEPARTMENT_ASSIGNED: "Department Assigned",
  STAFF_REVIEW: "Staff Review",
  IN_PROGRESS: "In Progress",
  INFORMATION_REQUESTED: "Information Requested",
  RESOLVED: "Resolved",
  ESCALATED: "Escalated",
  // Legacy / titlecase mappings
  Submitted: "Submitted",
  Acknowledged: "Acknowledged",
  "Under Review": "Under Review",
  "In Progress": "In Progress",
  "Waiting for Student": "Waiting for Student",
  "Resolution Proposed": "Resolution Proposed",
  Resolved: "Resolved",
  Rejected: "Rejected",
  Escalated: "Escalated",
  ESCALATED_TO_ADMIN: "Escalated to Admin",
};

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const DEPARTMENTS = [
  "Academic",
  "Examination",
  "Finance/Fees",
  "Scholarship",
  "Hostel",
  "Library",
  "Transport",
  "Infrastructure",
  "IT",
] as const;

export type DepartmentName = (typeof DEPARTMENTS)[number];

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  department: DepartmentName;
  year: string;
}

export interface Staff {
  id: string;
  staffId: string;
  name: string;
  email: string;
  department: DepartmentName;
  designation: string;
  activeCases: number;
}

export interface Department {
  id: string;
  name: DepartmentName;
  head: string;
  email: string;
  staffCount: number;
  openCases: number;
  avgResolutionDays: number;
}

export interface TimelineEntry {
  id: string;
  label: string;
  actor: string;
  note: string;
  date: string;
}

export interface GrievanceFeedback {
  rating: number;
  comment: string;
  date: string;
}


export interface Grievance {
  id: string;
  title: string;
  description: string;
  category: string;
  department: DepartmentName;
  priority: Priority;
  status: GrievanceStatus;
  submittedBy: string;
  studentId: string;
  assignedTo: string | null;
  submittedAt: string;
  updatedAt: string;
  timeline: TimelineEntry[];
  feedback?: GrievanceFeedback;
  /** GFM review fields — populated when GFM acts on the grievance */
  gfmReviewerId?: string;
  gfmReviewerName?: string;
  gfmReviewDate?: string;
  gfmComments?: string;
  gfmRejectionReason?: string;
  gfmInfoRequest?: string;
  gfmInfoRequestDeadline?: string;
  /** The department GFM selected when forwarding */
  assignedDepartment?: DepartmentName;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  tone: "info" | "success" | "warning" | "critical";
  audience: Role[];
}

/* ---------- Department staff module ---------- */

export interface DepartmentStaff {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: DepartmentName;
}

export interface GrievanceDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export interface AIAnalysis {
  detectedCategory: string;
  detectedIntent: string;
  sentiment: "Positive" | "Neutral" | "Frustrated" | "Distressed";
  priority: Priority;
  suggestedDepartment: DepartmentName;
  duplicateProbability: number;
  summary: string;
}

export interface AIRecommendation {
  policy: string;
  retrievedContext: string;
  recommendedAction: string;
  reasoning: string;
  confidence: number;
  reviewStatus: "Pending review" | "Accepted" | "Modified" | "Rejected";
}

export interface Escalation {
  id: string;
  grievanceId: string;
  reason: string;
  escalatedTo: "Department Head" | "HOD" | "Administrator";
  comments: string;
  date: string;
  by: string;
}

export interface ActivityEntry {
  id: string;
  label: string;
  detail: string;
  date: string;
  tone: "info" | "success" | "warning" | "critical";
}
