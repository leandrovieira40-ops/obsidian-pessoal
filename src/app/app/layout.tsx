import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#e5e1da] dark:border-[#3a352c] px-5 py-3">
        <nav className="flex items-center gap-4 text-sm">
          <span className="font-semibold">Palácio de Conhecimento</span>
          <Link href="/app" className="text-[#6b6558] dark:text-[#a39b89] hover:text-[#b2552e]">
            Notas
          </Link>
          <Link href="/app/grafo" className="text-[#6b6558] dark:text-[#a39b89] hover:text-[#b2552e]">
            Grafo
          </Link>
        </nav>
        <LogoutButton />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
