import { useEffect, useState } from "react";
import { AlertCircle, Clock, Info, Send, ShieldX, Sparkles, Star } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { GrievanceProgress } from "./GrievanceProgress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Grievance } from "@/lib/types";

interface Props {
  grievance: Grievance | null;
  onClose: () => void;
  studentActions?: boolean | undefined;
  onWithdraw?: ((id: string) => void) | undefined;
  onReopen?: ((id: string, reason: string) => void) | undefined;
  onFeedback?: ((id: string, rating: number, comment: string) => void) | undefined;
  onSubmitInfo?: ((id: string, info: string) => void) | undefined;
}

function mockSentiment(priority: Grievance["priority"]) {
  if (priority === "Critical") return "Highly negative";
  if (priority === "High") return "Negative";
  if (priority === "Medium") return "Concerned";
  return "Neutral";
}

export function GrievanceDetailModal({
  grievance,
  onClose,
  studentActions,
  onWithdraw,
  onReopen,
  onFeedback,
  onSubmitInfo,
}: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [showReopen, setShowReopen] = useState(false);
  const [infoText, setInfoText] = useState("");
  const [showInfoForm, setShowInfoForm] = useState(false);

  useEffect(() => {
    setRating(0);
    setComment("");
    setReopenReason("");
    setShowReopen(false);
    setInfoText("");
    setShowInfoForm(false);
  }, [grievance?.id]);

  const closed = grievance
    ? ["Resolved", "RESOLVED", "Rejected", "GFM_REJECTED"].includes(grievance.status)
    : false;
  const canWithdraw = grievance
    ? ["Submitted", "SUBMITTED", "Under Review", "GFM_REVIEW"].includes(grievance.status)
    : false;

  const isInfoRequested = grievance
    ? grievance.status === "GFM_INFORMATION_REQUESTED" ||
      grievance.status === "INFORMATION_REQUESTED" ||
      grievance.status === "Waiting for Student"
    : false;

  const isRejected = grievance
    ? grievance.status === "GFM_REJECTED" || grievance.status === "Rejected"
    : false;

  return (
    <Modal
      open={Boolean(grievance)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={grievance?.title ?? ""}
      description={grievance ? `${grievance.id} · filed ${grievance.submittedAt}` : undefined}
      className="sm:max-w-2xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {grievance ? (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={grievance.status} />
            <PriorityBadge priority={grievance.priority} />
          </div>

          {isRejected && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldX className="size-4" />
                <span>Grievance Rejected</span>
              </div>
              <p className="text-foreground">
                {grievance.gfmRejectionReason || "This grievance was reviewed and rejected."}
              </p>
            </div>
          )}

          {isInfoRequested && (
            <div className="rounded-lg border border-info/30 bg-info/10 p-3.5 text-xs text-info space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Info className="size-4" />
                <span>Information Requested by Reviewer</span>
              </div>
              <p className="text-foreground">
                {grievance.gfmInfoRequest || "Additional details or verification documents are required to proceed with review."}
              </p>
              {grievance.gfmInfoRequestDeadline && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" /> Response requested by: <strong>{grievance.gfmInfoRequestDeadline}</strong>
                </p>
              )}
            </div>
          )}

          <GrievanceProgress status={grievance.status} />

          <p className="text-sm leading-relaxed text-muted-foreground">{grievance.description}</p>

          <dl className="grid grid-cols-2 gap-4 rounded-lg border bg-secondary/40 p-4 text-sm sm:grid-cols-3">
            {[
              ["Department", grievance.department],
              ["Category", grievance.category],
              ["Assigned to", grievance.assignedTo ?? "Unassigned"],
              ["Submitted by", grievance.submittedBy],
              ["Student ID", grievance.studentId],
              ["Last updated", grievance.updatedAt],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-0.5 font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h4 className="text-sm font-semibold">AI Analysis — Demo</h4>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Sample values. Real analysis is added when the AI services are connected.
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {[
                ["Detected category", grievance.category],
                ["Detected sentiment", mockSentiment(grievance.priority)],
                ["Detected priority", grievance.priority],
                ["Suggested department", grievance.department],
                ["Duplicate check", "No duplicates found"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-0.5 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">AI summary: </span>
              {`A ${grievance.priority.toLowerCase()}-priority ${grievance.category.toLowerCase()} issue routed to the ${grievance.department} department; currently ${grievance.status.toLowerCase()}.`}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Resolution timeline</h4>
            <ol className="space-y-4 border-l pl-5">
              {grievance.timeline.map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[26px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-background" />
                  <p className="text-sm font-medium">{entry.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.actor} · {entry.date}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>
                </li>
              ))}
            </ol>
          </div>

          {grievance.feedback ? (
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-semibold">Your feedback</h4>
              <div className="mt-1 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "size-4",
                      n <= grievance.feedback!.rating
                        ? "fill-accent text-accent"
                        : "text-muted-foreground",
                    )}
                  />
                ))}
              </div>
              {grievance.feedback.comment ? (
                <p className="mt-2 text-sm text-muted-foreground">{grievance.feedback.comment}</p>
              ) : null}
            </div>
          ) : null}

          {studentActions ? (
            <div className="space-y-4 border-t pt-4">
              {isInfoRequested && onSubmitInfo ? (
                <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                    <Send className="size-4 text-primary" /> Respond to Information Request
                  </h4>
                  <Textarea
                    rows={3}
                    value={infoText}
                    onChange={(e) => setInfoText(e.target.value)}
                    placeholder="Enter the requested information or clarification here..."
                    maxLength={1000}
                  />
                  <Button
                    size="sm"
                    disabled={!infoText.trim()}
                    onClick={() => {
                      onSubmitInfo(grievance.id, infoText.trim());
                      setInfoText("");
                      onClose();
                    }}
                  >
                    Submit Requested Information
                  </Button>
                </div>
              ) : null}

              {closed && !grievance.feedback && onFeedback ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Rate this resolution</h4>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`Rate ${n} out of 5`}
                        onClick={() => setRating(n)}
                      >
                        <Star
                          className={cn(
                            "size-6 transition-colors",
                            n <= rating ? "fill-accent text-accent" : "text-muted-foreground",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    placeholder="Tell us how the resolution went (optional)"
                  />
                  <Button
                    size="sm"
                    disabled={rating === 0}
                    onClick={() => onFeedback(grievance.id, rating, comment.trim())}
                  >
                    Submit feedback
                  </Button>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {canWithdraw && onWithdraw ? (
                  <Button variant="outline" size="sm" onClick={() => onWithdraw(grievance.id)}>
                    Withdraw grievance
                  </Button>
                ) : null}
                {closed && onReopen ? (
                  <Button variant="outline" size="sm" onClick={() => setShowReopen((v) => !v)}>
                    Reopen case
                  </Button>
                ) : null}
              </div>

              {showReopen && onReopen ? (
                <div className="space-y-2">
                  <Textarea
                    rows={3}
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    maxLength={500}
                    placeholder="Why are you reopening this grievance?"
                  />
                  <Button
                    size="sm"
                    disabled={!reopenReason.trim()}
                    onClick={() => onReopen(grievance.id, reopenReason.trim())}
                  >
                    Confirm reopen
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
