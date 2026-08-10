// Prüft alle internen Verweise und Assetpfade der Demo.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'demo');
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let problems = 0;

for (const page of pages) {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  const refs = new Set();
  const add = (re, group) => { let m; while ((m = re.exec(html))) refs.add(m[group]); };
  add(/href="([^"#?][^"]*)"/g, 1);
  add(/src="([^"]+)"/g, 1);
  add(/srcset="([^"]+)"/g, 1);

  for (const raw of refs) {
    for (const part of raw.split(',')) {
      const url = part.trim().split(' ')[0];
      if (!url || /^(https?:|mailto:|tel:|data:|#)/.test(url)) continue;
      const p = path.join(ROOT, url.split('#')[0]);
      if (!fs.existsSync(p)) { console.log('FEHLT  ' + page + '  ->  ' + url); problems++; }
    }
  }
}

// verwaiste Bilder finden
const imgDir = path.join(ROOT, 'assets', 'img');
const allHtml = pages.map((p) => fs.readFileSync(path.join(ROOT, p), 'utf8')).join('\n')
  + fs.readFileSync(path.join(ROOT, 'assets', 'css', 'site.css'), 'utf8');
const unused = fs.readdirSync(imgDir).filter((f) => !allHtml.includes(f));
if (unused.length) console.log('\nnicht verwendet in assets/img: ' + unused.join(', '));

console.log(problems ? '\n' + problems + ' fehlende Ziele' : '\nAlle Verweise und Assetpfade gültig.');
