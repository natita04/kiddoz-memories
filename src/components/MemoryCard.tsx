"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand, Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
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

/* ─── WhatsApp icon ───────────────────────────────────────── */
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
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
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }}
      tabIndex={0} autoFocus
    >
      {/* Prominent close button — top-right, frosted pill */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 16, right: 16,
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          border: "2px solid rgba(255,255,255,0.35)",
          display: "grid", placeItems: "center",
          color: "white", cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
      >
        <X className="w-5 h-5" />
      </button>

      {photos.length > 1 && (
        <button className="absolute left-4 text-white/80 hover:text-white p-2" style={{ zIndex: 10 }}
          onClick={(e) => { e.stopPropagation(); prev(); }}>
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
        <Image src={photos[index]} alt={`Photo ${index + 1}`} fill className="object-contain" sizes="90vw" />
      </div>
      {photos.length > 1 && (
        <button className="absolute right-4 text-white/80 hover:text-white p-2" style={{ zIndex: 10 }}
          onClick={(e) => { e.stopPropagation(); next(); }}>
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
      {photos.length > 1 && (
        <div className="absolute bottom-4 text-white/60 text-sm font-round">{index + 1} / {photos.length}</div>
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

  const whatsappText = [
    story ?? "",
    "",
    `📅 ${dateFormatted}${ageAtMemory ? ` · ${t(`גיל ${ageAtMemory}`, `Age ${ageAtMemory}`)}` : ""}`,
    `— ${t("הזכרונות שלנו", "Our Memories")} 💛`,
  ].join("\n");
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  function handleDelete() {
    if (confirmingDelete) { onDelete(memory.id); }
    else { setConfirmingDelete(true); setTimeout(() => setConfirmingDelete(false), 3000); }
  }

  /* Unified button style — works on both photo and plain-card backgrounds */
  const btnStyle: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 10,
    border: "1px solid var(--color-line)",
    background: "rgba(255,255,255,0.92)",
    color: "var(--color-ink-soft)",
    cursor: "pointer", display: "grid", placeItems: "center",
    fontSize: 16, letterSpacing: 2, lineHeight: 1,
    boxShadow: "0 2px 8px rgba(75,67,88,0.12)",
  };

  /* Dropdown menu items — shared across all card types */
  const menuItems = (
    <div dir={dir}>
      <DropdownMenuItem onClick={() => window.open(whatsappUrl, "_blank")}>
        <span style={{ color: "#25D366", display: "flex", marginInlineEnd: 8 }}>
          <WhatsAppIcon size={14} />
        </span>
        {t("שליחה בוואטסאפ", "Share on WhatsApp")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onEdit(memory)}>
        <Pencil className="h-4 w-4 me-2" />
        {t("עריכה", "Edit")}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleDelete}
        className={confirmingDelete ? "text-destructive focus:text-destructive" : ""}
      >
        <Trash2 className="h-4 w-4 me-2" />
        {confirmingDelete ? t("לחץ שוב לאישור", "Click again to confirm") : t("מחיקה", "Delete")}
      </DropdownMenuItem>
    </div>
  );

  return (
    <>
      <article
        className="animate-fade-in"
        style={{
          background: "var(--color-card)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 4px 16px rgba(75,67,88,0.08)",
          border: "1px solid var(--color-line)",
          position: "relative",
        }}
      >
        {/* ── Photo on top ── */}
        {hasPhotos && (
          <div
            className="group"
            style={{ position: "relative", height: 200, overflow: "hidden", cursor: "pointer" }}
            onClick={() => setLightboxIndex(carouselIndex)}
          >
            <Image
              src={photos[carouselIndex]}
              alt={`Memory photo ${carouselIndex + 1}`}
              fill className="object-cover" sizes="50vw"
            />

            {/* Magnifier hover overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(255,255,255,0.9)",
                display: "grid", placeItems: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}>
                <Expand className="w-4 h-4" style={{ color: "#4B4358" }} />
              </div>
            </div>

            {/* Multi-photo badge */}
            {multi && (
              <div
                className="font-round"
                style={{
                  position: "absolute", bottom: 10, insetInlineStart: 10,
                  background: "rgba(0,0,0,0.52)", color: "#fff",
                  borderRadius: 99, padding: "3px 9px", fontSize: 11.5,
                }}
              >
                +{photos.length - 1} {t("תמונות", "photos")}
              </div>
            )}
          </div>
        )}

        {/* ── Text area ── */}
        <div
          dir={dir}
          style={{
            padding: hasPhotos ? "12px 12px 10px" : "14px 46px 14px 14px",
          }}
        >
          {story && (
            <p style={{
              margin: 0,
              fontFamily: "var(--font-sans, Rubik, sans-serif)",
              fontSize: 14, lineHeight: 1.65, color: "var(--color-ink)",
              textAlign: dir === "rtl" ? "right" : "left",
              marginBottom: 10,
            }}>
              {story}
            </p>
          )}

          {/* Tags */}
          {(memory.tags && memory.tags.length > 0 || sharedWith.length > 0) && (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
              {memory.tags?.map((tagId) => {
                const tagDef = PREDEFINED_TAGS.find((t) => t.id === tagId);
                const label = getTagLabel(tagId, language);
                return (
                  <span key={tagId} style={tagDef
                    ? {
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "4px 9px", borderRadius: 99,
                        fontFamily: "var(--font-round, sans-serif)", fontSize: 12,
                        background: tagDef.colors.soft, color: tagDef.colors.deep,
                        border: `1.5px solid ${tagDef.colors.mid}`,
                      }
                    : {
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "4px 9px", borderRadius: 99,
                        fontFamily: "var(--font-round, sans-serif)", fontSize: 12,
                        background: "#F5F5F5", color: "#8E869C", border: "1.5px solid #EFE7DE",
                      }}>
                    {label}
                  </span>
                );
              })}
              {sharedWith.length > 0 && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "4px 9px", borderRadius: 99,
                  fontFamily: "var(--font-round, sans-serif)", fontSize: 12,
                  background: "#EDE7FB", color: "#7E5BC9", border: "1.5px solid #CBB8F2",
                }}>
                  🤝 {t("גם עם", "Also with")} {sharedWith.map((k) => t(k.name_he, k.name_en)).join(", ")}
                </span>
              )}
            </div>
          )}

          {/* Footer: date + age */}
          <div
            dir={dir}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingTop: 8, borderTop: "1px solid var(--color-line)",
              fontFamily: "var(--font-round, sans-serif)", fontSize: 11.5,
              color: "var(--color-ink-soft)", gap: 6,
            }}
          >
            <span>{dateFormatted}</span>
            {ageAtMemory && <span>{t(`גיל ${ageAtMemory}`, `Age ${ageAtMemory}`)}</span>}
          </div>
        </div>

        {/* ── ··· / WhatsApp button — top inline-end corner ── */}
        <div style={{ position: "absolute", top: 10, insetInlineEnd: 10, zIndex: 5 }}>
          {!isGuest ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button style={{
                  ...btnStyle,
                  background: hasPhotos ? "rgba(255,255,255,0.88)" : "var(--color-card)",
                }}>···</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menuItems}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={t("שליחה בוואטסאפ", "Share on WhatsApp")}
              style={{ ...btnStyle, color: "#25D366", textDecoration: "none" }}
            >
              <WhatsAppIcon size={14} />
            </a>
          )}
        </div>
      </article>

      {lightboxIndex !== null && (
        <Lightbox photos={photos} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}
