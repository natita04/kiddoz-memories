"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { isHebrew } from "@/lib/zodiac";
import { PREDEFINED_TAGS } from "@/lib/tags";
import type { Memory } from "@/types";

interface MemoryModalProps {
  open: boolean;
  onClose: () => void;
  kidId: string;
  memory?: Memory | null;
  onSaved: (memory: Memory) => void;
}

interface PhotoPreview {
  file: File;
  preview: string;
}

const today = new Date().toISOString().split("T")[0];

export function MemoryModal({ open, onClose, kidId, memory, onSaved }: MemoryModalProps) {
  const { t, dir } = useLanguage();
  const isEditing = !!memory;

  const [story, setStory] = useState("");
  const [date, setDate] = useState(today);
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (memory) {
        setStory(memory.story_he ?? memory.story_en ?? "");
        setDate(memory.memory_date);
        setExistingPhotos(memory.photos ?? []);
        setSelectedTags(memory.tags ?? []);
        setPhotoPreviews([]);
      } else {
        setStory("");
        setDate(today);
        setPhotoPreviews([]);
        setExistingPhotos([]);
        setSelectedTags([]);
      }
      setCustomTag("");
      setError(null);
    }
  }, [open, memory]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const remaining = 5 - existingPhotos.length - photoPreviews.length;
      const toAdd = accepted.slice(0, remaining);
      const newPreviews = toAdd.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    },
    [existingPhotos.length, photoPreviews.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024,
    disabled: existingPhotos.length + photoPreviews.length >= 5,
  });

  function removeNewPhoto(index: number) {
    setPhotoPreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  function removeExistingPhoto(url: string) {
    setExistingPhotos((prev) => prev.filter((p) => p !== url));
  }

  async function uploadPhotos(): Promise<string[]> {
    const urls: string[] = [];
    for (const { file } of photoPreviews) {
      const ext = file.name.split(".").pop();
      const path = `${kidId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("memory-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("memory-photos").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function translateStory(
    text: string
  ): Promise<{ story_he: string | null; story_en: string | null }> {
    const hebrew = isHebrew(text);
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from: hebrew ? "he" : "en" }),
      });
      const { translation } = await res.json();
      return hebrew
        ? { story_he: text, story_en: translation }
        : { story_he: translation, story_en: text };
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!story.trim()) {
      setError(t("נא להוסיף טקסט לזיכרון", "Please add some text"));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { story_he, story_en } = await translateStory(story.trim());
      const newPhotoUrls = await uploadPhotos();
      const allPhotos = [...existingPhotos, ...newPhotoUrls];
      const allTags = customTag.trim()
        ? [...selectedTags, customTag.trim()]
        : selectedTags;

      if (isEditing && memory) {
        const { data, error } = await supabase
          .from("memories")
          .update({ story_he, story_en, memory_date: date, photos: allPhotos, tags: allTags })
          .eq("id", memory.id)
          .select()
          .single();
        if (error) throw error;
        onSaved(data as Memory);
      } else {
        const { data, error } = await supabase
          .from("memories")
          .insert({ kid_id: kidId, story_he, story_en, memory_date: date, photos: allPhotos, tags: allTags })
          .select()
          .single();
        if (error) throw error;
        onSaved(data as Memory);
      }

      onClose();
    } catch (err) {
      setError(t("שגיאה בשמירה. נסה שוב.", "Failed to save. Please try again."));
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const totalPhotos = existingPhotos.length + photoPreviews.length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("עריכת זיכרון", "Edit memory") : t("זיכרון חדש", "Add a memory")}
          </DialogTitle>
        </DialogHeader>

        <form id="memory-form" onSubmit={handleSubmit} className="space-y-4 px-6 pb-2">
          {/* Story */}
          <div className="space-y-1.5">
            <Label htmlFor="story">{t("הסיפור", "Story")}</Label>
            <Textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={t("מה קרה? מה אמר/ה?", "What happened? What did they say?")}
              className="min-h-[120px] resize-none"
              dir={dir}
              autoFocus
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">{t("תאריך", "Date")}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>{t("תגיות", "Tags")}</Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setSelectedTags((prev) =>
                        active ? prev.filter((t) => t !== tag.id) : [...prev, tag.id]
                      )
                    }
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {tag.emoji} {t(tag.he, tag.en)}
                  </button>
                );
              })}
            </div>
            <Input
              placeholder={t("תגית מותאמת אישית...", "Custom tag...")}
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="text-sm h-8"
            />
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <Label>{t(`תמונות (${totalPhotos}/5)`, `Photos (${totalPhotos}/5)`)}</Label>

            {/* Existing photos */}
            {existingPhotos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {existingPhotos.map((url) => (
                  <div key={url} className="relative group w-16 h-16 rounded-md overflow-hidden border border-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(url)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New photo previews */}
            {photoPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photoPreviews.map((p, i) => (
                  <div key={p.preview} className="relative group w-16 h-16 rounded-md overflow-hidden border border-border">
                    <img src={p.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Dropzone */}
            {totalPhotos < 5 && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <input {...getInputProps()} />
                <ImagePlus className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {isDragActive
                    ? t("שחרר כאן", "Drop here")
                    : t("גרור תמונות או לחץ לבחירה", "Drag photos or click to select")}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {t("עד 5MB לתמונה", "Up to 5MB per photo")}
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>

        <DialogFooter className="px-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            {t("ביטול", "Cancel")}
          </Button>
          <Button
            type="submit"
            form="memory-form"
            disabled={saving || translating}
          >
            {(saving || translating) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {translating
              ? t("מתרגם...", "Translating...")
              : saving
              ? t("שומר...", "Saving...")
              : isEditing
              ? t("שמירה", "Save")
              : t("הוספה", "Add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
