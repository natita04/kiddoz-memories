"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { enterAsGuest, logout } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getKidColors } from "@/lib/kidColors";
import type { Kid } from "@/types";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, dir } = useLanguage();
  const { mode, setMode } = useAuth();
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
    <header className="sticky top-0 z-40 w-full bg-cream dark:bg-background border-b border-line dark:border-border">
      {/* Row 1: Logo + controls — always LTR */}
      <div
        className="container max-w-4xl mx-auto flex h-14 items-center justify-between px-5"
        dir={dir}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "#FCE3D5",
              display: "grid",
              placeItems: "center",
              fontSize: 18,
              transform: "rotate(-6deg)",
              flexShrink: 0,
            }}
          >
            💛
          </div>
          <span
            className="font-display text-lg leading-none"
            style={{ color: "var(--color-ink)" }}
          >
            {t("זכרונות משפחת רז", "Memories - Raz Family")}
          </span>
        </Link>

        {/* Controls — fixed order left→right: moon · language · guest/login */}
        <div className="flex items-center gap-2">
          {/* 1. Dark/light toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
          {/* 2. Language toggle */}
          <button
            onClick={() => setLanguage(language === "he" ? "en" : "he")}
            className="font-round px-3 py-1 rounded-full text-xs font-semibold border border-line dark:border-border hover:bg-secondary transition-colors"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {language === "he" ? "EN" : "עב"}
          </button>
          {/* 3. Auth mode toggle — rightmost so appearing/disappearing doesn't shift other buttons */}
          {mounted && mode === "guest" && (
            <button
              onClick={() => { logout(); setMode(null); router.push("/"); }}
              className="font-round px-3 py-1 rounded-full text-xs font-semibold transition-colors"
              style={{ color: "#E07F52", border: "1.5px solid #F7BD9C", background: "#FCE3D530" }}
              title={t("כניסה עם סיסמה", "Sign in with password")}
            >
              {t("כניסה", "Sign in")}
            </button>
          )}
          {mounted && mode === "full" && (
            <button
              onClick={() => { enterAsGuest(); setMode("guest"); }}
              className="font-round px-3 py-1 rounded-full text-xs font-semibold border border-line dark:border-border hover:bg-secondary transition-colors"
              style={{ color: "var(--color-ink-soft)" }}
              title={t("מעבר למצב אורח", "Switch to guest view")}
            >
              {t("מצב אורח", "Guest mode")}
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Kid tabs as pills */}
      <div className="border-t border-line/60 dark:border-border/50">
        <nav
          className="container max-w-4xl mx-auto flex items-center gap-2 px-5 py-2"
          dir={dir}
        >
          {kids.map((kid) => {
            const isActive = activeSlug === kid.slug;
            const fam = getKidColors(kid.order);
            const emoji = kid.gender === "m" ? "👦" : "👧";

            return (
              <Link
                key={kid.id}
                href={`/${kid.slug}`}
                style={
                  isActive
                    ? {
                        background: fam.soft,
                        border: `2px solid ${fam.mid}`,
                        color: fam.deep,
                      }
                    : {
                        background: "transparent",
                        border: "2px solid transparent",
                        color: "var(--color-ink-soft)",
                      }
                }
                className="flex items-center gap-2 px-3 py-1 rounded-full transition-colors"
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: isActive ? fam.mid : "#EFE7DE",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  {emoji}
                </span>
                <span
                  className="font-round text-sm"
                  style={{ fontWeight: isActive ? 700 : 400 }}
                >
                  {t(kid.name_he, kid.name_en)}
                </span>
              </Link>
            );
          })}

          {/* Kid #3 placeholder */}
          <button
            disabled
            className="font-round flex items-center gap-2 px-3 py-1 text-sm cursor-not-allowed"
            style={{
              borderRadius: 99,
              border: "2px dashed var(--color-line)",
              background: "transparent",
              color: "var(--color-ink-soft)",
              opacity: 0.6,
            }}
            title={t("הולד/ת בקרוב", "Coming soon")}
          >
            <span style={{ fontSize: 15 }}>＋</span>
            {t("ילד #3", "Kid #3")}
          </button>
        </nav>
      </div>
    </header>
  );
}
