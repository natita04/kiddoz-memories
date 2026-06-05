"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Pencil, Trash2, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import type { Memory } from "@/types";

interface MemoryCardProps {
  memory: Memory;
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
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          className="absolute left-4 text-white/80 hover:text-white p-2"
          onClick={(e) => { e.stopPropagation(); prev(); }}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Image */}
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

      {/* Next */}
      {photos.length > 1 && (
        <button
          className="absolute right-4 text-white/80 hover:text-white p-2"
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 text-white/60 text-sm">
          {index + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

export function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
  const { language, t, dir } = useLanguage();
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

  return (
    <>
      <article className="bg-card border border-border rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden animate-fade-in">

        {/* Photo thumbnails */}
        {photos.length > 0 && (
          <div className="flex gap-1.5 p-3 pb-0 flex-wrap">
            {photos.map((url, i) => (
              <button
                key={url}
                onClick={() => setLightboxIndex(i)}
                className="relative w-20 h-20 rounded-md overflow-hidden bg-secondary flex-shrink-0 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <Image
                  src={url}
                  alt={`Memory photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-4" dir={dir}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {story && (
                <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap">
                  {story}
                </p>
              )}
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mt-1">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(memory)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  {t("עריכה", "Edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className={confirmingDelete ? "text-destructive focus:text-destructive" : ""}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {confirmingDelete ? t("לחץ שוב לאישור", "Click again to confirm") : t("מחיקה", "Delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <time className="text-xs text-muted-foreground">{dateFormatted}</time>
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
