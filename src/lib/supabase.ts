import { createClient } from "@supabase/supabase-js";

// Fallback values allow the build to succeed without .env.local.
// At runtime the app will error if these aren't set — copy .env.local.example.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
);
