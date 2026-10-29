import { useState } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  MessageSquarePlus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
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
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import {
  analysisFor,
  grievanceDocuments,
  lookupStudent,
  recommendationFor,
} from "@/lib/department-data";
import { useDepartmentData } from "@/lib/department-store";
import { GRIEVANCE_STATUSES } from "@/lib/types";
import type { Escalation, Grievance, GrievanceStatus } from "@/lib/types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

type Sheet = null | "status" | "info" | "resolve" | "escalate";

export function StaffCaseModal({
  grievance,
  open,
  onOpenChange,
}: {
  grievance: Grievance | undefined;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const store = useDepartmentData();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [status, setStatus] = useState<GrievanceStatus>("Under Review");
  const [comment, setComment] = useState("");
  const [required, setRequired] = useState("");
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [resolveDate, setResolveDate] = useState("2026-09-15");
  const [confirmResolve, setConfirmResolve] = useState(false);
  const [reason, setReason] = useState("");
  const [escalateTo, setEscalateTo] = useState<Escalation["escalatedTo"]>("Department Head");
  const [escComments, setEscComments] = useState("");
  const [review, setReview] = useState<string | null>(null);

  if (!grievance) return null;

  const g = grievance;
  const student = lookupStudent(g.studentId, g.submittedBy);
  const docs = grievanceDocuments[g.id] ?? [];
  const ai = analysisFor(g);
  const rec = recommendationFor(g);
  const history = store.escalations.filter((e) => e.grievanceId === g.id);

  const close = () => setSheet(null);

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={g.title}
        description={`${g.id} · ${g.category}`}
        className="sm:max-w-3xl"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={g.status} />
            <PriorityBadge priority={g.priority} />
            <span className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
              Current Department: {g.department}
            </span>
          </div>

          <section className="surface-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Student information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" value={student.name} />
              <Field label="Student ID" value={student.studentId} />
              <Field label="Email" value={student.email} />
              <Field label="Course" value={student.course} />
              <Field label="Year" value={student.year} />
              <Field label="Department" value={student.department} />
            </div>
          </section>

          <section className="surface-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Grievance information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Grievance ID" value={g.id} />
              <Field label="Category" value={g.category} />
              <Field label="Submission date" value={g.submittedAt} />
              <Field label="Priority" value={g.priority} />
              <Field label="Status" value={g.status} />
              <Field label="Assigned department" value={g.department} />
              <Field label="Assigned officer" value={g.assignedTo ?? "Unassigned"} />
              <Field label="Last updated" value={g.updatedAt} />
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {g.description}
            </p>
          </section>

          <section className="surface-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Supporting documents</h3>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents were attached.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {docs.map((d) => (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm"
                  >
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="font-medium">{d.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.type} · {d.size} · uploaded {d.uploadedAt}
                    </span>
                    <span className="ml-auto flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toast.info(`Preview of ${d.name} (demo)`)}>
                        <Eye className="mr-1.5 size-3.5" /> View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toast.success(`Downloading ${d.name} (demo)`)}>
                        <Download className="mr-1.5 size-3.5" /> Download
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="surface-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">AI Analysis</h3>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                AI Analysis — Demo
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Detected category" value={ai.detectedCategory} />
              <Field label="Detected intent" value={ai.detectedIntent} />
              <Field label="Sentiment" value={ai.sentiment} />
              <Field label="Priority" value={ai.priority} />
              <Field label="Suggested department" value={ai.suggestedDepartment} />
              <Field
                label="Duplicate probability"
                value={`${Math.round(ai.duplicateProbability * 100)}%`}
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{ai.summary}</p>
          </section>

          <section className="surface-card p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Sparkles className="size-4 text-accent-foreground" />
              <h3 className="text-sm font-semibold">AI Resolution Recommendation</h3>
              <span className="rounded-md bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning-foreground">
                AI Recommendation — Human Review Required
              </span>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <Field label="Relevant policy" value={rec.policy} />
              <Field label="Retrieved context" value={rec.retrievedContext} />
              <Field label="Recommended action" value={rec.recommendedAction} />
              <Field label="Reasoning" value={rec.reasoning} />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Confidence</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="h-2 w-40 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round(rec.confidence * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{Math.round(rec.confidence * 100)}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                This suggestion never changes a case on its own — a staff decision is always required.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setReview("Accepted");
                    toast.success("Recommendation accepted", {
                      description: "Apply it using Update status or Resolve.",
                    });
                  }}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReview("Modified");
                    setSummary(rec.recommendedAction);
                    setSheet("resolve");
                  }}
                >
                  Modify
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReview("Rejected");
                    toast.message("Recommendation rejected", {
                      description: "Handled manually by the department desk.",
                    });
                  }}
                >
                  Reject
                </Button>
                {review ? (
                  <span className="self-center text-xs text-muted-foreground">
                    Review status: {review}
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          {history.length > 0 ? (
            <section className="surface-card p-4">
              <h3 className="mb-3 text-sm font-semibold">Escalation history</h3>
              <ul className="flex flex-col gap-3">
                {history.map((e) => (
                  <li key={e.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">
                      Escalated to {e.escalatedTo} · {e.date}
                    </p>
                    <p className="text-muted-foreground">{e.reason}</p>
                    {e.comments ? (
                      <p className="mt-1 text-xs text-muted-foreground">{e.comments}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="surface-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Case timeline</h3>
            <ol className="flex flex-col gap-3">
              {g.timeline.map((e) => (
                <li key={e.id} className="border-l-2 pl-3 text-sm">
                  <p className="font-medium">
                    {e.label} <span className="text-xs text-muted-foreground">· {e.date}</span>
                  </p>
                  <p className="text-muted-foreground">
                    {e.actor} — {e.note}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={g.status !== "Submitted"}
              onClick={() => {
                store.acknowledge(g.id);
                toast.success("Grievance accepted");
              }}
            >
              <CheckCircle2 className="mr-1.5 size-4" /> Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSheet("status")}>
              <RefreshCw className="mr-1.5 size-4" /> Update status
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSheet("info")}>
              <MessageSquarePlus className="mr-1.5 size-4" /> Request information
            </Button>
            <Button size="sm" onClick={() => setSheet("resolve")}>
              <CheckCircle2 className="mr-1.5 size-4" /> Resolve
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSheet("escalate")}>
              <ShieldAlert className="mr-1.5 size-4" /> Escalate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status update */}
      <Modal
        open={sheet === "status"}
        onOpenChange={(v) => (v ? setSheet("status") : close())}
        title="Update status"
        description={`${g.id} · ${g.title}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                store.updateStatus(g.id, status, comment);
                toast.success(`Status updated to ${status}`);
                setComment("");
                close();
              }}
            >
              Update status
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>New status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as GrievanceStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRIEVANCE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Response / comment</Label>
            <Textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain what changed for the student."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Attachment (optional)</Label>
            <Input type="file" />
          </div>
        </div>
      </Modal>

      {/* Request information */}
      <Modal
        open={sheet === "info"}
        onOpenChange={(v) => (v ? setSheet("info") : close())}
        title="Request information"
        description="The case moves to Waiting for Student and the student is notified."
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              disabled={!required.trim()}
              onClick={() => {
                store.requestInformation(g.id, required, message);
                toast.success("Information requested", {
                  description: `${g.submittedBy} has been notified.`,
                });
                setRequired("");
                setMessage("");
                close();
              }}
            >
              Send request
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Information required</Label>
            <Input
              value={required}
              onChange={(e) => setRequired(e.target.value)}
              placeholder="e.g. UTR number of the duplicate payment"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Message</Label>
            <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Attachment (optional)</Label>
            <Input type="file" />
          </div>
        </div>
      </Modal>

      {/* Resolve */}
      <Modal
        open={sheet === "resolve"}
        onOpenChange={(v) => (v ? setSheet("resolve") : close())}
        title="Resolve grievance"
        description={`${g.id} · ${g.title}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button disabled={!summary.trim()} onClick={() => setConfirmResolve(true)}>
              Mark as resolved
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Resolution summary</Label>
            <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Action taken</Label>
            <Textarea
              rows={3}
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Resolution date</Label>
            <Input
              type="date"
              value={resolveDate}
              onChange={(e) => setResolveDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Supporting document (optional)</Label>
            <Input type="file" />
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        open={confirmResolve}
        onOpenChange={setConfirmResolve}
        title="Are you sure you want to mark this grievance as Resolved?"
        description="The student receives a resolution notification and can rate the outcome."
        confirmLabel="Yes, resolve"
        onConfirm={() => {
          store.resolve(g.id, summary, actionTaken, resolveDate);
          toast.success(`Your grievance ${g.id} has been resolved.`, {
            description: `${g.submittedBy} has been notified.`,
          });
          setConfirmResolve(false);
          setSummary("");
          setActionTaken("");
          close();
        }}
      />

      {/* Escalate */}
      <Modal
        open={sheet === "escalate"}
        onOpenChange={(v) => (v ? setSheet("escalate") : close())}
        title="Escalate grievance"
        description={`${g.id} · ${g.title}`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              disabled={!reason.trim()}
              onClick={() => {
                store.escalate(g.id, reason, escalateTo, escComments);
                toast.success(`Escalated to ${escalateTo}`, {
                  description: `${escalateTo} has been notified about ${g.id}.`,
                });
                setReason("");
                setEscComments("");
                close();
              }}
            >
              Escalate case
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Escalation reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Escalate to</Label>
            <Select
              value={escalateTo}
              onValueChange={(v) => setEscalateTo(v as Escalation["escalatedTo"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Department Head">Department Head</SelectItem>
                <SelectItem value="HOD">HOD</SelectItem>
                <SelectItem value="Administrator">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Comments</Label>
            <Textarea
              rows={3}
              value={escComments}
              onChange={(e) => setEscComments(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Supporting document (optional)</Label>
            <Input type="file" />
          </div>
        </div>
      </Modal>
    </>
  );
}
