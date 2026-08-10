const p = require('puppeteer-core');
(async () => {
  const b = await p.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const pg = await b.newPage();
  await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto(process.argv[2] || 'https://klindworthroofing.com/', { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 2500));
  const out = await pg.evaluate(() => {
    const s = new Set();
    document.querySelectorAll('h1,h2,h3,h4,p,a,body,li,blockquote').forEach((e) => {
      const c = getComputedStyle(e);
      if ((e.textContent || '').trim().length > 2) {
        s.add(`${e.tagName} | ${c.fontFamily} | ${c.fontSize} | ${c.fontWeight} | ls:${c.letterSpacing} | lh:${c.lineHeight}`);
      }
    });
    return [...s].slice(0, 45);
  });
  console.log(out.join('\n'));
  await b.close();
})();
