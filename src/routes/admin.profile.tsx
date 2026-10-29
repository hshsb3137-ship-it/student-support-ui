import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { ShieldCheck, LogOut, User, Mail, Building } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Field, Panel } from "@/components/admin/AdminUI";
import { useAdminData, type AdminPrefs } from "@/lib/admin-store";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "Admin Profile — Administration" },
      { name: "description", content: "Administrator profile and notification preferences." },
      { property: "og:title", content: "Admin Profile — Administration" },
      { property: "og:description", content: "Administrator profile and notification preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminProfile,
});

const schema = z.object({
  displayName: z.string().trim().min(2, "Display name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
});

const PREFS: { key: keyof AdminPrefs; label: string; desc: string }[] = [
  { key: "emailAlerts", label: "Email alerts", desc: "Receive a copy of important notifications by email." },
  { key: "escalationAlerts", label: "Escalation alerts", desc: "Notify me when a case is escalated to the Administrator." },
  { key: "slaWarnings", label: "SLA warnings", desc: "Warn me about cases nearing their deadline." },
  { key: "weeklyDigest", label: "Weekly digest", desc: "A summary of grievance activity every Monday." },
];

function AdminProfile() {
  const { prefs, setPrefs } = useAdminData();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(prefs);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = () => {
    const r = schema.safeParse(draft);
    if (!r.success) {
      const e: Record<string, string> = {};
      r.error.issues.forEach((i) => (e[String(i.path[0])] = i.message));
      return setErrors(e);
    }
    setErrors({});
    setPrefs({ ...draft, ...r.data });
    toast.success("Profile saved", { description: "Stored in demo state only — your login is unchanged." });
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out", { description: "You have been signed out of the Administrator console." });
    navigate({ to: "/login" });
  };

  return (
    <>
      <PageHeader
        title="Admin Profile & Identity"
        description="View administrative credentials, contact endpoints, and notification preferences."
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "Profile" }]}
        actions={
          <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="mr-1 size-4" /> Sign Out
          </Button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Institutional Account">
          <div className="grid gap-3.5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded border bg-muted/20 p-2.5">
                <p className="text-xs text-muted-foreground">Admin User ID</p>
                <p className="font-mono font-semibold text-foreground">ADM-0001</p>
              </div>
              <div className="rounded border bg-muted/20 p-2.5">
                <p className="text-xs text-muted-foreground">Office Assignment</p>
                <p className="font-semibold text-foreground">Registrar Office</p>
              </div>
            </div>

            {/* Role protection per Section 13 */}
            <div className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-purple-600 dark:text-purple-400" />
                <div>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">
                    System Administrator (Admin)
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    Role privilege is protected and cannot be altered from self-profile settings.
                  </p>
                </div>
              </div>
              <span className="rounded bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Protected Role
              </span>
            </div>

            <Field label="Display Name" htmlFor="a-name" error={errors["displayName"]}>
              <Input
                id="a-name"
                value={draft.displayName}
                onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
              />
            </Field>
            <Field label="Official Email Endpoint" htmlFor="a-email" error={errors["email"]}>
              <Input
                id="a-email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="Notification & Alert Subscriptions">
          <div className="flex flex-col gap-4">
            {PREFS.map((p) => (
              <div key={p.key} className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={p.key} className="font-medium text-foreground">
                    {p.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <Switch
                  id={p.key}
                  checked={Boolean(draft[p.key])}
                  onCheckedChange={(v) => setDraft({ ...draft, [p.key]: v })}
                />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setDraft(prefs);
            setErrors({});
          }}
        >
          Reset Preferences
        </Button>
        <Button onClick={save}>Save Profile</Button>
      </div>
    </>
  );
}

