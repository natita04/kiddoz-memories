"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { getKidColors } from "@/lib/kidColors";
import type { Kid } from "@/types";

export function Nav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, dir } = useLanguage();
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
        dir="ltr"
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
            style={{ color: "#4B4358" }}
          >
            {t("הזכרונות שלנו", "Our Memories")}
          </span>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-2" dir="ltr">
          <button
            onClick={() => setLanguage(language === "he" ? "en" : "he")}
            className="font-round px-3 py-1 rounded-full text-xs font-semibold border border-line dark:border-border hover:bg-secondary transition-colors"
            style={{ color: "#8E869C" }}
          >
            {language === "he" ? "EN" : "עב"}
          </button>
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
                        color: "#8E869C",
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
              border: "2px dashed #EFE7DE",
              background: "transparent",
              color: "#8E869C",
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
