import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Hourglass,
  Info,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { analysisFor, grievanceDocuments, lookupStudent } from "@/lib/department-data";
import { useAdminData } from "@/lib/admin-store";
import type { Grievance } from "@/lib/types";

export function AdminGrievanceDrawer({
  grievance,
  onClose,
}: {
  grievance: Grievance | null;
  onClose: () => void;
}) {
  const { comments, addGrievanceComment, escalations } = useAdminData();
  const [note, setNote] = useState("");
  const g = grievance;

  useEffect(() => {
    setNote("");
  }, [g?.id]);

  const ai = g ? analysisFor(g) : null;
  const docs = g ? grievanceDocuments[g.id] ?? [] : [];
  const student = g ? lookupStudent(g.studentId, g.submittedBy) : null;
  const resolution =
    g?.status === "Resolved" || g?.status === "RESOLVED"
      ? g.timeline[g.timeline.length - 1]
      : undefined;

  // Escalation info if matching
  const esc = g ? escalations.find((e) => e.grievanceId === g.id) : null;

  return (
    <Sheet open={!!g} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {g && ai && student ? (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">{g.id}</span>
                <StatusBadge status={g.status} />
                <PriorityBadge priority={g.priority} />
              </div>
              <SheetTitle className="font-display text-base font-semibold text-left">
                {g.title}
              </SheetTitle>
              <SheetDescription className="text-left text-xs">
                Filed by {student.name} ({g.studentId}) on {g.submittedAt} · Last updated {g.updatedAt}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-8 text-sm">
              {/* Primary Metadata */}
              <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/25 p-3 text-xs">
                <div>
                  <dt className="text-muted-foreground font-medium">Student</dt>
                  <dd className="font-semibold text-foreground">{student.name} ({g.studentId})</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">Email</dt>
                  <dd className="font-semibold text-foreground truncate">{student.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">Category</dt>
                  <dd className="font-semibold text-foreground">{g.category}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">Assigned Department</dt>
                  <dd className="font-semibold text-foreground">{g.department}</dd>
                </div>
              </dl>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Grievance Description
                </h4>
                <p className="rounded-md border p-3 text-xs leading-relaxed text-foreground/90 bg-card">
                  {g.description}
                </p>
              </div>

              {/* GFM Decision Section */}
              <section className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                <h4 className="flex items-center gap-2 font-display text-xs font-bold text-primary uppercase tracking-wide">
                  <UserCheck className="size-4" /> GFM First-Level Review Decision
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Reviewer</span>
                    <span className="font-medium text-foreground">
                      {g.gfmReviewerName || (g.status === "GFM_REVIEW" ? "Awaiting GFM Review" : "Dr. Priya Sharma")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Review Date</span>
                    <span className="font-medium text-foreground">{g.gfmReviewDate || g.submittedAt}</span>
                  </div>
                </div>

                {g.gfmRejectionReason ? (
                  <div className="rounded border border-critical/30 bg-critical/10 p-2 text-xs text-critical">
                    <span className="font-semibold block">Rejection Reason:</span>
                    {g.gfmRejectionReason}
                  </div>
                ) : g.gfmInfoRequest ? (
                  <div className="rounded border border-info/30 bg-info/10 p-2 text-xs text-info">
                    <span className="font-semibold block">Information Requested:</span>
                    {g.gfmInfoRequest}
                    {g.gfmInfoRequestDeadline && (
                      <span className="block mt-1 text-[11px] text-muted-foreground">
                        Deadline: {g.gfmInfoRequestDeadline}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    {g.gfmComments || "Grievance accepted by GFM and routed to department."}
                  </p>
                )}
              </section>

              {/* Department Assignment & Staff Actions */}
              <section className="rounded-lg border p-3.5 space-y-2 bg-card">
                <h4 className="flex items-center gap-2 font-display text-xs font-bold text-foreground uppercase tracking-wide">
                  <Clock className="size-4 text-muted-foreground" /> Department Assignment & Staff Actions
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Department Desk</span>
                    <span className="font-medium text-foreground">{g.assignedDepartment || g.department}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Assigned Officer</span>
                    <span className="font-medium text-foreground">{g.assignedTo || "Unassigned"}</span>
                  </div>
                </div>
              </section>

              {/* Escalation Information (if escalated) */}
              {esc || g.status === "Escalated" || g.status === "ESCALATED_TO_ADMIN" ? (
                <section className="rounded-lg border border-critical/30 bg-critical/5 p-3.5 space-y-2">
                  <h4 className="flex items-center gap-2 font-display text-xs font-bold text-critical uppercase tracking-wide">
                    <ShieldAlert className="size-4" /> Escalation Record
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Escalated To</span>
                      <span className="font-medium text-foreground">{esc?.escalatedTo || "Administrator"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Escalation Status</span>
                      <span className="font-semibold text-critical">{esc?.status || "Under Authority Review"}</span>
                    </div>
                  </div>
                  {esc?.reason && (
                    <p className="text-xs text-foreground bg-background/50 p-2 rounded border">
                      <strong>Reason:</strong> {esc.reason}
                    </p>
                  )}
                </section>
              ) : null}

              {/* Resolution Information */}
              <section className="rounded-lg border p-3.5 space-y-2 bg-card">
                <h4 className="flex items-center gap-2 font-display text-xs font-bold text-foreground uppercase tracking-wide">
                  <CheckCircle2 className="size-4 text-success" /> Resolution Information
                </h4>
                {resolution ? (
                  <div className="space-y-1.5 text-xs">
                    <p className="text-foreground font-medium">{resolution.note}</p>
                    <p className="text-muted-foreground text-[11px]">
                      Resolved by {resolution.actor} on {resolution.date}
                    </p>
                    {g.feedback && (
                      <div className="mt-2 rounded bg-muted/40 p-2 text-xs">
                        <span className="font-semibold text-foreground">Student Rating: </span>
                        <span>{g.feedback.rating}/5 stars</span>
                        {g.feedback.comment && (
                          <p className="italic text-muted-foreground mt-0.5">"{g.feedback.comment}"</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Case is currently in progress ({g.status}). No final resolution recorded yet.
                  </p>
                )}
              </section>

              {/* Complete Timeline */}
              <section>
                <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Complete Timeline & Audit Trail
                </h4>
                <ol className="space-y-2.5 border-l-2 border-primary/20 pl-3.5 text-xs">
                  {g.timeline.map((t) => (
                    <li key={t.id} className="relative">
                      <span className="absolute -left-[19px] top-1.5 size-2 rounded-full bg-primary" />
                      <p className="font-semibold text-foreground">{t.label}</p>
                      <p className="text-muted-foreground text-[11px]">{t.note}</p>
                      <p className="text-[10px] text-muted-foreground/75 mt-0.5">
                        {t.actor} · {t.date}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Admin Internal Comments */}
              <section className="border-t pt-4">
                <h4 className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Administrative Notes & Comments
                </h4>
                <ul className="space-y-2">
                  {(comments[g.id] ?? []).map((c) => (
                    <li key={c.id} className="rounded-md bg-muted/40 p-2 text-xs">
                      <p className="text-foreground">{c.note}</p>
                      <span className="block text-[10px] text-muted-foreground mt-1">
                        {c.author} · {c.date}
                      </span>
                    </li>
                  ))}
                </ul>
                <Textarea
                  className="mt-2 text-xs"
                  placeholder="Add administrative note or guidance for department..."
                  value={note}
                  maxLength={500}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button
                  className="mt-2"
                  size="sm"
                  disabled={!note.trim()}
                  onClick={() => {
                    addGrievanceComment(g.id, note.trim());
                    setNote("");
                    toast.success("Administrative comment recorded.");
                  }}
                >
                  Save Note
                </Button>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
