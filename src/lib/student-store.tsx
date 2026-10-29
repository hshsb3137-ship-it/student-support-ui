import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { grievances as seed, CURRENT_STUDENT } from "@/lib/mock-data";
import type { DepartmentName, Grievance, Priority, TimelineEntry } from "@/lib/types";

export interface NewGrievanceInput {
  title: string;
  description: string;
  category: string;
  department: DepartmentName;
  priority: Priority;
  attachment?: string | undefined;
}

interface StudentStore {
  all: Grievance[];
  mine: Grievance[];
  addGrievance: (input: NewGrievanceInput) => Grievance;
  withdrawGrievance: (id: string) => void;
  reopenGrievance: (id: string, reason: string) => void;
  addFeedback: (id: string, rating: number, comment: string) => void;
  submitInfo: (id: string, info: string) => void;
  findById: (id: string) => Grievance | undefined;
}

const Ctx = createContext<StudentStore | null>(null);

function today() {
  return new Date().toISOString().slice(0, 10);
}

function entry(label: string, actor: string, note: string): TimelineEntry {
  return { id: `t-${Math.random().toString(36).slice(2, 9)}`, label, actor, note, date: today() };
}

export function StudentDataProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Grievance[]>(seed);

  const addGrievance = useCallback((input: NewGrievanceInput) => {
    const created: Grievance = {
      id: `GRV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      department: input.department,
      priority: input.priority,
      status: "GFM_REVIEW",
      submittedBy: CURRENT_STUDENT.name,
      studentId: CURRENT_STUDENT.studentId,
      assignedTo: null,
      submittedAt: today(),
      updatedAt: today(),
      timeline: [
        entry("Submitted", CURRENT_STUDENT.name, "Grievance filed through the student portal."),
        entry(
          "Pending GFM Review",
          "System",
          "Grievance is awaiting first-level review by the Grievance Forwarding Member.",
        ),
      ],
    };
    setAll((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback((id: string, fn: (g: Grievance) => Grievance) => {
    setAll((prev) => prev.map((g) => (g.id === id ? fn(g) : g)));
  }, []);

  const withdrawGrievance = useCallback(
    (id: string) =>
      update(id, (g) => ({
        ...g,
        status: "Rejected",
        updatedAt: today(),
        timeline: [
          ...g.timeline,
          entry("Withdrawn", g.submittedBy, "The student withdrew this grievance."),
        ],
      })),
    [update],
  );

  const reopenGrievance = useCallback(
    (id: string, reason: string) =>
      update(id, (g) => ({
        ...g,
        status: "Under Review",
        updatedAt: today(),
        timeline: [
          ...g.timeline,
          entry("Reopened", g.submittedBy, reason || "The student reopened this grievance."),
        ],
      })),
    [update],
  );

  const addFeedback = useCallback(
    (id: string, rating: number, comment: string) =>
      update(id, (g) => ({
        ...g,
        updatedAt: today(),
        feedback: { rating, comment, date: today() },
        timeline: [
          ...g.timeline,
          entry("Feedback received", g.submittedBy, `Rated ${rating}/5. ${comment}`.trim()),
        ],
      })),
    [update],
  );

  const submitInfo = useCallback(
    (id: string, info: string) =>
      update(id, (g) => ({
        ...g,
        status: "GFM_REVIEW",
        updatedAt: today(),
        timeline: [
          ...g.timeline,
          entry(
            "Information Submitted",
            g.submittedBy,
            info || "The student submitted the requested information.",
          ),
          entry(
            "Pending GFM Review",
            "System",
            "Grievance returned to GFM queue for review of the submitted information.",
          ),
        ],
      })),
    [update],
  );

  const value = useMemo<StudentStore>(
    () => ({
      all,
      mine: all.filter((g) => g.studentId === CURRENT_STUDENT.studentId),
      addGrievance,
      withdrawGrievance,
      reopenGrievance,
      addFeedback,
      submitInfo,
      findById: (id) => all.find((g) => g.id.toLowerCase() === id.trim().toLowerCase()),
    }),
    [all, addGrievance, withdrawGrievance, reopenGrievance, addFeedback, submitInfo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStudentData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStudentData must be used inside StudentDataProvider");
  return ctx;
}
