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

  useEffect(() => {
    if (isAuthenticated()) {
      redirectToFirstKid();
    } else {
      setChecking(false);
      setShowGate(true);
    }
  }, []);

  async function redirectToFirstKid() {
    const { data } = await supabase
      .from("kids")
      .select("slug")
      .order("order")
      .limit(1)
      .single();
    if (data?.slug) {
      router.replace(`/${data.slug}`);
    } else {
      setChecking(false);
      setShowGate(true);
    }
  }

  function handleAuthSuccess() {
    redirectToFirstKid();
  }

  if (checking) {
    return <div className="min-h-screen bg-background" />;
  }

  if (showGate) {
    return <PasswordGate onSuccess={handleAuthSuccess} />;
  }

  return <div className="min-h-screen bg-background" />;
}
