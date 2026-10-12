import { createClient } from "@/lib/supabase/server";
import GraphView from "@/components/GraphView";

export default async function GrafoPage() {
  const supabase = await createClient();

  const [{ data: notes }, { data: links }] = await Promise.all([
    supabase.from("notes").select("id, title, summary, tags"),
    supabase.from("note_links").select("from_note, to_note"),
  ]);

  const nodes = (notes ?? []).map((n) => ({
    id: n.id,
    label: n.title,
    tags: n.tags ?? [],
    summary: n.summary,
  }));

  const edges = (links ?? []).map((l) => ({ from: l.from_note, to: l.to_note }));

  return <GraphView nodes={nodes} edges={edges} />;
}
