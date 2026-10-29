import { createFileRoute } from "@tanstack/react-router";
import { RoleLayout } from "@/components/layout/RoleLayout";
import { GFMDataProvider } from "@/lib/gfm-store";

export const Route = createFileRoute("/gfm")({
  head: () => ({
    meta: [
      { title: "GFM Portal — Grievance Resolution System" },
      {
        name: "description",
        content: "First-level grievance review, forwarding and decision portal for the Grievance Forwarding Member.",
      },
      { property: "og:title", content: "GFM Portal — Grievance Resolution System" },
      {
        property: "og:description",
        content: "First-level grievance review and department forwarding.",
      },
    ],
  }),
  component: () => (
    <GFMDataProvider>
      <RoleLayout role="gfm" />
    </GFMDataProvider>
  ),
});
