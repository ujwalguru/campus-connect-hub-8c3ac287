import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, Eye, KeyRound, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PortalSidebar } from "@/components/portal/Sidebar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Student Complaint Portal" },
      { name: "description", content: "Manage notifications, privacy and account preferences." },
      { property: "og:title", content: "Settings — Student Complaint Portal" },
      { property: "og:description", content: "Manage notifications, privacy and account preferences." },
    ],
  }),
  component: SettingsPage,
});

type Prefs = {
  notifyStatus: boolean;
  notifyAnnouncements: boolean;
  emailUpdates: boolean;
  anonymousDefault: boolean;
};

const defaultPrefs: Prefs = {
  notifyStatus: true,
  notifyAnnouncements: true,
  emailUpdates: false,
  anonymousDefault: false,
};

const PREFS_KEY = "campus-settings";

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return defaultPrefs;
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        on ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-card shadow transition-all",
          on ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const toggle = (key: keyof Prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const sections = [
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { key: "notifyStatus" as const, label: "Complaint status updates", hint: "Get notified when your complaint status changes." },
        { key: "notifyAnnouncements" as const, label: "Announcements", hint: "Show new announcements from the administration." },
        { key: "emailUpdates" as const, label: "Email updates", hint: "Receive a copy of updates by email." },
      ],
    },
    {
      title: "Privacy",
      icon: Eye,
      items: [
        { key: "anonymousDefault" as const, label: "File anonymously by default", hint: "New complaints start with anonymous mode turned on." },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <PortalSidebar
        active="Settings"
        onSelect={(label) => {
          if (label === "Profile") navigate({ to: "/profile" });
          else if (label !== "Settings") navigate({ to: "/student" });
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-3xl flex-1 space-y-5 p-4 md:p-8">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
              Settings
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your notifications, privacy and account preferences.
            </p>
          </div>

          {sections.map((s) => (
            <section key={s.title} className="rounded-3xl border border-border bg-card p-6 md:p-7">
              <div className="flex items-center gap-2">
                <s.icon className="size-5 text-primary" />
                <h2 className="font-display text-lg font-extrabold">{s.title}</h2>
              </div>
              <div className="mt-4 divide-y divide-border">
                {s.items.map((item) => (
                  <div key={item.key} className="flex items-center gap-4 py-4">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.hint}</span>
                    </span>
                    <Toggle on={prefs[item.key]} onClick={() => toggle(item.key)} />
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-3xl border border-border bg-card p-6 md:p-7">
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              <h2 className="font-display text-lg font-extrabold">Change Password</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Current password"
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
              />
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="New password"
                className="h-11 w-full rounded-xl border border-border bg-muted/40 px-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
              />
            </div>
            <button
              onClick={() => {
                if (!currentPw || newPw.length < 6) {
                  toast.error("Enter your current password and a new one of at least 6 characters.");
                  return;
                }
                setCurrentPw("");
                setNewPw("");
                toast.success("Password updated");
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-warm)] transition-transform hover:-translate-y-0.5"
            >
              <Settings2 className="size-4" />
              Update Password
            </button>
          </section>

          <section className="rounded-3xl border border-destructive/30 bg-card p-6 md:p-7">
            <div className="flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" />
              <h2 className="font-display text-lg font-extrabold text-destructive">Danger Zone</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Permanently delete your account and all associated complaints. This cannot be undone.
            </p>
            <button
              onClick={() => toast.error("Please contact the administration to delete your account.")}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-destructive/40 px-6 py-3 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
              Delete Account
            </button>
          </section>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
