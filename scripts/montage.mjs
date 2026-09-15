// Gera "contact sheets" (montagens) de todas as fotos originais do Marcelo,
// pra identificar os carros reais de uma vez. Uso: node scripts/montage.mjs
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'C:\\Users\\USER\\Pictures\\Moleta Carros';
const OUT = path.join(process.cwd(), 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const folders = ['venda', 'Aluguel'];
const PER_SHEET = 9; // 3x3

const browser = await chromium.launch();

for (const folder of folders) {
  const dir = path.join(BASE, folder);
  if (!fs.existsSync(dir)) continue;
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  for (let i = 0; i < files.length; i += PER_SHEET) {
    const chunk = files.slice(i, i + PER_SHEET);
    const cells = chunk
      .map((f) => {
        const fp = path.join(dir, f);
        const size = fs.statSync(fp).size;
        const ext = path.extname(f).slice(1).toLowerCase().replace('jpg', 'jpeg');
        let img = '<div style="color:#f66;font-size:20px">SEM IMAGEM</div>';
        if (size > 0) {
          const b64 = fs.readFileSync(fp).toString('base64');
          img = `<img src="data:image/${ext};base64,${b64}"/>`;
        }
        const label = `${folder}/${f}${size === 0 ? ' (VAZIO!)' : ''}`;
        return `<div class="cell">
          <div class="img">${img}</div>
          <div class="lbl">${label}</div>
        </div>`;
      })
      .join('');

    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      body{margin:0;background:#111;font-family:Arial}
      .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px}
      .cell{background:#000;border-radius:6px;overflow:hidden}
      .img{height:300px;display:flex;align-items:center;justify-content:center;background:#000}
      .img img{max-width:100%;max-height:300px;object-fit:contain}
      .lbl{color:#ffca9a;font-size:22px;font-weight:bold;padding:6px 8px;text-align:center}
    </style></head><body><div class="grid">${cells}</div></body></html>`;

    const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const sheet = Math.floor(i / PER_SHEET) + 1;
    const file = path.join(OUT, `MONTAGE-${folder}-${sheet}.png`);
    await page.screenshot({ path: file, fullPage: true });
    await page.close();
    console.log(`OK ${folder} folha ${sheet} (${chunk.length} fotos) -> ${path.basename(file)}`);
  }
}
await browser.close();
console.log('Montagens em ' + OUT);
