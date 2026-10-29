import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus,
  Upload,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  Cpu,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Database,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ActiveBadge, Field, NativeSelect, tdClass, thClass } from "@/components/admin/AdminUI";
import { useAdminData, adminToday } from "@/lib/admin-store";
import { POLICY_CATEGORIES, type Policy, type PolicyProcessingStatus } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/policies")({
  head: () => ({
    meta: [
      { title: "University Policies & RAG Knowledge Base — Administration" },
      { name: "description", content: "Manage university policies and vector chunking preparation for RAG knowledge base." },
      { property: "og:title", content: "University Policies & RAG Knowledge Base — Administration" },
      { property: "og:description", content: "Manage university policies and vector chunking preparation for RAG knowledge base." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PoliciesPage,
});

const schema = z.object({
  title: z.string().trim().min(3, "Title is required").max(120),
  category: z.string().trim().min(1, "Category is required"),
  version: z.string().trim().min(1, "Version is required").max(20),
  effectiveDate: z.string().trim().min(4, "Effective date is required"),
  description: z.string().trim().min(10, "Add at least 10 characters").max(1000),
  documentName: z.string().trim().min(1, "Attach or specify a document"),
});

const ALLOWED = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function PoliciesPage() {
  const { policies, savePolicy, deletePolicy, processPolicy, togglePolicy } = useAdminData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [procFilter, setProcFilter] = useState("all");

  const [editing, setEditing] = useState<{ p: Policy; isNew: boolean } | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rows = policies.filter((p) => {
    const matchQ =
      !q.trim() ||
      `${p.title} ${p.category} ${p.documentName} ${p.description} ${p.version}`
        .toLowerCase()
        .includes(q.trim().toLowerCase());
    const matchCat = cat === "all" || p.category === cat;
    const matchStatus =
      statusFilter === "all" || (statusFilter === "Active" ? p.active : !p.active);
    const matchProc = procFilter === "all" || p.processingStatus === procFilter;
    return matchQ && matchCat && matchStatus && matchProc;
  });

  const viewing = policies.find((p) => p.id === viewId);
  const deletingPolicy = policies.find((p) => p.id === deletingId);

  const set = (k: keyof Policy, v: any) =>
    setEditing((e) => (e ? { ...e, p: { ...e.p, [k]: v } } : e));

  const submit = () => {
    if (!editing) return;
    const r = schema.safeParse(editing.p);
    const errs: Record<string, string> = {};
    if (!r.success) r.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
    setErrors(errs);
    if (!r.success) return;

    savePolicy(
      {
        ...editing.p,
        ...r.data,
        updatedAt: adminToday(),
        processingStatus: editing.isNew ? "Pending" : editing.p.processingStatus,
        lastProcessed: editing.isNew ? "Not yet processed" : editing.p.lastProcessed,
        chunkCount: editing.isNew ? 0 : editing.p.chunkCount,
      },
      editing.isNew,
    );
    toast.success(editing.isNew ? "Policy created (Demo)" : "Policy updated (Demo)", {
      description: "Policy metadata registered in mock state. Ready for chunking.",
    });
    setEditing(null);
  };

  const handleProcess = (id: string, isReprocess = false) => {
    setProcessingId(id);
    toast.info(isReprocess ? "Reprocessing policy document..." : "Processing document into vector chunks...", {
      description: "Simulating document parsing, recursive text splitting, and embedding generation.",
    });
    setTimeout(() => {
      processPolicy(id);
      setProcessingId(null);
      toast.success(isReprocess ? "Policy reprocessed successfully" : "Policy processed and indexed", {
        description: "Vector chunks updated in demo knowledge base.",
      });
    }, 800);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deletePolicy(deletingId);
    toast.success("Policy removed", {
      description: "Policy document and associated vector chunks removed from demo index.",
    });
    setDeletingId(null);
  };

  const renderProcBadge = (status: PolicyProcessingStatus) => {
    switch (status) {
      case "Processed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-3" /> Processed
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
            <RefreshCw className="size-3 animate-spin" /> Processing
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <Clock className="size-3" /> Pending RAG
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-medium text-destructive">
            <AlertTriangle className="size-3" /> Failed
          </span>
        );
    }
  };

  return (
    <>
      <PageHeader
        title="University Policies"
        description="Knowledge base preparation for RAG indexing. Policies are vectorized into semantic chunks for grievance resolution guidance."
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "University Policies" }]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setErrors({});
              setEditing({
                isNew: true,
                p: {
                  id: `POL-${Date.now().toString().slice(-4)}`,
                  title: "",
                  category: "General",
                  description: "",
                  documentName: "",
                  version: "v1.0",
                  effectiveDate: adminToday(),
                  updatedAt: adminToday(),
                  active: true,
                  processingStatus: "Pending",
                  lastProcessed: "Pending",
                  chunkCount: 0,
                },
              });
            }}
          >
            <Plus className="mr-1 size-4" /> Add Policy / Upload
          </Button>
        }
      />

      <div className="surface-card mb-4 flex flex-wrap items-center justify-between gap-3 p-3 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-9 w-full sm:w-64"
            placeholder="Search title, document, content..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search policies"
          />
          <NativeSelect
            aria-label="Category"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            options={POLICY_CATEGORIES}
            allLabel="All categories"
          />
          <NativeSelect
            aria-label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={["Active", "Inactive"]}
            allLabel="All statuses"
          />
          <NativeSelect
            aria-label="Processing Status"
            value={procFilter}
            onChange={(e) => setProcFilter(e.target.value)}
            options={["Processed", "Processing", "Pending", "Failed"]}
            allLabel="All processing states"
          />
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Database className="size-3.5 text-primary" />
          <span>Demo RAG Index</span> • <span className="font-semibold text-foreground">{rows.length}</span> documents
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No policies found" description="Try another filter or upload a new policy document." />
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className={thClass}>Policy Title</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Document Name</th>
                <th className={thClass}>Version</th>
                <th className={thClass}>Effective Date</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Processing Status</th>
                <th className={thClass}>Last Processed</th>
                <th className={thClass}>Chunk Count</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b transition-colors hover:bg-muted/20 last:border-0">
                  <td className={tdClass}>
                    <div className="font-semibold text-foreground">{p.title}</div>
                    <div className="max-w-[240px] truncate text-xs text-muted-foreground">{p.description}</div>
                  </td>
                  <td className={tdClass}>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                      {p.category}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                      <FileText className="size-3.5 text-primary shrink-0" />
                      <span className="truncate max-w-[140px]">{p.documentName}</span>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <span className="font-mono text-xs font-semibold">{p.version}</span>
                  </td>
                  <td className={`${tdClass} text-xs text-muted-foreground`}>{p.effectiveDate}</td>
                  <td className={tdClass}>
                    <ActiveBadge active={p.active} />
                  </td>
                  <td className={tdClass}>{renderProcBadge(p.processingStatus)}</td>
                  <td className={`${tdClass} text-xs text-muted-foreground whitespace-nowrap`}>
                    {p.lastProcessed}
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <Layers className="size-3.5 text-muted-foreground" />
                      {p.chunkCount}
                    </div>
                  </td>
                  <td className={`${tdClass} text-right whitespace-nowrap`}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewId(p.id)}
                        title="View details and chunk preview"
                      >
                        <Eye className="mr-1 size-3.5" /> View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setErrors({});
                          setEditing({ p, isNew: false });
                        }}
                        title="Edit policy metadata"
                      >
                        <Edit3 className="mr-1 size-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingId === p.id}
                        onClick={() => handleProcess(p.id, p.processingStatus === "Processed")}
                        title={p.processingStatus === "Processed" ? "Reprocess vector embeddings" : "Process document into RAG chunks"}
                      >
                        <RefreshCw className={`mr-1 size-3.5 ${processingId === p.id ? "animate-spin" : ""}`} />
                        {p.processingStatus === "Processed" ? "Reprocess" : "Process"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeletingId(p.id)}
                        title="Delete policy"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Detail Modal */}
      <Modal
        open={!!viewing}
        onOpenChange={(o) => !o && setViewId(null)}
        title={viewing?.title ?? "Policy Details"}
        description={`Document: ${viewing?.documentName} • Version ${viewing?.version} • Category: ${viewing?.category}`}
      >
        {viewing ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border bg-muted/30 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Policy Summary & Mandate
              </h4>
              <p className="mt-1 text-sm text-foreground">{viewing.description}</p>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Policy ID", viewing.id],
                ["Category", viewing.category],
                ["Document Name", viewing.documentName],
                ["Version", viewing.version],
                ["Effective Date", viewing.effectiveDate],
                ["Last Updated", viewing.updatedAt],
                ["Publication Status", viewing.active ? "Active" : "Archived / Inactive"],
                ["RAG Processing Status", viewing.processingStatus],
                ["Last Vectorized", viewing.lastProcessed],
                ["Indexed Chunk Count", `${viewing.chunkCount} semantic chunks`],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded border p-2">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-semibold text-foreground break-words">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="rounded-lg border p-3 bg-muted/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Cpu className="size-3.5 text-primary" /> RAG Knowledge Base Chunks Preview (Demo)
                </span>
                <span className="text-muted-foreground">{viewing.chunkCount} total chunks</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono text-muted-foreground max-h-32 overflow-y-auto">
                <div className="rounded bg-muted/40 p-2 border">
                  <strong>[Chunk #001]:</strong> {viewing.title} — Scope & Eligibility. {viewing.description.slice(0, 80)}...
                </div>
                <div className="rounded bg-muted/40 p-2 border">
                  <strong>[Chunk #002]:</strong> Timeline & Escalation Matrix for {viewing.category} grievances. Effective {viewing.effectiveDate}.
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Edit / Upload Modal */}
      <Modal
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.isNew ? "Upload & Register Policy Document" : `Edit Policy: ${editing?.p.title}`}
        description="Demo action: Define metadata for RAG document extraction. Files are stored locally in mock state."
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={submit}>
              {editing?.isNew ? "Upload & Save" : "Save Changes"}
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-3 text-sm">
            <Field label="Policy Title" htmlFor="p-title" error={errors["title"]}>
              <Input
                id="p-title"
                placeholder="e.g. Examination Revaluation Guidelines"
                value={editing.p.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category" htmlFor="p-cat">
                <NativeSelect
                  id="p-cat"
                  className="w-full"
                  value={editing.p.category}
                  onChange={(e) => set("category", e.target.value)}
                  options={POLICY_CATEGORIES}
                />
              </Field>
              <Field label="Version" htmlFor="p-version" error={errors["version"]}>
                <Input
                  id="p-version"
                  placeholder="e.g. v2.1"
                  value={editing.p.version}
                  onChange={(e) => set("version", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Effective Date" htmlFor="p-date" error={errors["effectiveDate"]}>
                <Input
                  id="p-date"
                  type="date"
                  value={editing.p.effectiveDate}
                  onChange={(e) => set("effectiveDate", e.target.value)}
                />
              </Field>
              <Field label="Status" htmlFor="p-active">
                <select
                  id="p-active"
                  aria-label="Policy status"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={editing.p.active ? "Active" : "Inactive"}
                  onChange={(e) => set("active", e.target.value === "Active")}
                >
                  <option value="Active">Active (Published)</option>
                  <option value="Inactive">Inactive (Archived)</option>
                </select>
              </Field>
            </div>

            <Field label="Description & Mandate" htmlFor="p-desc" error={errors["description"]}>
              <Textarea
                id="p-desc"
                rows={3}
                maxLength={1000}
                placeholder="Summary of terms, SLA timelines, and conditions governed by this policy."
                value={editing.p.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>

            <Field
              label="Policy Document File (PDF or DOCX, max 10 MB)"
              htmlFor="p-doc"
              error={errors["documentName"]}
            >
              <label
                htmlFor="p-doc"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground hover:bg-muted/40 transition-colors"
              >
                <Upload className="size-4" />{" "}
                <span className="font-semibold text-foreground">
                  {editing.p.documentName || "Choose a PDF / DOCX document"}
                </span>
              </label>
              <input
                id="p-doc"
                type="file"
                className="sr-only"
                accept=".pdf,.docx"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (!ALLOWED.includes(f.type)) {
                    return setErrors((x) => ({
                      ...x,
                      documentName: "Only PDF or DOCX files are allowed",
                    }));
                  }
                  if (f.size > 10 * 1024 * 1024) {
                    return setErrors((x) => ({
                      ...x,
                      documentName: "File must be 10 MB or smaller",
                    }));
                  }
                  setErrors((x) => ({ ...x, documentName: "" }));
                  set("documentName", f.name);
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Demo Action: Document is retained in frontend memory. RAG embeddings will be generated via LangGraph/pgvector in subsequent phase.
              </p>
            </Field>
          </div>
        ) : null}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deletingPolicy}
        onOpenChange={(o) => !o && setDeletingId(null)}
        title={`Delete policy: ${deletingPolicy?.title}?`}
        description="Are you sure you want to remove this policy document? This will remove all associated chunk embeddings from the demo RAG index."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          Document: <span className="font-mono font-semibold">{deletingPolicy?.documentName}</span> ({deletingPolicy?.chunkCount} chunks).
        </p>
      </Modal>
    </>
  );
}

