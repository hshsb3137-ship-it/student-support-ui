import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CURRENT_STUDENT } from "@/lib/mock-data";
import {
  addGrievanceToSharedStore,
  addNotificationToSharedStore,
  getSharedGrievances,
  subscribeToSharedStore,
  updateGrievanceInSharedStore,
} from "@/lib/shared-grievance-store";
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
  return { id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label, actor, note, date: today() };
}

export function StudentDataProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Grievance[]>(getSharedGrievances);

  useEffect(() => {
    return subscribeToSharedStore(() => {
      setAll([...getSharedGrievances()]);
    });
  }, []);

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
    addGrievanceToSharedStore(created);
    return created;
  }, []);

  const withdrawGrievance = useCallback((id: string) => {
    updateGrievanceInSharedStore(id, (g) => ({
      ...g,
      status: "Rejected",
      updatedAt: today(),
      timeline: [
        ...g.timeline,
        entry("Withdrawn", g.submittedBy, "The student withdrew this grievance."),
      ],
    }));
  }, []);

  const reopenGrievance = useCallback((id: string, reason: string) => {
    updateGrievanceInSharedStore(id, (g) => ({
      ...g,
      status: "GFM_REVIEW",
      updatedAt: today(),
      timeline: [
        ...g.timeline,
        entry("Reopened", g.submittedBy, reason || "The student reopened this grievance."),
        entry("Pending GFM Review", "System", "Awaiting GFM triage after reopening."),
      ],
    }));
  }, []);

  const addFeedback = useCallback((id: string, rating: number, comment: string) => {
    updateGrievanceInSharedStore(id, (g) => ({
      ...g,
      updatedAt: today(),
      feedback: { rating, comment, date: today() },
      timeline: [
        ...g.timeline,
        entry("Feedback received", g.submittedBy, `Rated ${rating}/5. ${comment}`.trim()),
      ],
    }));
  }, []);

  const submitInfo = useCallback((id: string, info: string) => {
    updateGrievanceInSharedStore(id, (g) => {
      const isGFMStage = g.status === "GFM_INFORMATION_REQUESTED";
      const nextStatus = isGFMStage ? "GFM_REVIEW" : "STAFF_REVIEW";
      const timelineEntries = [
        ...g.timeline,
        entry(
          "Information Provided",
          g.submittedBy,
          info || "The student provided the requested information.",
        ),
      ];

      if (isGFMStage) {
        timelineEntries.push(
          entry(
            "Pending GFM Review",
            "System",
            "Grievance returned to GFM queue for review of the submitted information.",
          ),
        );
      } else {
        timelineEntries.push(
          entry(
            "Staff Review Started",
            "System",
            "Grievance returned to department staff for further review.",
          ),
        );
      }

      // Add notification for GFM or department staff
      addNotificationToSharedStore({
        id: `notif-info-res-${Date.now()}`,
        title: "Information Provided by Student",
        message: `${g.submittedBy} submitted the requested information for ${g.id}.`,
        date: new Date().toISOString().slice(0, 16).replace("T", " "),
        read: false,
        tone: "info",
        audience: isGFMStage ? ["gfm", "admin"] : ["department", "admin"],
      });

      return {
        ...g,
        status: nextStatus,
        updatedAt: today(),
        timeline: timelineEntries,
      };
    });
  }, []);

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
