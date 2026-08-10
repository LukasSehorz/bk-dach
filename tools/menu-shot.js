const p = require('puppeteer-core');
(async () => {
  const b = await p.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--lang=de-DE', '--font-render-hinting=none'],
  });
  const out = process.argv[2];
  const w = parseInt(process.argv[3] || '1440', 10);
  const h = parseInt(process.argv[4] || '900', 10);
  const pg = await b.newPage();
  await pg.setViewport({ width: w, height: h });
  await pg.goto('http://localhost:4173/', { waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1200));
  await pg.click('.menu-btn');
  await new Promise((r) => setTimeout(r, 1300));
  await pg.screenshot({ path: out });
  console.log('OK ' + out);
  try { await b.close(); } catch (e) {}
  process.exit(0);
})();
