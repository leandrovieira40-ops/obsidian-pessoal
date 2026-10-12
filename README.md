# Palácio de Conhecimento

App web privado (login + banco de dados) pra registrar notas conectadas —
tudo que você lê e manda por texto ou áudio se transforma numa nota, ligada
automaticamente às notas relacionadas que você já tem.

## Stack

- **Next.js** (App Router) — código e UI
- **Supabase** — autenticação (e-mail/senha) e banco de dados (Postgres),
  com Row Level Security: cada usuário só vê as próprias notas
- **Vercel** — hospedagem (deploy automático a cada push)

## Como funciona

- `/login` — criar conta / entrar
- `/app` — lista de notas + formulário de nova nota. Ao digitar, o próprio
  formulário sugere notas relacionadas (por sobreposição de palavras-chave e
  tags, calculado no navegador — sem custo de API) e já cria o link nos dois
  sentidos ao salvar.
- `/app/grafo` — grafo interativo das notas e conexões (vis-network).

## Desenvolvimento local

```bash
npm install
cp .env.local.example .env.local   # preencha com as chaves do projeto Supabase
npm run dev
```

## Variáveis de ambiente

| Nome | Onde pegar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (chave `anon`/`publishable`) |

## Deploy

1. Importe este repositório em [vercel.com/new](https://vercel.com/new).
2. Configure as duas variáveis de ambiente acima no projeto Vercel.
3. Deploy — a cada push na branch principal, o Vercel publica automaticamente.

## Esquema do banco (Supabase)

- `notes`: `id, user_id, slug, title, summary, body, tags[], source, created_at`
- `note_links`: `id, user_id, from_note, to_note` (uma linha por direção)

Ambas as tabelas têm RLS habilitado com políticas que restringem tudo a
`auth.uid() = user_id`.
