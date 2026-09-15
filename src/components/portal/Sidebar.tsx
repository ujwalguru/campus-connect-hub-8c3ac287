import {
  GraduationCap,
  Home,
  PlusCircle,
  FileText,
  Clock,
  Bell,
  BookOpen,
  User,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home },
  { label: "New Complaint", icon: PlusCircle },
  { label: "My Complaints", icon: FileText },
  { label: "Track Status", icon: Clock },
  { label: "Notifications", icon: Bell, badge: 3 },
  { label: "Knowledge Base", icon: BookOpen },
  { label: "Profile", icon: User },
  { label: "Settings", icon: Settings },
];

export function PortalSidebar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (label: string) => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col justify-between border-r border-border bg-sidebar lg:flex">
      <div>
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-[15px] font-extrabold leading-tight text-sidebar-foreground">
            Student
            <br />
            Complaint Portal
          </span>
        </div>

        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = active === item.label;
            return (
              <button
                key={item.label}
                onClick={() => onSelect(item.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-warm)]"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-[18px]" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[11px] font-bold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="relative m-4 overflow-hidden rounded-2xl border border-border p-5">
        <div className="absolute inset-0" style={{ background: "var(--gradient-warm)" }} />
        <svg
          className="absolute -bottom-6 left-0 w-full text-primary/25"
          viewBox="0 0 200 60"
          fill="none"
          aria-hidden="true"
        >
          <path d="M0 30c40-26 70 20 110-4s60 6 90-10v50H0z" fill="currentColor" />
          <path d="M0 44c50-22 80 14 120-6s50 4 80-8v34H0z" fill="currentColor" opacity="0.5" />
        </svg>
        <p className="relative font-display text-lg font-extrabold leading-tight text-foreground">
          Better
          <br />
          Campus
          <br />
          Together
        </p>
        <span className="relative mt-3 block h-1 w-8 rounded-full bg-primary" />
      </div>
    </aside>
  );
}
