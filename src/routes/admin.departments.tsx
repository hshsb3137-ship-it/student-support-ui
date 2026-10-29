import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, CheckCircle2, XCircle, Power, Edit3, Eye } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Field, NativeSelect, tdClass, thClass } from "@/components/admin/AdminUI";
import { useAdminData } from "@/lib/admin-store";
import type { AdminDepartment } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/departments")({
  head: () => ({
    meta: [
      { title: "Department Management — Administration" },
      { name: "description", content: "Departments, heads, staff and grievance workload." },
      { property: "og:title", content: "Department Management — Administration" },
      { property: "og:description", content: "Departments, heads, staff and grievance workload." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DepartmentsPage,
});

const GFM_PENDING_OR_REJECTED = new Set([
  "Submitted",
  "GFM_REVIEW",
  "GFM_REJECTED",
  "GFM_INFORMATION_REQUESTED",
]);

const schema = z.object({
  id: z.string().trim().min(2, "Code is required").max(12),
  name: z.string().trim().min(2, "Name is required").max(60),
  head: z.string().trim().min(2, "Department head is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  staffCount: z.number().int().min(0, "Must be 0 or more").max(500),
  description: z.string().trim().max(300),
  status: z.enum(["Active", "Inactive"]),
});

function DepartmentsPage() {
  const { departments, grievances, saveDepartment, toggleDepartmentStatus } = useAdminData();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<{ d: AdminDepartment; isNew: boolean } | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Workload rule (Section 14): Grievances not yet accepted by GFM must not count as department workload
  const stats = useMemo(
    () =>
      departments.map((d) => {
        const deptGrievances = grievances.filter(
          (g) => g.department === d.key && !GFM_PENDING_OR_REJECTED.has(g.status)
        );
        const resolved = deptGrievances.filter((g) => g.status === "Resolved");
        return {
          d,
          assignedCount: deptGrievances.length,
          resolvedCount: resolved.length,
          pendingCount: deptGrievances.length - resolved.length,
        };
      }),
    [departments, grievances],
  );

  const rows = stats.filter((s) => {
    const matchQ =
      !q.trim() ||
      `${s.d.name} ${s.d.id} ${s.d.head} ${s.d.description}`.toLowerCase().includes(q.trim().toLowerCase());
    const matchStatus =
      statusFilter === "all" || s.d.status.toLowerCase() === statusFilter.toLowerCase();
    return matchQ && matchStatus;
  });

  const viewing = stats.find((s) => s.d.id === viewId);
  const targetDeactivate = departments.find((d) => d.id === deactivatingId);

  const set = (k: keyof AdminDepartment, v: string | number) =>
    setEditing((e) => (e ? { ...e, d: { ...e.d, [k]: v } } : e));

  const submit = () => {
    if (!editing) return;
    const r = schema.safeParse(editing.d);
    const errs: Record<string, string> = {};
    if (!r.success) {
      r.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    saveDepartment(
      {
        ...editing.d,
        ...r.data,
        key: editing.d.key ?? (r.data.name as any),
      },
      editing.isNew,
    );
    toast.success(editing.isNew ? "Department created" : "Department updated", {
      description: `Changes for ${r.data.name} saved in demo memory.`,
    });
    setEditing(null);
  };

  const handleToggle = (dept: AdminDepartment) => {
    toggleDepartmentStatus(dept.id);
    const nextStatus = dept.status === "Active" ? "Inactive" : "Active";
    toast.success(`Department ${dept.name} is now ${nextStatus}`, {
      description: "Department status updated in demo memory.",
    });
    setDeactivatingId(null);
  };

  return (
    <>
      <PageHeader
        title="Department Management"
        description="Configure academic and administrative departments, heads, staffing levels, and workload quotas."
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "Department Management" }]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setErrors({});
              setEditing({
                isNew: true,
                d: {
                  id: `DEP-${String(departments.length + 1).padStart(3, "0")}`,
                  name: "",
                  key: null,
                  head: "",
                  email: "",
                  staffCount: 4,
                  description: "",
                  status: "Active",
                },
              });
            }}
          >
            <Plus className="mr-1 size-4" /> Add Department
          </Button>
        }
      />

      <div className="surface-card mb-4 flex flex-wrap items-center justify-between gap-3 p-3 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-9 w-full sm:w-72"
            placeholder="Search department, code, head..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search departments"
          />
          <NativeSelect
            aria-label="Status filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={["Active", "Inactive"]}
            allLabel="All statuses"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{rows.length}</span> of {departments.length} departments
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No departments found" description="Try clearing your search query or filters." />
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className={thClass}>Department Name</th>
                <th className={thClass}>Code</th>
                <th className={thClass}>Description</th>
                <th className={thClass}>Department Head</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Staff</th>
                <th className={thClass}>Assigned Grievances</th>
                <th className={thClass}>Resolved</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ d, assignedCount, resolvedCount }) => (
                <tr key={d.id} className="border-b transition-colors hover:bg-muted/20 last:border-0">
                  <td className={`${tdClass} font-semibold text-foreground`}>{d.name}</td>
                  <td className={tdClass}>
                    <span className="font-mono text-xs font-semibold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {d.id}
                    </span>
                  </td>
                  <td className={`${tdClass} max-w-xs truncate text-xs text-muted-foreground`} title={d.description}>
                    {d.description || "—"}
                  </td>
                  <td className={tdClass}>
                    <div className="font-medium">{d.head}</div>
                    <div className="text-xs text-muted-foreground">{d.email}</div>
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {d.status === "Active" ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      {d.status}
                    </span>
                  </td>
                  <td className={`${tdClass} font-semibold`}>{d.staffCount}</td>
                  <td className={tdClass}>
                    <span className="font-semibold text-foreground">{assignedCount}</span>
                    <span className="ml-1 text-[11px] text-muted-foreground">(post-GFM)</span>
                  </td>
                  <td className={`${tdClass} font-medium text-emerald-600 dark:text-emerald-400`}>
                    {resolvedCount}
                  </td>
                  <td className={`${tdClass} text-right whitespace-nowrap`}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewId(d.id)}
                        title="View details"
                      >
                        <Eye className="mr-1 size-3.5" /> View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setErrors({});
                          setEditing({ d, isNew: false });
                        }}
                        title="Edit department"
                      >
                        <Edit3 className="mr-1 size-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={d.status === "Active" ? "outline" : "default"}
                        className={d.status === "Active" ? "text-amber-600 hover:text-amber-700" : ""}
                        onClick={() => {
                          if (d.status === "Active") {
                            setDeactivatingId(d.id);
                          } else {
                            handleToggle(d);
                          }
                        }}
                      >
                        <Power className="mr-1 size-3.5" />
                        {d.status === "Active" ? "Deactivate" : "Activate"}
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
        title={viewing?.d.name ?? "Department"}
        description={`Code: ${viewing?.d.id} • Status: ${viewing?.d.status}`}
      >
        {viewing ? (
          <div className="space-y-4 text-sm">
            <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              {viewing.d.description}
            </p>
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["Department Code", viewing.d.id],
                ["Status", viewing.d.status],
                ["Department Head", viewing.d.head],
                ["Official Email", viewing.d.email],
                ["Active Staff Count", viewing.d.staffCount],
                ["Department Workload", `${viewing.assignedCount} assigned grievances`],
                ["Resolved Cases", `${viewing.resolvedCount} closed`],
                ["Active In-Progress", `${viewing.pendingCount} active`],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded border p-2.5">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-semibold text-foreground break-words">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </Modal>

      {/* Edit / Add Modal */}
      <Modal
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.isNew ? "Add Department" : `Edit ${editing?.d.name}`}
        description="Provide department details, code, head of department, and staffing count."
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={submit}>
              {editing?.isNew ? "Create Department" : "Save Changes"}
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Department Code" htmlFor="d-id" error={errors["id"]}>
                <Input
                  id="d-id"
                  placeholder="e.g. DEP-EXM"
                  value={editing.d.id}
                  disabled={!editing.isNew}
                  onChange={(e) => set("id", e.target.value.toUpperCase())}
                />
              </Field>
              <Field label="Status" htmlFor="d-status" error={errors["status"]}>
                <select
                  id="d-status"
                  aria-label="Status"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={editing.d.status}
                  onChange={(e) => set("status", e.target.value as "Active" | "Inactive")}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </Field>
            </div>
            <Field label="Department Name" htmlFor="d-name" error={errors["name"]}>
              <Input
                id="d-name"
                placeholder="e.g. Examination Services"
                value={editing.d.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Department Head" htmlFor="d-head" error={errors["head"]}>
                <Input
                  id="d-head"
                  placeholder="e.g. Prof. S. Balachandran"
                  value={editing.d.head}
                  onChange={(e) => set("head", e.target.value)}
                />
              </Field>
              <Field label="Official Email" htmlFor="d-email" error={errors["email"]}>
                <Input
                  id="d-email"
                  type="email"
                  placeholder="dept@university.edu"
                  value={editing.d.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Active Staff Count" htmlFor="d-staff" error={errors["staffCount"]}>
              <Input
                id="d-staff"
                type="number"
                min={0}
                value={editing.d.staffCount}
                onChange={(e) => set("staffCount", Number(e.target.value))}
              />
            </Field>
            <Field label="Description / Mandate" htmlFor="d-desc" error={errors["description"]}>
              <Textarea
                id="d-desc"
                maxLength={300}
                rows={3}
                placeholder="Brief summary of issues managed by this department."
                value={editing.d.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
          </div>
        ) : null}
      </Modal>

      {/* Deactivate confirmation modal */}
      <Modal
        open={!!targetDeactivate}
        onOpenChange={(o) => !o && setDeactivatingId(null)}
        title={`Deactivate ${targetDeactivate?.name}?`}
        description="Deactivating this department will suspend new grievance routing. Existing assigned cases will remain accessible for auditing."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeactivatingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => targetDeactivate && handleToggle(targetDeactivate)}
            >
              Confirm Deactivation
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          Department Code: <span className="font-semibold">{targetDeactivate?.id}</span>. You can reactivate this department at any time.
        </p>
      </Modal>
    </>
  );
}

