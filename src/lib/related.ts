const STOPWORDS = new Set([
  "a", "o", "e", "de", "da", "do", "em", "um", "uma", "para", "com", "que",
  "no", "na", "os", "as", "se", "por", "mais", "como", "mas", "ou", "ao",
  "dos", "das", "ja", "sobre", "the", "and", "or", "of", "to", "in", "is",
  "it", "this", "that", "for", "on", "with", "are", "be",
]);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-zà-ÿ0-9]+/g) ?? []).filter(
    (t) => t.length > 2 && !STOPWORDS.has(t),
  );
}

export type NoteForScoring = {
  id: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
};

/** Pontuação simples por sobreposição de palavras-chave + tags. 0 a 1+. */
export function scoreRelated(query: string, queryTags: string[], note: NoteForScoring): number {
  const queryWords = new Set(tokenize(query));
  const noteWords = new Set(tokenize(`${note.title} ${note.summary} ${note.body}`));

  let overlap = 0;
  for (const w of queryWords) if (noteWords.has(w)) overlap++;
  const wordScore = overlap / Math.max(3, Math.min(queryWords.size, noteWords.size));

  const tagOverlap = queryTags.filter((t) => note.tags.includes(t)).length;
  const tagScore = tagOverlap > 0 ? tagOverlap * 0.3 : 0;

  return wordScore + tagScore;
}

export function findRelated(
  query: string,
  queryTags: string[],
  notes: NoteForScoring[],
  { top = 5, threshold = 0.12 } = {},
) {
  return notes
    .map((n) => ({ note: n, score: scoreRelated(query, queryTags, n) }))
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, top);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "nota";
}
