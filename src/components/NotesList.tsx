type NoteRow = {
  id: string;
  title: string;
  summary: string | null;
  tags: string[];
  created_at: string;
};

export default function NotesList({ notes }: { notes: NoteRow[] }) {
  if (notes.length === 0) {
    return (
      <p className="text-sm text-[#6b6558] dark:text-[#a39b89]">
        Nenhuma nota ainda. Registre a primeira no formulário ao lado.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => (
        <li
          key={note.id}
          className="rounded-xl border border-[#e5e1da] dark:border-[#3a352c] bg-white dark:bg-[#242019] p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{note.title}</h3>
            <time className="text-xs text-[#a39b89]">
              {new Date(note.created_at).toLocaleDateString("pt-BR")}
            </time>
          </div>
          {note.summary && (
            <p className="text-sm text-[#6b6558] dark:text-[#a39b89] mt-1">{note.summary}</p>
          )}
          {note.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] rounded-full bg-[#b2552e] text-white px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
