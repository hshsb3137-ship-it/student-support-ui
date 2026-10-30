import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle,
  Download,
  Eye,
  FilterX,
  MessageSquare,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NativeSelect, tdClass, thClass } from "@/components/admin/AdminUI";
import { useAdminData } from "@/lib/admin-store";
import {
  downloadFile,
  generateEscalationReportCSV,
  type AdminEscalation,
  type EscalationStatus,
} from "@/lib/admin-data";
import { DEPARTMENTS, PRIORITIES } from "@/lib/types";

export const Route = createFileRoute("/admin/escalations")({
  head: () => ({
    meta: [
      { title: "Escalation Management — Administration" },
      { name: "description", content: "Monitor, assign, and resolve escalated grievances with administrative authorities." },
      { property: "og:title", content: "Escalation Management — Administration" },
      { property: "og:description", content: "Monitor, assign, and resolve escalated grievances with administrative authorities." },
    ],
  }),
  component: EscalationsPage,
});

const ESCALATION_STATUS_OPTIONS = [
  "Open",
  "Under Authority Review",
  "Action Required",
  "Returned to Department",
  "Resolved by Authority",
  "Closed",
] as const;

const AUTHORITIES = [
  "Campus Registrar",
  "Dean of Academic Affairs",
  "Controller of Examinations",
  "Chief Warden & Estate Officer",
  "Finance & Accounts Officer",
  "University Student Ombudsman",
];

function EscalationsPage() {
  const {
    escalations,
    assignEscalation,
    updateEscalationStatus,
    addEscalationComment,
    updateGrievanceStatus,
  } = useAdminData();

  const [q, setQ] = useState("");
  const [pri, setPri] = useState("all");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Handlers and authority bodies represented in escalations
  const assignedList = Array.from(
    new Set(
      escalations
        .map((e) => e.assignedOfficer || e.escalatedTo)
        .filter(Boolean),
    ),
  ).sort() as string[];

  // Selected item for viewing & detail modal
  const [activeEscalation, setActiveEscalation] = useState<AdminEscalation | null>(null);
  const [note, setNote] = useState("");

  // Assign officer state
  const [assigningEsc, setAssigningEsc] = useState<AdminEscalation | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<string>(AUTHORITIES[0] ?? "");

  // Confirmation dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
    destructive?: boolean | undefined;
    confirmLabel?: string | undefined;
  }>({
    open: false,
    title: "",
    description: "",
    action: () => {},
  });

  const hasActiveFilters = Boolean(
    q ||
      pri !== "all" ||
      dept !== "all" ||
      status !== "all" ||
      assignedFilter !== "all" ||
      fromDate ||
      toDate,
  );

  function resetFilters() {
    setQ("");
    setPri("all");
    setDept("all");
    setStatus("all");
    setAssignedFilter("all");
    setFromDate("");
    setToDate("");
  }

  const rows = escalations.filter((e) => {
    const term = q.trim().toLowerCase();
    if (
      term &&
      !(
        e.id.toLowerCase().includes(term) ||
        e.grievanceId.toLowerCase().includes(term) ||
        e.reason.toLowerCase().includes(term) ||
        e.fromDepartment.toLowerCase().includes(term) ||
        e.escalatedTo.toLowerCase().includes(term) ||
        (e.assignedOfficer && e.assignedOfficer.toLowerCase().includes(term))
      )
    ) {
      return false;
    }

    if (pri !== "all" && e.priority !== pri) return false;
    if (dept !== "all" && e.fromDepartment !== dept) return false;
    if (status !== "all" && e.status !== status) return false;

    if (assignedFilter === "unassigned") {
      if (e.assignedOfficer) return false;
    } else if (
      assignedFilter !== "all" &&
      e.assignedOfficer !== assignedFilter &&
      e.escalatedTo !== assignedFilter
    ) {
      return false;
    }

    if (fromDate && e.date < fromDate) return false;
    if (toDate && e.date > toDate) return false;

    return true;
  });

  function triggerStatusChange(
    e: AdminEscalation,
    targetStatus: EscalationStatus,
    label: string,
    destructive = false,
  ) {
    setConfirmConfig({
      open: true,
      title: `Mark escalation as ${label}?`,
      description: `Case ${e.id} (${e.grievanceId}) will be marked as "${targetStatus}" in the administrative register.`,
      confirmLabel: `Mark as ${label}`,
      destructive,
      action: () => {
        updateEscalationStatus(e.id, targetStatus);
        if (targetStatus === "Resolved by Authority") {
          updateGrievanceStatus(e.grievanceId, "Resolved");
        }
        toast.success(`Escalation ${e.id} marked as "${targetStatus}"`);
        setConfirmConfig((prev) => ({ ...prev, open: false }));
        // Update active modal view if open
        if (activeEscalation?.id === e.id) {
          setActiveEscalation((prev) => (prev ? { ...prev, status: targetStatus } : null));
        }
      },
    });
  }

  function handleAssignSubmit() {
    if (!assigningEsc || !selectedOfficer) return;
    assignEscalation(assigningEsc.id, selectedOfficer);
    toast.success(`Assigned ${assigningEsc.id} to ${selectedOfficer}`);
    setAssigningEsc(null);
    if (activeEscalation?.id === assigningEsc.id) {
      setActiveEscalation((prev) =>
        prev ? { ...prev, assignedOfficer: selectedOfficer } : null,
      );
    }
  }

  function exportCSV() {
    try {
      const csv = generateEscalationReportCSV(rows);
      downloadFile(csv, "escalation-report.csv", "text/csv;charset=utf-8");
      toast.success("Escalation report downloaded as CSV");
    } catch {
      toast.error("Could not export escalation report");
    }
  }

  return (
    <>
      <PageHeader
        title="Escalation Management"
        description="Oversee cases escalated to senior university authorities. Assign handlers and record official interventions."
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "Escalation Management" }]}
        actions={
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={rows.length === 0}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        }
      />

      <div className="surface-card mb-4 p-3.5 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search escalation #, grievance #, reason, authority…"
              className="pl-8 h-9 text-xs"
            />
          </div>

          <NativeSelect
            aria-label="Escalation status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={ESCALATION_STATUS_OPTIONS}
            allLabel="All escalation statuses"
          />

          <NativeSelect
            aria-label="Department"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            options={DEPARTMENTS}
            allLabel="All departments"
          />

          <NativeSelect
            aria-label="Priority"
            value={pri}
            onChange={(e) => setPri(e.target.value)}
            options={PRIORITIES}
            allLabel="All priorities"
          />

          {/* Assigned Authority or Officer */}
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            aria-label="Assigned Handler"
          >
            <option value="all">All assigned authorities</option>
            <option value="unassigned">Unassigned Officer</option>
            {assignedList.map((handler) => (
              <option key={handler} value={handler}>
                {handler}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Sub-Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
          <span className="font-medium">Escalation Date:</span>
          <Input
            type="date"
            className="h-8 w-36 text-xs"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label="From Date"
          />
          <span>to</span>
          <Input
            type="date"
            className="h-8 w-36 text-xs"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            aria-label="To Date"
          />

          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground ml-auto sm:ml-0"
              onClick={resetFilters}
            >
              <FilterX className="mr-1 size-3.5" />
              Reset filters
            </Button>
          )}

          <span className="ml-auto text-xs text-muted-foreground font-medium">
            Showing {rows.length} of {escalations.length} escalation{escalations.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No escalations match"
          description="Try adjusting your filter settings."
        />
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className={thClass}>Escalation #</th>
                <th className={thClass}>Grievance #</th>
                <th className={thClass}>Original Dept.</th>
                <th className={thClass}>Escalated To</th>
                <th className={thClass}>Assigned Officer</th>
                <th className={thClass}>Reason</th>
                <th className={thClass}>Priority</th>
                <th className={thClass}>Escalated Date</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className={`${tdClass} font-mono text-xs font-semibold text-primary`}>
                    {e.id}
                  </td>
                  <td className={`${tdClass} font-mono text-xs text-muted-foreground`}>
                    {e.grievanceId}
                  </td>
                  <td className={tdClass}>{e.fromDepartment}</td>
                  <td className={tdClass}>{e.escalatedTo}</td>
                  <td className={`${tdClass} text-xs font-medium`}>
                    {e.assignedOfficer ? (
                      <span className="text-foreground">{e.assignedOfficer}</span>
                    ) : (
                      <span className="italic text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className={`${tdClass} max-w-[240px]`}>
                    <span className="line-clamp-2 text-xs">{e.reason}</span>
                  </td>
                  <td className={tdClass}>
                    <PriorityBadge priority={e.priority} />
                  </td>
                  <td className={`${tdClass} text-xs text-muted-foreground whitespace-nowrap`}>
                    {e.date}
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        e.status === "Closed" || e.status === "Resolved by Authority"
                          ? "bg-success/15 text-success"
                          : e.status === "Under Authority Review"
                            ? "bg-warning/15 text-warning-foreground"
                            : e.status === "Action Required"
                              ? "bg-critical/15 text-critical"
                              : "bg-secondary text-foreground"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-xs"
                        onClick={() => {
                          setNote("");
                          setActiveEscalation(e);
                        }}
                      >
                        <Eye className="size-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          setAssigningEsc(e);
                          setSelectedOfficer(e.assignedOfficer || AUTHORITIES[0] || "");
                        }}
                      >
                        Assign
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Escalation & Administrative Actions Modal */}
      <Modal
        open={!!activeEscalation}
        onOpenChange={(o) => !o && setActiveEscalation(null)}
        title={activeEscalation ? `Escalation ${activeEscalation.id} (${activeEscalation.grievanceId})` : ""}
        description={activeEscalation?.reason ?? undefined}
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Status: <strong>{activeEscalation?.status}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={() => setActiveEscalation(null)}>
              Close
            </Button>
          </div>
        }
      >
        {activeEscalation ? (
          <div className="space-y-5">
            {/* Metadata Summary */}
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-3 text-xs">
              <div>
                <span className="text-muted-foreground block">Originating Department</span>
                <span className="font-semibold">{activeEscalation.fromDepartment}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Escalated Authority</span>
                <span className="font-semibold">{activeEscalation.escalatedTo}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Assigned Handler</span>
                <span className="font-semibold">{activeEscalation.assignedOfficer || "Unassigned"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Priority Level</span>
                <PriorityBadge priority={activeEscalation.priority} />
              </div>
            </div>

            {/* Quick Status Actions */}
            <div>
              <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Administrative Lifecycle Actions
              </h5>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() =>
                    triggerStatusChange(
                      activeEscalation,
                      "Under Authority Review",
                      "Under Review",
                    )
                  }
                >
                  Mark Under Review
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-warning-foreground"
                  onClick={() =>
                    triggerStatusChange(
                      activeEscalation,
                      "Action Required",
                      "Action Required",
                    )
                  }
                >
                  Mark Action Required
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-success"
                  onClick={() =>
                    triggerStatusChange(
                      activeEscalation,
                      "Resolved by Authority",
                      "Resolved",
                    )
                  }
                >
                  <CheckCircle className="mr-1 size-3.5" />
                  Mark Resolved
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs text-muted-foreground"
                  onClick={() =>
                    triggerStatusChange(activeEscalation, "Closed", "Closed", true)
                  }
                >
                  <XCircle className="mr-1 size-3.5" />
                  Mark Closed
                </Button>
              </div>
            </div>

            {/* History Timeline */}
            <div>
              <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Escalation Audit Trail
              </h5>
              <ol className="space-y-3 border-l-2 pl-3.5 text-xs">
                {activeEscalation.history.map((h) => (
                  <li key={h.id}>
                    <p className="font-medium text-foreground">{h.note}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {h.actor} · {h.date}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Add Administrative Note */}
            <div className="border-t pt-3">
              <h5 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-1.5">
                Add Administrative Note
              </h5>
              <Textarea
                className="text-xs"
                placeholder="Record guidance, directive, or authority observation..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                size="sm"
                className="mt-2 text-xs"
                disabled={!note.trim()}
                onClick={() => {
                  addEscalationComment(activeEscalation.id, note.trim());
                  // Also update local active escalation view
                  setActiveEscalation((prev) =>
                    prev
                      ? {
                          ...prev,
                          history: [
                            ...prev.history,
                            {
                              id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `h-${Date.now()}`,
                              date: new Date().toISOString().slice(0, 10),
                              actor: "Dr. Anjali Kamat (Admin)",
                              note: note.trim(),
                            },
                          ],
                        }
                      : null,
                  );
                  setNote("");
                  toast.success("Administrative note appended to escalation history");
                }}
              >
                <MessageSquare className="mr-1.5 size-3.5" />
                Add Note
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Assign Authority Modal */}
      <Modal
        open={!!assigningEsc}
        onOpenChange={(o) => !o && setAssigningEsc(null)}
        title="Assign Escalated Case to Authority"
        description={`Allocate an administrative officer to take ownership of case ${assigningEsc?.id ?? ""} (${assigningEsc?.grievanceId ?? ""}).`}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setAssigningEsc(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAssignSubmit}>
              Confirm Assignment
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2 text-xs">
          <label className="font-semibold block text-muted-foreground">Select Officer / Authority</label>
          <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
            <SelectTrigger className="w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUTHORITIES.map((auth) => (
                <SelectItem key={auth} value={auth}>
                  {auth}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Modal>

      {/* Shared Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmConfig.open}
        onOpenChange={(open) => setConfirmConfig((prev) => ({ ...prev, open }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmLabel={confirmConfig.confirmLabel ?? "Confirm"}
        destructive={confirmConfig.destructive ?? false}
        onConfirm={confirmConfig.action}
      />
    </>
  );
}
