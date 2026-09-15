import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User, Mail, Phone, IdCard, GraduationCap, CalendarDays, Save } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PortalSidebar } from "@/components/portal/Sidebar";
import { useProfile } from "@/components/portal/profile";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Student Complaint Portal" },
      { name: "description", content: "View and update your student profile details." },
      { property: "og:title", content: "My Profile — Student Complaint Portal" },
      { property: "og:description", content: "View and update your student profile details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { profile, save } = useProfile();
  const [form, setForm] = useState(profile);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    const initials = form.name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    save({ ...form, initials: initials || "ST" });
    toast.success("Profile updated");
  }

  const fields = [
    { key: "name" as const, label: "Full Name", icon: User, placeholder: "Your full name" },
    { key: "rollNo" as const, label: "Roll Number", icon: IdCard, placeholder: "e.g. CS2023-114" },
    { key: "course" as const, label: "Course", icon: GraduationCap, placeholder: "e.g. B.Tech - Computer Science" },
    { key: "year" as const, label: "Year", icon: CalendarDays, placeholder: "e.g. 3rd Year" },
    { key: "email" as const, label: "Email", icon: Mail, placeholder: "you@campus.edu" },
    { key: "phone" as const, label: "Phone", icon: Phone, placeholder: "+91 ..." },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <PortalSidebar
        active="Profile"
        onSelect={(label) => {
          if (label === "Settings") navigate({ to: "/settings" });
          else if (label !== "Profile") navigate({ to: "/student" });
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-3xl flex-1 space-y-5 p-4 md:p-8">
          <section className="flex items-center gap-5 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-warm)] md:p-8">
            <span className="flex size-20 items-center justify-center rounded-full bg-primary/15 font-display text-2xl font-extrabold text-primary">
              {profile.initials}
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
                {profile.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.course} · {profile.year}
              </p>
              <p className="text-sm text-muted-foreground">Roll No: {profile.rollNo}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              <h2 className="font-display text-lg font-extrabold">Profile Details</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep your details up to date so the administration can reach you.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <f.icon className="size-3.5" />
                    {f.label}
                  </span>
                  <input
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
                  />
                </label>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-warm)] transition-transform hover:-translate-y-0.5"
            >
              <Save className="size-4" />
              Save Changes
            </button>
          </section>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
