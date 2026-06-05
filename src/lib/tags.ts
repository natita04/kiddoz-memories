import type { Language } from "@/types";

export interface TagDef {
  id: string;
  he: string;
  en: string;
  emoji: string;
}

export const PREDEFINED_TAGS: TagDef[] = [
  { id: "funny",        he: "מצחיק",     en: "Funny",         emoji: "😄" },
  { id: "sweet",        he: "מתוק",      en: "Sweet",         emoji: "🥰" },
  { id: "first-time",   he: "פעם ראשונה", en: "First time",   emoji: "⭐" },
  { id: "milestone",    he: "אבן דרך",   en: "Milestone",     emoji: "🏆" },
  { id: "proud-moment", he: "רגע גאווה", en: "Proud moment",  emoji: "💪" },
];

export function getTagLabel(tagId: string, language: Language): string {
  const found = PREDEFINED_TAGS.find((t) => t.id === tagId);
  if (found) return `${found.emoji} ${language === "he" ? found.he : found.en}`;
  return tagId;
}
