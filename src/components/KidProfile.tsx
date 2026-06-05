"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { getAge, getZodiacSign } from "@/lib/zodiac";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Kid } from "@/types";

interface KidProfileProps {
  kid: Kid;
}

interface StatItemProps {
  label: string;
  value: string;
  emoji?: string;
}

function StatItem({ label, value, emoji }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-background border border-border">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">
        {emoji && <span className="mr-1">{emoji}</span>}
        {value}
      </span>
    </div>
  );
}

export function KidProfile({ kid }: KidProfileProps) {
  const { t, language, dir } = useLanguage();
  const age = getAge(kid.birthdate);
  const zodiac = getZodiacSign(kid.birthdate);

  const birthFormatted = new Date(kid.birthdate).toLocaleDateString(
    language === "he" ? "he-IL" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-card rounded-lg border border-border shadow-card">
      {/* Avatar */}
      <div className="flex-shrink-0 flex justify-center sm:justify-start">
        <div className="relative">
          {kid.profile_photo_url ? (
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20">
              <Image
                src={kid.profile_photo_url}
                alt={t(kid.name_he, kid.name_en)}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <Avatar className="w-24 h-24 ring-4 ring-primary/20">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary font-display">
                {t(kid.name_he, kid.name_en).charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1" dir={dir}>
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">
          {t(kid.name_he, kid.name_en)}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          {t(`בן/בת ${age}`, `Age ${age}`)}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <StatItem
            label={t("יום הולדת", "Birthday")}
            value={birthFormatted}
            emoji="🎂"
          />
          <StatItem
            label={t("גיל", "Age")}
            value={t(`${age} שנים`, `${age} years old`)}
            emoji="🌟"
          />
          <StatItem
            label={t("מזל", "Star sign")}
            value={`${zodiac.emoji} ${t(zodiac.he, zodiac.en)}`}
          />
          <StatItem
            label={t("אוכל אהוב", "Favorite food")}
            value={t(kid.favorite_food_he, kid.favorite_food_en)}
            emoji="🍽️"
          />
          <StatItem
            label={t("צבע אהוב", "Favorite color")}
            value={t(kid.favorite_color_he, kid.favorite_color_en)}
            emoji="🎨"
          />
        </div>
      </div>
    </div>
  );
}
