"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Pencil, Expand } from "lucide-react";
import { KidEditModal } from "@/components/KidEditModal";
import { useLanguage } from "@/context/LanguageContext";
import { getAge, getZodiacSign } from "@/lib/zodiac";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Kid } from "@/types";

interface KidProfileProps {
  kid: Kid;
}

function foodEmoji(he: string, en: string): string {
  const s = `${he} ${en}`.toLowerCase();
  if (s.includes("pizza") || s.includes("פיצה")) return "🍕";
  if (s.includes("toast") || s.includes("טוסט")) return "🍞";
  if (s.includes("egg") || s.includes("ביצ")) return "🍳";
  if (s.includes("chocolate") || s.includes("שוקולד")) return "🍫";
  if (s.includes("pasta") || s.includes("פסטה")) return "🍝";
  if (s.includes("rice") || s.includes("אורז")) return "🍚";
  if (s.includes("burger") || s.includes("המבורגר")) return "🍔";
  if (s.includes("sushi") || s.includes("סושי")) return "🍣";
  if (s.includes("salad") || s.includes("סלט")) return "🥗";
  if (s.includes("soup") || s.includes("מרק")) return "🍲";
  if (s.includes("ice cream") || s.includes("גלידה")) return "🍦";
  if (s.includes("cake") || s.includes("עוגה")) return "🎂";
  if (s.includes("apple") || s.includes("תפוח")) return "🍎";
  if (s.includes("banana") || s.includes("בננה")) return "🍌";
  return "🍽️";
}

function colorEmoji(he: string, en: string): string {
  const s = `${he} ${en}`.toLowerCase();
  if (s.includes("red") || s.includes("אדום")) return "🔴";
  if (s.includes("blue") || s.includes("כחול")) return "🔵";
  if (s.includes("green") || s.includes("ירוק")) return "🟢";
  if (s.includes("yellow") || s.includes("צהוב")) return "🟡";
  if (s.includes("orange") || s.includes("כתום")) return "🟠";
  if (s.includes("purple") || s.includes("סגול")) return "🟣";
  if (s.includes("brown") || s.includes("חום")) return "🟤";
  if (s.includes("black") || s.includes("שחור")) return "⚫";
  if (s.includes("white") || s.includes("לבן")) return "⚪";
  if (s.includes("pink") || s.includes("ורוד")) return "🩷";
  if (s.includes("gold") || s.includes("זהב")) return "🌟";
  return "🎨";
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
      <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
        {emoji && <span>{emoji}</span>}
        <span>{value}</span>
      </span>
    </div>
  );
}

export function KidProfile({ kid }: KidProfileProps) {
  const { t, language, dir } = useLanguage();
  const { isGuest } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [kidData, setKidData] = useState(kid);
  const [photoUrl, setPhotoUrl] = useState(kid.profile_photo_url);
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const age = getAge(kidData.birthdate);
  const zodiac = getZodiacSign(kidData.birthdate);

  const birthFormatted = new Date(kidData.birthdate).toLocaleDateString(
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
      {/* Avatar with hover actions below */}
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <div className="group relative">
          {/* Avatar circle */}
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

          {/* Two small icon buttons that appear below the avatar on hover */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isGuest && (
              <button
                onClick={() => fileInputRef.current?.click()}
                title={t("החלפת תמונה", "Change photo")}
                className="p-1.5 rounded-full bg-background border border-border shadow-sm hover:bg-secondary transition-colors"
              >
                {uploading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  : <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                }
              </button>
            )}
            {photoUrl && (
              <button
                onClick={() => setLightboxOpen(true)}
                title={t("הגדלה", "View full")}
                className="p-1.5 rounded-full bg-background border border-border shadow-sm hover:bg-secondary transition-colors"
              >
                <Expand className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Spacer so icons don't overlap the content below */}
        <div className="h-4" />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Lightbox */}
      {lightboxOpen && photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full">
            <Image
              src={photoUrl}
              alt={t(kidData.name_he, kidData.name_en)}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}

      {/* Info */}
      <div className="flex-1" dir={dir}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-1">
              {t(kidData.name_he, kidData.name_en)}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              {t(kidData.gender === "m" ? `בן ${age}` : `בת ${age}`, `Age ${age}`)}
            </p>
          </div>
          {!isGuest && (
            <button
              onClick={() => setEditOpen(true)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={t("עריכת פרטים", "Edit details")}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <StatItem label={t("יום הולדת", "Birthday")} value={birthFormatted} emoji="🎂" />
          <StatItem label={t("גיל", "Age")} value={t(`${age} שנים`, `${age} years old`)} emoji="🌟" />
          <StatItem label={t("מזל", "Star sign")} value={`${zodiac.emoji} ${t(zodiac.he, zodiac.en)}`} />
          <StatItem label={t("אוכל אהוב", "Favorite food")} value={t(kidData.favorite_food_he, kidData.favorite_food_en)} emoji={foodEmoji(kidData.favorite_food_he, kidData.favorite_food_en)} />
          <StatItem label={t("צבע אהוב", "Favorite color")} value={t(kidData.favorite_color_he, kidData.favorite_color_en)} emoji={colorEmoji(kidData.favorite_color_he, kidData.favorite_color_en)} />
        </div>
      </div>

      <KidEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        kid={kidData}
        onSaved={(updated) => setKidData(updated)}
      />
    </div>
  );
}
