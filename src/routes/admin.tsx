import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Hourglass,
  LayoutDashboard,
  Megaphone,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  categories,
  statusStyles,
  timelineSteps,
  stepIndexFor,
  type ComplaintStatus,
} from "@/components/portal/data";
import {
  activityFeed,
  adminComplaints,
  departments,
  statusOrder,
  urgencyStyles,
  weeklyTrend,
  type AdminComplaint,
} from "@/components/portal/adminData";
import { useAnnouncements } from "@/components/portal/announcements";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Control Center — Campus Voice Hub" },
      {
        name: "description",
        content:
          "Manage every campus complaint: update status, assign departments, add internal notes, track analytics and publish announcements.",
      },
      { property: "og:title", content: "Admin Control Center — Campus Voice Hub" },
      {
        property: "og:description",
        content: "Triage complaints, assign departments, review analytics and post announcements.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});

type Tab = "overview" | "complaints" | "analytics" | "announcements";

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "complaints", label: "Complaints", icon: ClipboardList },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "announcements", label: "Announcements", icon: Megaphone },
];

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [list, setList] = useState<AdminComplaint[]>(adminComplaints);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ComplaintStatus | "All">("All");
  const [category, setCategory] = useState("All");
  const [urgency, setUrgency] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "urgency" | "status">("date");
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState<AdminComplaint | null>(null);
  const [note, setNote] = useState("");
  const { announcements, publish: publishAnnouncement, remove: removeAnnouncement } =
    useAnnouncements();
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");

  const urgencyRank: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  const counts = useMemo(() => {
    const by = (s: ComplaintStatus) => list.filter((c) => c.status === s).length;
    return {
      total: list.length,
      inProgress: by("In Progress"),
      pending: by("Pending"),
      resolved: by("Resolved"),
      submitted: by("Submitted"),
      review: by("Under Review"),
      critical: list.filter((c) => c.urgency === "Critical").length,
      unassigned: list.filter((c) => c.assignee === "Unassigned").length,
    };
  }, [list]);

  const resolutionRate = Math.round((counts.resolved / Math.max(1, counts.total)) * 100);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = list.filter((c) => {
      if (status !== "All" && c.status !== status) return false;
      if (category !== "All" && c.category !== category) return false;
      if (urgency !== "All" && c.urgency !== urgency) return false;
      if (!q) return true;
      return [c.id, c.subject, c.category, c.status, c.student, c.assignee]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    return [...rows].sort((a, b) => {
      if (sortBy === "urgency") return (urgencyRank[a.urgency] ?? 9) - (urgencyRank[b.urgency] ?? 9);
      if (sortBy === "status") return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      return 0;
    });
  }, [list, query, status, category, urgency, sortBy]);

  const update = (id: string, patch: Partial<AdminComplaint>) => {
    setList((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    setOpen((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  };

  const bulkStatus = (s: ComplaintStatus) => {
    setList((prev) => prev.map((c) => (selected.includes(c.id) ? { ...c, status: s } : c)));
    setSelected([]);
  };

  const bulkDelete = () => {
    setList((prev) => prev.filter((c) => !selected.includes(c.id)));
    setSelected([]);
  };

  const exportCsv = () => {
    const head = ["ID", "Subject", "Category", "Urgency", "Date", "Status", "Assigned to"];
    const rows = filtered.map((c) =>
      [c.id, c.subject, c.category, c.urgency, c.date, c.status, c.assignee]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[head.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "complaints.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const addNote = () => {
    if (!open || !note.trim()) return;
    update(open.id, {
      notes: [...open.notes, { author: "Admin", text: note.trim(), time: "Just now" }],
    });
    setNote("");
  };

  const categoryStats = categories.map((c) => ({
    name: c.name,
    icon: c.icon,
    value: list.filter((x) => x.category === c.name).length,
  }));
  const maxCategory = Math.max(1, ...categoryStats.map((c) => c.value));
  const maxTrend = Math.max(...weeklyTrend.map((d) => Math.max(d.received, d.resolved)));

  const kpis = [
    { label: "Total complaints", value: counts.total, icon: ClipboardList, delta: "+12%" },
    { label: "In progress", value: counts.inProgress, icon: Clock, delta: "+3" },
    { label: "Pending action", value: counts.pending, icon: Hourglass, delta: "-1" },
    { label: "Resolved", value: counts.resolved, icon: CheckCircle2, delta: `${resolutionRate}%` },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col justify-between border-r border-border bg-sidebar p-5 lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <p className="font-display text-sm font-extrabold leading-tight">Control Center</p>
                <p className="text-[11px] text-muted-foreground">Campus Voice Hub</p>
              </div>
            </div>

            <nav className="mt-7 space-y-1.5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                    tab === t.id
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-warm)]"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <t.icon className="size-[18px]" />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="rounded-3xl border border-border bg-card p-4">
            <p className="text-xs font-bold">Needs attention</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {counts.critical} critical · {counts.unassigned} unassigned
            </p>
            <Link
              to="/"
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary"
            >
              <ArrowLeft className="size-3.5" />
              Switch role
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b border-border bg-card/85 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3 px-4 py-4 md:px-7">
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg font-extrabold capitalize">{tab}</h1>
                <p className="text-xs text-muted-foreground">
                  Managing {counts.total} student complaints
                </p>
              </div>
              <div className="relative min-w-[200px] flex-1 md:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setTab("complaints");
                  }}
                  placeholder="Search complaints…"
                  className="w-full rounded-full border border-border bg-muted/40 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary/50"
                />
              </div>
              <span className="relative flex size-10 items-center justify-center rounded-2xl border border-border bg-muted/40">
                <Bell className="size-[18px]" />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-destructive" />
              </span>
              <div className="flex lg:hidden">
                <select
                  value={tab}
                  onChange={(e) => setTab(e.target.value as Tab)}
                  className="rounded-full border border-border bg-muted/40 px-3 py-2 text-sm font-semibold"
                >
                  {tabs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          <main className="space-y-5 px-4 py-6 md:px-7">
            {/* KPI row always visible */}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {kpis.map((k) => (
                <div
                  key={k.label}
                  className="relative overflow-hidden rounded-3xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <k.icon className="size-[18px]" />
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-1 text-[11px] font-bold text-success">
                      <ArrowUpRight className="size-3" />
                      {k.delta}
                    </span>
                  </div>
                  <p className="mt-4 font-display text-3xl font-extrabold">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
              ))}
            </section>

            {tab === "overview" && (
              <section className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl border border-border bg-card p-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-base font-extrabold">This week</h2>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <TrendingUp className="size-4 text-success" />
                      Received vs resolved
                    </span>
                  </div>
                  <div className="mt-6 flex h-44 items-end gap-3">
                    {weeklyTrend.map((d) => (
                      <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex h-36 w-full items-end justify-center gap-1">
                          <div
                            className="w-1/2 rounded-t-lg bg-primary/80"
                            style={{ height: `${(d.received / maxTrend) * 100}%` }}
                            title={`${d.received} received`}
                          />
                          <div
                            className="w-1/2 rounded-t-lg bg-success/70"
                            style={{ height: `${(d.resolved / maxTrend) * 100}%` }}
                            title={`${d.resolved} resolved`}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          {d.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-card p-6">
                  <h2 className="font-display text-base font-extrabold">Resolution rate</h2>
                  <div className="mt-5 flex items-center gap-5">
                    <div
                      className="grid size-28 place-items-center rounded-full"
                      style={{
                        background: `conic-gradient(var(--color-success) ${resolutionRate * 3.6}deg, var(--color-muted) 0deg)`,
                      }}
                    >
                      <span className="grid size-20 place-items-center rounded-full bg-card font-display text-xl font-extrabold">
                        {resolutionRate}%
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        <b className="text-foreground">{counts.resolved}</b> resolved
                      </p>
                      <p>
                        <b className="text-foreground">{counts.inProgress}</b> in progress
                      </p>
                      <p>
                        <b className="text-foreground">{counts.pending}</b> pending
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Recent activity
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {activityFeed.map((a) => (
                      <li key={a.text} className="flex gap-3">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-semibold leading-snug">{a.text}</p>
                          <p className="text-[11px] text-muted-foreground">{a.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {tab === "analytics" && (
              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-6">
                  <h2 className="font-display text-base font-extrabold">Complaints by category</h2>
                  <ul className="mt-5 space-y-4">
                    {categoryStats.map((c) => (
                      <li key={c.name}>
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span className="flex items-center gap-2">
                            <c.icon className="size-4 text-primary" />
                            {c.name}
                          </span>
                          <span className="text-muted-foreground">{c.value}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${(c.value / maxCategory) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl border border-border bg-card p-6">
                    <h2 className="font-display text-base font-extrabold">Status breakdown</h2>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {statusOrder.map((s) => (
                        <div key={s} className="rounded-2xl border border-border bg-muted/35 p-4">
                          <p className="font-display text-xl font-extrabold">
                            {list.filter((c) => c.status === s).length}
                          </p>
                          <span
                            className={cn(
                              "mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                              statusStyles[s],
                            )}
                          >
                            {s}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-border bg-card p-6">
                    <h2 className="font-display text-base font-extrabold">Department load</h2>
                    <ul className="mt-4 space-y-2 text-sm">
                      {departments.map((d) => (
                        <li key={d} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{d}</span>
                          <span className="font-bold">
                            {list.filter((c) => c.assignee === d).length}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {tab === "announcements" && (
              <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
                <div className="rounded-3xl border border-border bg-card p-6">
                  <h2 className="font-display text-base font-extrabold">New announcement</h2>
                  <input
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Title"
                    className="mt-4 w-full rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-primary/50"
                  />
                  <textarea
                    value={annBody}
                    onChange={(e) => setAnnBody(e.target.value)}
                    placeholder="Write the message students will see…"
                    rows={4}
                    className="mt-3 w-full resize-none rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm outline-none focus:border-primary/50"
                  />
                  <button
                    onClick={() => {
                      if (!annTitle.trim()) return;
                      publishAnnouncement(annTitle.trim(), annBody.trim());
                      setAnnTitle("");
                      setAnnBody("");
                    }}
                    className="mt-4 w-full rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-warm)]"
                  >
                    Publish
                  </button>
                </div>
                <ul className="space-y-3">
                  {announcements.map((a) => (
                    <li key={a.id} className="rounded-3xl border border-border bg-card p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-sm font-extrabold">{a.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                          <p className="mt-2 text-[11px] text-muted-foreground">{a.date}</p>
                        </div>
                        <button
                          onClick={() => removeAnnouncement(a.id)}
                          className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent"
                          aria-label="Delete announcement"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tab === "complaints" && (
              <section className="rounded-3xl border border-border bg-card p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-semibold outline-none focus:border-primary/50"
                  >
                    <option value="All">All categories</option>
                    {categories.map((c) => (
                      <option key={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-semibold outline-none focus:border-primary/50"
                  >
                    <option value="All">All urgency</option>
                    {["Critical", "High", "Medium", "Low"].map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-semibold outline-none focus:border-primary/50"
                  >
                    <option value="date">Sort: newest</option>
                    <option value="urgency">Sort: urgency</option>
                    <option value="status">Sort: status</option>
                  </select>
                  <button
                    onClick={exportCsv}
                    className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold transition-colors hover:bg-accent"
                  >
                    <Download className="size-4" />
                    Export CSV
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(["All", ...statusOrder] as (ComplaintStatus | "All")[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors",
                        status === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/40 text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {selected.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/8 px-4 py-3">
                    <span className="text-sm font-bold">{selected.length} selected</span>
                    <button
                      onClick={() => bulkStatus("In Progress")}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-accent"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => bulkStatus("Resolved")}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-accent"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={bulkDelete}
                      className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-card px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                    <button
                      onClick={() => setSelected([])}
                      className="ml-auto text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[900px] border-separate border-spacing-y-1.5 text-sm">
                    <thead>
                      <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        <th className="px-3 pb-2">
                          <input
                            type="checkbox"
                            checked={selected.length > 0 && selected.length === filtered.length}
                            onChange={(e) =>
                              setSelected(e.target.checked ? filtered.map((c) => c.id) : [])
                            }
                            aria-label="Select all"
                          />
                        </th>
                        <th className="px-3 pb-2">Complaint</th>
                        <th className="px-3 pb-2">Student</th>
                        <th className="px-3 pb-2">Urgency</th>
                        <th className="px-3 pb-2">Assigned to</th>
                        <th className="px-3 pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => (
                        <tr
                          key={c.id}
                          className="cursor-pointer bg-muted/35 transition-colors hover:bg-accent"
                          onClick={() => setOpen(c)}
                        >
                          <td
                            className="rounded-l-xl px-3 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={selected.includes(c.id)}
                              onChange={(e) =>
                                setSelected((p) =>
                                  e.target.checked ? [...p, c.id] : p.filter((x) => x !== c.id),
                                )
                              }
                              aria-label={`Select ${c.id}`}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-semibold">{c.subject}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {c.id} · {c.category} · {c.date}
                            </p>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">{c.student}</td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "inline-block rounded-full border px-2.5 py-1 text-[11px] font-bold",
                                urgencyStyles[c.urgency],
                              )}
                            >
                              {c.urgency}
                            </span>
                          </td>
                          <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={c.assignee}
                              onChange={(e) => update(c.id, { assignee: e.target.value })}
                              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold outline-none"
                            >
                              {departments.map((d) => (
                                <option key={d}>{d}</option>
                              ))}
                            </select>
                          </td>
                          <td className="rounded-r-xl px-3 py-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={c.status}
                              onChange={(e) =>
                                update(c.id, { status: e.target.value as ComplaintStatus })
                              }
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-xs font-bold outline-none",
                                statusStyles[c.status],
                              )}
                            >
                              {statusOrder.map((s) => (
                                <option key={s} className="bg-card text-foreground">
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
                            No complaints match these filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Detail drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]"
            onClick={() => setOpen(null)}
            aria-label="Close details"
          />
          <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground">{open.id}</p>
                <h2 className="font-display text-lg font-extrabold">{open.subject}</h2>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="rounded-full p-2 hover:bg-accent"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className={cn("rounded-full border px-2.5 py-1", statusStyles[open.status])}>
                {open.status}
              </span>
              <span className={cn("rounded-full border px-2.5 py-1", urgencyStyles[open.urgency])}>
                {open.urgency}
              </span>
              <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground">
                {open.category}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{open.description}</p>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-border bg-muted/35 p-3">
                <dt className="text-[11px] text-muted-foreground">Raised by</dt>
                <dd className="font-semibold">{open.student}</dd>
              </div>
              <div className="rounded-2xl border border-border bg-muted/35 p-3">
                <dt className="text-[11px] text-muted-foreground">Date</dt>
                <dd className="font-semibold">{open.date}</dd>
              </div>
            </dl>

            <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Progress
            </h3>
            <ol className="mt-3 space-y-3">
              {timelineSteps.map((s, i) => {
                const done = i <= stepIndexFor(open.status);
                return (
                  <li key={s} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        done ? "bg-primary" : "bg-muted-foreground/30",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        done ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s}
                    </span>
                  </li>
                );
              })}
            </ol>

            <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Update
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <select
                value={open.status}
                onChange={(e) => update(open.id, { status: e.target.value as ComplaintStatus })}
                className="rounded-2xl border border-border bg-muted/40 px-3 py-2 text-sm font-semibold outline-none"
              >
                {statusOrder.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={open.assignee}
                onChange={(e) => update(open.id, { assignee: e.target.value })}
                className="rounded-2xl border border-border bg-muted/40 px-3 py-2 text-sm font-semibold outline-none"
              >
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>

            <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Internal notes
            </h3>
            <ul className="mt-3 space-y-2">
              {open.notes.map((n, i) => (
                <li key={i} className="rounded-2xl border border-border bg-muted/35 p-3">
                  <p className="text-sm">{n.text}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {n.author} · {n.time}
                  </p>
                </li>
              ))}
              {open.notes.length === 0 && (
                <li className="text-sm text-muted-foreground">No notes yet.</li>
              )}
            </ul>
            <div className="mt-3 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Add a note…"
                className="flex-1 rounded-full border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none focus:border-primary/50"
              />
              <button
                onClick={addNote}
                className="rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
              >
                Add
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
