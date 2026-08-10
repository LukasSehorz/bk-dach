// Nimmt N Bilder bei gleicher relativer Scrolltiefe auf, damit sich zwei Seiten
// Zustand für Zustand vergleichen lassen.
//   node frames.js <url> <praefix> [frames]
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2];
const prefix = process.argv[3] || 'f';
const N = parseInt(process.argv[4] || '12', 10);
const OUT = path.resolve(__dirname, '..', 'qa', 'frames');
require('fs').mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--lang=de-DE', '--font-render-hinting=none'],
  });
  const pg = await b.newPage();
  await pg.setViewport({ width: 1440, height: 900 });
  await pg.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
  await pg.goto(url, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  await sleep(1600);

  // Cookie-Banner wegklicken
  await pg.evaluate(() => {
    const words = ['accept', 'akzeptieren', 'alle akzeptieren', 'zustimmen', 'einverstanden'];
    for (const el of document.querySelectorAll('button, a, [role="button"]')) {
      const t = (el.textContent || '').trim().toLowerCase();
      if (t && words.some((w) => t === w || t.startsWith(w))) { el.click(); return; }
    }
  }).catch(() => {});
  await sleep(500);

  // einmal langsam durchscrollen, damit alle Auftritte ausgelöst sind
  await pg.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight + step; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 260));
    }
  });
  await sleep(900);

  const total = await pg.evaluate(() => document.body.scrollHeight);
  console.log(prefix + ' Seitenhöhe ' + total);

  for (let i = 0; i < N; i++) {
    const y = Math.round((total - 900) * (i / (N - 1)));
    await pg.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(950);
    await pg.screenshot({ path: path.join(OUT, `${prefix}-${String(i).padStart(2, '0')}.png`) });
  }
  console.log(prefix + ': ' + N + ' Bilder in qa/frames/');

  try { await b.close(); } catch (e) {}
  process.exit(0);
})();
