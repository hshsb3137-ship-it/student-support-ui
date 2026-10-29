import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Eye, Edit3, Power, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, NativeSelect, tdClass, thClass } from "@/components/admin/AdminUI";
import { useAdminData, adminToday } from "@/lib/admin-store";
import { ROLE_NAMES, type AdminUser } from "@/lib/admin-data";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — Administration" },
      { name: "description", content: "Manage student, GFM, department staff and admin accounts." },
      { property: "og:title", content: "User Management — Administration" },
      { property: "og:description", content: "Manage student, GFM, department staff and admin accounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UsersPage,
});

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "gfm", label: "GFM" },
  { value: "department", label: "Department Staff" },
  { value: "admin", label: "Admin" },
];

const schema = z.object({
  id: z.string().trim().min(3, "User ID must be at least 3 characters").max(20),
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid university email").max(255),
  department: z.string().trim().min(2, "Department is required").max(60),
});

const blank: AdminUser = {
  id: "",
  name: "",
  email: "",
  role: "student",
  department: "",
  status: "Active",
  createdAt: "",
};

function UsersPage() {
  const { users, saveUser, toggleUser } = useAdminData();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<{ user: AdminUser; isNew: boolean } | null>(null);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<AdminUser | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!t ||
          u.name.toLowerCase().includes(t) ||
          u.email.toLowerCase().includes(t) ||
          u.id.toLowerCase().includes(t) ||
          u.department.toLowerCase().includes(t)) &&
        (roleFilter === "all" || u.role === roleFilter) &&
        (statusFilter === "all" || u.status === statusFilter),
    );
  }, [users, q, roleFilter, statusFilter]);

  const submit = () => {
    if (!editing) return;
    const r = schema.safeParse(editing.user);
    const errs: Record<string, string> = {};
    if (!r.success) r.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
    if (
      editing.isNew &&
      users.some((u) => u.id.toLowerCase() === editing.user.id.trim().toLowerCase())
    ) {
      errs["id"] = "This User ID is already assigned";
    }

    // Security rule: Do not allow self privilege elevation or assigning admin privileges casually
    if (editing.isNew && editing.user.role === "admin") {
      errs["role"] = "Admin role provisioning requires super-admin console approval.";
    }

    setErrors(errs);
    if (Object.keys(errs).length || !r.success) return;

    saveUser(
      {
        ...editing.user,
        ...r.data,
        createdAt: editing.user.createdAt || adminToday(),
      },
      editing.isNew,
    );
    toast.success(editing.isNew ? "User profile created" : "User profile updated", {
      description: `Account record for ${r.data.name} saved in demo state.`,
    });
    setEditing(null);
  };

  const set = (k: keyof AdminUser, v: string) =>
    setEditing((e) => (e ? { ...e, user: { ...e.user, [k]: v } } : e));

  const handleToggle = (user: AdminUser) => {
    toggleUser(user.id);
    const next = user.status === "Active" ? "Inactive" : "Active";
    toast.success(`Account for ${user.name} is now ${next}`, {
      description: "Account status modified in demo memory.",
    });
    setDeactivatingUser(null);
  };

  return (
    <>
      <PageHeader
        title="User Management"
        description="Inspect and manage institutional roles for Students, GFM, Department Staff, and Administrators."
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "User Management" }]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setErrors({});
              setEditing({ user: { ...blank, id: `USR-${Math.floor(1000 + Math.random() * 9000)}` }, isNew: true });
            }}
          >
            <UserPlus className="mr-1 size-4" /> Add User
          </Button>
        }
      />

      <div className="surface-card mb-4 flex flex-wrap items-center justify-between gap-3 p-3 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-9 w-full sm:w-64"
            placeholder="Search name, email, ID or dept..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search users"
          />
          <NativeSelect
            aria-label="Role filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={ROLE_OPTIONS.map((o) => o.label)}
            allLabel="All roles"
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
          Showing <span className="font-semibold text-foreground">{rows.length}</span> of {users.length} accounts
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search criteria or role filters." />
      ) : (
        <div className="surface-card overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>User ID</th>
                <th className={thClass}>Role</th>
                <th className={thClass}>Department</th>
                <th className={thClass}>Account Status</th>
                <th className={thClass}>Created</th>
                <th className={`${thClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b transition-colors hover:bg-muted/20 last:border-0">
                  <td className={`${tdClass} font-semibold text-foreground`}>{u.name}</td>
                  <td className={`${tdClass} text-xs font-mono text-muted-foreground`}>{u.email}</td>
                  <td className={tdClass}>
                    <span className="font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded text-foreground">
                      {u.id}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${
                        u.role === "admin"
                          ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/30"
                          : u.role === "gfm"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/30"
                            : u.role === "department"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300/30"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/30"
                      }`}
                    >
                      {ROLE_NAMES[u.role]}
                    </span>
                  </td>
                  <td className={tdClass}>{u.department}</td>
                  <td className={tdClass}>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {u.status === "Active" ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      {u.status}
                    </span>
                  </td>
                  <td className={`${tdClass} text-xs text-muted-foreground`}>{u.createdAt}</td>
                  <td className={`${tdClass} text-right whitespace-nowrap`}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setViewingUser(u)}
                        title="View user details"
                      >
                        <Eye className="mr-1 size-3.5" /> View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setErrors({});
                          setEditing({ user: u, isNew: false });
                        }}
                        title="Edit permitted fields"
                      >
                        <Edit3 className="mr-1 size-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={u.status === "Active" ? "outline" : "default"}
                        className={u.status === "Active" ? "text-amber-600 hover:text-amber-700" : ""}
                        onClick={() => {
                          if (u.status === "Active") {
                            setDeactivatingUser(u);
                          } else {
                            handleToggle(u);
                          }
                        }}
                      >
                        <Power className="mr-1 size-3.5" />
                        {u.status === "Active" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View User Modal */}
      <Modal
        open={!!viewingUser}
        onOpenChange={(o) => !o && setViewingUser(null)}
        title={viewingUser?.name ?? "User Details"}
        description={`Account ID: ${viewingUser?.id} • Role: ${viewingUser ? ROLE_NAMES[viewingUser.role] : ""}`}
      >
        {viewingUser ? (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["User ID", viewingUser.id],
                ["Full Name", viewingUser.name],
                ["Email Address", viewingUser.email],
                ["Assigned Role", ROLE_NAMES[viewingUser.role]],
                ["Department", viewingUser.department],
                ["Account Status", viewingUser.status],
                ["Member Since", viewingUser.createdAt],
                [
                  "Access Scope",
                  viewingUser.role === "admin"
                    ? "Full Administrative & Analytics"
                    : viewingUser.role === "gfm"
                      ? "First-Level Review & Routing"
                      : viewingUser.role === "department"
                        ? "Departmental Grievance Resolution"
                        : "Student Self-Service & Submission",
                ],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded border p-2.5">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-semibold text-foreground break-words">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <strong>Security Audit Note:</strong> Role authorizations are mock demonstrations. Real
              authorization will be enforced via Supabase Auth and Row Level Security.
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Edit / Add Modal */}
      <Modal
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        title={editing?.isNew ? "Add Institutional User" : `Edit Profile: ${editing?.user.name}`}
        description="Update permitted demographic and department information. Privilege elevation is restricted."
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={submit}>
              {editing?.isNew ? "Create User" : "Save Changes"}
            </Button>
          </>
        }
      >
        {editing ? (
          <div className="grid gap-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Field label="User ID" htmlFor="u-id" error={errors["id"]}>
                <Input
                  id="u-id"
                  placeholder="e.g. STF-2041 or CSE21042"
                  value={editing.user.id}
                  disabled={!editing.isNew}
                  onChange={(e) => set("id", e.target.value.toUpperCase())}
                />
              </Field>
              <Field label="Role" htmlFor="u-role" error={errors["role"]}>
                <select
                  id="u-role"
                  aria-label="Role"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-60"
                  value={editing.user.role}
                  disabled={!editing.isNew && editing.user.role === "admin"}
                  onChange={(e) => set("role", e.target.value as Role)}
                >
                  <option value="student">Student</option>
                  <option value="gfm">GFM</option>
                  <option value="department">Department Staff</option>
                  <option value="admin" disabled={editing.isNew}>
                    Admin (Super-Admin Provisioned)
                  </option>
                </select>
              </Field>
            </div>
            {!editing.isNew && editing.user.role === "admin" && (
              <div className="flex items-center gap-2 rounded bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
                <ShieldAlert className="size-4 shrink-0" />
                Administrative privileges cannot be elevated or downgraded from this portal.
              </div>
            )}
            <Field label="Full Name" htmlFor="u-name" error={errors["name"]}>
              <Input
                id="u-name"
                placeholder="e.g. Dr. Priya Sharma"
                value={editing.user.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Email Address" htmlFor="u-email" error={errors["email"]}>
              <Input
                id="u-email"
                type="email"
                placeholder="user@university.edu"
                value={editing.user.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <Field label="Department / Unit" htmlFor="u-dept" error={errors["department"]}>
              <Input
                id="u-dept"
                placeholder="e.g. Grievance Cell, Examination, Computer Science"
                value={editing.user.department}
                onChange={(e) => set("department", e.target.value)}
              />
            </Field>
          </div>
        ) : null}
      </Modal>

      {/* Deactivate confirmation modal */}
      <Modal
        open={!!deactivatingUser}
        onOpenChange={(o) => !o && setDeactivatingUser(null)}
        title={`Deactivate account for ${deactivatingUser?.name}?`}
        description="The user will not be able to log in or process grievance tickets while inactive. Historical activity is retained."
        footer={
          <>
            <Button variant="outline" onClick={() => setDeactivatingUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deactivatingUser && handleToggle(deactivatingUser)}
            >
              Confirm Deactivation
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          User ID: <span className="font-semibold">{deactivatingUser?.id}</span> • Role:{" "}
          <span className="font-semibold">{deactivatingUser ? ROLE_NAMES[deactivatingUser.role] : ""}</span>.
        </p>
      </Modal>
    </>
  );
}

