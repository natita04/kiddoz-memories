"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "@/types";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (he: string, en: string) => string;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "he",
  setLanguage: () => {},
  t: (he) => he,
  dir: "rtl",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("he");

  useEffect(() => {
    const stored = localStorage.getItem("kiddoz_lang") as Language | null;
    if (stored === "he" || stored === "en") setLanguageState(stored);
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem("kiddoz_lang", lang);
  }

  function t(he: string, en: string) {
    return language === "he" ? he : en;
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, dir: language === "he" ? "rtl" : "ltr" }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
