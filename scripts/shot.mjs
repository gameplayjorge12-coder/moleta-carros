// Ferramenta de inspeção visual + caça a falhas silenciosas.
// Abre o site num navegador headless, fotografa cada tela (desktop + mobile)
// e registra: erros de console, requisições que falharam, respostas >= 400,
// imagens quebradas. Uso:  node scripts/shot.mjs [baseUrl]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.argv[2] || 'https://moleta-carros.vercel.app';
const OUT = path.join(process.cwd(), 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: 'home',          url: '/' },
  { name: 'home-venda',    url: '/?categoria=venda' },
  { name: 'home-aluguel',  url: '/?categoria=aluguel' },
  { name: 'admin-login',   url: '/admin' },
];

const VIEWPORTS = [
  { tag: 'desktop', width: 1280, height: 800, mobile: false },
  { tag: 'mobile',  width: 390,  height: 844, mobile: true },
];

const report = [];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    deviceScaleFactor: 1,
  });
  for (const p of PAGES) {
    const page = await ctx.newPage();
    const problems = { consoleErrors: [], failedRequests: [], badResponses: [], brokenImages: [] };

    page.on('console', (m) => {
      if (m.type() === 'error') problems.consoleErrors.push(m.text().slice(0, 200));
    });
    page.on('requestfailed', (r) =>
      problems.failedRequests.push(`${r.method()} ${r.url().slice(0, 120)} — ${r.failure()?.errorText}`)
    );
    page.on('response', (r) => {
      if (r.status() >= 400) problems.badResponses.push(`${r.status()} ${r.url().slice(0, 120)}`);
    });

    const file = path.join(OUT, `${p.name}-${vp.tag}.png`);
    try {
      await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1200); // deixa animações/imagens assentarem

      // Detecta imagens que não carregaram (naturalWidth === 0)
      const broken = await page.$$eval('img', (imgs) =>
        imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src)
      );
      problems.brokenImages = broken.slice(0, 10);

      await page.screenshot({ path: file, fullPage: true });
      report.push({ page: `${p.name} [${vp.tag}]`, screenshot: file, ...problems });
      console.log(`OK  ${p.name} [${vp.tag}] -> ${path.basename(file)}`);
    } catch (e) {
      report.push({ page: `${p.name} [${vp.tag}]`, erro: e.message, ...problems });
      console.log(`ERR ${p.name} [${vp.tag}]: ${e.message}`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));

// Resumo no console
console.log('\n===== RESUMO DE FALHAS SILENCIOSAS =====');
let total = 0;
for (const r of report) {
  const issues = [
    ...(r.consoleErrors || []).map((x) => `console: ${x}`),
    ...(r.failedRequests || []).map((x) => `req falhou: ${x}`),
    ...(r.badResponses || []).map((x) => `resp ${x}`),
    ...(r.brokenImages || []).map((x) => `img quebrada: ${x.slice(0, 80)}`),
    ...(r.erro ? [`ERRO PAGINA: ${r.erro}`] : []),
  ];
  if (issues.length) {
    total += issues.length;
    console.log(`\n[${r.page}]`);
    issues.forEach((i) => console.log('  - ' + i));
  }
}
console.log(`\nTotal de problemas detectados: ${total}`);
console.log(`Screenshots + report.json em: ${OUT}`);
