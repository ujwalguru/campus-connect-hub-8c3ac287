import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Sun,
  Moon,
  Globe,
  Check,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notifications } from "./data";
import { useProfile } from "./profile";
import { languages, useLanguage, useTheme } from "./prefs";

export function TopBar({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
}) {
  const { profile } = useProfile();
  const { theme, toggle } = useTheme();
  const { lang, current, change } = useLanguage();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-8">
      <label className="relative flex h-11 flex-1 items-center rounded-xl border border-border bg-card px-4 md:max-w-xl">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search complaints, keywords..."
          className="h-full flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <span className="hidden rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground sm:block">
          Ctrl + K
        </span>
      </label>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent"
        >
          {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Change language"
            className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-foreground outline-none transition-colors hover:bg-accent data-[state=open]:bg-accent"
          >
            <Globe className="size-[18px]" />
            <span className="hidden text-sm font-semibold uppercase sm:block">{current.code}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {languages.map((l) => (
              <DropdownMenuItem key={l.code} onClick={() => change(l.code)}>
                <span className="flex-1">
                  {l.native}
                  <span className="ml-2 text-xs text-muted-foreground">{l.label}</span>
                </span>
                {lang === l.code && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger className="relative flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent">
            <Bell className="size-[18px]" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-card" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <p className="border-b border-border px-4 py-3 text-sm font-bold">Notifications</p>
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <li key={n.title} className="px-4 py-3">
                  <p className="text-sm font-medium leading-snug text-foreground">{n.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 transition-colors outline-none hover:bg-accent data-[state=open]:bg-accent">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {profile.initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-bold text-foreground">{profile.name}</span>
              <span className="block text-xs text-muted-foreground">{profile.course}</span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none">{profile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
              <User className="mr-2 size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/student" })}>
              <HelpCircle className="mr-2 size-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/" })} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
