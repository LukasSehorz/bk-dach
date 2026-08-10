// Erzeugt alle Bildmotive für die BK-Dach Demo über kie.ai / gpt-image-2.
// Alle Aufträge werden zuerst parallel eingereicht, danach gepollt.
//   node gen-images.js [nur-diese-keys,kommagetrennt]

const fs = require('fs');
const path = require('path');

const KIE = process.env.KIE_API_KEY || '48a4ef78b3d7b1468b8e604b1dd9a2a7';
const OUT = path.resolve(__dirname, '..', 'demo', 'assets', 'img-orig');
fs.mkdirSync(OUT, { recursive: true });

const STYLE =
  ' Photorealistic architectural photography, shot on a full-frame camera with a 35mm lens, ' +
  'muted and desaturated cool colour grade, anthracite grey and slate blue tones, soft overcast ' +
  'daylight of Upper Bavaria near Munich, calm and precise composition, no people in the foreground, ' +
  'no text anywhere, no signage, no logos, no watermarks, no brand names, no lettering.';

const JOBS = [
  { key: 'hero-steildach', size: '2:3', prompt:
    'A close three-quarter view of a steeply pitched German house roof freshly covered with dark anthracite ' +
    'flat interlocking clay tiles, crisp ridge line, a dormer window and a zinc valley gutter, mature trees ' +
    'and a hint of Bavarian countryside behind, late afternoon light raking across the tiles.' },

  { key: 'hero-flachdach', size: '2:3', prompt:
    'A modern German apartment building with a flat roof seen from a neighbouring rooftop, dark grey bitumen ' +
    'membrane surface with a light gravel border, a clean sheet-metal parapet capping, roof drains and a ' +
    'skylight dome, Munich suburban skyline blurred in the distance under a soft grey sky.' },

  { key: 'lst-flachdach', size: '3:2', prompt:
    'A roofer in dark workwear and knee pads welding a bitumen waterproofing membrane onto a flat roof with a ' +
    'gas torch, the rolled membrane partly unrolled, clean straight seams, parapet and drain visible, seen from ' +
    'behind at a low angle so the face is not visible.' },

  { key: 'lst-begruenung', size: '3:2', prompt:
    'An extensive green roof on a flat-roofed modern German residential building, low sedum and grass planting ' +
    'in muted green and rust tones, a light gravel strip along the edge, a clean metal parapet, neighbouring ' +
    'rooftops and trees behind under an overcast sky.' },

  { key: 'lst-sanierung', size: '3:2', prompt:
    'A renovation site on a traditional Bavarian house: half of the pitched roof stripped back to the timber ' +
    'battens and underlay, the other half already covered with new dark anthracite tiles, scaffolding with ' +
    'safety netting along the eaves, stacked tile pallets on the ground.' },

  { key: 'lst-steildach', size: '3:2', prompt:
    'A newly finished pitched roof on a detached German family house, dark anthracite interlocking tiles in ' +
    'perfectly aligned rows, a zinc ridge and hip detail, snow guards, a chimney with sheet-metal flashing, ' +
    'white rendered facade below, soft overcast light.' },

  { key: 'lst-spenglerei', size: '3:2', prompt:
    'A tight detail of skilled sheet-metal roofing work: a hand-folded titanium zinc valley and standing seam ' +
    'joint meeting a wall flashing, matte grey metal with fine folding lines, a few tools and a folding machine ' +
    'slightly out of focus behind.' },

  { key: 'lst-service', size: '3:2', prompt:
    'Roof maintenance inspection on a flat roof: a gloved hand clearing leaves from a roof drain grate, ' +
    'inspection notes on a clipboard resting beside it, dark bitumen membrane surface, gravel edge and parapet ' +
    'behind, wet from recent rain.' },

  { key: 'work-wohnanlage', size: '3:2', prompt:
    'An elevated drone view of a modern German residential complex with large flat roofs, dark waterproofing ' +
    'membrane surfaces with gravel borders and green roof sections, technical units and skylights arranged in a ' +
    'clean grid, courtyards with trees between the buildings, Munich suburbs under a soft grey sky.' },

  { key: 'work-gewerbehalle', size: '3:2', prompt:
    'A large industrial hall in a Bavarian commercial estate seen from above at an angle, expansive flat roof ' +
    'with dark membrane, long rows of skylight bands, a light gravel perimeter and clean sheet-metal parapet ' +
    'edges, loading yard and parked trailers below, overcast light.' },

  { key: 'work-stadthaus', size: '3:2', prompt:
    'A contemporary German townhouse with a steep gabled roof in dark anthracite tiles, sharp zinc gutters and ' +
    'downpipes, large format windows, pale rendered walls, a low hedge and a paved entrance path in front, ' +
    'quiet residential street in the Munich area.' },

  { key: 'fahrzeug', size: '3:2', prompt:
    'A plain white unmarked panel van of a roofing company parked at the kerb in front of a German house under ' +
    'renovation, roof ladder and material racks on the roof rails, tidy stacks of tiles and a folding machine ' +
    'nearby, scaffolding on the house behind, completely blank van panels.' },

  { key: 'detail-stehfalz', size: '1:1', prompt:
    'A tight abstract detail of a dark grey standing seam metal roof, parallel raised seams running diagonally ' +
    'across the frame, a flat roof window sitting flush in the surface, fine rain droplets on the matte metal.' },

  { key: 'detail-gruendach', size: '1:1', prompt:
    'A tight detail of a green roof edge: low sedum planting in muted olive and rust tones meeting a band of ' +
    'light grey gravel and a folded sheet-metal edge trim, shallow depth of field.' },

  { key: 'detail-ziegel', size: '1:1', prompt:
    'A tight detail of anthracite flat clay roof tiles in overlapping rows, the crisp shadow line under each ' +
    'course, one row of tiles meeting a hand-folded zinc valley, matte surfaces, cool grey light.' },

  { key: 'betrieb', size: '3:2', prompt:
    'The tidy yard of a small German roofing company: pallets of anthracite roof tiles and rolls of ' +
    'waterproofing membrane stacked under a canopy, a sheet-metal folding machine, coils of titanium zinc, ' +
    'a workshop building with an open roller door, everything clean and ordered, overcast morning light.' },
];

const only = process.argv[2] ? process.argv[2].split(',') : null;
const jobs = only ? JOBS.filter((j) => only.includes(j.key)) : JOBS;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(body) {
  const r = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KIE}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function info(taskId) {
  const r = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
    headers: { Authorization: `Bearer ${KIE}` },
  });
  return r.json();
}

(async () => {
  const pending = [];

  for (const j of jobs) {
    const res = await post({
      model: 'gpt-image-2-text-to-image',
      input: { prompt: j.prompt + STYLE, image_size: j.size },
    });
    if (res.code === 200 && res.data && res.data.taskId) {
      pending.push({ ...j, taskId: res.data.taskId });
      console.log(`eingereicht  ${j.key}  ${res.data.taskId}`);
    } else {
      console.log(`FEHLER       ${j.key}  ${JSON.stringify(res).slice(0, 200)}`);
    }
    await sleep(400);
  }

  console.log(`\n${pending.length} Aufträge laufen, jetzt pollen …\n`);

  const done = new Set();
  for (let round = 0; round < 80 && done.size < pending.length; round++) {
    await sleep(12000);
    for (const j of pending) {
      if (done.has(j.key)) continue;
      let d;
      try { d = await info(j.taskId); } catch { continue; }
      const state = d && d.data && d.data.state;
      if (state === 'success') {
        let url = null;
        try { url = JSON.parse(d.data.resultJson).resultUrls[0]; } catch {}
        if (!url) { console.log(`kein Bild   ${j.key}`); done.add(j.key); continue; }
        const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
        fs.writeFileSync(path.join(OUT, `${j.key}.png`), buf);
        console.log(`fertig      ${j.key}  ${(buf.length / 1024 / 1024).toFixed(1)} MB   (${done.size + 1}/${pending.length})`);
        done.add(j.key);
      } else if (state === 'fail') {
        console.log(`fehlgeschl. ${j.key}  ${(d.data && d.data.failMsg) || ''}`);
        done.add(j.key);
      }
    }
  }
  console.log('\nfertig: ' + done.size + '/' + pending.length);
})();
