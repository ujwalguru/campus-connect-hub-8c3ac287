import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Clock,
  CheckCircle2,
  Hourglass,
  Plus,
  Zap,
  Search,
  HelpCircle,
  FileEdit,
  Sun,
  FolderOpen,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PortalSidebar } from "@/components/portal/Sidebar";
import { TopBar } from "@/components/portal/TopBar";
import { ComplaintDialog, type NewComplaint } from "@/components/portal/ComplaintDialog";
import { TrackDialog } from "@/components/portal/TrackDialog";
import {
  categories,
  faqs,
  statusStyles,
  type Complaint,
} from "@/components/portal/data";
import { useComplaints } from "@/components/portal/complaintsStore";
import { useAnnouncements } from "@/components/portal/announcements";
import campusImage from "@/assets/campus.jpg";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Student Complaint Portal — File & Track Campus Complaints" },
      {
        name: "description",
        content:
          "Submit campus complaints, follow their status through a clear timeline and browse answers to common questions in one warm, simple student portal.",
      },
      { property: "og:title", content: "Student Complaint Portal" },
      {
        property: "og:description",
        content: "File a campus complaint and track it from submission to resolution.",
      },
    ],
  }),
  component: StudentPortal,
});

function StudentPortal() {
  const { complaints, add: addToStore } = useComplaints();
  const [activeNav, setActiveNav] = useState("Home");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [preset, setPreset] = useState<string | undefined>();
  const [tracked, setTracked] = useState<Complaint | null>(null);
  const [faqOpen, setFaqOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { announcements } = useAnnouncements();
  const navigate = useNavigate();

  const stats = useMemo(
    () => [
      { label: "Total Complaints", value: complaints.length, icon: ClipboardList },
      {
        label: "In Progress",
        value: complaints.filter((c) => c.status === "In Progress").length,
        icon: Clock,
      },
      {
        label: "Resolved",
        value: complaints.filter((c) => c.status === "Resolved").length,
        icon: CheckCircle2,
      },
      {
        label: "Pending",
        value: complaints.filter((c) => c.status === "Pending").length,
        icon: Hourglass,
      },
    ],
    [complaints],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? complaints.filter((c) =>
          [c.id, c.subject, c.category, c.status].join(" ").toLowerCase().includes(q),
        )
      : complaints;
    return showAll ? list : list.slice(0, 4);
  }, [complaints, query, showAll]);

  function openForm(category?: string) {
    setPreset(category);
    setFormOpen(true);
  }

  function handleNav(label: string) {
    setActiveNav(label);
    if (label === "New Complaint") openForm();
    if (label === "Knowledge Base") setFaqOpen(true);
    if (label === "Track Status") setTracked(complaints[0] ?? null);
    if (label === "My Complaints") setShowAll(true);
    if (label === "Profile") navigate({ to: "/profile" });
    if (label === "Settings") navigate({ to: "/settings" });
  }

  function addComplaint(data: NewComplaint) {
    const next = addToStore({
      subject: data.subject,
      category: data.category,
      urgency: data.urgency,
      description: data.description,
      attachments: data.attachments,
      student: data.anonymous ? "Anonymous" : "Rahul Sharma",
      anonymous: data.anonymous,
    });
    toast.success(`Complaint ${next.id} submitted`, {
      description: data.anonymous
        ? "Filed anonymously. Admin can see it now."
        : "Sent to the admin dashboard. You'll get updates here.",
    });
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <PortalSidebar active={activeNav} onSelect={handleNav} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar query={query} onQueryChange={setQuery} />

        <main className="grid flex-1 gap-5 p-4 md:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-warm)]">
              <div className="grid items-stretch md:grid-cols-[1.05fr_1fr]">
                <div className="p-7 md:p-9">
                  <p className="text-sm font-semibold text-muted-foreground">Welcome back,</p>
                  <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
                    Rahul <span className="align-middle">👋</span>
                  </h1>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Your voice matters. Submit your complaint and help us make the campus better.
                  </p>
                  <button
                    onClick={() => openForm()}
                    className="mt-6 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-warm)] transition-transform hover:-translate-y-0.5"
                  >
                    <Plus className="size-4" />
                    Submit New Complaint
                    <ArrowRight className="size-4" />
                  </button>
                </div>
                <div className="relative min-h-[220px]">
                  <img
                    src={campusImage}
                    alt="Sunlit modern campus academic building surrounded by trees"
                    width={1024}
                    height={640}
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-card via-card/40 to-transparent" />
                  <p className="absolute bottom-6 right-6 max-w-[9rem] text-right font-display text-sm font-bold italic leading-snug text-foreground/90">
                    “A better campus starts with your voice.”
                    <span className="mt-2 ml-auto block h-1 w-8 rounded-full bg-primary" />
                  </p>
                </div>
              </div>
            </section>

            {/* Categories */}
            <section className="rounded-3xl border border-border bg-card p-6 md:p-7">
              <div className="flex items-center gap-2">
                <FolderOpen className="size-5 text-primary" />
                <h2 className="font-display text-lg font-extrabold">Complaint Categories</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose the category that best fits your issue.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => openForm(c.name)}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                      <c.icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{c.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{c.hint}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </section>

            {/* Recent complaints */}
            <section className="rounded-3xl border border-border bg-card p-6 md:p-7">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-primary" />
                  <h2 className="font-display text-lg font-extrabold">
                    {showAll ? "All Complaints" : "Recent Complaints"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {showAll ? "Show less" : "View All"}
                  <ArrowRight className="size-4" />
                </button>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[620px] border-separate border-spacing-y-1 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 pb-2">ID</th>
                      <th className="px-3 pb-2">Subject</th>
                      <th className="px-3 pb-2">Category</th>
                      <th className="px-3 pb-2">Date</th>
                      <th className="px-3 pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setTracked(c)}
                        className="cursor-pointer bg-muted/35 transition-colors hover:bg-accent"
                      >
                        <td className="rounded-l-xl px-3 py-3 font-semibold text-muted-foreground">
                          {c.id}
                        </td>
                        <td className="px-3 py-3 font-semibold">{c.subject}</td>
                        <td className="px-3 py-3 text-muted-foreground">{c.category}</td>
                        <td className="px-3 py-3 text-muted-foreground">{c.date}</td>
                        <td className="rounded-r-xl px-3 py-3">
                          <span
                            className={cn(
                              "inline-block rounded-full border px-2.5 py-1 text-xs font-semibold",
                              statusStyles[c.status],
                            )}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                          No complaints match “{query}”.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-extrabold">Your Complaint Overview</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl border border-border bg-muted/40 p-4">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                      <s.icon className="size-[18px]" />
                    </span>
                    <p className="mt-3 font-display text-2xl font-extrabold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Announcements from administration */}
            <section className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Megaphone className="size-5 text-primary" />
                <h2 className="font-display text-lg font-extrabold">Announcements</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Updates posted by the administration.</p>
              <ul className="mt-4 space-y-3">
                {announcements.map((a) => (
                  <li key={a.id} className="rounded-2xl border border-border bg-muted/40 p-4">
                    <p className="text-sm font-bold">{a.title}</p>
                    {a.body && <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>}
                    <p className="mt-2 text-[11px] font-semibold text-muted-foreground">{a.date}</p>
                  </li>
                ))}
                {announcements.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No announcements right now.
                  </li>
                )}
              </ul>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                <h2 className="font-display text-lg font-extrabold">Quick Actions</h2>
              </div>
              <div className="mt-4 divide-y divide-border">
                {[
                  {
                    title: "Submit New Complaint",
                    hint: "Start a new complaint in few steps",
                    icon: FileEdit,
                    action: () => openForm(),
                  },
                  {
                    title: "Track Your Complaint",
                    hint: "Check the current status",
                    icon: Search,
                    action: () => setTracked(complaints[0] ?? null),
                  },
                  {
                    title: "View FAQs",
                    hint: "Get help with common queries",
                    icon: HelpCircle,
                    action: () => setFaqOpen(true),
                  },
                ].map((a) => (
                  <button
                    key={a.title}
                    onClick={a.action}
                    className="group flex w-full items-center gap-3 py-3 text-left"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                      <a.icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{a.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{a.hint}</span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-3xl border border-border p-6">
              <div className="absolute inset-0" style={{ background: "var(--gradient-warm)" }} />
              <svg
                className="absolute -bottom-4 right-0 w-2/3 text-primary/25"
                viewBox="0 0 200 60"
                fill="none"
                aria-hidden="true"
              >
                <path d="M0 34c40-24 70 18 110-6s60 8 90-8v44H0z" fill="currentColor" />
                <path d="M0 46c50-20 80 12 120-6s50 4 80-6v30H0z" fill="currentColor" opacity="0.5" />
              </svg>
              <Sun className="relative size-5 text-primary" />
              <p className="relative mt-3 font-display text-base font-bold leading-relaxed">
                “Your feedback helps us improve and create a safer, better environment for everyone.”
              </p>
              <p className="relative mt-3 text-xs font-semibold text-muted-foreground">
                — College Administration
              </p>
            </section>
          </div>
        </main>
      </div>

      <ComplaintDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        presetCategory={preset}
        onSubmit={addComplaint}
      />
      <TrackDialog complaint={tracked} onOpenChange={(o) => !o && setTracked(null)} />

      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Frequently asked questions</DialogTitle>
            <DialogDescription>Quick answers about the complaint process.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-4">
            {faqs.map((f) => (
              <li key={f.q} className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-sm font-bold">{f.q}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
