// Nimmt alle Seiten der Demo in mehreren Breiten auf und meldet Konsolenfehler
// sowie horizontalen Überlauf.  node qa.js <version>
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:4173/';
const VER = process.argv[2] || 'v';
const OUT = path.resolve(__dirname, '..', 'qa');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = ['index', 'leistungen', 'referenzen', 'kontakt', 'impressum', 'datenschutz'];
const SIZES = [
  { w: 1440, h: 900, tag: 'desk' },
  { w: 390, h: 844, tag: 'mob' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--lang=de-DE', '--font-render-hinting=none'],
  });

  const report = [];

  for (const size of SIZES) {
    for (const name of PAGES) {
      const page = await browser.newPage();
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
      page.on('pageerror', (e) => errors.push('JS: ' + String(e).slice(0, 160)));
      page.on('requestfailed', (r) => errors.push('404/fail: ' + r.url().replace(BASE, '')));

      await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
      await page.goto(BASE + name + '.html', { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
      await sleep(900);

      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.7);
        for (let y = 0; y < document.body.scrollHeight + step; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 170));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 420));
      });
      await sleep(700);

      const diag = await page.evaluate(() => {
        const de = document.documentElement;
        const over = [];
        // Elemente, die ein Vorfahre mit overflow:hidden ohnehin beschneidet, sind kein Fehler
        const clipped = (el) => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const o = getComputedStyle(p);
            if (/hidden|auto|scroll|clip/.test(o.overflowX) || /hidden|auto|scroll|clip/.test(o.overflow)) return true;
          }
          return false;
        };
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > de.clientWidth + 2 || r.left < -2) && !clipped(el)) {
            const sel = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
            if (!over.some((o) => o.sel === sel)) over.push({ sel, left: Math.round(r.left), right: Math.round(r.right) });
          }
        });
        return {
          scrollW: de.scrollWidth,
          clientW: de.clientWidth,
          over: over.slice(0, 8),
          imgsBroken: [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
        };
      });

      const file = path.join(OUT, `${VER}-${size.tag}-${name}.png`);
      await page.screenshot({ path: file, fullPage: true });

      report.push({
        page: name,
        size: size.tag,
        hScroll: diag.scrollW > diag.clientW + 1 ? `${diag.scrollW} > ${diag.clientW}` : 'ok',
        overflow: diag.over,
        brokenImages: diag.imgsBroken,
        errors: [...new Set(errors)],
      });
      await page.close();
    }
  }

  const summary = report.filter(
    (r) => r.hScroll !== 'ok' || r.overflow.length || r.brokenImages.length || r.errors.length
  );
  fs.writeFileSync(path.join(OUT, VER + '-report.json'), JSON.stringify(report, null, 1));
  console.log(summary.length ? JSON.stringify(summary, null, 1) : 'ALLES SAUBER — kein Overflow, keine Fehler, keine fehlenden Bilder.');

  try { await browser.close(); } catch (e) { /* Windows-Profilaufräumen scheitert gelegentlich */ }
  process.exit(0);
})();
