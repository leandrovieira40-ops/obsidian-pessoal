"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ text: error.message, isError: true });
      } else {
        router.push("/app");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ text: error.message, isError: true });
      } else {
        setMessage({
          text: "Conta criada. Se a confirmação por e-mail estiver ativa no projeto Supabase, verifique sua caixa de entrada antes de entrar.",
          isError: false,
        });
        setMode("signin");
      }
    }
    setLoading(false);
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-[#e5e1da] dark:border-[#3a352c] bg-white dark:bg-[#242019] p-8 shadow-sm">
        <h1 className="text-lg font-semibold mb-1">Palácio de Conhecimento</h1>
        <p className="text-sm text-[#6b6558] dark:text-[#a39b89] mb-6">
          {mode === "signin" ? "Entre com sua conta." : "Crie sua conta."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[#e5e1da] dark:border-[#3a352c] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#b2552e]"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-[#e5e1da] dark:border-[#3a352c] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#b2552e]"
          />

          {message && (
            <p className={`text-xs ${message.isError ? "text-red-500" : "text-[#3f7d6b]"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-[#b2552e] text-white text-sm font-medium py-2 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-xs text-[#6b6558] dark:text-[#a39b89] underline underline-offset-2"
        >
          {mode === "signin" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}
