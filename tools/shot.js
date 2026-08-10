// Screenshot-Helfer: scrollt die Seite komplett durch (löst Scroll-Reveals aus)
// und speichert danach einen Full-Page-Screenshot. Optional Abschnitte.
//
//   node shot.js <url> <out.png> [breite] [hoehe] [--sections] [--wait=ms]

const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const width = parseInt(args[2] || '1440', 10);
const height = parseInt(args[3] || '900', 10);
const sections = args.includes('--sections');
const waitArg = args.find((a) => a.startsWith('--wait='));
const extraWait = waitArg ? parseInt(waitArg.split('=')[1], 10) : 1200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--lang=de-DE',
      '--font-render-hinting=none',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  );

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  await sleep(extraWait);

  // Cookie-Banner wegklicken, soweit auffindbar
  await page.evaluate(() => {
    const words = ['accept', 'akzeptieren', 'alle akzeptieren', 'zustimmen', 'einverstanden', 'speichern & fortfahren'];
    for (const el of document.querySelectorAll('button, a, [role="button"]')) {
      const t = (el.textContent || '').trim().toLowerCase();
      if (t && words.some((w) => t === w || t.startsWith(w))) { el.click(); return; }
    }
  }).catch(() => {});
  await sleep(600);

  // Komplett durchscrollen, damit Reveal-Animationen auslösen
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    const total = document.body.scrollHeight;
    for (let y = 0; y < total + step; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 500));
  });
  await sleep(900);

  await page.screenshot({ path: out, fullPage: true });
  console.log('OK ' + out);

  if (sections) {
    const full = await page.evaluate(() => document.body.scrollHeight);
    const dir = path.dirname(out);
    const base = path.basename(out, '.png');
    let i = 1;
    for (let y = 0; y < full; y += height) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await sleep(450);
      const f = path.join(dir, `${base}-s${String(i).padStart(2, '0')}.png`);
      await page.screenshot({ path: f });
      console.log('OK ' + f);
      i++;
      if (i > 14) break;
    }
  }

  await browser.close();
})();
