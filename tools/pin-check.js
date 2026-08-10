// Prüft die angeheftete Leistungs-Sektion: läuft das Karussell beim
// senkrechten Scrollen waagerecht durch und gibt es die Seite danach frei?
const puppeteer = require('puppeteer-core');
const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars', '--font-render-hinting=none'],
  });
  const pg = await b.newPage();
  await pg.setViewport({ width: 1440, height: 900 });
  await pg.goto('http://localhost:4173/', { waitUntil: 'networkidle2' });
  await sleep(1800);

  const geo = await pg.evaluate(() => {
    const pin = document.querySelector('.rail-pin');
    const rail = pin.querySelector('.rail');
    return {
      pinnt: pin.classList.contains('is-pinning'),
      pinHoehe: Math.round(pin.getBoundingClientRect().height),
      pinTop: Math.round(pin.getBoundingClientRect().top + window.scrollY),
      spannweite: rail.scrollWidth - rail.clientWidth,
    };
  });
  console.log('Anheftung aktiv: ' + geo.pinnt);
  console.log('Rahmenhöhe ' + geo.pinHoehe + ' px, Beginn bei ' + geo.pinTop + ', Scrollweite der Reihe ' + geo.spannweite + ' px');

  const OUT = path.resolve(__dirname, '..', 'qa');
  const steps = 7;
  for (let i = 0; i <= steps; i++) {
    const y = geo.pinTop - 200 + Math.round((geo.spannweite + 300) * (i / steps));
    await pg.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(420);
    const s = await pg.evaluate(() => {
      const pin = document.querySelector('.rail-pin');
      const rail = pin.querySelector('.rail');
      const first = rail.firstElementChild.getBoundingClientRect();
      const last = rail.lastElementChild.getBoundingClientRect();
      return {
        left: Math.round(rail.scrollLeft),
        stickyTop: Math.round(pin.querySelector('.rail-sticky').getBoundingClientRect().top),
        ersteKarte: Math.round(first.left),
        letzteKarte: Math.round(last.right),
      };
    });
    console.log(
      'scrollY ' + String(y).padStart(6) +
      '   Reihe links ' + String(s.left).padStart(5) +
      '   sticky oben ' + String(s.stickyTop).padStart(5) +
      '   erste Karte x ' + String(s.ersteKarte).padStart(6) +
      '   letzte Karte endet ' + String(s.letzteKarte).padStart(6)
    );
    if (i % 2 === 0) await pg.screenshot({ path: path.join(OUT, `pin-${i}.png`) });
  }

  try { await b.close(); } catch (e) {}
  process.exit(0);
})();
