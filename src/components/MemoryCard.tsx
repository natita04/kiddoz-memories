"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { PREDEFINED_TAGS, getTagLabel } from "@/lib/tags";
import { getAgeAtDate } from "@/lib/zodiac";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import type { Kid, Memory } from "@/types";

interface MemoryCardProps {
  memory: Memory;
  kidBirthdate: string;
  allKids: Kid[];
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
}

/* ─── Lightbox ────────────────────────────────────────────── */
function Lightbox({ photos, startIndex, onClose }: { photos: string[]; startIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(startIndex);
  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); }}
      tabIndex={0} autoFocus
    >
      <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2" onClick={onClose}>
        <X className="w-6 h-6" />
      </button>
      {photos.length > 1 && (
        <button className="absolute left-4 text-white/80 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); prev(); }}>
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
        <Image src={photos[index]} alt={`Photo ${index + 1}`} fill className="object-contain" sizes="90vw" />
      </div>
      {photos.length > 1 && (
        <button className="absolute right-4 text-white/80 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); next(); }}>
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
      {photos.length > 1 && (
        <div className="absolute bottom-4 text-white/60 text-sm">{index + 1} / {photos.length}</div>
      )}
    </div>
  );
}

/* ─── Card ────────────────────────────────────────────────── */
export function MemoryCard({ memory, kidBirthdate, allKids, onEdit, onDelete }: MemoryCardProps) {
  const { language, t, dir } = useLanguage();
  const { isGuest } = useAuth();
  const ageAtMemory = getAgeAtDate(kidBirthdate, memory.memory_date);
  const sharedWith = allKids.filter((k) => memory.shared_kid_ids?.includes(k.id));

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const story = language === "he" ? memory.story_he ?? memory.story_en : memory.story_en ?? memory.story_he;
  const dateFormatted = new Date(memory.memory_date).toLocaleDateString(
    language === "he" ? "he-IL" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const photos = memory.photos ?? [];
  const hasPhotos = photos.length > 0;
  const multi = photos.length > 1;

  function handleDelete() {
    if (confirmingDelete) { onDelete(memory.id); }
    else { setConfirmingDelete(true); setTimeout(() => setConfirmingDelete(false), 3000); }
  }

  function carouselPrev(e: React.MouseEvent) {
    e.stopPropagation();
    setCarouselIndex((i) => (i - 1 + photos.length) % photos.length);
  }
  function carouselNext(e: React.MouseEvent) {
    e.stopPropagation();
    setCarouselIndex((i) => (i + 1) % photos.length);
  }

  return (
    <>
      <article
        className="animate-fade-in"
        style={{
          background: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 6px 22px rgba(75,67,88,0.08)",
          border: "1px solid #EFE7DE",
          position: "relative",
          display: "flex",
          alignItems: "stretch",
          minHeight: hasPhotos ? 180 : "auto",
        }}
      >
        {/* ── Photo column — first in DOM → physical RIGHT in RTL ── */}
        {hasPhotos && (
          <div style={{ flex: "0 0 190px", position: "relative", overflow: "hidden", cursor: "pointer" }}
            onClick={() => setLightboxIndex(carouselIndex)}>
            <Image
              src={photos[carouselIndex]}
              alt={`Memory photo ${carouselIndex + 1}`}
              fill
              className="object-cover"
              sizes="190px"
            />

            {/* Carousel arrows */}
            {multi && (
              <>
                <button
                  onClick={carouselPrev}
                  style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: 6,
                    width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: "rgba(255,255,255,0.85)", display: "grid", placeItems: "center",
                    fontSize: 16, color: "rgba(55,45,70,0.8)", boxShadow: "0 1px 5px rgba(0,0,0,0.15)", zIndex: 1 }}>
                  ‹
                </button>
                <button
                  onClick={carouselNext}
                  style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: 6,
                    width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: "rgba(255,255,255,0.85)", display: "grid", placeItems: "center",
                    fontSize: 16, color: "rgba(55,45,70,0.8)", boxShadow: "0 1px 5px rgba(0,0,0,0.15)", zIndex: 1 }}>
                  ›
                </button>

                {/* Dots */}
                <div style={{ position: "absolute", bottom: 10, left: 0, right: 0,
                  display: "flex", justifyContent: "center", gap: 5, zIndex: 1 }}>
                  {photos.map((_, i) => (
                    <div key={i} onClick={(e) => { e.stopPropagation(); setCarouselIndex(i); }}
                      style={{ width: i === carouselIndex ? 8 : 6, height: i === carouselIndex ? 8 : 6,
                        borderRadius: "50%", background: i === carouselIndex ? "#fff" : "rgba(255,255,255,0.5)",
                        cursor: "pointer", transition: "all 0.15s" }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Text column — second in DOM → physical LEFT in RTL ── */}
        <div
          dir={dir}
          style={{
            flex: 1,
            padding: dir === "rtl"
              ? (hasPhotos ? "20px 18px 18px 56px" : "24px 18px 18px 56px")
              : (hasPhotos ? "20px 56px 18px 18px" : "24px 56px 18px 18px"),
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minWidth: 0,
          }}
        >
          {story && (
            <p style={{ margin: "0 0 0 0", fontFamily: "var(--font-sans, Rubik, sans-serif)",
              fontSize: 16, lineHeight: 1.7, color: "#4B4358",
              textAlign: dir === "rtl" ? "right" : "left" }}>
              {story}
            </p>
          )}

          {/* Footer — dir on the row so flex-direction reverses for RTL,
               first child (date) ends up on left in RTL, tags on right */}
          <div dir={dir} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 14, paddingTop: 14, borderTop: "1px solid #EFE7DE", gap: 12, flexWrap: "wrap" }}>
            {/* Date + age — first in DOM → physical RIGHT in RTL, LEFT in LTR */}
            <div style={{ display: "flex", alignItems: "center", gap: 10,
              fontFamily: "var(--font-round, sans-serif)", fontSize: 12.5,
              color: "#8E869C", whiteSpace: "nowrap", flexShrink: 0 }}>
              <span>📅 {dateFormatted}</span>
              {ageAtMemory && <span>{t(`גיל ${ageAtMemory}`, `Age ${ageAtMemory}`)}</span>}
            </div>
            {/* Tags — second in DOM → physical LEFT in RTL, RIGHT in LTR */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {memory.tags?.map((tagId) => {
                const tagDef = PREDEFINED_TAGS.find((t) => t.id === tagId);
                const label = getTagLabel(tagId, language);
                return (
                  <span key={tagId} style={tagDef
                    ? { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px",
                        borderRadius: 99, fontFamily: "var(--font-round, sans-serif)", fontSize: 12.5,
                        background: tagDef.colors.soft, color: tagDef.colors.deep, border: `1.5px solid ${tagDef.colors.mid}` }
                    : { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px",
                        borderRadius: 99, fontFamily: "var(--font-round, sans-serif)", fontSize: 12.5,
                        background: "#F5F5F5", color: "#8E869C", border: "1.5px solid #EFE7DE" }}>
                    {label}
                  </span>
                );
              })}
              {sharedWith.length > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px",
                  borderRadius: 99, fontFamily: "var(--font-round, sans-serif)", fontSize: 12.5,
                  background: "#EDE7FB", color: "#7E5BC9", border: "1.5px solid #CBB8F2" }}>
                  🤝 {t("גם עם", "Also with")} {sharedWith.map((k) => t(k.name_he, k.name_en)).join(", ")}
                </span>
              )}
            </div>

          </div>
        </div>

        {/* ── ··· options button — inline-end corner (right in LTR, left in RTL) ── */}
        {!isGuest && (
          <div style={{ position: "absolute", top: 14, ...(dir === "rtl" ? { left: 16 } : { right: 16 }), zIndex: 3 }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button style={{ width: 32, height: 32, borderRadius: 10,
                  border: "1px solid #EFE7DE", background: "#fff", color: "#8E869C",
                  cursor: "pointer", display: "grid", placeItems: "center",
                  fontSize: 16, letterSpacing: 2, lineHeight: 1,
                  boxShadow: "0 2px 6px rgba(75,67,88,0.08)" }}>
                  ···
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(memory)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  {t("עריכה", "Edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete}
                  className={confirmingDelete ? "text-destructive focus:text-destructive" : ""}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {confirmingDelete ? t("לחץ שוב לאישור", "Click again to confirm") : t("מחיקה", "Delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </article>

      {lightboxIndex !== null && (
        <Lightbox photos={photos} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}
