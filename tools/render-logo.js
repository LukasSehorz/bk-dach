const p = require('puppeteer-core');
const path = require('path');
(async () => {
  const b = await p.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--font-render-hinting=none'],
  });
  const pg = await b.newPage();
  await pg.setViewport({ width: 1400, height: 420, deviceScaleFactor: 2 });
  await pg.goto('file:///' + path.resolve(__dirname, 'logo-render.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));
  const out = path.resolve(__dirname, 'logo-dark.png');
  await pg.screenshot({ path: out, omitBackground: true });
  console.log('OK ' + out);
  try { await b.close(); } catch (e) {}
  process.exit(0);
})();
