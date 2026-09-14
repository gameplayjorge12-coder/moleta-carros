#!/usr/bin/env node

// WebSocket polyfill para Node.js 20
if (!globalThis.WebSocket) {
  const WebSocket = await import("ws").then((m) => m.default);
  globalThis.WebSocket = WebSocket;
}

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://npxqnedaaeuzitdiqgvd.supabase.co";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_SECRET_KEY) {
  console.error("❌ SUPABASE_SECRET_KEY não configurada. Use: export SUPABASE_SECRET_KEY='...'");
  process.exit(1);
}

const SQL_SCHEMA = `
create table if not exists public.veiculos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  titulo text not null,
  preco numeric not null,
  categoria text check (categoria in ('venda', 'aluguel')) not null default 'venda',
  descricao text,
  fotos text[] default '{}'::text[],
  status text check (status in ('disponivel', 'vendido')) not null default 'disponivel',
  views integer default 0
);

alter table public.veiculos enable row level security;

create policy if not exists "Leitura publica" on public.veiculos
for select using (true);

create policy if not exists "Escrita Admin" on public.veiculos
for all using (auth.role() = 'authenticated');

create index if not exists veiculos_status_idx on public.veiculos(status);
create index if not exists veiculos_categoria_idx on public.veiculos(categoria);
`;

async function setup() {
  console.log("🚗 Moleta Carros — Setup Automático\n");

  try {
    const client = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. SQL Schema
    console.log("1️⃣  Executando SQL schema...");
    const queries = SQL_SCHEMA.split(";").filter((q) => q.trim());

    for (const query of queries) {
      if (query.trim()) {
        const { error } = await client.rpc("exec", { sql: query });
        if (error && !error.message.includes("already exists")) {
          console.warn("   ⚠️  " + error.message);
        }
      }
    }
    console.log("✅ SQL schema criado\n");

    // 2. Bucket Storage
    console.log("2️⃣  Criando bucket storage...");
    const { error: bucketError } = await client.storage.createBucket(
      "veiculos",
      { public: true }
    );

    if (
      bucketError &&
      !bucketError.message.includes("already") &&
      !bucketError.message.includes("exists")
    ) {
      console.error("❌ Erro bucket:", bucketError.message);
    } else {
      console.log("✅ Bucket 'veiculos' pronto\n");
    }

    console.log("🎉 Setup Supabase Completo!\n");
    console.log("Próximos passos:");
    console.log("  npm run test    — Rodar testes");
    console.log("  npm run build   — Build produção");
    console.log("  Vercel deploy   — Deploy automático\n");
  } catch (err) {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  }
}

setup();
