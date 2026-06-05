"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import type { Kid } from "@/types";

export function Nav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [kids, setKids] = useState<Kid[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase
      .from("kids")
      .select("*")
      .order("order")
      .then(({ data }) => {
        if (data) setKids(data as Kid[]);
      });
  }, []);

  const activeSlug = pathname.split("/").pop();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container max-w-4xl mx-auto flex h-14 items-center justify-between px-4" dir="ltr">
        {/* Kid tabs */}
        <nav className="flex items-center gap-1">
          {kids.map((kid) => {
            const isActive = activeSlug === kid.slug;
            return (
              <Link
                key={kid.id}
                href={`/${kid.slug}`}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-background text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {t(kid.name_he, kid.name_en)}
              </Link>
            );
          })}

          {/* Kid #3 placeholder */}
          <button
            disabled
            className="px-4 py-1.5 rounded-md text-sm font-medium text-muted-foreground/40 cursor-not-allowed flex items-center gap-1.5"
            title={t("הולד/ת בקרוב", "Coming soon")}
          >
            <Baby className="w-3.5 h-3.5" />
            {t("ילד #3", "Kid #3")}
          </button>
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2" dir="ltr">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === "he" ? "en" : "he")}
            className="px-3 py-1 rounded-md text-xs font-semibold border border-border hover:bg-secondary transition-colors"
          >
            {language === "he" ? "EN" : "עב"}
          </button>

          {/* Dark/light toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
