"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Pencil, Trash2, Calendar } from "lucide-react";
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

export function MemoryCard({ memory, onEdit, onDelete }: MemoryCardProps) {
  const { language, t, dir } = useLanguage();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
    <article className="bg-card border border-border rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden animate-fade-in">
      {/* Photos grid */}
      {photos.length > 0 && (
        <div
          className={`grid gap-0.5 ${
            photos.length === 1
              ? "grid-cols-1"
              : photos.length === 2
              ? "grid-cols-2"
              : photos.length === 3
              ? "grid-cols-3"
              : "grid-cols-2"
          }`}
        >
          {photos.slice(0, photos.length === 4 ? 4 : Math.min(photos.length, 3)).map((url, i) => (
            <div
              key={url}
              className={`relative overflow-hidden bg-secondary ${
                photos.length === 1 ? "aspect-video" : "aspect-square"
              } ${photos.length === 3 && i === 0 ? "col-span-2 row-span-2" : ""}`}
            >
              <Image
                src={url}
                alt={`Memory photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
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
  );
}
