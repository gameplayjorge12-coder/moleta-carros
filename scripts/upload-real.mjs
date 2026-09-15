// Sobe as fotos REAIS (organizadas por carro) pro Supabase Storage.
// Uso: SB_SECRET=... node scripts/upload-real.mjs
import fs from 'fs';
import path from 'path';

const SB = 'https://npxqnedaaeuzitdiqgvd.supabase.co';
const SECRET = process.env.SB_SECRET;
if (!SECRET) { console.error('faltou SB_SECRET'); process.exit(1); }
const BASE = 'C:\\Users\\USER\\Pictures\\Moleta Carros';

// mapa: nome no storage -> arquivo origem
const MAP = {
  'rav4-1.jpg': 'venda/22.jpeg', 'rav4-2.jpg': 'venda/25.jpeg', 'rav4-3.jpg': 'venda/27.jpeg', 'rav4-4.jpg': 'venda/26.jpeg',
  'corolla-1.jpg': 'venda/24.jpeg', 'corolla-2.jpg': 'venda/21.jpeg', 'corolla-3.jpg': 'venda/23.jpeg',
  'palio-1.jpg': 'venda/6.jpeg', 'palio-2.jpg': 'venda/1.jpeg', 'palio-3.jpg': 'venda/5.jpeg', 'palio-4.jpg': 'venda/4.jpeg', 'palio-5.jpg': 'venda/3.jpeg',
  'strada-1.jpg': 'venda/20.jpeg', 'strada-2.jpg': 'venda/19.jpeg', 'strada-3.jpg': 'venda/18.jpeg',
  'caminhao-1.jpg': 'venda/15.jpeg', 'caminhao-2.jpg': 'venda/12.jpeg', 'caminhao-3.jpg': 'venda/13.jpeg',
  'mobi-1.jpg': 'Aluguel/2.jpeg', 'mobi-2.jpg': 'Aluguel/3.jpeg', 'mobi-3.jpg': 'Aluguel/1.jpeg', 'mobi-4.jpg': 'Aluguel/4.jpeg', 'mobi-5.jpg': 'Aluguel/5.jpeg',
  'kwid-1.jpg': 'Aluguel/7.jpeg', 'kwid-2.jpg': 'Aluguel/6.jpeg', 'kwid-3.jpg': 'Aluguel/111.jpeg', 'kwid-4.jpg': 'Aluguel/12312312.jpeg', 'kwid-5.jpg': 'Aluguel/1231231213.jpeg',
  'patio.jpg': 'Aluguel/8.jpeg',
};

let ok = 0, fail = 0;
for (const [name, rel] of Object.entries(MAP)) {
  const fp = path.join(BASE, rel.replace('/', path.sep));
  if (!fs.existsSync(fp)) { console.log(`FALTA ${rel}`); fail++; continue; }
  const bytes = fs.readFileSync(fp);
  const res = await fetch(`${SB}/storage/v1/object/veiculos/${name}`, {
    method: 'POST',
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: bytes,
  });
  if (res.ok) { ok++; console.log(`OK ${name} <- ${rel}`); }
  else { fail++; console.log(`ERRO ${name}: ${res.status} ${await res.text()}`); }
}
console.log(`\n${ok} enviadas, ${fail} falhas`);
