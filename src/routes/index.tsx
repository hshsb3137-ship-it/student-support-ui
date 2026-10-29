import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth, ROLE_HOME } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "University Grievance Portal — Sign In" },
      {
        name: "description",
        content:
          "Single entry point for students, department staff and administrators to file and resolve university grievances.",
      },
      { property: "og:title", content: "University Grievance Portal" },
      {
        property: "og:description",
        content: "File, track and resolve university grievances with AI-assisted triage.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    navigate({ to: user ? ROLE_HOME[user.role] : "/login", replace: true });
  }, [ready, user, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
