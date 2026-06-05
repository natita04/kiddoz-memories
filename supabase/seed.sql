-- ================================================
-- Kiddoz Memories — Seed Data
-- Update names/dates to match your actual kids!
-- ================================================

insert into public.kids
  (name_he, name_en, slug, birthdate, favorite_food_he, favorite_food_en, favorite_color_he, favorite_color_en, "order")
values
  (
    'ילד ראשון',    -- ← replace with first kid's Hebrew name
    'Kid One',      -- ← replace with first kid's English name
    'kid-1',        -- ← replace with a URL-friendly slug, e.g. 'maya'
    '2020-04-10',   -- ← replace with actual birthdate
    'פיצה',
    'Pizza',
    'כחול',
    'Blue',
    1
  ),
  (
    'ילד שני',      -- ← replace with second kid's Hebrew name
    'Kid Two',      -- ← replace with second kid's English name
    'kid-2',        -- ← replace with a URL-friendly slug, e.g. 'lior'
    '2022-09-03',   -- ← replace with actual birthdate
    'שוקולד',
    'Chocolate',
    'ורוד',
    'Pink',
    2
  )
on conflict (slug) do nothing;
