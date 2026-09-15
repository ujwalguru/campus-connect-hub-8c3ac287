import { useCallback, useEffect, useState } from "react";
import { initialAnnouncements } from "./adminData";

export type Announcement = {
  id: number;
  title: string;
  body: string;
  date: string;
};

const STORAGE_KEY = "campus-announcements";
const EVENT = "campus-announcements-change";

function read(): Announcement[] {
  if (typeof window === "undefined") return initialAnnouncements;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialAnnouncements;
    const parsed = JSON.parse(raw) as Announcement[];
    return Array.isArray(parsed) ? parsed : initialAnnouncements;
  } catch {
    return initialAnnouncements;
  }
}

function write(list: Announcement[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Shared announcements: published by admin, read by students. */
export function useAnnouncements() {
  const [announcements, setState] = useState<Announcement[]>(initialAnnouncements);

  useEffect(() => {
    const sync = () => setState(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const publish = useCallback((title: string, body: string) => {
    const next: Announcement = {
      id: Date.now(),
      title,
      body,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    write([next, ...read()]);
    return next;
  }, []);

  const remove = useCallback((id: number) => {
    write(read().filter((a) => a.id !== id));
  }, []);

  return { announcements, publish, remove };
}
