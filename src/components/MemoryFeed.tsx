"use client";

import { useMemo, useState } from "react";
import { PlusCircle, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemoryCard } from "@/components/MemoryCard";
import { MemoryModal } from "@/components/MemoryModal";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { PREDEFINED_TAGS, getTagLabel } from "@/lib/tags";
import type { Kid, Memory } from "@/types";

interface MemoryFeedProps {
  kidId: string;
  kidBirthdate: string;
  allKids: Kid[];
  initialMemories: Memory[];
}

export function MemoryFeed({ kidId, kidBirthdate, allKids, initialMemories }: MemoryFeedProps) {
  const { t, language } = useLanguage();
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Tags that actually appear in this kid's memories
  const availableTags = useMemo(() => {
    const seen = new Set<string>();
    memories.forEach((m) => m.tags?.forEach((t) => seen.add(t)));
    return Array.from(seen);
  }, [memories]);

  const filtered = useMemo(() => {
    return memories.filter((m) => {
      if (activeTag && !m.tags?.includes(activeTag)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          m.story_he?.toLowerCase().includes(q) ||
          m.story_en?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [memories, searchQuery, activeTag]);

  function openAddModal() {
    setEditingMemory(null);
    setModalOpen(true);
  }

  function openEditModal(memory: Memory) {
    setEditingMemory(memory);
    setModalOpen(true);
  }

  function handleSaved(saved: Memory) {
    setMemories((prev) => {
      const exists = prev.find((m) => m.id === saved.id);
      if (exists) return prev.map((m) => (m.id === saved.id ? saved : m));
      return [saved, ...prev].sort(
        (a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime()
      );
    });
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (!error) setMemories((prev) => prev.filter((m) => m.id !== id));
  }

  const hasFilters = searchQuery.trim() || activeTag;

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-foreground">
          {t("זיכרונות", "Memories")}
          {memories.length > 0 && (
            <span className="ms-2 text-sm font-sans font-normal text-muted-foreground">
              ({memories.length})
            </span>
          )}
        </h3>
        <Button onClick={openAddModal} size="sm">
          <PlusCircle className="h-4 w-4 me-1.5" />
          {t("זיכרון חדש", "Add memory")}
        </Button>
      </div>

      {/* Search + tag filters */}
      {memories.length > 0 && (
        <div className="space-y-2 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("חיפוש בזיכרונות...", "Search memories...")}
              className="ps-9 pe-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tag filters — only shown if any memories have tags */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isActive = activeTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(isActive ? null : tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {getTagLabel(tag, language)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty / no-results states */}
      {memories.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border">
          <div className="text-4xl mb-3">📷</div>
          <p className="text-muted-foreground text-sm">
            {t("עדיין אין זיכרונות. הוסיפו את הראשון!", "No memories yet. Add the first one!")}
          </p>
          <Button onClick={openAddModal} variant="outline" size="sm" className="mt-4">
            {t("הוסיפו זיכרון", "Add a memory")}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {t("לא נמצאו זיכרונות", "No memories found")}
          {hasFilters && (
            <button
              onClick={() => { setSearchQuery(""); setActiveTag(null); }}
              className="block mx-auto mt-2 text-primary text-xs hover:underline"
            >
              {t("נקה סינון", "Clear filters")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              kidBirthdate={kidBirthdate}
              allKids={allKids}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <MemoryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingMemory(null); }}
        kidId={kidId}
        allKids={allKids}
        memory={editingMemory}
        onSaved={handleSaved}
      />
    </section>
  );
}
