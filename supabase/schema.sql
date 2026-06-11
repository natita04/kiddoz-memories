-- ================================================
-- Kiddoz Memories — Supabase Schema
-- Run this in the Supabase SQL editor
-- ================================================

-- Kids table
create table if not exists public.kids (
  id              uuid primary key default gen_random_uuid(),
  name_he         text not null,
  name_en         text not null,
  slug            text not null unique,             -- used for URL routing
  birthdate       date not null,
  favorite_food_he text not null default '',
  favorite_food_en text not null default '',
  favorite_color_he text not null default '',
  favorite_color_en text not null default '',
  profile_photo_url text,                           -- Supabase storage URL
  "order"         int not null default 0            -- controls tab order
);

-- Memories table
create table if not exists public.memories (
  id           uuid primary key default gen_random_uuid(),
  kid_id       uuid not null references public.kids(id) on delete cascade,
  story_he     text,                                -- Hebrew original or translation
  story_en     text,                                -- English original or translation
  memory_date  date not null default current_date,  -- user-set date of the memory
  created_at   timestamptz not null default now(),  -- server timestamp
  photos       text[] not null default '{}',        -- array of Supabase storage URLs
  constraint memories_has_story check (story_he is not null or story_en is not null)
);

create index if not exists memories_kid_date_idx
  on public.memories (kid_id, memory_date desc);

-- ================================================
-- Storage buckets
-- Run these statements to create the buckets:
-- ================================================

-- Option A: via SQL (Supabase supports this)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',        'avatars',        true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('memory-photos',  'memory-photos',  true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- Storage policies — allow all operations from anon (family app, no user accounts)
-- No SELECT policy needed: buckets are public=true so files are served by URL
-- without requiring an API-level read policy. A SELECT policy would also allow
-- listing all filenames in the bucket, which is unnecessary exposure.

create policy "Anon upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars');

create policy "Anon upload memory photos"
  on storage.objects for insert
  with check (bucket_id = 'memory-photos');

create policy "Anon delete memory photos"
  on storage.objects for delete
  using (bucket_id = 'memory-photos');

-- RLS enabled on both tables. Anon role gets full access because this is a
-- password-gated family app with no per-user row isolation needed.
-- The service role (used server-side) bypasses RLS by default.
alter table public.kids     enable row level security;
alter table public.memories enable row level security;

create policy "Anon full access kids"
  on public.kids for all to anon
  using (true) with check (true);

create policy "Anon full access memories"
  on public.memories for all to anon
  using (true) with check (true);
