// Tratamento de fotos em lote (o Marcelo manda cru, o script entrega pronto pro site).
// Melhor desempenho: sharp (libvips) — auto-orienta, apara borda, redimensiona e comprime.
//
// Uso:
//   node scripts/treat-fotos.mjs                      # entrada: ./fotos-raw  saída: ./fotos-tratadas
//   node scripts/treat-fotos.mjs <entrada> <saida>
//   node scripts/treat-fotos.mjs <entrada> <saida> --crop   # recorta pra 3:2 (cards)
//
// Depois é só subir as imagens de ./fotos-tratadas pelo painel admin.
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')));
const IN = path.resolve(args[0] || 'fotos-raw');
const OUT = path.resolve(args[1] || 'fotos-tratadas');
const CROP = flags.has('--crop');

const EXT = /\.(jpe?g|png|webp)$/i; // heic: converta antes (o painel já converte no upload)
const MAX_W = 1600; // suficiente pro site; mantém leve
const QUALITY = 82; // ótimo custo/benefício visual

if (!fs.existsSync(IN)) {
  console.log(`\n📸 treat-fotos — trate as fotos do Marcelo em lote.\n`);
  console.log(`Pasta de entrada não existe: ${IN}`);
  console.log(`Crie a pasta, jogue as fotos dentro e rode de novo.\n`);
  console.log(`  node scripts/treat-fotos.mjs [entrada] [saida] [--crop]\n`);
  process.exit(0);
}

fs.mkdirSync(OUT, { recursive: true });
const files = fs.readdirSync(IN).filter((f) => EXT.test(f));

if (files.length === 0) {
  console.log(`Nenhuma imagem (${EXT}) em ${IN}. Nada a fazer.`);
  process.exit(0);
}

let okCount = 0;
let bytesIn = 0;
let bytesOut = 0;
const falhas = [];

for (const file of files) {
  const src = path.join(IN, file);
  const base = file.replace(EXT, '');
  const dst = path.join(OUT, `${base}.jpg`);
  try {
    const sizeIn = fs.statSync(src).size;
    let pipe = sharp(src).rotate().trim({ threshold: 12 }); // auto-orienta + apara borda uniforme
    if (CROP) {
      pipe = pipe.resize(MAX_W, Math.round((MAX_W * 2) / 3), { fit: 'cover', position: 'centre' });
    } else {
      pipe = pipe.resize({ width: MAX_W, withoutEnlargement: true });
    }
    await pipe.jpeg({ quality: QUALITY, mozjpeg: true }).toFile(dst);
    const sizeOut = fs.statSync(dst).size;
    bytesIn += sizeIn;
    bytesOut += sizeOut;
    okCount++;
    const kbIn = (sizeIn / 1024).toFixed(0);
    const kbOut = (sizeOut / 1024).toFixed(0);
    console.log(`✓ ${file}  ${kbIn}KB → ${kbOut}KB`);
  } catch (err) {
    falhas.push(`${file}: ${err instanceof Error ? err.message : 'erro'}`);
  }
}

console.log(`\n✅ ${okCount}/${files.length} tratadas → ${OUT}`);
if (bytesIn) {
  const economia = (100 - (bytesOut / bytesIn) * 100).toFixed(0);
  console.log(`   ${(bytesIn / 1e6).toFixed(1)}MB → ${(bytesOut / 1e6).toFixed(1)}MB (−${economia}%)`);
}
if (falhas.length) {
  console.log(`\n⚠️ Falhas (${falhas.length}):`);
  falhas.forEach((f) => console.log(`   ${f}`));
}
