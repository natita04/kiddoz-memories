"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MemoryCard } from "@/components/MemoryCard";
import { MemoryModal } from "@/components/MemoryModal";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import type { Memory } from "@/types";

interface MemoryFeedProps {
  kidId: string;
  initialMemories: Memory[];
}

export function MemoryFeed({ kidId, initialMemories }: MemoryFeedProps) {
  const { t } = useLanguage();
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

  function openAddModal() {
    setEditingMemory(null);
    setModalOpen(true);
  }

  function openEditModal(memory: Memory) {
    setEditingMemory(memory);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingMemory(null);
  }

  function handleSaved(saved: Memory) {
    setMemories((prev) => {
      const exists = prev.find((m) => m.id === saved.id);
      if (exists) {
        return prev.map((m) => (m.id === saved.id ? saved : m));
      }
      return [saved, ...prev].sort(
        (a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime()
      );
    });
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (!error) {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-foreground">
          {t("זיכרונות", "Memories")}
          {memories.length > 0 && (
            <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">
              ({memories.length})
            </span>
          )}
        </h3>
        <Button onClick={openAddModal} size="sm">
          <PlusCircle className="h-4 w-4 mr-1.5" />
          {t("זיכרון חדש", "Add memory")}
        </Button>
      </div>

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
      ) : (
        <div className="space-y-4">
          {memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <MemoryModal
        open={modalOpen}
        onClose={closeModal}
        kidId={kidId}
        memory={editingMemory}
        onSaved={handleSaved}
      />
    </section>
  );
}
