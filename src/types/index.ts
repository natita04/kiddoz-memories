export type Language = "he" | "en";

export interface Kid {
  id: string;
  name_he: string;
  name_en: string;
  slug: string;
  birthdate: string;
  favorite_food_he: string;
  favorite_food_en: string;
  favorite_color_he: string;
  favorite_color_en: string;
  profile_photo_url: string | null;
  order: number;
  gender: "m" | "f";
}

export interface Memory {
  id: string;
  kid_id: string;
  story_he: string | null;
  story_en: string | null;
  memory_date: string;
  created_at: string;
  photos: string[];
  tags: string[];
  shared_kid_ids: string[];
}
