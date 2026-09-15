import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "campus-theme";
const LANG_KEY = "campus-language";

export type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial: Theme =
      stored ??
      (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}

export const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

export function useLanguage() {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored) setLang(stored);
  }, []);

  const change = useCallback((code: string) => {
    setLang(code);
    localStorage.setItem(LANG_KEY, code);
    if (typeof document !== "undefined") document.documentElement.lang = code;
  }, []);

  const current = languages.find((l) => l.code === lang) ?? languages[0]!;

  return { lang, current, change };
}
