import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Role } from "./types";

export interface SessionUser {
  name: string;
  email: string;
  role: Role;
  identifier: string;
  department?: string;
  designation?: string;
}

const STORAGE_KEY = "grievance.session";

const MOCK_PROFILES: Record<Role, Omit<SessionUser, "email" | "role">> = {
  student: { name: "Nishant Bendale", identifier: "CSE21042", department: "Computer Engineering" },
  gfm: {
    name: "Dr. Priya Sharma",
    identifier: "GFM-0001",
    department: "Grievance Cell",
    designation: "Grievance Forwarding Member",
  },
  department: {
    name: "Prof. S. Balachandran",
    identifier: "STF-1088",
    department: "Examination",
    designation: "Assistant Professor",
  },
  admin: { name: "Dr. Anjali Kamat", identifier: "ADM-0001", department: "Registrar Office" },
};

export const ROLE_HOME: Record<Role, string> = {
  student: "/student",
  gfm: "/gfm",
  department: "/department",
  admin: "/admin",
};

interface AuthContextValue {
  user: SessionUser | null;
  ready: boolean;
  login: (email: string, password: string, role: Role) => SessionUser;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as SessionUser);
    } catch {
      /* ignore malformed session */
    }
    setReady(true);
  }, []);

  const login = useCallback((email: string, _password: string, role: Role) => {
    const profile = MOCK_PROFILES[role];
    const next: SessionUser = { ...profile, email, role };
    setUser(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
