import type { Language } from "@/types";
import type { KidColorFamily } from "@/lib/kidColors";

export interface TagDef {
  id: string;
  he: string;
  en: string;
  emoji: string;
  colors: KidColorFamily;
}

export const PREDEFINED_TAGS: TagDef[] = [
  {
    id: "funny",
    he: "מצחיק",
    en: "Funny",
    emoji: "😄",
    colors: { soft: "#DCF1E8", mid: "#9FDCC1", deep: "#3F9E78" }, // mint
  },
  {
    id: "sweet",
    he: "מתוק",
    en: "Sweet",
    emoji: "🥰",
    colors: { soft: "#FCE3D5", mid: "#F7BD9C", deep: "#E07F52" }, // peach
  },
  {
    id: "first-time",
    he: "פעם ראשונה",
    en: "First time",
    emoji: "⭐",
    colors: { soft: "#E0EEFB", mid: "#A9D0F4", deep: "#3E7FC4" }, // sky
  },
  {
    id: "milestone",
    he: "אבן דרך",
    en: "Milestone",
    emoji: "🏆",
    colors: { soft: "#EDE7FB", mid: "#CBB8F2", deep: "#7E5BC9" }, // lav
  },
  {
    id: "proud-moment",
    he: "רגע גאווה",
    en: "Proud moment",
    emoji: "💪",
    colors: { soft: "#FBE2EC", mid: "#F2B2CC", deep: "#D2638E" }, // rose
  },
];

export function getTagLabel(tagId: string, language: Language): string {
  const found = PREDEFINED_TAGS.find((t) => t.id === tagId);
  if (found) return `${found.emoji} ${language === "he" ? found.he : found.en}`;
  return tagId;
}
