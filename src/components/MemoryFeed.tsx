"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { MemoryCard } from "@/components/MemoryCard";
import { MemoryModal } from "@/components/MemoryModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { PREDEFINED_TAGS, getTagLabel } from "@/lib/tags";
import { getKidColors } from "@/lib/kidColors";
import type { Kid, Memory } from "@/types";

interface MemoryFeedProps {
  kidId: string;
  kidBirthdate: string;
  allKids: Kid[];
  initialMemories: Memory[];
  kidOrder: number;
}

export function MemoryFeed({
  kidId,
  kidBirthdate,
  allKids,
  initialMemories,
  kidOrder,
}: MemoryFeedProps) {
  const { t, language, dir } = useLanguage();
  const { isGuest } = useAuth();
  const kidColors = getKidColors(kidOrder);
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

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
        (a, b) =>
          new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime()
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
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h3
            className="font-display"
            style={{ margin: 0, fontSize: 24, color: "var(--color-ink)" }}
          >
            {t("זיכרונות", "Memories")}
          </h3>
          {memories.length > 0 && (
            <span
              className="font-round"
              style={{ fontSize: 16, color: "var(--color-ink-soft)" }}
            >
              {memories.length}
            </span>
          )}
        </div>
        {!isGuest && (
          <button
            onClick={openAddModal}
            className="font-round"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 18px",
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              color: "#fff",
              fontSize: 15,
              background: kidColors.deep,
              boxShadow: `0 6px 16px ${kidColors.mid}`,
            }}
          >
            <span style={{ fontSize: 17 }}>＋</span>
            {t("זיכרון חדש", "Add memory")}
          </button>
        )}
      </div>

      {/* Search + tag filters */}
      {memories.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {/* Search bar */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                // 🔍 always on the inline-start side: right in RTL, left in LTR
                ...(dir === "rtl" ? { right: 14 } : { left: 14 }),
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                color: "#8E869C",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("חיפוש בזיכרונות...", "Search memories...")}
              style={{
                width: "100%",
                // icon side gets 44px, clear-button side gets 36px
                padding: dir === "rtl" ? "12px 44px 12px 36px" : "12px 36px 12px 44px",
                background: "var(--color-card)",
                borderRadius: 16,
                border: "1px solid var(--color-line)",
                fontFamily: "var(--font-sans, Rubik, sans-serif)",
                fontSize: 14,
                color: "var(--color-ink)",
                outline: "none",
                boxSizing: "border-box",
                direction: dir,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  // X clear always on the inline-end side: left in RTL, right in LTR
                  ...(dir === "rtl" ? { left: 12 } : { right: 12 }),
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#8E869C",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tag filter pills */}
          {availableTags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {availableTags.map((tagId) => {
                const isActive = activeTag === tagId;
                const tagDef = PREDEFINED_TAGS.find((t) => t.id === tagId);
                const label = getTagLabel(tagId, language);
                return (
                  <button
                    key={tagId}
                    onClick={() => setActiveTag(isActive ? null : tagId)}
                    className="font-round"
                    style={
                      isActive && tagDef
                        ? {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "7px 14px",
                            borderRadius: 99,
                            fontSize: 13.5,
                            background: tagDef.colors.soft,
                            color: tagDef.colors.deep,
                            border: `1.5px solid ${tagDef.colors.mid}`,
                            cursor: "pointer",
                          }
                        : {
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "7px 14px",
                            borderRadius: 99,
                            fontSize: 13.5,
                            background: "#fff",
                            color: "#8E869C",
                            border: "1.5px solid #EFE7DE",
                            cursor: "pointer",
                          }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty / no-results states */}
      {memories.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "#fff",
            borderRadius: 24,
            border: "2px dashed #EFE7DE",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
          <p
            className="font-round"
            style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: 0 }}
          >
            {t(
              "עדיין אין זיכרונות. הוסיפו את הראשון!",
              "No memories yet. Add the first one!"
            )}
          </p>
          {!isGuest && (
            <button
              onClick={openAddModal}
              className="font-round"
              style={{
                marginTop: 16,
                padding: "10px 22px",
                borderRadius: 99,
                border: "1.5px solid #EFE7DE",
                background: "#fff",
                color: "#8E869C",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {t("הוסיפו זיכרון", "Add a memory")}
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p className="font-round" style={{ color: "var(--color-ink-soft)", fontSize: 14, margin: 0 }}>
            {t("לא נמצאו זיכרונות", "No memories found")}
          </p>
          {hasFilters && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveTag(null);
              }}
              className="font-round"
              style={{
                marginTop: 8,
                background: "none",
                border: "none",
                color: kidColors.deep,
                fontSize: 13,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {t("נקה סינון", "Clear filters")}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
        onClose={() => {
          setModalOpen(false);
          setEditingMemory(null);
        }}
        kidId={kidId}
        allKids={allKids}
        memory={editingMemory}
        onSaved={handleSaved}
      />
    </section>
  );
}
