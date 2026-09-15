import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, ArrowRight } from "lucide-react";
import campusImage from "@/assets/campus.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Voice Hub — Student & Admin Complaint Portal" },
      {
        name: "description",
        content:
          "Choose how you want to continue: file and track campus complaints as a student, or review every complaint as an administrator.",
      },
      { property: "og:title", content: "Campus Voice Hub" },
      {
        property: "og:description",
        content: "Continue as a student to file complaints, or as an admin to review them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const roles = [
  {
    to: "/student" as const,
    icon: GraduationCap,
    title: "I'm a Student",
    text: "File a new complaint, track its progress and browse common answers.",
    cta: "Enter student portal",
  },
  {
    to: "/admin" as const,
    icon: ShieldCheck,
    title: "I'm an Admin",
    text: "See every complaint coming in, filter by status or category and stay on top of them.",
    cta: "Enter admin dashboard",
  },
];

function Landing() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-14 text-foreground">
      <img
        src={campusImage}
        alt="Sunlit campus building surrounded by trees"
        className="absolute inset-0 size-full object-cover opacity-20"
      />
      <div className="absolute inset-0" style={{ background: "var(--gradient-warm)", opacity: 0.7 }} />

      <div className="relative w-full max-w-4xl">
        <div className="text-center">
          <span className="inline-block rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Campus Voice Hub
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            How would you like to continue?
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Pick your role to open the right space for you.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {roles.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className="group rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-warm)] transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <r.icon className="size-7" />
              </span>
              <h2 className="mt-5 font-display text-xl font-extrabold">{r.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                {r.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
