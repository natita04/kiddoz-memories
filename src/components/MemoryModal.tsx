"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { isHebrew } from "@/lib/zodiac";
import { PREDEFINED_TAGS } from "@/lib/tags";
import type { Kid, Memory } from "@/types";

interface MemoryModalProps {
  open: boolean;
  onClose: () => void;
  kidId: string;
  allKids: Kid[];
  memory?: Memory | null;
  onSaved: (memory: Memory) => void;
}

interface PhotoPreview {
  file: File;
  preview: string;
}

const today = new Date().toISOString().split("T")[0];

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 14,
  fontFamily: "var(--font-sans, Rubik, sans-serif)",
  fontSize: 15,
  color: "#4B4358",
  background: "#FAFAF8",
  outline: "none",
  border: "1.5px solid #EFE7DE",
  resize: "none",
  boxSizing: "border-box" as const,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-round, sans-serif)",
  fontSize: 13.5,
  color: "#8E869C",
  display: "block",
  marginBottom: 8,
};

export function MemoryModal({
  open,
  onClose,
  kidId,
  allKids,
  memory,
  onSaved,
}: MemoryModalProps) {
  const { t, dir } = useLanguage();
  const otherKids = allKids.filter((k) => k.id !== kidId);
  const isEditing = !!memory;

  const [story, setStory] = useState("");
  const [date, setDate] = useState(today);
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sharedKidIds, setSharedKidIds] = useState<string[]>([]);
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
        setSharedKidIds(memory.shared_kid_ids ?? []);
        setPhotoPreviews([]);
      } else {
        setStory("");
        setDate(today);
        setPhotoPreviews([]);
        setExistingPhotos([]);
        setSelectedTags([]);
        setSharedKidIds([]);
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
      const path = `${kidId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("memory-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage
        .from("memory-photos")
        .getPublicUrl(path);
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
          .update({
            story_he,
            story_en,
            memory_date: date,
            photos: allPhotos,
            tags: allTags,
            shared_kid_ids: sharedKidIds,
          })
          .eq("id", memory.id)
          .select()
          .single();
        if (error) throw error;
        onSaved(data as Memory);
      } else {
        const { data, error } = await supabase
          .from("memories")
          .insert({
            kid_id: kidId,
            story_he,
            story_en,
            memory_date: date,
            photos: allPhotos,
            tags: allTags,
            shared_kid_ids: sharedKidIds,
          })
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
      <DialogContent
        className="max-h-[90vh] overflow-y-auto p-0"
        style={{
          maxWidth: 580,
          borderRadius: 28,
          boxShadow: "0 20px 60px rgba(75,67,88,0.22)",
        }}
      >
        {/* Header */}
        <DialogHeader
          style={{
            padding: "22px 26px 0",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DialogTitle
            className="font-display"
            style={{ margin: 0, fontSize: 22, color: "#4B4358" }}
          >
            {isEditing
              ? t("עריכת זיכרון", "Edit memory")
              : t("זיכרון חדש", "New memory")}
          </DialogTitle>
        </DialogHeader>

        <form
          id="memory-form"
          onSubmit={handleSubmit}
          style={{
            padding: "20px 26px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
          dir={dir}
        >
          {/* Story */}
          <div>
            <label style={labelStyle}>{t("הסיפור", "Story")}</label>
            <textarea
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={t("מה קרה? מה אמר/ה?", "What happened? What did they say?")}
              style={{
                ...fieldStyle,
                border: "1.5px solid #F7BD9C",
                boxShadow: "0 0 0 3px #FCE3D5",
              }}
              autoFocus
            />
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>{t("תאריך", "Date")}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              style={fieldStyle}
            />
          </div>

          {/* Share with — stacked below date */}
          {otherKids.length > 0 && (
            <div>
              <label style={labelStyle}>{t("יחד עם", "Together with")}</label>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {otherKids.map((ok) => {
                  const checked = sharedKidIds.includes(ok.id);
                  return (
                    <label key={ok.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setSharedKidIds((prev) =>
                            e.target.checked ? [...prev, ok.id] : prev.filter((id) => id !== ok.id)
                          )
                        }
                        style={{ width: 18, height: 18, accentColor: "#E07F52" }}
                      />
                      <span className="font-round" style={{ fontSize: 14, color: "#4B4358" }}>
                        {t(ok.name_he, ok.name_en)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label style={labelStyle}>{t("תגיות", "Tags")}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PREDEFINED_TAGS.map((tag) => {
                const active = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() =>
                      setSelectedTags((prev) =>
                        active
                          ? prev.filter((t) => t !== tag.id)
                          : [...prev, tag.id]
                      )
                    }
                    className="font-round"
                    style={
                      active
                        ? {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 14px",
                            borderRadius: 99,
                            fontSize: 13.5,
                            cursor: "pointer",
                            background: tag.colors.soft,
                            color: tag.colors.deep,
                            border: `1.5px solid ${tag.colors.mid}`,
                          }
                        : {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 14px",
                            borderRadius: 99,
                            fontSize: 13.5,
                            cursor: "pointer",
                            background: "#FAFAF8",
                            color: "#8E869C",
                            border: "1.5px solid #EFE7DE",
                          }
                    }
                  >
                    <span>{tag.emoji}</span>
                    {t(tag.he, tag.en)}
                  </button>
                );
              })}
            </div>
            <input
              placeholder={t("תגית מותאמת אישית...", "Custom tag...")}
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              style={{ ...fieldStyle, marginTop: 10 }}
            />
          </div>

          {/* Photos */}
          <div>
            <label style={labelStyle}>
              {t(`תמונות (${totalPhotos}/5)`, `Photos (${totalPhotos}/5)`)}
            </label>

            {existingPhotos.length > 0 && (
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
              >
                {existingPhotos.map((url) => (
                  <div
                    key={url}
                    style={{
                      position: "relative",
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid #EFE7DE",
                    }}
                    className="group"
                  >
                    <img
                      src={url}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(url)}
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.5)",
                        opacity: 0,
                        border: "none",
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                      }}
                      className="group-hover:opacity-100"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photoPreviews.length > 0 && (
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}
              >
                {photoPreviews.map((p, i) => (
                  <div
                    key={p.preview}
                    style={{
                      position: "relative",
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid #EFE7DE",
                    }}
                    className="group"
                  >
                    <img
                      src={p.preview}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(i)}
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.5)",
                        opacity: 0,
                        border: "none",
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                      }}
                      className="group-hover:opacity-100"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalPhotos < 5 && (
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? "#F7BD9C" : "#EFE7DE"}`,
                  borderRadius: 18,
                  padding: "28px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  background: isDragActive ? "#FCE3D5" : "#FAFAF8",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <input {...getInputProps()} />
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "#FCE3D5",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 24,
                  }}
                >
                  🖼️
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    className="font-round"
                    style={{ fontSize: 14.5, color: "#4B4358" }}
                  >
                    {isDragActive
                      ? t("שחרר כאן", "Drop here")
                      : t("גרור תמונות או לחץ לבחירה", "Drag photos or click to select")}
                  </div>
                  <div
                    className="font-round"
                    style={{ fontSize: 12.5, color: "#8E869C", marginTop: 4 }}
                  >
                    {t("עד 5 תמונות · עד 5MB לתמונה", "Up to 5 photos · 5MB each")}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p style={{ fontSize: 14, color: "#DC2626", margin: 0 }}>{error}</p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              disabled={saving || translating}
              className="font-round"
              style={{
                padding: "12px 28px",
                borderRadius: 99,
                border: "none",
                cursor: saving || translating ? "not-allowed" : "pointer",
                background: saving || translating ? "#F7BD9C" : "#E07F52",
                color: "#fff",
                fontSize: 15,
                boxShadow: "0 6px 16px #F7BD9C",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {(saving || translating) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {translating
                ? t("מתרגם...", "Translating...")
                : saving
                ? t("שומר...", "Saving...")
                : isEditing
                ? t("שמירה", "Save")
                : t("הוספה", "Add")}
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
