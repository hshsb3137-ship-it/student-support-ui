import type {
  ActivityEntry,
  AIAnalysis,
  AIRecommendation,
  AppNotification,
  DepartmentStaff,
  Escalation,
  Grievance,
  GrievanceDocument,
  Priority,
} from "./types";

/**
 * Department Staff module mock data.
 * Everything here is frontend-only and structured so each export can later be
 * replaced by a single backend query without touching the components.
 */

export const CURRENT_DEPARTMENT_STAFF: DepartmentStaff = {
  id: "st2",
  staffId: "STF-1088",
  name: "Prof. S. Balachandran",
  email: "exam.cell@university.edu",
  phone: "+91 98220 41188",
  designation: "Controller of Examinations",
  department: "Examination",
};

interface StudentProfile {
  name: string;
  studentId: string;
  email: string;
  course: string;
  year: string;
  department: string;
}

export const studentDirectory: Record<string, StudentProfile> = {
  CSE21042: {
    name: "Nishant Bendale",
    studentId: "CSE21042",
    email: "nishant.bendale@university.edu",
    course: "B.Tech Computer Engineering",
    year: "Final Year",
    department: "Computer Engineering",
  },
  ECE22118: {
    name: "Ananya Deshmukh",
    studentId: "ECE22118",
    email: "ananya.deshmukh@university.edu",
    course: "B.Tech Electronics",
    year: "Third Year",
    department: "Electronics Engineering",
  },
  MEC20077: {
    name: "Rahul Iyer",
    studentId: "MEC20077",
    email: "rahul.iyer@university.edu",
    course: "B.Tech Mechanical",
    year: "Fourth Year",
    department: "Mechanical Engineering",
  },
  CIV23009: {
    name: "Fatima Sheikh",
    studentId: "CIV23009",
    email: "fatima.sheikh@university.edu",
    course: "B.Tech Civil",
    year: "Second Year",
    department: "Civil Engineering",
  },
  CSE21103: {
    name: "Kabir Menon",
    studentId: "CSE21103",
    email: "kabir.menon@university.edu",
    course: "B.Tech Computer Engineering",
    year: "Final Year",
    department: "Computer Engineering",
  },
  BBA22056: {
    name: "Sneha Kulkarni",
    studentId: "BBA22056",
    email: "sneha.kulkarni@university.edu",
    course: "BBA",
    year: "Third Year",
    department: "Management Studies",
  },
};

export function lookupStudent(studentId: string, fallbackName: string): StudentProfile {
  return (
    studentDirectory[studentId] ?? {
      name: fallbackName,
      studentId,
      email: `${studentId.toLowerCase()}@university.edu`,
      course: "Not on record",
      year: "Not on record",
      department: "Not on record",
    }
  );
}

const t = (id: string, label: string, actor: string, note: string, date: string) => ({
  id,
  label,
  actor,
  note,
  date,
});

/** Extra Examination-department cases so the staff desk has a realistic workload. */
export const departmentSeed: Grievance[] = [
  {
    id: "GRV-2026-0151",
    title: "Revaluation result pending for Data Structures (CS402)",
    description:
      "I applied for revaluation on 2 August and paid the fee, but the revised result has still not been published. My internship offer depends on the final grade sheet.",
    category: "Revaluation",
    department: "Examination",
    priority: "Critical",
    status: "Submitted",
    submittedBy: "Ananya Deshmukh",
    studentId: "ECE22118",
    assignedTo: null,
    submittedAt: "2026-09-14",
    updatedAt: "2026-09-14",
    timeline: [
      t("t1", "Submitted", "Ananya Deshmukh", "Revaluation receipt attached.", "2026-09-14"),
      t(
        "t2",
        "Auto-classified",
        "Triage Assistant",
        "Routed to Examination · category Revaluation · priority Critical.",
        "2026-09-14",
      ),
    ],
  },
  {
    id: "GRV-2026-0149",
    title: "Hall ticket shows incorrect elective subject",
    description:
      "My hall ticket for the end-semester examination lists Cloud Computing instead of the elective I registered for (Computer Vision).",
    category: "Hall Ticket",
    department: "Examination",
    priority: "High",
    status: "Acknowledged",
    submittedBy: "Kabir Menon",
    studentId: "CSE21103",
    assignedTo: "Prof. S. Balachandran",
    submittedAt: "2026-09-11",
    updatedAt: "2026-09-12",
    timeline: [
      t("t1", "Submitted", "Kabir Menon", "Hall ticket copy uploaded.", "2026-09-11"),
      t(
        "t2",
        "Acknowledged",
        "Prof. S. Balachandran",
        "Case accepted by the Examination desk.",
        "2026-09-12",
      ),
    ],
  },
  {
    id: "GRV-2026-0147",
    title: "Answer sheet photocopy request not processed",
    description:
      "Applied for a certified photocopy of my Thermodynamics answer sheet three weeks ago. No response from the examination section so far.",
    category: "Answer Sheet",
    department: "Examination",
    priority: "Medium",
    status: "Under Review",
    submittedBy: "Rahul Iyer",
    studentId: "MEC20077",
    assignedTo: "Prof. S. Balachandran",
    submittedAt: "2026-09-05",
    updatedAt: "2026-09-13",
    timeline: [
      t("t1", "Submitted", "Rahul Iyer", "Application reference RQ-8821.", "2026-09-05"),
      t("t2", "Acknowledged", "Examination Cell", "Request logged.", "2026-09-07"),
      t(
        "t3",
        "Under Review",
        "Prof. S. Balachandran",
        "Verifying scanning queue with the evaluation section.",
        "2026-09-13",
      ),
    ],
  },
  {
    id: "GRV-2026-0145",
    title: "Backlog exam fee paid twice, receipt not generated",
    description:
      "The examination fee for two backlog papers was debited twice and no receipt was generated for the second payment.",
    category: "Examination Fee",
    department: "Examination",
    priority: "High",
    status: "Waiting for Student",
    submittedBy: "Fatima Sheikh",
    studentId: "CIV23009",
    assignedTo: "Prof. S. Balachandran",
    submittedAt: "2026-09-02",
    updatedAt: "2026-09-10",
    timeline: [
      t("t1", "Submitted", "Fatima Sheikh", "Bank statement attached.", "2026-09-02"),
      t("t2", "Under Review", "Examination Cell", "Payment gateway logs requested.", "2026-09-06"),
      t(
        "t3",
        "Waiting for Student",
        "Prof. S. Balachandran",
        "Asked the student for the UTR number of the duplicate transaction.",
        "2026-09-10",
      ),
    ],
  },
  {
    id: "GRV-2026-0143",
    title: "Grade card shows 'AB' for an attended practical exam",
    description:
      "I appeared for the Signals Lab practical on 20 July, but the grade card marks me absent. Invigilator signature is on the attendance sheet.",
    category: "Marks Discrepancy",
    department: "Examination",
    priority: "High",
    status: "Resolution Proposed",
    submittedBy: "Ananya Deshmukh",
    studentId: "ECE22118",
    assignedTo: "Prof. S. Balachandran",
    submittedAt: "2026-08-29",
    updatedAt: "2026-09-09",
    timeline: [
      t("t1", "Submitted", "Ananya Deshmukh", "Attendance sheet extract attached.", "2026-08-29"),
      t("t2", "Under Review", "Examination Cell", "Cross-checked with lab register.", "2026-09-03"),
      t(
        "t3",
        "Resolution Proposed",
        "Prof. S. Balachandran",
        "Corrected grade card to be issued after the moderation committee sign-off.",
        "2026-09-09",
      ),
    ],
  },
  {
    id: "GRV-2026-0138",
    title: "Supplementary exam timetable clashes with main paper",
    description:
      "The supplementary examination for Microprocessors is scheduled at the same slot as my regular paper on 18 September.",
    category: "Timetable",
    department: "Examination",
    priority: "Critical",
    status: "Escalated",
    submittedBy: "Kabir Menon",
    studentId: "CSE21103",
    assignedTo: "Prof. S. Balachandran",
    submittedAt: "2026-08-25",
    updatedAt: "2026-09-08",
    timeline: [
      t("t1", "Submitted", "Kabir Menon", "Timetable screenshots attached.", "2026-08-25"),
      t("t2", "Under Review", "Examination Cell", "Slot conflict confirmed.", "2026-08-30"),
      t(
        "t3",
        "Escalated",
        "Prof. S. Balachandran",
        "Escalated to the Controller's office — timetable change needs HOD approval.",
        "2026-09-08",
      ),
    ],
  },
  {
    id: "GRV-2026-0132",
    title: "Duplicate mark sheet not issued after fee payment",
    description:
      "Paid the duplicate mark sheet fee on 10 August, still awaiting the printed copy for my visa application.",
    category: "Certificates",
    department: "Examination",
    priority: "Medium",
    status: "Resolved",
    submittedBy: "Rahul Iyer",
    studentId: "MEC20077",
    assignedTo: "Prof. S. Balachandran",
    submittedAt: "2026-08-12",
    updatedAt: "2026-08-30",
    timeline: [
      t("t1", "Submitted", "Rahul Iyer", "Fee receipt uploaded.", "2026-08-12"),
      t("t2", "In Progress", "Examination Cell", "Print request raised.", "2026-08-20"),
      t(
        "t3",
        "Resolved",
        "Prof. S. Balachandran",
        "Duplicate mark sheet handed over at the examination counter.",
        "2026-08-30",
      ),
    ],
  },
  {
    id: "GRV-2026-0128",
    title: "Online exam portal logged me out mid-paper",
    description:
      "During the online mid-semester test the portal logged me out twice and the extra time was not granted.",
    category: "Examination Conduct",
    department: "Examination",
    priority: "Low",
    status: "Rejected",
    submittedBy: "Fatima Sheikh",
    studentId: "CIV23009",
    assignedTo: "Prof. S. Balachandran",
    submittedAt: "2026-08-05",
    updatedAt: "2026-08-18",
    timeline: [
      t("t1", "Submitted", "Fatima Sheikh", "Session log screenshots attached.", "2026-08-05"),
      t(
        "t2",
        "Rejected",
        "Prof. S. Balachandran",
        "Server logs show a stable session; no extra time admissible under clause 4.2.",
        "2026-08-18",
      ),
    ],
  },
];

/** Supporting documents attached by students, keyed by grievance ID. */
export const grievanceDocuments: Record<string, GrievanceDocument[]> = {
  "GRV-2026-0151": [
    { id: "f1", name: "revaluation-receipt.pdf", type: "PDF", size: "184 KB", uploadedAt: "2026-09-14" },
  ],
  "GRV-2026-0149": [
    { id: "f1", name: "hall-ticket.png", type: "PNG", size: "612 KB", uploadedAt: "2026-09-11" },
    { id: "f2", name: "elective-registration.pdf", type: "PDF", size: "96 KB", uploadedAt: "2026-09-11" },
  ],
  "GRV-2026-0145": [
    { id: "f1", name: "bank-statement-aug.pdf", type: "PDF", size: "241 KB", uploadedAt: "2026-09-02" },
  ],
  "GRV-2026-0143": [
    { id: "f1", name: "lab-attendance.jpg", type: "JPG", size: "1.1 MB", uploadedAt: "2026-08-29" },
  ],
  "GRV-2026-0142": [
    { id: "f1", name: "portal-screenshot.png", type: "PNG", size: "421 KB", uploadedAt: "2026-08-18" },
  ],
};

const SENTIMENTS: AIAnalysis["sentiment"][] = ["Neutral", "Frustrated", "Distressed", "Positive"];

const INTENTS: Record<string, string> = {
  Revaluation: "Request re-evaluation of an already declared result",
  "Hall Ticket": "Correct examination registration details",
  "Answer Sheet": "Obtain a certified copy of an evaluated script",
  "Examination Fee": "Claim a refund for a duplicate fee payment",
  "Marks Discrepancy": "Correct an incorrectly recorded assessment mark",
  Timetable: "Resolve a scheduling conflict between two papers",
  Certificates: "Obtain an official academic document",
  "Examination Conduct": "Report an issue with examination conduct",
};

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) % 9973;
  return h;
}

export function analysisFor(g: Grievance): AIAnalysis {
  const h = hash(g.id);
  const sentiment =
    g.priority === "Critical"
      ? "Distressed"
      : g.priority === "High"
        ? "Frustrated"
        : (SENTIMENTS[h % SENTIMENTS.length] ?? "Neutral");
  return {
    detectedCategory: g.category,
    detectedIntent: INTENTS[g.category] ?? "Seek assistance from the concerned department",
    sentiment,
    priority: g.priority,
    suggestedDepartment: g.department,
    duplicateProbability: (h % 22) / 100,
    summary: `Student ${g.submittedBy} reports an issue classified as ${g.category.toLowerCase()} affecting academic records. The model routes this to the ${g.department} desk with ${g.priority.toLowerCase()} urgency based on the wording and the stated deadline pressure.`,
  };
}

const POLICIES: Record<string, { policy: string; context: string; action: string }> = {
  Revaluation: {
    policy: "Examination Manual 2024 · Clause 7.3 — Revaluation timelines",
    context:
      "Revaluation outcomes must be published within 21 working days of the application. Delay beyond this window requires a written status update to the student.",
    action:
      "Fetch the revaluation batch status from the evaluation section, publish the revised result and issue a written apology with the revised date.",
  },
  "Hall Ticket": {
    policy: "Examination Manual 2024 · Clause 3.1 — Registration corrections",
    context:
      "Elective mismatches reported at least 7 days before the paper can be corrected by the Controller without a fine.",
    action: "Verify the elective registration record and reissue a corrected hall ticket the same day.",
  },
  "Examination Fee": {
    policy: "Finance Circular 18/2025 — Duplicate payment refunds",
    context:
      "Duplicate examination fee payments are refunded to the source account within 10 working days of verification.",
    action:
      "Confirm the duplicate UTR with Accounts and raise a refund request; inform the student of the expected credit date.",
  },
  "Marks Discrepancy": {
    policy: "Evaluation Policy · Clause 5.4 — Mark corrections",
    context:
      "Attendance registers and award lists override the digitised grade card. Corrections need moderation committee sign-off.",
    action:
      "Place the corrected award list before the moderation committee and reissue the grade card once approved.",
  },
  Timetable: {
    policy: "Examination Manual 2024 · Clause 6.2 — Slot conflicts",
    context:
      "Where a supplementary paper clashes with a regular paper, the supplementary paper is rescheduled to the reserve slot.",
    action: "Move the supplementary paper to the reserve slot and publish an addendum timetable.",
  },
};

const DEFAULT_POLICY = {
  policy: "Student Grievance Redressal Policy · Clause 2.1 — Response standards",
  context:
    "Every grievance must receive an acknowledgement within 48 hours and a substantive response within 7 working days.",
  action:
    "Acknowledge the case, collect the supporting records from the concerned section and share a dated resolution plan with the student.",
};

export function recommendationFor(g: Grievance): AIRecommendation {
  const base = POLICIES[g.category] ?? DEFAULT_POLICY;
  const h = hash(g.title);
  return {
    policy: base.policy,
    retrievedContext: base.context,
    recommendedAction: base.action,
    reasoning: `The description matches ${g.category.toLowerCase()} precedents in the knowledge base, and the stated deadline pressure supports a ${g.priority.toLowerCase()}-priority handling path. No conflicting decision was found for this student.`,
    confidence: 0.72 + (h % 24) / 100,
    reviewStatus: "Pending review",
  };
}

export const seedEscalations: Escalation[] = [
  {
    id: "e1",
    grievanceId: "GRV-2026-0138",
    reason: "Timetable change requires approval outside the department's authority",
    escalatedTo: "HOD",
    comments: "Two papers in the same slot; reserve slot allocation needs HOD sign-off.",
    date: "2026-09-08",
    by: "Prof. S. Balachandran",
  },
];

export const departmentActivity: ActivityEntry[] = [
  {
    id: "a1",
    label: "New grievance assigned",
    detail: "GRV-2026-0151 · Revaluation result pending — Ananya Deshmukh",
    date: "2026-09-14 09:20",
    tone: "info",
  },
  {
    id: "a2",
    label: "Additional document received",
    detail: "Kabir Menon uploaded elective-registration.pdf for GRV-2026-0149",
    date: "2026-09-13 16:42",
    tone: "info",
  },
  {
    id: "a3",
    label: "Status updated",
    detail: "GRV-2026-0147 moved to Under Review",
    date: "2026-09-13 11:05",
    tone: "warning",
  },
  {
    id: "a4",
    label: "Resolution proposed",
    detail: "Corrected grade card proposed for GRV-2026-0143",
    date: "2026-09-09 15:30",
    tone: "success",
  },
  {
    id: "a5",
    label: "Case escalated",
    detail: "GRV-2026-0138 escalated to HOD — slot conflict",
    date: "2026-09-08 10:12",
    tone: "critical",
  },
];

export const departmentNotificationSeed: AppNotification[] = [
  {
    id: "dn1",
    title: "New grievance assigned",
    message: "GRV-2026-0151 (Revaluation) has been routed to the Examination desk.",
    date: "2026-09-14 09:20",
    read: false,
    tone: "info",
    audience: ["department"],
  },
  {
    id: "dn2",
    title: "High priority case",
    message: "GRV-2026-0149 is flagged High priority — hall ticket correction before the exam date.",
    date: "2026-09-12 08:05",
    read: false,
    tone: "warning",
    audience: ["department"],
  },
  {
    id: "dn3",
    title: "Additional information received",
    message: "Kabir Menon uploaded a new document for GRV-2026-0149.",
    date: "2026-09-13 16:42",
    read: false,
    tone: "info",
    audience: ["department"],
  },
  {
    id: "dn4",
    title: "SLA deadline approaching",
    message: "GRV-2026-0147 breaches the 7-day response window in 24 hours.",
    date: "2026-09-13 07:00",
    read: false,
    tone: "warning",
    audience: ["department"],
  },
  {
    id: "dn5",
    title: "Case escalated",
    message: "GRV-2026-0138 was escalated to the HOD for timetable approval.",
    date: "2026-09-08 10:12",
    read: true,
    tone: "critical",
    audience: ["department"],
  },
  {
    id: "dn6",
    title: "Student replied",
    message: "Fatima Sheikh responded to the information request on GRV-2026-0145.",
    date: "2026-09-11 18:26",
    read: false,
    tone: "info",
    audience: ["department"],
  },
  {
    id: "dn7",
    title: "Resolution approved",
    message: "The moderation committee approved the resolution proposed for GRV-2026-0143.",
    date: "2026-09-10 12:40",
    read: true,
    tone: "success",
    audience: ["department"],
  },
];

export const PRIORITY_ORDER: Record<Priority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/** Mock SLA helper — days left against a 7 working day response window. */
export function slaDaysLeft(g: Grievance): number {
  const submitted = new Date(g.submittedAt).getTime();
  const today = new Date("2026-09-15").getTime();
  const elapsed = Math.floor((today - submitted) / 86400000);
  return 7 - elapsed;
}
