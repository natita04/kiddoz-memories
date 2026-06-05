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

function Lightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);

  function prev() {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }
  function next() {
    setIndex((i) => (i + 1) % photos.length);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      autoFocus
    >
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>

      {photos.length > 1 && (
        <button
          className="absolute left-4 text-white/80 hover:text-white p-2"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      <div
        className="relative max-w-[90vw] max-h-[90vh] w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photos[index]}
          alt={`Photo ${index + 1}`}
          fill
          className="object-contain"
          sizes="90vw"
        />
      </div>

      {photos.length > 1 && (
        <button
          className="absolute right-4 text-white/80 hover:text-white p-2"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {photos.length > 1 && (
        <div className="absolute bottom-4 text-white/60 text-sm">
          {index + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

export function MemoryCard({
  memory,
  kidBirthdate,
  allKids,
  onEdit,
  onDelete,
}: MemoryCardProps) {
  const { language, t, dir } = useLanguage();
  const { isGuest } = useAuth();
  const ageAtMemory = getAgeAtDate(kidBirthdate, memory.memory_date);
  const sharedWith = allKids.filter((k) =>
    memory.shared_kid_ids?.includes(k.id)
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const story =
    language === "he"
      ? memory.story_he ?? memory.story_en
      : memory.story_en ?? memory.story_he;

  const dateFormatted = new Date(memory.memory_date).toLocaleDateString(
    language === "he" ? "he-IL" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  function handleDelete() {
    if (confirmingDelete) {
      onDelete(memory.id);
    } else {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 3000);
    }
  }

  const photos = memory.photos ?? [];
  const hasPhotos = photos.length > 0;
  const extraPhotos = photos.length - 1;

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
        }}
      >
        {/* Hero photo */}
        {hasPhotos && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setLightboxIndex(0)}
              style={{
                display: "block",
                width: "100%",
                height: 220,
                position: "relative",
                cursor: "pointer",
                border: "none",
                padding: 0,
                background: "transparent",
              }}
            >
              <Image
                src={photos[0]}
                alt="Memory photo"
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </button>
            {extraPhotos > 0 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: 14,
                  background: "rgba(55,45,70,0.68)",
                  backdropFilter: "blur(4px)",
                  WebkitBackdropFilter: "blur(4px)",
                  color: "#fff",
                  fontFamily: "var(--font-round, sans-serif)",
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "5px 13px",
                  borderRadius: 99,
                  letterSpacing: "0.3px",
                  pointerEvents: "none",
                }}
              >
                +{extraPhotos}
              </div>
            )}
          </div>
        )}

        {/* Options button */}
        {!isGuest && (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 16,
              zIndex: 2,
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: "1px solid #EFE7DE",
                    background: "#fff",
                    color: "#8E869C",
                    cursor: "pointer",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 16,
                    letterSpacing: 2,
                    lineHeight: 1,
                    boxShadow: "0 2px 6px rgba(75,67,88,0.08)",
                  }}
                >
                  ···
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(memory)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  {t("עריכה", "Edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className={
                    confirmingDelete
                      ? "text-destructive focus:text-destructive"
                      : ""
                  }
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {confirmingDelete
                    ? t("לחץ שוב לאישור", "Click again to confirm")
                    : t("מחיקה", "Delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Text content */}
        <div
          dir={dir}
          style={{
            padding: hasPhotos
              ? "18px 44px 18px 24px"
              : "28px 44px 18px 24px",
          }}
        >
          {story && (
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-sans, Rubik, sans-serif)",
                fontSize: 16,
                lineHeight: 1.7,
                color: "#4B4358",
                textAlign: dir === "rtl" ? "right" : "left",
              }}
            >
              {story}
            </p>
          )}

          {/* Footer: tags + date/age */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid #EFE7DE",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {/* Tags */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {memory.tags?.map((tagId) => {
                const tagDef = PREDEFINED_TAGS.find((t) => t.id === tagId);
                const label = getTagLabel(tagId, language);
                return (
                  <span
                    key={tagId}
                    style={
                      tagDef
                        ? {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 11px",
                            borderRadius: 99,
                            fontFamily: "var(--font-round, sans-serif)",
                            fontSize: 12.5,
                            background: tagDef.colors.soft,
                            color: tagDef.colors.deep,
                            border: `1.5px solid ${tagDef.colors.mid}`,
                          }
                        : {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "5px 11px",
                            borderRadius: 99,
                            fontFamily: "var(--font-round, sans-serif)",
                            fontSize: 12.5,
                            background: "#F5F5F5",
                            color: "#8E869C",
                            border: "1.5px solid #EFE7DE",
                          }
                    }
                  >
                    {label}
                  </span>
                );
              })}

              {/* Shared-with badge */}
              {sharedWith.length > 0 && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 11px",
                    borderRadius: 99,
                    fontFamily: "var(--font-round, sans-serif)",
                    fontSize: 12.5,
                    background: "#EDE7FB",
                    color: "#7E5BC9",
                    border: "1.5px solid #CBB8F2",
                  }}
                >
                  🤝{" "}
                  {t("גם עם", "Also with")}{" "}
                  {sharedWith.map((k) => t(k.name_he, k.name_en)).join(", ")}
                </span>
              )}
            </div>

            {/* Date + age */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "var(--font-round, sans-serif)",
                fontSize: 12.5,
                color: "#8E869C",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span>📅 {dateFormatted}</span>
              {ageAtMemory && <span>{t(`גיל ${ageAtMemory}`, `Age ${ageAtMemory}`)}</span>}
            </div>
          </div>
        </div>
      </article>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
