// Prüft, ob bei reduzierter Bewegung und bei abgeschaltetem JavaScript alle Inhalte sichtbar sind.
const p = require('puppeteer-core');
const path = require('path');

(async () => {
  const b = await p.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars'],
  });
  const OUT = path.resolve(__dirname, '..', 'qa');

  for (const mode of ['reduced', 'nojs']) {
    const pg = await b.newPage();
    await pg.setViewport({ width: 1440, height: 900 });
    if (mode === 'reduced') {
      await pg.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    } else {
      await pg.setJavaScriptEnabled(false);
    }
    await pg.goto('http://localhost:4173/', { waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));

    const hidden = await pg.evaluate(() => {
      const out = [];
      document.querySelectorAll('.rise, .hero-art figure, .hero h1 .ln > span').forEach((el) => {
        const s = getComputedStyle(el);
        if (parseFloat(s.opacity) < 0.9 || (s.transform !== 'none' && !/matrix\(1, 0, 0, 1, 0, 0\)/.test(s.transform))) {
          out.push(el.className || el.tagName);
        }
      });
      return out;
    });

    await pg.screenshot({ path: path.join(OUT, 'check-' + mode + '.png'), fullPage: true });
    console.log(mode + ': ' + (hidden.length ? 'UNSICHTBAR -> ' + [...new Set(hidden)].join(', ') : 'alles sichtbar'));
    await pg.close();
  }

  try { await b.close(); } catch (e) {}
  process.exit(0);
})();
