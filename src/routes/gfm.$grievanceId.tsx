import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileText,
  Info,
  ShieldX,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal } from "@/components/common/Modal";
import { useGFMData } from "@/lib/gfm-store";
import { DEPARTMENTS } from "@/lib/types";
import type { DepartmentName } from "@/lib/types";

export const Route = createFileRoute("/gfm/$grievanceId")({
  head: () => ({ meta: [{ title: "Review Grievance — GFM Portal" }] }),
  component: GFMGrievanceReview,
});

function GFMGrievanceReview() {
  const { grievanceId } = Route.useParams();
  const navigate = useNavigate();
  const { findById, acceptAndForward, reject, requestInfo } = useGFMData();
  const grievance = findById(grievanceId);

  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptDept, setAcceptDept] = useState("");
  const [acceptComments, setAcceptComments] = useState("");
  const [acceptConfirmOpen, setAcceptConfirmOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);
  const [rejectErr, setRejectErr] = useState("");

  const [infoOpen, setInfoOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoDeadline, setInfoDeadline] = useState("");
  const [infoConfirmOpen, setInfoConfirmOpen] = useState(false);
  const [infoErr, setInfoErr] = useState("");

  if (!grievance) {
    return (
      <div className="surface-card p-12 text-center">
        <p className="font-semibold">Grievance not found</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/gfm">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const canAct =
    grievance.status === "GFM_REVIEW" || grievance.status === "GFM_INFORMATION_REQUESTED";

  function handleAcceptSubmit() {
    if (!acceptDept) { toast.error("Please select a department."); return; }
    setAcceptOpen(false);
    setAcceptConfirmOpen(true);
  }
  function handleAcceptConfirm() {
    if (!grievance) return;
    acceptAndForward(grievance.id, acceptDept as DepartmentName, acceptComments);
    toast.success("Grievance forwarded to " + acceptDept + " department.");
    navigate({ to: "/gfm" });
  }

  function handleRejectSubmit() {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      setRejectErr("Please provide a reason (at least 10 characters)."); return;
    }
    setRejectErr(""); setRejectOpen(false); setRejectConfirmOpen(true);
  }
  function handleRejectConfirm() {
    if (!grievance) return;
    reject(grievance.id, rejectReason.trim());
    toast.success("Grievance rejected and student notified.");
    navigate({ to: "/gfm" });
  }

  function handleInfoSubmit() {
    if (!infoMessage.trim() || infoMessage.trim().length < 10) {
      setInfoErr("Please describe the required information (at least 10 characters)."); return;
    }
    setInfoErr(""); setInfoOpen(false); setInfoConfirmOpen(true);
  }
  function handleInfoConfirm() {
    if (!grievance) return;
    requestInfo(grievance.id, infoMessage.trim(), infoDeadline || undefined);
    toast.success("Information request sent to student.");
    navigate({ to: "/gfm" });
  }

  return (
    <>
      <PageHeader
        title="Review Grievance"
        crumbs={[{ label: "GFM Dashboard", to: "/gfm" }, { label: grievance.id }]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/gfm"><ArrowLeft className="mr-2 size-4" />Back to queue</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <div className="surface-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{grievance.id}</p>
                <h2 className="mt-1 font-display text-xl font-semibold">{grievance.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{grievance.category} · submitted {grievance.submittedAt}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority={grievance.priority} />
                <StatusBadge status={grievance.status} />
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 rounded-lg border bg-secondary/40 p-4 text-sm sm:grid-cols-4">
              {[["Student", grievance.submittedBy], ["Student ID", grievance.studentId], ["Category", grievance.category], ["Last updated", grievance.updatedAt]].map(([l, v]) => (
                <div key={l}><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{l}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{grievance.description}</p>
            </div>
          </div>

          {grievance.gfmReviewerName && (
            <div className="surface-card p-5">
              <h3 className="mb-3 font-display text-base font-semibold">GFM Review Details</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Reviewer</dt><dd className="mt-0.5 font-medium">{grievance.gfmReviewerName}</dd></div>
                {grievance.gfmReviewDate && <div><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Review Date</dt><dd className="mt-0.5 font-medium">{grievance.gfmReviewDate}</dd></div>}
                {grievance.gfmComments && <div className="col-span-2 sm:col-span-3"><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Comments</dt><dd className="mt-0.5">{grievance.gfmComments}</dd></div>}
                {grievance.gfmRejectionReason && <div className="col-span-2 sm:col-span-3"><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Rejection Reason</dt><dd className="mt-0.5 text-destructive">{grievance.gfmRejectionReason}</dd></div>}
                {grievance.gfmInfoRequest && <div className="col-span-2 sm:col-span-3"><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Information Requested</dt><dd className="mt-0.5">{grievance.gfmInfoRequest}</dd>{grievance.gfmInfoRequestDeadline && <dd className="text-xs text-muted-foreground">Deadline: {grievance.gfmInfoRequestDeadline}</dd>}</div>}
                {grievance.assignedDepartment && <div><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Forwarded To</dt><dd className="mt-0.5 font-medium">{grievance.assignedDepartment}</dd></div>}
              </dl>
            </div>
          )}

          <div className="surface-card p-6">
            <h3 className="mb-4 font-display text-base font-semibold">Review history</h3>
            <ol className="relative space-y-5 border-l pl-6">
              {grievance.timeline.map((t) => (
                <li key={t.id} className="relative">
                  <span className="absolute -left-[1.9rem] top-1 size-3 rounded-full border-2 border-background bg-primary" />
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.actor} · {t.date}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.note}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-5">
            <h3 className="mb-4 font-display text-base font-semibold">GFM Actions</h3>
            {canAct ? (
              <div className="space-y-3">
                <Button id="btn-accept" className="w-full gap-2" onClick={() => setAcceptOpen(true)}>
                  <CheckCircle className="size-4" />Accept and Forward
                </Button>
                <Button id="btn-info" variant="outline" className="w-full gap-2" onClick={() => setInfoOpen(true)}>
                  <Info className="size-4" />Request Information
                </Button>
                <Button id="btn-reject" variant="destructive" className="w-full gap-2" onClick={() => setRejectOpen(true)}>
                  <ShieldX className="size-4" />Reject
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                <StatusBadge status={grievance.status} className="mb-2" />
                <p className="mt-2">
                  {grievance.status === "DEPARTMENT_ASSIGNED" ? "Forwarded to department." : grievance.status === "GFM_REJECTED" ? "Grievance rejected." : "No action needed at this stage."}
                </p>
              </div>
            )}
          </div>
          <div className="surface-card p-5">
            <h3 className="mb-3 font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide">Quick Info</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><User className="size-4 text-muted-foreground" />{grievance.submittedBy}</li>
              <li className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" />{grievance.category}</li>
              <li className="flex items-center gap-2"><Calendar className="size-4 text-muted-foreground" />Submitted {grievance.submittedAt}</li>
            </ul>
          </div>
        </div>
      </div>

      <Modal open={acceptOpen} onOpenChange={setAcceptOpen} title="Accept and Forward Grievance" description="Select the department to forward this grievance to." footer={<><Button variant="outline" onClick={() => setAcceptOpen(false)}>Cancel</Button><Button id="btn-accept-submit" onClick={handleAcceptSubmit}>Forward</Button></>}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Department *</Label>
            <Select value={acceptDept} onValueChange={setAcceptDept}>
              <SelectTrigger id="accept-dept"><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accept-comments">Comments (optional)</Label>
            <Textarea id="accept-comments" value={acceptComments} onChange={(e) => setAcceptComments(e.target.value)} placeholder="Add context for department staff…" rows={3} />
          </div>
        </div>
      </Modal>
      <ConfirmationDialog open={acceptConfirmOpen} onOpenChange={setAcceptConfirmOpen} title={"Forward to " + (acceptDept || "department") + "?"} description={"This will move the grievance to the " + acceptDept + " department queue and notify the student."} confirmLabel="Yes, forward" onConfirm={handleAcceptConfirm} />

      <Modal open={rejectOpen} onOpenChange={setRejectOpen} title="Reject Grievance" description="Provide a clear reason for rejection. The student will see this." footer={<><Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button><Button id="btn-reject-submit" variant="destructive" onClick={handleRejectSubmit}>Reject</Button></>}>
        <div className="space-y-2">
          <Label htmlFor="reject-reason">Rejection reason *</Label>
          <Textarea id="reject-reason" value={rejectReason} onChange={(e) => { setRejectReason(e.target.value); setRejectErr(""); }} placeholder="Explain why this grievance is being rejected…" rows={4} />
          {rejectErr && <p className="text-xs text-destructive">{rejectErr}</p>}
        </div>
      </Modal>
      <ConfirmationDialog open={rejectConfirmOpen} onOpenChange={setRejectConfirmOpen} title="Reject this grievance?" description="The student will be notified. The grievance will not be forwarded to any department." confirmLabel="Confirm rejection" destructive onConfirm={handleRejectConfirm} />

      <Modal open={infoOpen} onOpenChange={setInfoOpen} title="Request Additional Information" description="Describe the information needed. The student will be notified." footer={<><Button variant="outline" onClick={() => setInfoOpen(false)}>Cancel</Button><Button id="btn-info-submit" onClick={handleInfoSubmit}>Send request</Button></>}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="info-message">Information required *</Label>
            <Textarea id="info-message" value={infoMessage} onChange={(e) => { setInfoMessage(e.target.value); setInfoErr(""); }} placeholder="Describe what documents or details are needed…" rows={4} />
            {infoErr && <p className="text-xs text-destructive">{infoErr}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="info-deadline">Response deadline (optional)</Label>
            <Input id="info-deadline" type="date" value={infoDeadline} onChange={(e) => setInfoDeadline(e.target.value)} />
          </div>
        </div>
      </Modal>
      <ConfirmationDialog open={infoConfirmOpen} onOpenChange={setInfoConfirmOpen} title="Send information request?" description="The student will be notified and the grievance will be updated. Once the student responds, the grievance returns to GFM review." confirmLabel="Send request" onConfirm={handleInfoConfirm} />
    </>
  );
}
