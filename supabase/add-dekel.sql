-- ================================================
-- Add Dekel (kid #3)
-- Run this once in the Supabase SQL editor
-- ================================================

insert into public.kids
  (name_he, name_en, slug, birthdate, favorite_food_he, favorite_food_en, favorite_color_he, favorite_color_en, gender, "order")
values
  ('דקל', 'Dekel', 'dekel', '2026-09-10', 'חלב', 'Milk', 'תכלת', 'Baby blue', 'm', 3)
on conflict (slug) do nothing;
