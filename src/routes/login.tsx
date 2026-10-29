import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, ClipboardCheck, GraduationCap, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/common/Modal";
import { useAuth, ROLE_HOME } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — University Grievance Portal" },
      {
        name: "description",
        content:
          "Sign in as a student, GFM, department staff member or administrator to manage university grievances.",
      },
      { property: "og:title", content: "Sign In — University Grievance Portal" },
      {
        property: "og:description",
        content: "Role-based access to the intelligent student grievance resolution system.",
      },
    ],
  }),
  component: LoginPage,
});

const ROLE_OPTIONS: { role: Role; label: string; hint: string; icon: typeof GraduationCap }[] = [
  { role: "student", label: "Student", hint: "File & track grievances", icon: GraduationCap },
  { role: "gfm", label: "GFM", hint: "First-level grievance review", icon: ClipboardCheck },
  { role: "department", label: "Department Staff", hint: "Resolve assigned cases", icon: Building2 },
  { role: "admin", label: "Admin", hint: "Oversee the whole system", icon: ShieldCheck },
];

const DEMO_EMAIL: Record<Role, string> = {
  student: "nishant.bendale@university.edu",
  gfm: "gfm@university.edu",
  department: "s.balachandran@university.edu",
  admin: "registrar@university.edu",
};

function LoginPage() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState(DEMO_EMAIL.student);
  const [password, setPassword] = useState("demo1234");
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (ready && user) navigate({ to: ROLE_HOME[user.role], replace: true });
  }, [ready, user, navigate]);

  function selectRole(next: Role) {
    setRole(next);
    setEmail(DEMO_EMAIL[next]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Enter both email and password to continue.");
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      const session = login(email.trim(), password, role);
      setSubmitting(false);
      toast.success(`Welcome back, ${session.name.split(" ")[0]}`);
      navigate({ to: ROLE_HOME[role], replace: true });
    }, 550);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="brand-gradient relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold leading-tight">University Portal</p>
            <p className="text-xs text-primary-foreground/70">Office of the Grievance Cell</p>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight">
            Agentic AI-based intelligent student grievance resolution
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
            NLP-assisted classification, automatic departmental routing, SLA-aware escalation and
            transparent tracking — one accountable workflow from submission to resolution.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-primary-foreground/85">
            {[
              "Automatic category and priority detection",
              "Department-wise routing and ownership",
              "Escalation when service windows are breached",
            ].map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-primary-foreground/60">
          Final-year project prototype · frontend foundation
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </span>
            <div>
              <p className="font-display text-base font-semibold leading-tight">University Portal</p>
              <p className="text-xs text-muted-foreground">Grievance Cell</p>
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold">Sign in to your account</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Choose your role and continue with your university credentials.
          </p>

          <div className="mt-6">
            <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
              Select role
            </Label>
            <div className="grid gap-2 grid-cols-2">
              {ROLE_OPTIONS.map((opt) => {
                const active = opt.role === role;
                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => selectRole(opt.role)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all",
                      active
                        ? "border-primary bg-primary/5 shadow-[var(--shadow-card)]"
                        : "border-border hover:border-primary/40 hover:bg-secondary",
                    )}
                  >
                    <opt.icon
                      className={cn(
                        "size-4",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="mt-2 block text-sm font-semibold leading-tight">
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">University email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="you@university.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 rounded-lg border border-dashed bg-secondary/50 p-3 text-xs text-muted-foreground">
            Demo build — authentication is mocked. Any password works; the selected role decides
            which dashboard loads.
          </p>
        </div>
      </section>

      <Modal
        open={forgotOpen}
        onOpenChange={setForgotOpen}
        title="Reset your password"
        description="Enter your registered university email and we'll send a reset link."
        footer={
          <>
            <Button variant="outline" onClick={() => setForgotOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setForgotOpen(false);
                toast.success("If the email is registered, a reset link has been sent.");
                setResetEmail("");
              }}
            >
              Send reset link
            </Button>
          </>
        }
      >
        <div className="space-y-1.5">
          <Label htmlFor="reset-email">University email</Label>
          <Input
            id="reset-email"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="you@university.edu"
          />
        </div>
      </Modal>
    </div>
  );
}
