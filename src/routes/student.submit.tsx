import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Paperclip, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudentData } from "@/lib/student-store";
import { CURRENT_STUDENT } from "@/lib/mock-data";
import type { DepartmentName, Priority } from "@/lib/types";

export const Route = createFileRoute("/student/submit")({
  head: () => ({
    meta: [
      { title: "Submit a Grievance — Student Portal" },
      {
        name: "description",
        content:
          "Raise a new grievance with category and supporting documents. Priority and department are assessed automatically.",
      },
      { property: "og:title", content: "Submit a Grievance — Student Portal" },
      {
        property: "og:description",
        content: "Raise a new grievance and let the system route it to the right department.",
      },
    ],
  }),
  component: SubmitGrievance,
});

const CATEGORIES = [
  "Academic",
  "Examination",
  "Fees",
  "Scholarship",
  "Hostel",
  "Library",
  "Transport",
  "Infrastructure",
  "IT/Technical",
  "Other",
] as const;

const CATEGORY_DEPARTMENT: Record<string, DepartmentName> = {
  Academic: "Academic",
  Examination: "Examination",
  Fees: "Finance/Fees",
  Scholarship: "Scholarship",
  Hostel: "Hostel",
  Library: "Library",
  Transport: "Transport",
  Infrastructure: "Infrastructure",
  "IT/Technical": "IT",
  Other: "Academic",
};

const URGENT_WORDS = ["urgent", "immediately", "harassment", "unsafe", "medical", "deadline"];
const HIGH_WORDS = ["refund", "scholarship", "exam", "result", "fee", "blocked"];

function detectPriority(text: string): Priority {
  const t = text.toLowerCase();
  if (URGENT_WORDS.some((w) => t.includes(w))) return "Critical";
  if (HIGH_WORDS.some((w) => t.includes(w))) return "High";
  if (t.length > 240) return "Medium";
  return "Low";
}

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg"];
const MAX_MB = 5;

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(8, { message: "Title must be at least 8 characters" })
    .max(120, { message: "Title must be under 120 characters" }),
  description: z
    .string()
    .trim()
    .min(30, { message: "Please describe the issue in at least 30 characters" })
    .max(2000, { message: "Description must be under 2000 characters" }),
  category: z.string().min(1, { message: "Select a category" }),
});

interface Receipt {
  id: string;
  date: string;
  category: string;
  department: DepartmentName;
}

function SubmitGrievance() {
  const navigate = useNavigate();
  const { addGrievance } = useStudentData();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const priority = useMemo(() => detectPriority(`${title} ${description}`), [title, description]);

  function onFile(file: File | undefined) {
    if (!file) {
      setFileName("");
      setFileError("");
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      setFileName("");
      setFileError("Only PDF, PNG or JPG files are allowed.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setFileName("");
      setFileError(`File must be smaller than ${MAX_MB} MB.`);
      return;
    }
    setFileError("");
    setFileName(`${file.name} (${(file.size / 1024).toFixed(0)} KB)`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ title, description, category });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setErrors({});
    setSubmitting(true);
    const department = CATEGORY_DEPARTMENT[category] ?? "Academic";
    setTimeout(() => {
      const created = addGrievance({
        title,
        description,
        category,
        department,
        priority,
        attachment: fileName || undefined,
      });
      setSubmitting(false);
      setReceipt({
        id: created.id,
        date: created.submittedAt,
        category: created.category,
        department: created.department,
      });
    }, 600);
  }

  if (receipt) {
    return (
      <>
        <PageHeader
          title="Grievance submitted"
          description="Keep your reference number safe — you will need it to track this case."
          crumbs={[{ label: "Student Portal", to: "/student" }, { label: "Submit Grievance" }]}
        />

        <div className="surface-card max-w-2xl p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-primary" />
          <h2 className="mt-4 font-display text-xl font-semibold">
            Your grievance was submitted successfully
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The grievance cell has received your case and it is now queued for review.
          </p>

          <dl className="mt-6 grid gap-4 rounded-lg border bg-secondary/40 p-5 text-left sm:grid-cols-2">
            {[
              ["Grievance ID", receipt.id],
              ["Submission date", receipt.date],
              ["Category", receipt.category],
              ["Assigned department", receipt.department],
              ["Initial status", "Submitted"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-0.5 font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline">
              <Link to="/student/track">Track this grievance</Link>
            </Button>
            <Button asChild>
              <Link to="/student/grievances">View my grievances</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Submit a grievance"
        description="Describe the issue clearly. Accurate details lead to faster resolution."
        crumbs={[{ label: "Student Portal", to: "/student" }, { label: "Submit Grievance" }]}
      />

      <form onSubmit={submit} className="grid gap-5 lg:max-w-3xl" noValidate>
        <section className="surface-card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-display text-base font-semibold sm:col-span-2">
            Student information
          </h2>
          <div className="space-y-2">
            <Label htmlFor="s-id">Student ID</Label>
            <Input id="s-id" value={CURRENT_STUDENT.studentId} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-name">Student name</Label>
            <Input id="s-name" value={CURRENT_STUDENT.name} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-email">Email</Label>
            <Input id="s-email" value={CURRENT_STUDENT.email} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-dept">Department</Label>
            <Input id="s-dept" value={CURRENT_STUDENT.department} readOnly className="bg-muted/50" />
          </div>
        </section>

        <section className="surface-card grid gap-5 p-6">
          <h2 className="font-display text-base font-semibold">Grievance information</h2>

          <div className="space-y-2">
            <Label htmlFor="g-title">Grievance title</Label>
            <Input
              id="g-title"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Excess semester fee not refunded"
            />
            {errors['title'] ? <p className="text-xs text-destructive">{errors['title']}</p> : null}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="sm:max-w-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors['category'] ? <p className="text-xs text-destructive">{errors['category']}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="g-desc">Description</Label>
            <Textarea
              id="g-desc"
              rows={6}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what happened, when it happened and what outcome you expect."
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-destructive">{errors['description'] ?? ""}</span>
              <span>{description.length}/2000 characters</span>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 text-sm sm:grid-cols-2">
            <p className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              Priority will be automatically assessed by the AI system.
            </p>
            <p className="flex items-start gap-2">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              Department will be automatically recommended by the AI system.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="g-file">Supporting document (optional)</Label>
            <label
              htmlFor="g-file"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground transition-colors hover:bg-secondary/50"
            >
              <Paperclip className="size-4" />
              {fileName || `Attach receipts, screenshots or letters — PDF, PNG, JPG up to ${MAX_MB} MB`}
            </label>
            <input
              id="g-file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {fileName ? (
              <button
                type="button"
                onClick={() => setFileName("")}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" /> Remove file
              </button>
            ) : null}
            {fileError ? <p className="text-xs text-destructive">{fileError}</p> : null}
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/student" })}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            <Send className="mr-2 size-4" />
            {submitting ? "Submitting…" : "Submit grievance"}
          </Button>
        </div>
      </form>
    </>
  );
}
