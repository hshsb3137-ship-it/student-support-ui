import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Sun, Moon, Laptop, LogOut, Sliders, Shield } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "System Settings & Preferences — Administration" },
      { name: "description", content: "Configure institutional SLA windows, workflow automation, theme options, and UI preferences." },
      { property: "og:title", content: "System Settings & Preferences — Administration" },
      {
        property: "og:description",
        content: "Configure institutional SLA windows, workflow automation, theme options, and UI preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const TOGGLES = [
  { id: "auto-route", label: "Automatic Department Routing", desc: "Route newly accepted grievances to matched desk upon GFM approval." },
  { id: "escalate", label: "Auto-Escalate on SLA Breach", desc: "Flag and notify the Administrator when case breaches resolution SLA." },
  { id: "email", label: "Email Notifications", desc: "Dispatch email status updates to students on every workflow milestone." },
  { id: "anon", label: "Allow Anonymous Submissions", desc: "Allow students to withhold their name and roll number from department staff." },
];

function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [pageSize, setPageSize] = useState("10");

  const [flags, setFlags] = useState<Record<string, boolean>>({
    "auto-route": true,
    escalate: true,
    email: true,
    anon: false,
  });

  const handleLogout = () => {
    logout();
    toast.info("Logged out", { description: "Session ended. Returning to login screen." });
    navigate({ to: "/login" });
  };

  const applyTheme = (t: "light" | "dark" | "system") => {
    setTheme(t);
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
    } else if (t === "light") {
      root.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    toast.success(`Theme set to ${t} mode`);
  };

  return (
    <>
      <PageHeader
        title="System Settings"
        description="Configure institutional SLA deadlines, workflow automation, theme appearance, and interface preferences."
        crumbs={[{ label: "Administration", to: "/admin" }, { label: "Settings" }]}
      />

      <form
        className="grid gap-5 lg:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Settings saved successfully", {
            description: "Institutional preferences updated in session memory.",
          });
        }}
      >
        {/* Service Windows */}
        <section className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <Sliders className="size-5 text-primary" /> Service Level Agreement (SLA) Windows
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turnaround deadlines applied across Student, GFM, and Department workflows.
          </p>
          <Separator className="my-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="gfm-sla" className="text-xs font-medium">GFM Triage Window (hours)</Label>
              <Input id="gfm-sla" type="number" defaultValue={48} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ack" className="text-xs font-medium">Staff Acknowledgement (hours)</Label>
              <Input id="ack" type="number" defaultValue={24} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res" className="text-xs font-medium">Resolution Target (days)</Label>
              <Input id="res" type="number" defaultValue={7} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="esc" className="text-xs font-medium">Auto-Escalation Threshold (days)</Label>
              <Input id="esc" type="number" defaultValue={10} />
            </div>
          </div>
        </section>

        {/* Workflow Automation */}
        <section className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="size-5 text-primary" /> Workflow Automation
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Behavioral rules for grievance triage, notifications, and routing.
          </p>
          <Separator className="my-4" />
          <div className="flex flex-col gap-4">
            {TOGGLES.map((t) => (
              <div key={t.id} className="flex items-start justify-between gap-4">
                <div>
                  <Label htmlFor={t.id} className="text-sm font-medium text-foreground">
                    {t.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <Switch
                  id={t.id}
                  checked={flags[t.id] ?? false}
                  onCheckedChange={(v) => setFlags((p) => ({ ...p, [t.id]: v }))}
                />
              </div>
            ))}
          </div>
        </section>

        {/* UI & Theme Preferences */}
        <section className="surface-card p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Theme & Appearance</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select your preferred display mode and UI scale.
          </p>
          <Separator className="my-4" />
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Color Theme</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTheme("light")}
                  className="w-full justify-center"
                >
                  <Sun className="mr-1.5 size-4" /> Light
                </Button>
                <Button
                  type="button"
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTheme("dark")}
                  className="w-full justify-center"
                >
                  <Moon className="mr-1.5 size-4" /> Dark
                </Button>
                <Button
                  type="button"
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyTheme("system")}
                  className="w-full justify-center"
                >
                  <Laptop className="mr-1.5 size-4" /> System
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="density" className="text-xs font-medium">Table Density</Label>
                <select
                  id="density"
                  aria-label="Table density"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={density}
                  onChange={(e) => setDensity(e.target.value as any)}
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="page-size" className="text-xs font-medium">Default Page Size</Label>
                <select
                  id="page-size"
                  aria-label="Default page size"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                >
                  <option value="10">10 records</option>
                  <option value="25">25 records</option>
                  <option value="50">50 records</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Session & Sign Out */}
        <section className="surface-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Session & Access Control</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Active administrative session for Dr. Anjali Kamat (ADM-0001).
            </p>
            <Separator className="my-4" />
            <div className="rounded-lg border bg-muted/20 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Authenticated Role:</span>
                <span className="font-semibold text-foreground">Admin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active (Mock Session)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audit Log Id:</span>
                <span className="font-mono text-muted-foreground">SES-2026-9812</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-1.5 size-4" /> Sign Out of Administrator Portal
            </Button>
          </div>
        </section>

        <div className="lg:col-span-2 flex justify-end gap-3 pt-2">
          <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </>
  );
}

