import {
  BarChart3,
  Bell,
  Bot,
  Building2,
  CheckCircle,
  ClipboardList,
  FileText,
  FolderOpen,
  Gauge,
  GraduationCap,
  Inbox,
  Info,
  ListChecks,
  Search,
  Settings,
  Sparkles,
  ShieldAlert,
  ShieldX,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const NAV: Record<Role, NavItem[]> = {
  student: [
    { label: "Dashboard", to: "/student", icon: Gauge, exact: true },
    { label: "Submit Grievance", to: "/student/submit", icon: FileText },
    { label: "My Grievances", to: "/student/grievances", icon: ClipboardList },
    { label: "Track Grievance", to: "/student/track", icon: Search },
    { label: "Notifications", to: "/student/notifications", icon: Bell },
    { label: "AI Assistant", to: "/student/assistant", icon: Bot },
    { label: "Profile", to: "/student/profile", icon: UserCircle },
  ],
  gfm: [
    { label: "Dashboard", to: "/gfm", icon: Gauge, exact: true },
    { label: "Pending Review", to: "/gfm/pending", icon: Inbox },
    { label: "Accepted", to: "/gfm/accepted", icon: CheckCircle },
    { label: "Information Requests", to: "/gfm/info-requests", icon: Info },
    { label: "Rejected", to: "/gfm/rejected", icon: ShieldX },
    { label: "Notifications", to: "/gfm/notifications", icon: Bell },
    { label: "Profile", to: "/gfm/profile", icon: UserCircle },
  ],
  department: [
    { label: "Dashboard", to: "/department", icon: Gauge, exact: true },
    { label: "Assigned Grievances", to: "/department/assigned", icon: Inbox },
    { label: "Pending Actions", to: "/department/pending", icon: ListChecks },
    { label: "Escalated Cases", to: "/department/escalated", icon: ShieldAlert },
    { label: "AI Recommendations", to: "/department/recommendations", icon: Sparkles },
    { label: "Reports", to: "/department/reports", icon: FolderOpen },
    { label: "Notifications", to: "/department/notifications", icon: Bell },
    { label: "Profile", to: "/department/profile", icon: UserCircle },
  ],
  admin: [
    { label: "Dashboard", to: "/admin", icon: Gauge, exact: true },
    { label: "All Grievances", to: "/admin/grievances", icon: ClipboardList },
    { label: "GFM Reviews", to: "/admin/gfm-reviews", icon: CheckCircle },
    { label: "User Management", to: "/admin/users", icon: Users },
    { label: "Department Management", to: "/admin/departments", icon: Building2 },
    { label: "Escalation Management", to: "/admin/escalations", icon: ShieldAlert },
    { label: "University Policies", to: "/admin/policies", icon: FileText },
    { label: "Analytics & Reports", to: "/admin/reports", icon: BarChart3 },
    { label: "Notifications", to: "/admin/notifications", icon: Bell },
    { label: "Profile", to: "/admin/profile", icon: UserCircle },
    { label: "Settings", to: "/admin/settings", icon: Settings },
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student Portal",
  gfm: "GFM Portal",
  department: "Department Desk",
  admin: "Administration",
};
