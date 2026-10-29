/**
 * Admin module mock data. Maps to administrative entities:
 * users, departments, escalations, policies, admin_notifications, and exports.
 */
import { grievances } from "./mock-data";
import { departmentSeed } from "./department-data";
import type { DepartmentName, Grievance, Priority, Role } from "./types";

export type AccountStatus = "Active" | "Inactive";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: AccountStatus;
  createdAt: string;
}

export interface AdminDepartment {
  id: string;
  name: string;
  /** Grievance routing key used to count cases. */
  key: DepartmentName | null;
  head: string;
  email: string;
  staffCount: number;
  description: string;
  status: "Active" | "Inactive";
}

export type EscalationStatus =
  | "Open"
  | "Under Authority Review"
  | "Action Required"
  | "Returned to Department"
  | "Resolved by Authority"
  | "Closed";

export interface EscalationHistoryEntry {
  id: string;
  date: string;
  actor: string;
  note: string;
}

export interface AdminEscalation {
  id: string;
  grievanceId: string;
  fromDepartment: DepartmentName;
  escalatedTo: string;
  assignedOfficer?: string;
  reason: string;
  priority: Priority;
  date: string;
  status: EscalationStatus;
  history: EscalationHistoryEntry[];
}

export type PolicyProcessingStatus = "Processed" | "Processing" | "Pending" | "Failed";

export interface Policy {
  id: string;
  title: string;
  category: string;
  description: string;
  documentName: string;
  version: string;
  effectiveDate: string;
  updatedAt: string;
  active: boolean;
  processingStatus: PolicyProcessingStatus;
  lastProcessed: string;
  chunkCount: number;
}

export interface AdminNotice {
  id: string;
  title: string;
  message: string;
  recipient: string;
  date: string;
  read: boolean;
}

export interface ReportStatistics {
  total: number;
  resolved: number;
  pending: number;
  escalated: number;
  resolutionRate: number;
  avgResolutionDays: number;
}

export const ROLE_NAMES: Record<Role, string> = {
  student: "Student",
  gfm: "GFM",
  department: "Department Staff",
  admin: "Admin",
};

/** Every grievance across departments (base + department seed, de-duplicated). */
export const allGrievances: Grievance[] = (() => {
  const map = new Map<string, Grievance>();
  [...grievances, ...departmentSeed].forEach((g) => map.set(g.id, g));
  return [...map.values()];
})();

export const adminUsers: AdminUser[] = [
  { id: "CSE21042", name: "Nishant Bendale", email: "nishant.bendale@university.edu", role: "student", department: "Computer Science", status: "Active", createdAt: "2025-07-14" },
  { id: "ECE22118", name: "Ananya Deshmukh", email: "ananya.deshmukh@university.edu", role: "student", department: "Electronics", status: "Active", createdAt: "2025-07-16" },
  { id: "MEC20077", name: "Rahul Iyer", email: "rahul.iyer@university.edu", role: "student", department: "Mechanical", status: "Active", createdAt: "2024-07-20" },
  { id: "CIV23009", name: "Fatima Sheikh", email: "fatima.sheikh@university.edu", role: "student", department: "Civil", status: "Inactive", createdAt: "2025-08-02" },
  { id: "BBA22056", name: "Sneha Kulkarni", email: "sneha.kulkarni@university.edu", role: "student", department: "Management", status: "Active", createdAt: "2025-07-22" },
  { id: "GFM-0001", name: "Dr. Priya Sharma", email: "gfm@university.edu", role: "gfm", department: "Grievance Cell", status: "Active", createdAt: "2024-01-15" },
  { id: "STF-1088", name: "Prof. S. Balachandran", email: "exam.controller@university.edu", role: "department", department: "Examination", status: "Active", createdAt: "2023-06-01" },
  { id: "STF-1041", name: "Dr. Meera Raghavan", email: "meera.raghavan@university.edu", role: "department", department: "Academics", status: "Active", createdAt: "2023-06-01" },
  { id: "STF-1102", name: "Mr. Arvind Patil", email: "arvind.patil@university.edu", role: "department", department: "Hostel", status: "Active", createdAt: "2024-01-10" },
  { id: "STF-1120", name: "Ms. Kavya Nair", email: "kavya.nair@university.edu", role: "department", department: "Fees", status: "Active", createdAt: "2024-03-18" },
  { id: "STF-1133", name: "Mr. Rohan Joshi", email: "rohan.joshi@university.edu", role: "department", department: "IT Support", status: "Inactive", createdAt: "2024-05-04" },
  { id: "ADM-0001", name: "Dr. Anjali Kamat", email: "registrar@university.edu", role: "admin", department: "Registrar Office", status: "Active", createdAt: "2022-11-01" },
];

export const adminDepartments: AdminDepartment[] = [
  { id: "DEP-EXM", name: "Examination", key: "Examination", head: "Prof. S. Balachandran", email: "exam.cell@university.edu", staffCount: 9, description: "Results, revaluation, hall tickets and exam timetables.", status: "Active" },
  { id: "DEP-ACA", name: "Academics", key: "Academic", head: "Dr. Meera Raghavan", email: "academic.office@university.edu", staffCount: 12, description: "Courses, attendance, faculty and curriculum matters.", status: "Active" },
  { id: "DEP-FEE", name: "Fees", key: "Finance/Fees", head: "Ms. Kavya Nair", email: "accounts@university.edu", staffCount: 6, description: "Fee payments, refunds and receipts.", status: "Active" },
  { id: "DEP-SCH", name: "Scholarship", key: "Scholarship", head: "Dr. Prakash Rao", email: "scholarship@university.edu", staffCount: 4, description: "Scholarship disbursement and eligibility.", status: "Active" },
  { id: "DEP-HOS", name: "Hostel", key: "Hostel", head: "Mr. Arvind Patil", email: "hostel.office@university.edu", staffCount: 8, description: "Hostel rooms, mess and maintenance.", status: "Active" },
  { id: "DEP-LIB", name: "Library", key: "Library", head: "Dr. Sunita Pawar", email: "library@university.edu", staffCount: 5, description: "Books, fines, digital resources.", status: "Active" },
  { id: "DEP-TRN", name: "Transport", key: "Transport", head: "Mr. Vikram Shinde", email: "transport@university.edu", staffCount: 7, description: "Bus routes, passes and timings.", status: "Active" },
  { id: "DEP-ITS", name: "IT Support", key: "IT", head: "Mr. Rohan Joshi", email: "it.helpdesk@university.edu", staffCount: 6, description: "Portal access, Wi-Fi and campus systems.", status: "Active" },
];

export const adminEscalations: AdminEscalation[] = [
  {
    id: "ESC-001", grievanceId: "GRV-2026-0138", fromDepartment: "Examination", escalatedTo: "HOD", assignedOfficer: "Dean of Academic Affairs",
    reason: "Timetable clash needs approval outside the department's authority", priority: "High", date: "2026-09-08", status: "Under Authority Review",
    history: [
      { id: "h1", date: "2026-09-08", actor: "Prof. S. Balachandran", note: "Escalated to HOD — reserve slot allocation needs sign-off." },
      { id: "h2", date: "2026-09-10", actor: "HOD Office", note: "Received; reviewing with the timetable committee." },
    ],
  },
  {
    id: "ESC-002", grievanceId: "GRV-2026-0131", fromDepartment: "Hostel", escalatedTo: "Administrator", assignedOfficer: "Campus Registrar",
    reason: "Repeated water supply failure beyond warden's budget authority", priority: "Critical", date: "2026-09-04", status: "Open",
    history: [{ id: "h1", date: "2026-09-04", actor: "Mr. Arvind Patil", note: "Escalated — repair cost exceeds hostel office limit." }],
  },
  {
    id: "ESC-003", grievanceId: "GRV-2026-0119", fromDepartment: "Finance/Fees", escalatedTo: "Department Head", assignedOfficer: "Finance Officer",
    reason: "Refund delayed over 45 days", priority: "Medium", date: "2026-08-21", status: "Returned to Department",
    history: [
      { id: "h1", date: "2026-08-21", actor: "Ms. Kavya Nair", note: "Escalated for refund approval." },
      { id: "h2", date: "2026-08-26", actor: "Finance Head", note: "Approved; returned to department to process." },
    ],
  },
  {
    id: "ESC-004", grievanceId: "GRV-2026-0107", fromDepartment: "Scholarship", escalatedTo: "Administrator", assignedOfficer: "Registrar Office",
    reason: "Government portal mismatch affecting 30+ students", priority: "High", date: "2026-08-12", status: "Closed",
    history: [
      { id: "h1", date: "2026-08-12", actor: "Dr. Prakash Rao", note: "Escalated — requires Registrar letter to state portal." },
      { id: "h2", date: "2026-08-19", actor: "Registrar Office", note: "Letter issued; matter closed by authority." },
    ],
  },
];

export const adminPolicies: Policy[] = [
  { id: "POL-01", title: "Examination Revaluation Policy", category: "Examination", description: "Revaluation requests must be filed within 10 days of result declaration; outcome within 21 days.", documentName: "revaluation-policy-2026.pdf", version: "v2.1", effectiveDate: "2026-06-12", updatedAt: "2026-06-12", active: true, processingStatus: "Processed", lastProcessed: "2026-06-12 14:30", chunkCount: 38 },
  { id: "POL-02", title: "Fee Refund Guidelines", category: "Fees", description: "Refunds are processed within 30 working days after withdrawal approval.", documentName: "fee-refund-guidelines.pdf", version: "v1.4", effectiveDate: "2026-04-03", updatedAt: "2026-04-03", active: true, processingStatus: "Processed", lastProcessed: "2026-04-03 10:15", chunkCount: 24 },
  { id: "POL-03", title: "Hostel Code of Conduct", category: "Hostel", description: "Rules for residence, maintenance complaints and mess quality standards.", documentName: "hostel-code.pdf", version: "v3.0", effectiveDate: "2026-07-01", updatedAt: "2026-07-01", active: true, processingStatus: "Processed", lastProcessed: "2026-07-01 16:00", chunkCount: 52 },
  { id: "POL-04", title: "Attendance Condonation Rules", category: "Academic", description: "Medical leave condonation up to 10% with verified supporting documents.", documentName: "attendance-condonation.pdf", version: "v1.0", effectiveDate: "2025-12-15", updatedAt: "2025-12-15", active: true, processingStatus: "Processed", lastProcessed: "2025-12-15 09:45", chunkCount: 19 },
  { id: "POL-05", title: "Grievance Redressal Charter (2024)", category: "General", description: "Historical grievance redressal charter retained for university archive and reference.", documentName: "grievance-charter-2024.pdf", version: "v1.0", effectiveDate: "2024-08-01", updatedAt: "2024-08-01", active: false, processingStatus: "Processed", lastProcessed: "2024-08-01 12:00", chunkCount: 45 },
  { id: "POL-06", title: "Anti-Ragging Compliance Guidelines", category: "General", description: "Zero-tolerance anti-ragging measures, reporting protocols, and disciplinary action matrix.", documentName: "anti-ragging-policy.pdf", version: "v2.0", effectiveDate: "2026-01-10", updatedAt: "2026-01-10", active: true, processingStatus: "Processed", lastProcessed: "2026-01-10 11:20", chunkCount: 64 },
];

export const POLICY_CATEGORIES = ["General", "Academic", "Examination", "Fees", "Scholarship", "Hostel", "Library", "Transport", "IT"];

export const adminNoticeSeed: AdminNotice[] = [
  { id: "an-gfm-1", title: "New grievance pending GFM review", message: "GRV-2026-0160 (Marks Discrepancy) submitted by Nishant Bendale is awaiting GFM first-level review.", recipient: "Grievance Cell / Admin", date: "2026-10-20 09:30", read: false },
  { id: "an-gfm-2", title: "Grievance rejected by GFM", message: "GRV-2026-0155 (Library Fine) was rejected by GFM (Dr. Priya Sharma). Outside academic grievance cell purview.", recipient: "Administrator", date: "2026-10-16 11:20", read: true },
  { id: "an-gfm-3", title: "GFM information request issued", message: "Additional documents requested for GRV-2026-0158 (Scholarship) with deadline 2026-10-26.", recipient: "Administrator", date: "2026-10-19 14:15", read: false },
  { id: "an1", title: "Critical grievance escalated", message: "GRV-2026-0131 (Hostel) escalated to Administrator by hostel warden.", recipient: "Administrator", date: "2026-09-04 10:12", read: false },
  { id: "an2", title: "SLA breach warning", message: "5 Examination grievances are past the 7-day turnaround window.", recipient: "Examination Department", date: "2026-09-14 08:30", read: false },
  { id: "an-dept-1", title: "Department action recorded", message: "Examination department started investigation on GRV-2026-0142.", recipient: "Administrator", date: "2026-10-18 16:40", read: true },
  { id: "an4", title: "Monthly report ready", message: "Current monthly grievance digest is ready for executive review.", recipient: "Registrar Office", date: "2026-10-01 09:00", read: true },
  { id: "an5", title: "Policy updated", message: "Hostel Code of Conduct was updated to v3.0.", recipient: "All Staff", date: "2026-07-01 11:20", read: true },
];

export const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"] as const;

export const OPEN_STATUSES = new Set([
  "Submitted",
  "Acknowledged",
  "Under Review",
  "In Progress",
  "Waiting for Student",
  "Resolution Proposed",
  "DEPARTMENT_ASSIGNED",
  "STAFF_REVIEW",
  "INFORMATION_REQUESTED",
]);

export function computeStats(list: Grievance[]): ReportStatistics {
  const resolved = list.filter((g) => g.status === "Resolved" || g.status === "RESOLVED");
  const pending = list.filter((g) => OPEN_STATUSES.has(g.status)).length;
  const escalated = list.filter(
    (g) => g.status === "Escalated" || g.status === "ESCALATED" || g.status === "ESCALATED_TO_ADMIN",
  ).length;
  const days = resolved.map((g) =>
    Math.max(1, Math.round((new Date(g.updatedAt).getTime() - new Date(g.submittedAt).getTime()) / 86400000)),
  );
  const avg = days.length ? days.reduce((a, b) => a + b, 0) / days.length : 0;
  return {
    total: list.length,
    resolved: resolved.length,
    pending,
    escalated,
    resolutionRate: list.length ? Math.round((resolved.length / list.length) * 100) : 0,
    avgResolutionDays: Math.round(avg * 10) / 10,
  };
}

export function monthKey(date: string) {
  const m = new Date(date).getMonth();
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m] ?? "";
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return blob.size;
}

const csvCell = (v: string | number | undefined | null) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCSV(rows: (string | number | undefined | null)[][]) {
  return rows.map((r) => r.map(csvCell).join(",")).join("\n");
}

const xmlEsc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** SpreadsheetML 2003 — opens natively in Excel without extra libraries. */
export function toExcelXML(sheet: string, rows: (string | number | undefined | null)[][]) {
  const body = rows
    .map(
      (r) =>
        `<Row>${r
          .map((c) =>
            typeof c === "number"
              ? `<Cell><Data ss:Type="Number">${c}</Data></Cell>`
              : `<Cell><Data ss:Type="String">${xmlEsc(String(c ?? ""))}</Data></Cell>`,
          )
          .join("")}</Row>`,
    )
    .join("");
  return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="${xmlEsc(sheet)}"><Table>${body}</Table></Worksheet></Workbook>`;
}

// ----------------- Section 11 CSV Exporters -----------------

export function generateAllGrievancesCSV(list: Grievance[]) {
  const headers = [
    "Grievance ID",
    "Title",
    "Student Name",
    "Student ID",
    "Category",
    "Department",
    "Priority",
    "Current Status",
    "GFM Reviewer",
    "Submission Date",
    "Last Updated",
  ];
  const rows = list.map((g) => [
    g.id,
    g.title,
    g.submittedBy,
    g.studentId,
    g.category,
    g.department,
    g.priority,
    g.status,
    g.gfmReviewerName || "Unassigned",
    g.submittedAt,
    g.updatedAt,
  ]);
  return toCSV([headers, ...rows]);
}

export function generateGFMReviewsCSV(list: Grievance[]) {
  const headers = [
    "Grievance ID",
    "Title",
    "Student",
    "GFM Reviewer",
    "Decision",
    "Review Date",
    "Forwarded Department",
    "Rejection Reason",
    "Comments",
  ];
  const gfmCases = list.filter(
    (g) =>
      g.gfmReviewDate ||
      g.status === "GFM_REVIEW" ||
      g.status === "GFM_ACCEPTED" ||
      g.status === "GFM_REJECTED" ||
      g.status === "GFM_INFORMATION_REQUESTED" ||
      g.status === "DEPARTMENT_ASSIGNED",
  );
  const rows = gfmCases.map((g) => [
    g.id,
    g.title,
    g.submittedBy,
    g.gfmReviewerName || "Dr. Priya Sharma",
    g.status,
    g.gfmReviewDate || g.submittedAt,
    g.assignedDepartment || g.department,
    g.gfmRejectionReason || "N/A",
    g.gfmComments || g.gfmInfoRequest || "Standard triage",
  ]);
  return toCSV([headers, ...rows]);
}

export function generateDepartmentPerformanceCSV(departments: AdminDepartment[], list: Grievance[]) {
  const headers = [
    "Department Code",
    "Department Name",
    "Head of Department",
    "Staff Count",
    "Total Assigned",
    "Resolved",
    "Pending Active",
    "Resolution Rate (%)",
    "Avg Resolution Days",
  ];
  const rows = departments.map((d) => {
    // Only count grievances actually forwarded to / in department
    const deptCases = list.filter(
      (g) =>
        g.department === d.key &&
        g.status !== "GFM_REVIEW" &&
        g.status !== "GFM_REJECTED" &&
        g.status !== "Submitted",
    );
    const resolved = deptCases.filter((g) => g.status === "Resolved" || g.status === "RESOLVED").length;
    const pending = deptCases.length - resolved;
    const rate = deptCases.length ? Math.round((resolved / deptCases.length) * 100) : 0;
    return [
      d.id,
      d.name,
      d.head,
      d.staffCount,
      deptCases.length,
      resolved,
      pending,
      rate,
      3.5, // average days
    ];
  });
  return toCSV([headers, ...rows]);
}

export function generateResolutionReportCSV(list: Grievance[]) {
  const headers = [
    "Grievance ID",
    "Title",
    "Department",
    "Priority",
    "Submitted Date",
    "Resolved Date",
    "Turnaround (Days)",
    "Resolver Note",
    "Student Rating",
  ];
  const resolvedCases = list.filter((g) => g.status === "Resolved" || g.status === "RESOLVED");
  const rows = resolvedCases.map((g) => {
    const last = g.timeline[g.timeline.length - 1];
    const days = Math.max(
      1,
      Math.round((new Date(g.updatedAt).getTime() - new Date(g.submittedAt).getTime()) / 86400000),
    );
    return [
      g.id,
      g.title,
      g.department,
      g.priority,
      g.submittedAt,
      g.updatedAt,
      days,
      last?.note || "Resolved according to standard university procedure.",
      g.feedback?.rating ? `${g.feedback.rating}/5` : "Unrated",
    ];
  });
  return toCSV([headers, ...rows]);
}

export function generateEscalationReportCSV(escalations: AdminEscalation[]) {
  const headers = [
    "Escalation ID",
    "Grievance ID",
    "From Department",
    "Escalated To",
    "Assigned Authority",
    "Priority",
    "Escalation Date",
    "Status",
    "Reason",
    "Latest Note",
  ];
  const rows = escalations.map((e) => [
    e.id,
    e.grievanceId,
    e.fromDepartment,
    e.escalatedTo,
    e.assignedOfficer || "Unassigned",
    e.priority,
    e.date,
    e.status,
    e.reason,
    e.history[e.history.length - 1]?.note || "",
  ]);
  return toCSV([headers, ...rows]);
}
