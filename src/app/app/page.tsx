import { createClient } from "@/lib/supabase/server";
import NoteForm from "@/components/NoteForm";
import NotesList from "@/components/NotesList";

export default async function AppPage() {
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, summary, body, tags, created_at")
    .order("created_at", { ascending: false });

  const allNotes = notes ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-5xl mx-auto">
      <section>
        <h1 className="text-base font-semibold mb-3">Suas notas</h1>
        <NotesList notes={allNotes} />
      </section>
      <section>
        <NoteForm existingNotes={allNotes} />
      </section>
    </div>
  );
}
