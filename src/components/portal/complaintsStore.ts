import { useCallback, useEffect, useState } from "react";
import { adminComplaints, type AdminComplaint } from "./adminData";
import type { ComplaintStatus } from "./data";

const STORAGE_KEY = "campus-complaints";
const EVENT = "campus-complaints-change";

function read(): AdminComplaint[] {
  if (typeof window === "undefined") return adminComplaints;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return adminComplaints;
    const parsed = JSON.parse(raw) as AdminComplaint[];
    return Array.isArray(parsed) && parsed.length ? parsed : adminComplaints;
  } catch {
    return adminComplaints;
  }
}

function write(list: AdminComplaint[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage quota exceeded (large media): keep file details, drop the heavy previews.
    const slim = list.map((c) => ({
      ...c,
      attachments: (c.attachments ?? []).map((a) => ({ ...a, url: "" })),
    }));
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

function nextId(list: AdminComplaint[]) {
  const numbers = list
    .map((c) => Number(c.id.replace(/\D/g, "").slice(-4)))
    .filter((n) => Number.isFinite(n));
  const max = numbers.length ? Math.max(...numbers) : 148;
  return `#SC-${new Date().getFullYear()}-0${max + 1}`;
}

/** Shared complaint list: filed by students, managed by admin. */
export function useComplaints() {
  const [complaints, setState] = useState<AdminComplaint[]>(adminComplaints);

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

  const add = useCallback(
    (data: Omit<AdminComplaint, "id" | "date" | "status" | "assignee" | "notes">) => {
      const current = read();
      const next: AdminComplaint = {
        ...data,
        id: nextId(current),
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "Submitted",
        assignee: "Unassigned",
        notes: [],
      };
      write([next, ...current]);
      return next;
    },
    [],
  );

  const update = useCallback((id: string, patch: Partial<AdminComplaint>) => {
    write(read().map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const bulkStatus = useCallback((ids: string[], status: ComplaintStatus) => {
    write(read().map((c) => (ids.includes(c.id) ? { ...c, status } : c)));
  }, []);

  const remove = useCallback((ids: string[]) => {
    write(read().filter((c) => !ids.includes(c.id)));
  }, []);

  return { complaints, add, update, bulkStatus, remove };
}
