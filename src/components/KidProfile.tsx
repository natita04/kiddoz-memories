"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Pencil, Expand } from "lucide-react";
import { KidEditModal } from "@/components/KidEditModal";
import { useLanguage } from "@/context/LanguageContext";
import { getAge, getZodiacSign } from "@/lib/zodiac";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { getKidColors } from "@/lib/kidColors";
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

interface StatChipProps {
  label: string;
  value: string;
  emoji?: string;
  softColor: string;
}

function StatChip({ label, value, emoji, softColor }: StatChipProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 14px",
        background: "rgba(255,255,255,0.72)",
        borderRadius: 16,
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: softColor,
          display: "grid",
          placeItems: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {emoji ?? "•"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
        <span
          className="font-round"
          style={{ fontSize: 11.5, color: "#8E869C" }}
        >
          {label}
        </span>
        <span
          className="font-round"
          style={{ fontSize: 15, color: "#4B4358", fontWeight: 700 }}
        >
          {value}
        </span>
      </div>
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
  const c = getKidColors(kidData.order);

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
    <div
      style={{
        borderRadius: 28,
        padding: "26px 28px",
        background: `linear-gradient(135deg, ${c.soft} 0%, ${c.mid}40 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: c.mid,
          filter: "blur(2px)",
          opacity: 0.35,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -50,
          left: 60,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: c.soft,
          filter: "blur(2px)",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      <div
        className="flex flex-col sm:flex-row gap-6"
        style={{ position: "relative" }}
        dir={dir}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="group relative">
            {photoUrl ? (
              <div
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: "32%",
                  overflow: "hidden",
                  transform: "rotate(-3deg)",
                  boxShadow: `0 0 0 5px #fff, 0 0 0 9px ${c.mid}`,
                  flexShrink: 0,
                }}
              >
                <Image
                  src={photoUrl}
                  alt={t(kid.name_he, kid.name_en)}
                  width={104}
                  height={104}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: "32%",
                  background: `linear-gradient(150deg, ${c.soft}, ${c.mid})`,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 52,
                  transform: "rotate(-3deg)",
                  boxShadow: `0 0 0 5px #fff, 0 0 0 9px ${c.mid}`,
                  flexShrink: 0,
                }}
              >
                {kid.gender === "m" ? "👦" : "👧"}
              </div>
            )}

            {/* Hover actions */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isGuest && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title={t("החלפת תמונה", "Change photo")}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "1px solid #EFE7DE",
                    boxShadow: "0 2px 6px rgba(75,67,88,0.10)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {uploading ? (
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                  ) : (
                    <Camera className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              )}
              {photoUrl && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  title={t("הגדלה", "View full")}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "1px solid #EFE7DE",
                    boxShadow: "0 2px 6px rgba(75,67,88,0.10)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Expand className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
          <div className="h-5" />
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
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <h2
                  className="font-display"
                  style={{ margin: 0, fontSize: 34, color: "#4B4358" }}
                >
                  {t(kidData.name_he, kidData.name_en)}
                </h2>
                <span
                  className="font-round"
                  style={{ fontSize: 16, color: c.deep }}
                >
                  {t(
                    kidData.gender === "m" ? `בן ${age}` : `בת ${age}`,
                    `Age ${age}`
                  )}
                </span>
              </div>
            </div>
            {!isGuest && (
              <button
                onClick={() => setEditOpen(true)}
                title={t("עריכת פרטים", "Edit details")}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: "none",
                  background: "#fff",
                  color: "#8E869C",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(75,67,88,0.12)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 16,
            }}
          >
            <StatChip
              label={t("יום הולדת", "Birthday")}
              value={birthFormatted}
              emoji="🎂"
              softColor={c.soft}
            />
            <StatChip
              label={t("גיל", "Age")}
              value={t(`${age} שנים`, `${age} years old`)}
              emoji="🌟"
              softColor={c.soft}
            />
            <StatChip
              label={t("מזל", "Star sign")}
              value={`${zodiac.emoji} ${t(zodiac.he, zodiac.en)}`}
              softColor={c.soft}
            />
            <StatChip
              label={t("אוכל אהוב", "Favorite food")}
              value={t(kidData.favorite_food_he, kidData.favorite_food_en)}
              emoji={foodEmoji(kidData.favorite_food_he, kidData.favorite_food_en)}
              softColor={c.soft}
            />
            <StatChip
              label={t("צבע אהוב", "Favorite color")}
              value={t(kidData.favorite_color_he, kidData.favorite_color_en)}
              emoji={colorEmoji(kidData.favorite_color_he, kidData.favorite_color_en)}
              softColor={c.soft}
            />
          </div>
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
