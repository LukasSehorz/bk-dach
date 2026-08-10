// Misst Übertragungsgewicht und einfache Tastatur-Erreichbarkeit je Seite.
const p = require('puppeteer-core');
const PAGES = ['index', 'leistungen', 'referenzen', 'kontakt'];

(async () => {
  const b = await p.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars'],
  });

  for (const name of PAGES) {
    const pg = await b.newPage();
    let bytes = 0;
    const byType = {};
    pg.on('response', async (r) => {
      try {
        const len = parseInt(r.headers()['content-length'] || '0', 10);
        const t = (r.request().resourceType() || 'other');
        bytes += len;
        byType[t] = (byType[t] || 0) + len;
      } catch (e) {}
    });
    await pg.setViewport({ width: 1440, height: 900 });
    await pg.goto('http://localhost:4173/' + name + '.html', { waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise((r) => setTimeout(r, 800));

    const a11y = await pg.evaluate(() => {
      const focusables = document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
      const noName = [...focusables].filter((el) => {
        const t = (el.textContent || '').trim();
        return !t && !el.getAttribute('aria-label') && !el.getAttribute('title');
      }).length;
      const imgsNoAlt = [...document.images].filter((i) => !i.hasAttribute('alt')).length;
      const h1 = document.querySelectorAll('h1').length;
      const lang = document.documentElement.lang;
      return { focusables: focusables.length, ohneNamen: noName, bilderOhneAlt: imgsNoAlt, h1, lang };
    });

    console.log(
      name.padEnd(12),
      String(Math.round(bytes / 1024) + ' KB').padStart(9),
      ' | html ' + Math.round((byType.document || 0) / 1024) + 'k',
      'css ' + Math.round((byType.stylesheet || 0) / 1024) + 'k',
      'js ' + Math.round((byType.script || 0) / 1024) + 'k',
      'font ' + Math.round((byType.font || 0) / 1024) + 'k',
      'img ' + Math.round((byType.image || 0) / 1024) + 'k',
      ' | fokussierbar ' + a11y.focusables,
      'ohne Namen ' + a11y.ohneNamen,
      'Bilder ohne alt ' + a11y.bilderOhneAlt,
      'h1 ' + a11y.h1,
      'lang ' + a11y.lang
    );
    await pg.close();
  }

  try { await b.close(); } catch (e) {}
  process.exit(0);
})();
