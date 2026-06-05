"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getAge, getZodiacSign } from "@/lib/zodiac";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(kid.profile_photo_url);
  const [uploading, setUploading] = useState(false);

  const birthFormatted = new Date(kid.birthdate).toLocaleDateString(
    language === "he" ? "he-IL" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${kid.slug}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("kids")
        .update({ profile_photo_url: url })
        .eq("id", kid.id);
      if (updateError) throw updateError;

      setPhotoUrl(url);
    } catch (err) {
      console.error("Photo upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-card rounded-lg border border-border shadow-card">
      {/* Avatar with upload overlay */}
      <div className="flex-shrink-0 flex justify-center sm:justify-start">
        <button
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          title={t("לחץ להחלפת תמונה", "Click to change photo")}
        >
          {photoUrl ? (
            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20">
              <Image
                src={photoUrl}
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

          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : <Camera className="w-5 h-5 text-white" />
            }
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Info */}
      <div className="flex-1" dir={dir}>
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">
          {t(kid.name_he, kid.name_en)}
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          {t(kid.gender === "m" ? `בן ${age}` : `בת ${age}`, `Age ${age}`)}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <StatItem label={t("יום הולדת", "Birthday")} value={birthFormatted} emoji="🎂" />
          <StatItem label={t("גיל", "Age")} value={t(`${age} שנים`, `${age} years old`)} emoji="🌟" />
          <StatItem label={t("מזל", "Star sign")} value={`${zodiac.emoji} ${t(zodiac.he, zodiac.en)}`} />
          <StatItem label={t("אוכל אהוב", "Favorite food")} value={t(kid.favorite_food_he, kid.favorite_food_en)} emoji="🍽️" />
          <StatItem label={t("צבע אהוב", "Favorite color")} value={t(kid.favorite_color_he, kid.favorite_color_en)} emoji="🎨" />
        </div>
      </div>
    </div>
  );
}
