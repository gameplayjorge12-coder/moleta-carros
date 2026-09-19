#!/usr/bin/env node
// Relatório do MALHA — responde "teve interação hoje?" com número.
// Uso:  node scripts/mesh-report.mjs           (hoje)
//       node scripts/mesh-report.mjs 7         (últimos 7 dias)
// Ignora sinais de teste (device_fp começando com TESTFP_).
import { Client } from 'pg';

const dias = parseInt(process.argv[2] || '0', 10);
const c = new Client({
  host: 'db.npxqnedaaeuzitdiqgvd.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'kQdTvxFfH3McxYzp',
  ssl: { rejectUnauthorized: false },
});

const janela = dias > 0
  ? `criado_em >= (now() at time zone 'America/Sao_Paulo')::date - interval '${dias} days'`
  : `criado_em >= date_trunc('day', now() at time zone 'America/Sao_Paulo')`;

const filtroTeste = `(device_fp is null or device_fp not like 'TESTFP_%')`;

await c.connect();
const { rows } = await c.query(`
  select tipo, count(*)::int total, count(distinct device_fp)::int dispositivos
  from mesh_sinal
  where ${janela} and ${filtroTeste}
  group by tipo order by total desc`);

console.log(`\n=== MALHA — ${dias > 0 ? `últimos ${dias} dias` : 'HOJE'} (America/Sao_Paulo) ===`);
if (!rows.length) {
  console.log('Nenhuma interação registrada.');
} else {
  for (const r of rows) {
    console.log(`${String(r.tipo).padEnd(18)} ${String(r.total).padStart(5)} evento(s) | ${r.dispositivos} dispositivo(s)`);
  }
  const tot = rows.reduce((a, r) => a + r.total, 0);
  console.log('-'.repeat(50));
  console.log(`TOTAL              ${String(tot).padStart(5)} evento(s)`);
}

// carros mais vistos na janela
const carros = await c.query(`
  select veiculo_id, count(*)::int views
  from mesh_sinal
  where ${janela} and ${filtroTeste} and tipo='car_detail_view' and veiculo_id is not null
  group by veiculo_id order by views desc limit 5`);
if (carros.rows.length) {
  console.log('\nCarros mais vistos:');
  for (const r of carros.rows) console.log(`  ${r.veiculo_id}  →  ${r.views} view(s)`);
}
await c.end();
