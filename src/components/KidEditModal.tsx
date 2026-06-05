"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import type { Kid } from "@/types";

interface KidEditModalProps {
  open: boolean;
  onClose: () => void;
  kid: Kid;
  onSaved: (kid: Kid) => void;
}

export function KidEditModal({ open, onClose, kid, onSaved }: KidEditModalProps) {
  const { t, dir } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name_he: kid.name_he,
    name_en: kid.name_en,
    birthdate: kid.birthdate,
    favorite_food_he: kid.favorite_food_he,
    favorite_food_en: kid.favorite_food_en,
    favorite_color_he: kid.favorite_color_he,
    favorite_color_en: kid.favorite_color_en,
  });

  useEffect(() => {
    if (open) {
      setForm({
        name_he: kid.name_he,
        name_en: kid.name_en,
        birthdate: kid.birthdate,
        favorite_food_he: kid.favorite_food_he,
        favorite_food_en: kid.favorite_food_en,
        favorite_color_he: kid.favorite_color_he,
        favorite_color_en: kid.favorite_color_en,
      });
    }
  }, [open, kid]);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data, error } = await supabase
      .from("kids")
      .update(form)
      .eq("id", kid.id)
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      onSaved(data as Kid);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("עריכת פרטים", "Edit details")}</DialogTitle>
        </DialogHeader>

        <form id="kid-edit-form" onSubmit={handleSubmit} className="space-y-4 px-6 pb-2" dir={dir}>
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("שם בעברית", "Hebrew name")}</Label>
              <Input value={form.name_he} onChange={(e) => set("name_he", e.target.value)} dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("שם באנגלית", "English name")}</Label>
              <Input value={form.name_en} onChange={(e) => set("name_en", e.target.value)} dir="ltr" />
            </div>
          </div>

          {/* Birthdate */}
          <div className="space-y-1.5">
            <Label>{t("תאריך לידה", "Birthday")}</Label>
            <Input type="date" value={form.birthdate} onChange={(e) => set("birthdate", e.target.value)} dir="ltr" />
          </div>

          {/* Food */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("אוכל אהוב (עב)", "Fav food (HE)")}</Label>
              <Input value={form.favorite_food_he} onChange={(e) => set("favorite_food_he", e.target.value)} dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("אוכל אהוב (EN)", "Fav food (EN)")}</Label>
              <Input value={form.favorite_food_en} onChange={(e) => set("favorite_food_en", e.target.value)} dir="ltr" />
            </div>
          </div>

          {/* Color */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{t("צבע אהוב (עב)", "Fav color (HE)")}</Label>
              <Input value={form.favorite_color_he} onChange={(e) => set("favorite_color_he", e.target.value)} dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("צבע אהוב (EN)", "Fav color (EN)")}</Label>
              <Input value={form.favorite_color_en} onChange={(e) => set("favorite_color_en", e.target.value)} dir="ltr" />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{t("ביטול", "Cancel")}</Button>
          <Button type="submit" form="kid-edit-form" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin me-2" />}
            {t("שמירה", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
