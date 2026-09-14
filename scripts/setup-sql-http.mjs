#!/usr/bin/env node

/**
 * Setup SQL via HTTP direto (não precisa de RPC)
 * Usa endpoint /rest/v1 do Supabase
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "https://npxqnedaaeuzitdiqgvd.supabase.co";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_SECRET_KEY) {
  console.error("❌ SUPABASE_SECRET_KEY não configurada. Use: export SUPABASE_SECRET_KEY='...'");
  process.exit(1);
}

const SQL_STATEMENTS = [
  `create table if not exists public.veiculos (
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
  )`,

  `alter table public.veiculos enable row level security`,

  `create policy if not exists "Leitura publica" on public.veiculos
   for select using (true)`,

  `create policy if not exists "Escrita Admin" on public.veiculos
   for all using (auth.role() = 'authenticated')`,

  `create index if not exists veiculos_status_idx on public.veiculos(status)`,

  `create index if not exists veiculos_categoria_idx on public.veiculos(categoria)`,
];

async function executeSql() {
  console.log("🚗 Moleta Carros — Setup SQL via HTTP\n");

  for (let i = 0; i < SQL_STATEMENTS.length; i++) {
    const sql = SQL_STATEMENTS[i];
    console.log(`${i + 1}️⃣  Executando SQL (${i + 1}/${SQL_STATEMENTS.length})...`);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql_execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      // Se a rota acima não funciona, tenta alternativa
      if (!response.ok && response.status === 404) {
        console.log(
          "   ℹ️  Endpoint não encontrado, tentando alternativa...\n"
        );
        break;
      }

      if (response.ok) {
        console.log("   ✅ Executado\n");
      } else {
        const err = await response.json();
        if (err.message && err.message.includes("already exists")) {
          console.log("   ℹ️  Já existe, pulando\n");
        } else {
          console.log("   ⚠️  " + (err.message || response.statusText) + "\n");
        }
      }
    } catch (err) {
      console.error("   ❌ Erro:", err.message, "\n");
    }
  }

  console.log(
    "📌 Se SQL não rodou via HTTP, execute manualmente no dashboard:\n"
  );
  console.log("   Dashboard → SQL Editor → Cole SQL → Execute\n");
  console.log(
    "   Link: https://app.supabase.com/project/npxqnedaaeuzitdiqgvd/sql\n"
  );
  console.log("🎯 Próximo: npm run test\n");
}

executeSql();
