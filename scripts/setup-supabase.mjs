#!/usr/bin/env node

/**
 * Setup Script — Moleta Carros Supabase
 * 1. Cria bucket storage (automático)
 * 2. Instrui SQL schema (manual no dashboard — 1 min)
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SQL_SCHEMA = `
-- Tabela de veículos
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

-- Row Level Security
alter table public.veiculos enable row level security;

-- Policy: Leitura pública
create policy if not exists "Leitura publica" on public.veiculos
for select using (true);

-- Policy: Escrita (autenticado)
create policy if not exists "Escrita Admin" on public.veiculos
for all using (auth.role() = 'authenticated');

-- Índices
create index if not exists veiculos_status_idx on public.veiculos(status);
create index if not exists veiculos_categoria_idx on public.veiculos(categoria);
`;

async function setupSupabase() {
  console.log("🚗 Moleta Carros — Setup Supabase\n");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Variáveis de ambiente não configuradas!");
    console.error("   Verifique .env.local");
    process.exit(1);
  }

  try {
    // 1. Conectar ao Supabase
    console.log("1️⃣  Conectando ao Supabase...");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Conectado\n");

    // 2. Criar bucket storage
    console.log("2️⃣  Criando bucket storage...");
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === "veiculos");

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(
        "veiculos",
        { public: true }
      );

      if (createError) {
        console.warn("⚠️  Bucket pode já existir ou erro:", createError.message);
      } else {
        console.log("✅ Bucket 'veiculos' criado (público)\n");
      }
    } else {
      console.log("✅ Bucket 'veiculos' já existe\n");
    }

    // 3. Instruir SQL (manual no dashboard)
    console.log("3️⃣  SQL Schema — Execute manualmente no Supabase:\n");
    console.log("   Dashboard → SQL Editor → Cole abaixo e execute:\n");
    console.log("━".repeat(60));
    console.log(SQL_SCHEMA);
    console.log("━".repeat(60));
    console.log("\n   Link direto: https://app.supabase.com/project/npxqnedaaeuzitdiqgvd/sql");
    console.log("\n");

    console.log("🎉 Setup iniciado! Próximos passos:\n");
    console.log("   1. Execute SQL acima no Supabase dashboard (1 min)");
    console.log("   2. npm run dev      — Iniciar desenvolvimento");
    console.log("   3. npm run test     — Validar testes");
    console.log("   4. npm run build    — Build produção");
    console.log("\n");
  } catch (err) {
    console.error("❌ Erro no setup:", err.message);
    process.exit(1);
  }
}

setupSupabase();
