import { useEffect } from "react";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth, ROLE_HOME } from "@/lib/auth";
import { AppShell } from "./AppShell";
import type { Role } from "@/lib/types";

export function RoleLayout({ role }: { role: Role }) {
  const { user, ready, switchRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
    } else if (user.role !== role) {
      // In this frontend demo environment, seamlessly adapt the mock session
      // to the target module route when navigated directly.
      switchRole(role);
    }
  }, [ready, user, role, navigate, switchRole]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Preparing your workspace…
        </div>
      </div>
    );
  }

  return (
    <AppShell role={role}>
      <Outlet />
    </AppShell>
  );
}
