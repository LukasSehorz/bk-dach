// Prüft die Bewegungsschicht: scrollt schrittweise, misst Reveal-Zustände und
// Parallaxwerte und legt Zwischenbilder ab.  node anim-check.js <url> <praefix>
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const url = process.argv[2] || 'http://localhost:4173/';
const prefix = process.argv[3] || 'anim';
const OUT = path.resolve(__dirname, '..', 'qa');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--lang=de-DE', '--font-render-hinting=none'],
  });
  const pg = await b.newPage();
  await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
  await sleep(1400);

  const total = await pg.evaluate(() => document.body.scrollHeight);
  console.log('Seitenhöhe: ' + total);

  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const y = Math.round((total - 900) * (i / steps));
    await pg.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(120); // absichtlich kurz: mitten in der Bewegung messen
    const state = await pg.evaluate(() => {
      const all = document.querySelectorAll('[data-animate]');
      const done = document.querySelectorAll('[data-animate][data-animated]');
      const par = [];
      document.querySelectorAll('[data-parallax]').forEach((el) => {
        const v = el.style.getPropertyValue('--parallax-percent');
        if (v) par.push((el.className || el.tagName).toString().split(' ')[0] + ':' + Number(v).toFixed(2));
      });
      const mid = document.querySelector('[data-animate="img"]:not([data-animated])');
      return {
        reveals: done.length + '/' + all.length,
        parallax: par.slice(0, 6).join('  '),
        nextHidden: mid ? (mid.className || mid.tagName).toString().slice(0, 40) : '—',
      };
    });
    console.log(
      String(y).padStart(6) + '  reveals ' + state.reveals.padEnd(8) + '  ' + state.parallax
    );
    if (i % 2 === 0) await pg.screenshot({ path: path.join(OUT, `${prefix}-${String(i).padStart(2, '0')}.png`) });
  }

  // Zustand direkt beim Auftauchen eines Bildes festhalten
  await pg.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await pg.evaluate(() => window.scrollTo(0, window.innerHeight * 0.9));
  await sleep(180);
  await pg.screenshot({ path: path.join(OUT, `${prefix}-mid-reveal.png`) });
  console.log('Zwischenbild bei laufender Enthüllung gespeichert.');

  try { await b.close(); } catch (e) {}
  process.exit(0);
})();
