import { useCallback, useEffect, useState } from "react";

export type StudentProfile = {
  name: string;
  initials: string;
  course: string;
  rollNo: string;
  email: string;
  phone: string;
  year: string;
};

export const defaultProfile: StudentProfile = {
  name: "Rahul Sharma",
  initials: "RS",
  course: "B.Tech - Computer Science",
  rollNo: "CS2023-114",
  email: "rahul.sharma@campus.edu",
  phone: "+91 98765 43210",
  year: "3rd Year",
};

const KEY = "campus-profile";
const EVENT = "campus-profile-change";

function read(): StudentProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return defaultProfile;
}

export function useProfile() {
  const [profile, setProfile] = useState<StudentProfile>(read);

  useEffect(() => {
    const sync = () => setProfile(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((next: StudentProfile) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    setProfile(next);
  }, []);

  return { profile, save };
}
