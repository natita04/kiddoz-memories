"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand, Languages, Loader2, Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { PREDEFINED_TAGS, getTagLabel } from "@/lib/tags";
import { getAgeAtDate } from "@/lib/zodiac";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Kid, Memory } from "@/types";

interface MemoryCardProps {
  memory: Memory;
  kidId: string;
  kidBirthdate: string;
  allKids: Kid[];
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onSaved: (memory: Memory) => void;
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
function Lightbox({
  photos, startIndex, onClose, memory, kidId, kidBirthdate, allKids,
}: {
  photos: string[];
  startIndex: number;
  onClose: () => void;
  memory: Memory;
  kidId: string;
  kidBirthdate: string;
  allKids: Kid[];
}) {
  const [index, setIndex] = useState(startIndex);
  const { language, t, dir } = useLanguage();

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  const story = language === "he" ? memory.story_he ?? memory.story_en : memory.story_en ?? memory.story_he;
  const ageAtMemory = getAgeAtDate(kidBirthdate, memory.memory_date);
  const dateFormatted = new Date(memory.memory_date).toLocaleDateString(
    language === "he" ? "he-IL" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );
  const sharedWith = allKids.filter((k) => memory.shared_kid_ids?.includes(k.id));
  const currentKid = allKids.find((k) => k.id === kidId);
  const kidName = currentKid ? t(currentKid.name_he, currentKid.name_en) : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.80)" }}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }}
      tabIndex={0} autoFocus
    >
      {/* ── Sized container ── */}
      <div
        className="flex flex-col sm:flex-row overflow-hidden rounded-2xl"
        style={{ width: "70vw", height: "90vh", maxWidth: "1200px" }}
        onClick={(e) => e.stopPropagation()}
      >
      {/* ── Photo area ── */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center"
        style={{ background: "#000" }}
      >
        <div className="relative w-full h-full">
          <Image
            src={photos[index]}
            alt={`Photo ${index + 1}`}
            fill className="object-contain"
            sizes="(max-width: 640px) 100vw, 65vw"
          />
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 text-white/80 hover:text-white p-2"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 text-white/80 hover:text-white p-2"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
            <div className="absolute bottom-4 text-white/50 font-round text-sm">
              {index + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {/* ── Content panel ── */}
      <div
        className="w-80 shrink-0 overflow-y-auto flex flex-col"
        style={{ background: "var(--color-card)", borderInlineStart: "1px solid var(--color-line)" }}
        dir={dir}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--color-line)",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: "#FCE3D5", display: "grid", placeItems: "center",
            fontSize: 18, flexShrink: 0,
          }}>💛</div>
          <span className="font-display" style={{ fontSize: 15, color: "var(--color-ink)" }}>
            {kidName}
          </span>

          {/* Close button inside panel header */}
          <button
            onClick={onClose}
            style={{
              marginInlineStart: "auto",
              width: 32, height: 32, borderRadius: "50%",
              background: "transparent",
              border: "1px solid var(--color-line)",
              display: "grid", placeItems: "center",
              color: "var(--color-ink-soft)", cursor: "pointer", flexShrink: 0,
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story */}
        {story && (
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-line)" }}>
            <p style={{
              margin: 0,
              fontFamily: "var(--font-sans, Rubik, sans-serif)",
              fontSize: 14, lineHeight: 1.75, color: "var(--color-ink)",
              textAlign: dir === "rtl" ? "right" : "left",
            }}>
              {story}
            </p>
          </div>
        )}

        {/* Tags */}
        {(memory.tags && memory.tags.length > 0 || sharedWith.length > 0) && (
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-line)", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {memory.tags?.map((tagId) => {
              const tagDef = PREDEFINED_TAGS.find((t) => t.id === tagId);
              const label = getTagLabel(tagId, language);
              return (
                <span key={tagId} style={tagDef ? {
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: 99,
                  fontFamily: "var(--font-round, sans-serif)", fontSize: 12.5,
                  background: tagDef.colors.soft, color: tagDef.colors.deep,
                  border: `1.5px solid ${tagDef.colors.mid}`,
                } : {
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: 99,
                  fontFamily: "var(--font-round, sans-serif)", fontSize: 12.5,
                  background: "#F5F5F5", color: "#8E869C", border: "1.5px solid #EFE7DE",
                }}>{label}</span>
              );
            })}
            {sharedWith.length > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "4px 10px", borderRadius: 99,
                fontFamily: "var(--font-round, sans-serif)", fontSize: 12.5,
                background: "#EDE7FB", color: "#7E5BC9", border: "1.5px solid #CBB8F2",
              }}>
                🤝 {t("גם עם", "Also with")} {sharedWith.map((k) => t(k.name_he, k.name_en)).join(", ")}
              </span>
            )}
          </div>
        )}

        {/* Date + age footer */}
        <div style={{
          padding: "12px 16px", marginTop: "auto",
          fontFamily: "var(--font-round, sans-serif)", fontSize: 13,
          color: "var(--color-ink-soft)",
          textAlign: dir === "rtl" ? "right" : "left",
        }}>
          <div>📅 {dateFormatted}</div>
          {ageAtMemory && <div style={{ marginTop: 2 }}>{t(`גיל ${ageAtMemory}`, `Age ${ageAtMemory}`)}</div>}
        </div>
      </div>
      </div>
    </div>
  );
}

/* ─── Fix-translation modal ───────────────────────────────────
   Edits only the currently-displayed language's text. The other
   language (the original the user typed) is never touched. */
function FixTranslationModal({
  memory, onClose, onSaved,
}: {
  memory: Memory;
  onClose: () => void;
  onSaved: (memory: Memory) => void;
}) {
  const { language, t, dir } = useLanguage();
  const field = language === "he" ? "story_he" : "story_en";
  const [text, setText] = useState(memory[field] ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("memories")
        .update({ [field]: text.trim() })
        .eq("id", memory.id)
        .select()
        .single();
      if (error) throw error;
      onSaved(data as Memory);
      onClose();
    } catch (err) {
      setError(t("שגיאה בשמירה. נסה שוב.", "Failed to save. Please try again."));
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="p-0"
        style={{ maxWidth: 520, borderRadius: 28, boxShadow: "0 20px 60px rgba(75,67,88,0.22)" }}
      >
        <DialogHeader style={{ padding: "22px 26px 0" }}>
          <DialogTitle className="font-display" style={{ margin: 0, fontSize: 22, color: "var(--color-ink)" }}>
            {t("תיקון תרגום", "Fix translation")}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: "16px 26px 26px", display: "flex", flexDirection: "column", gap: 16 }} dir={dir}>
          <p className="font-round" style={{ margin: 0, fontSize: 13.5, color: "var(--color-ink-soft)", lineHeight: 1.5 }}>
            {t(
              "עריכת הטקסט בעברית בלבד. הטקסט בשפה המקורית לא ישתנה.",
              "Editing the English text only. The original-language text won't change."
            )}
          </p>
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            dir={dir}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: 14,
              fontFamily: "var(--font-sans, Rubik, sans-serif)",
              fontSize: 15,
              color: "var(--color-ink)",
              background: "#FAFAF8",
              outline: "none",
              border: "1.5px solid #F7BD9C",
              boxShadow: "0 0 0 3px #FCE3D5",
              resize: "none",
              boxSizing: "border-box",
              textAlign: dir === "rtl" ? "right" : "left",
            }}
            autoFocus
          />

          {error && <p style={{ fontSize: 14, color: "#DC2626", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !text.trim()}
              className="font-round"
              style={{
                padding: "12px 28px",
                borderRadius: 99,
                border: "none",
                cursor: saving || !text.trim() ? "not-allowed" : "pointer",
                background: saving || !text.trim() ? "#F7BD9C" : "#E07F52",
                color: "#fff",
                fontSize: 15,
                boxShadow: "0 6px 16px #F7BD9C",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? t("שומר...", "Saving...") : t("שמירה", "Save")}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="font-round"
              style={{
                padding: "12px 22px",
                borderRadius: 99,
                cursor: "pointer",
                background: "transparent",
                color: "#8E869C",
                fontSize: 15,
                border: "1.5px solid #EFE7DE",
              }}
            >
              {t("ביטול", "Cancel")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Card ────────────────────────────────────────────────── */
export function MemoryCard({ memory, kidId, kidBirthdate, allKids, onEdit, onDelete, onSaved }: MemoryCardProps) {
  const { language, t, dir } = useLanguage();
  const { isGuest } = useAuth();
  const ageAtMemory = getAgeAtDate(kidBirthdate, memory.memory_date);
  const sharedWith = allKids.filter((k) => memory.shared_kid_ids?.includes(k.id));

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [fixingTranslation, setFixingTranslation] = useState(false);

  const story = language === "he" ? memory.story_he ?? memory.story_en : memory.story_en ?? memory.story_he;
  /* Both languages present → the displayed text is a translation that can be fixed */
  const hasTranslation = !!memory.story_he && !!memory.story_en;
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
      {hasTranslation && (
        <DropdownMenuItem onClick={() => setFixingTranslation(true)}>
          <Languages className="h-4 w-4 me-2" />
          {t("תיקון תרגום", "Fix translation")}
        </DropdownMenuItem>
      )}
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
            style={{ position: "relative", height: 300, overflow: "hidden", cursor: "pointer" }}
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
          style={{ padding: "12px 12px 10px" }}
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

          {/* Footer: button (inline-start) + date/age (inline-end)
               Hebrew RTL → button on RIGHT, date/age on LEFT
               English LTR → button on LEFT, date/age on RIGHT  */}
          <div
            dir={dir}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingTop: 8, borderTop: "1px solid var(--color-line)", gap: 6,
            }}
          >
            {/* Date + age — inline-start
                 Hebrew RTL → sits on the RIGHT
                 English LTR → sits on the LEFT  */}
            <div style={{
              fontFamily: "var(--font-round, sans-serif)", fontSize: 11.5,
              color: "var(--color-ink-soft)", lineHeight: 1.4,
              textAlign: dir === "rtl" ? "right" : "left",
            }}>
              <div>{dateFormatted}</div>
              {ageAtMemory && <div>{t(`גיל ${ageAtMemory}`, `Age ${ageAtMemory}`)}</div>}
            </div>

            {/* Action button — inline-end
                 Hebrew RTL → sits on the LEFT
                 English LTR → sits on the RIGHT  */}
            {!isGuest ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button style={btnStyle}>···</button>
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
        </div>
      </article>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          memory={memory}
          kidId={kidId}
          kidBirthdate={kidBirthdate}
          allKids={allKids}
        />
      )}

      {fixingTranslation && (
        <FixTranslationModal
          memory={memory}
          onClose={() => setFixingTranslation(false)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
