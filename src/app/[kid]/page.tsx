"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { KidProfile } from "@/components/KidProfile";
import { MemoryFeed } from "@/components/MemoryFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Kid, Memory } from "@/types";

export default function KidPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.kid as string;

  const [kid, setKid] = useState<Kid | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/");
      return;
    }
    loadData();
  }, [slug]);

  async function loadData() {
    setLoading(true);
    const { data: kidData, error: kidError } = await supabase
      .from("kids")
      .select("*")
      .eq("slug", slug)
      .single();

    if (kidError || !kidData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const { data: memoriesData } = await supabase
      .from("memories")
      .select("*")
      .eq("kid_id", kidData.id)
      .order("memory_date", { ascending: false });

    setKid(kidData as Kid);
    setMemories((memoriesData as Memory[]) ?? []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !kid) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="container max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Kid not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        <KidProfile kid={kid} />
        <MemoryFeed kidId={kid.id} initialMemories={memories} />
      </main>
    </div>
  );
}
