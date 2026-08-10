const p = require('puppeteer-core');
(async () => {
  const b = await p.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'],
  });
  const pg = await b.newPage();
  pg.on('pageerror', (e) => console.log('JS-FEHLER: ' + e));
  pg.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE: ' + m.text()); });
  await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto('http://localhost:4173/', { waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1500));

  const info = await pg.evaluate(() => {
    return Array.prototype.map.call(document.querySelectorAll('[data-animate="words"]'), function (el) {
      const r = el.getBoundingClientRect();
      const w = el.querySelector('.word');
      return {
        id: el.id || el.className,
        text: (el.textContent || '').trim().slice(0, 46),
        lines: el.querySelectorAll('.line').length,
        words: el.querySelectorAll('.word').length,
        split: el.dataset.split || '-',
        animated: el.hasAttribute('data-animated'),
        top: Math.round(r.top + window.scrollY),
        h: Math.round(r.height),
        wordOpacity: w ? getComputedStyle(w).opacity : '-',
        wordTransform: w ? getComputedStyle(w).transform : '-',
      };
    });
  });
  console.log(JSON.stringify(info, null, 1));

  // bis zur Leistungssektion scrollen und erneut messen
  await pg.evaluate(() => {
    const el = document.getElementById('leistungen-titel');
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 400);
  });
  await new Promise((r) => setTimeout(r, 1200));
  const after = await pg.evaluate(() => {
    const el = document.getElementById('leistungen-titel');
    const w = el.querySelector('.word');
    return {
      animated: el.hasAttribute('data-animated'),
      lines: el.querySelectorAll('.line').length,
      opacity: w ? getComputedStyle(w).opacity : '-',
      transform: w ? getComputedStyle(w).transform : '-',
      rectTop: Math.round(el.getBoundingClientRect().top),
    };
  });
  console.log('nach dem Scrollen: ' + JSON.stringify(after));

  try { await b.close(); } catch (e) {}
  process.exit(0);
})();
