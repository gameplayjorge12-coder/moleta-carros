#!/usr/bin/env node

import { Client } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  host: "db.npxqnedaaeuzitdiqgvd.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "kQdTvxFfH3McxYzp",
  ssl: { rejectUnauthorized: false },
});

async function executeMigrations() {
  console.log("🚗 Moleta Carros — Executando Migrations\n");

  try {
    console.log("1️⃣  Conectando ao banco...");
    await client.connect();
    console.log("✅ Conectado\n");

    const migrationFile = path.join(
      __dirname,
      "..",
      "supabase",
      "migrations",
      "20260914000001_create_veiculos_table.sql"
    );

    const sql = fs.readFileSync(migrationFile, "utf-8");

    console.log("2️⃣  Executando SQL schema...");

    // Split by semicolon e executa cada statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 50).replace(/\n/g, " ");

      try {
        await client.query(statement);
        console.log(`   ✓ Statement ${i + 1}: ${preview}...`);
      } catch (err) {
        // Ignore "already exists" errors
        if (
          err.message.includes("already exists") ||
          err.message.includes("duplicate key")
        ) {
          console.log(
            `   ℹ️  Statement ${i + 1}: ${preview}... (já existe)`
          );
        } else {
          console.error(
            `   ❌ Statement ${i + 1}: ${preview}...\n   Erro: ${err.message}`
          );
          throw err;
        }
      }
    }

    console.log("✅ SQL schema criado\n");

    console.log("🎉 Migrations completas!\n");
    console.log("Próximos passos:");
    console.log("  npm run test    — Validar testes");
    console.log("  npm run build   — Build produção");
    console.log("  Vercel deploy   — Deploy automático\n");
  } catch (err) {
    console.error("❌ Erro:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

executeMigrations();
