import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "./PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { CURRENT_STUDENT } from "@/lib/mock-data";
import type { Role } from "@/lib/types";

export function ProfilePage({ role, crumbLabel }: { role: Role; crumbLabel: string }) {
  const { user } = useAuth();
  const isStudent = role === "student";
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("+91 98220 45110");
  const [course, setCourse] = useState("B.Tech Computer Science & Engineering");
  const [year, setYear] = useState(CURRENT_STUDENT.year);
  const [department, setDepartment] = useState(user?.department ?? CURRENT_STUDENT.department);

  const readOnly = !editing;

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage the details linked to your grievance portal account."
        crumbs={[{ label: crumbLabel, to: `/${role}` }, { label: "Profile" }]}
        actions={
          <Button variant={editing ? "outline" : "default"} onClick={() => setEditing((v) => !v)}>
            {editing ? "Cancel editing" : "Edit profile"}
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <div className="surface-card p-6 text-center">
          <div className="brand-gradient mx-auto grid size-20 place-items-center rounded-2xl font-display text-2xl font-semibold text-primary-foreground">
            {(user?.name ?? "U")
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.identifier}</p>
          <p className="mt-3 inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {role}
          </p>
          {user?.department ? (
            <p className="mt-3 text-sm text-muted-foreground">{user.department}</p>
          ) : null}
        </div>

        <form
          className="surface-card grid gap-4 p-6 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setEditing(false);
            toast.success("Profile updated", { description: "Your changes have been saved." });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="p-id">{isStudent ? "Student ID" : "Identifier"}</Label>
            <Input id="p-id" value={user?.identifier ?? ""} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-name">Full name</Label>
            <Input
              id="p-name"
              value={name}
              readOnly={readOnly}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-email">Email</Label>
            <Input
              id="p-email"
              type="email"
              value={email}
              readOnly={readOnly}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-phone">Phone</Label>
            <Input
              id="p-phone"
              value={phone}
              readOnly={readOnly}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {!isStudent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="p-desig">Designation</Label>
                <Input
                  id="p-desig"
                  value={user?.designation ?? "Staff"}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-dept2">Department</Label>
                <Input
                  id="p-dept2"
                  value={user?.department ?? ""}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            </>
          ) : null}

          {isStudent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="p-course">Course</Label>
                <Input
                  id="p-course"
                  value={course}
                  readOnly={readOnly}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-year">Year</Label>
                <Input
                  id="p-year"
                  value={year}
                  readOnly={readOnly}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-dept">Department</Label>
                <Input
                  id="p-dept"
                  value={department}
                  readOnly={readOnly}
                  onChange={(e) => setDepartment(e.target.value as typeof department)}
                />
              </div>
            </>
          ) : null}

          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="submit" disabled={!editing}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
