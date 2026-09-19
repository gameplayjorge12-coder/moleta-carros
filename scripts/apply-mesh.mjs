#!/usr/bin/env node
// Aplica a migration do MALHA (mesh_*) no Supabase. Roda o arquivo inteiro
// numa query só — a migration tem função PL/pgSQL ($$...$$) e split por ';' quebra.
import { Client } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "supabase", "migrations", "20260918000001_create_mesh_identity_graph.sql");

const client = new Client({
  host: "db.npxqnedaaeuzitdiqgvd.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "kQdTvxFfH3McxYzp",
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const sql = fs.readFileSync(file, "utf-8");
  console.log("🔗 Conectando…");
  await client.connect();
  console.log("✅ Conectado. Aplicando MALHA (idempotente)…");
  await client.query(sql);
  console.log("✅ Migration aplicada.");

  const { rows } = await client.query(`
    select table_name from information_schema.tables
    where table_schema='public' and table_name like 'mesh_%' order by table_name`);
  console.log("📋 Tabelas mesh_*:", rows.map(r => r.table_name).join(", ") || "(nenhuma)");
  await client.end();
}
main().catch(async (e) => { console.error("❌", e.message); try { await client.end(); } catch {} process.exit(1); });
