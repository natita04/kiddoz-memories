"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordGate } from "@/components/PasswordGate";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [showGate, setShowGate] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      redirectToFirstKid();
    } else {
      setChecking(false);
      setShowGate(true);
    }
  }, []);

  async function redirectToFirstKid() {
    const { data, error } = await supabase
      .from("kids")
      .select("slug")
      .order("order")
      .limit(1)
      .single();
    if (data?.slug) {
      router.replace(`/${data.slug}`);
    } else {
      console.error("Could not load kids:", error);
      setChecking(false);
      setShowGate(true);
      setLoadError(
        error?.code === "PGRST116"
          ? "No kids found — make sure you ran the seed SQL in Supabase."
          : "Could not connect to database. Check your Supabase env vars in Vercel."
      );
    }
  }

  function handleAuthSuccess() {
    redirectToFirstKid();
  }

  if (checking) {
    return <div className="min-h-screen bg-background" />;
  }

  if (showGate) {
    return <PasswordGate onSuccess={handleAuthSuccess} error={loadError} />;
  }

  return <div className="min-h-screen bg-background" />;
}
