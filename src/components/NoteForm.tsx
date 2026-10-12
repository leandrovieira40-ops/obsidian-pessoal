"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { findRelated, slugify, type NoteForScoring } from "@/lib/related";

export default function NoteForm({ existingNotes }: { existingNotes: NoteForScoring[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [source, setSource] = useState("");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagList = useMemo(
    () => tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
    [tags],
  );

  const suggestions = useMemo(() => {
    const queryText = `${title} ${summary} ${body}`;
    if (queryText.trim().length < 6) return [];
    return findRelated(queryText, tagList, existingNotes, { top: 6 });
  }, [title, summary, body, tagList, existingNotes]);

  function isChecked(id: string, defaultValue: boolean) {
    return overrides[id] ?? defaultValue;
  }

  function toggle(id: string, defaultValue: boolean) {
    setOverrides((prev) => ({ ...prev, [id]: !isChecked(id, defaultValue) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const slug = `${slugify(title)}-${Date.now().toString(36)}`;

    const { data: note, error: insertError } = await supabase
      .from("notes")
      .insert({ title, slug, summary, body, tags: tagList, source: source || null })
      .select("id")
      .single();

    if (insertError || !note) {
      setError(insertError?.message ?? "Erro ao salvar a nota.");
      setSaving(false);
      return;
    }

    const linkTargets = new Set(
      suggestions.filter((s) => isChecked(s.note.id, s.score >= 0.25)).map((s) => s.note.id),
    );

    if (linkTargets.size > 0) {
      const rows = Array.from(linkTargets).flatMap((targetId) => [
        { from_note: note.id, to_note: targetId },
        { from_note: targetId, to_note: note.id },
      ]);
      await supabase.from("note_links").insert(rows);
    }

    setTitle("");
    setTags("");
    setSummary("");
    setBody("");
    setSource("");
    setOverrides({});
    setSaving(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-[#e5e1da] dark:border-[#3a352c] bg-white dark:bg-[#242019] p-5"
    >
      <h2 className="text-sm font-semibold">Nova nota</h2>

      <input
        required
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-[#e5e1da] dark:border-[#3a352c] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#b2552e]"
      />
      <input
        placeholder="Tags (separadas por vírgula)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="rounded-lg border border-[#e5e1da] dark:border-[#3a352c] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#b2552e]"
      />
      <input
        placeholder="Resumo (1-2 frases)"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="rounded-lg border border-[#e5e1da] dark:border-[#3a352c] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#b2552e]"
      />
      <textarea
        required
        placeholder="Corpo da nota — cole aqui o texto ou a transcrição do áudio"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        className="rounded-lg border border-[#e5e1da] dark:border-[#3a352c] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#b2552e]"
      />
      <input
        placeholder="Fonte (opcional — livro, artigo, autor...)"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className="rounded-lg border border-[#e5e1da] dark:border-[#3a352c] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#b2552e]"
      />

      {suggestions.length > 0 && (
        <div className="rounded-lg bg-[#faf5ee] dark:bg-[#1b1915] p-3">
          <p className="text-xs text-[#6b6558] dark:text-[#a39b89] mb-2">
            Notas relacionadas encontradas — desmarque se não fizer sentido:
          </p>
          <div className="flex flex-col gap-1">
            {suggestions.map((s) => (
              <label key={s.note.id} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={isChecked(s.note.id, s.score >= 0.25)}
                  onChange={() => toggle(s.note.id, s.score >= 0.25)}
                />
                {s.note.title}
                <span className="text-[#a39b89]">({s.score.toFixed(2)})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-1 self-start rounded-lg bg-[#b2552e] text-white text-sm font-medium px-4 py-2 hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Salvando..." : "Registrar nota"}
      </button>
    </form>
  );
}
