// Prüft Lizenzhinweise und Projektkennung in index.html, sw.js und LICENSE.md.
// Aufruf: node tests/lizenz.js
const fs = require('fs'), path = require('path');
const lies = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const html = lies('index.html'), sw = lies('sw.js'), lizenz = lies('LICENSE.md');

let ok = true;
function pruef(name, bed) { if (!bed) ok = false; console.log((bed ? 'OK   ' : 'FEHLER ') + name); }

const notice = (lizenz.match(/^Required Notice: .*$/m) || [])[0];
pruef('LICENSE.md enthält eine Required-Notice-Zeile', !!notice);
pruef('LICENSE.md ist PolyForm Noncommercial 1.0.0', lizenz.startsWith('# PolyForm Noncommercial License 1.0.0'));

const kopf = (html.match(/^<!DOCTYPE html>\s*<!--([\s\S]*?)-->/) || [])[1] || '';
pruef('index.html: Kopfkommentar direkt nach <!DOCTYPE html>', !!kopf);
pruef('index.html: Required Notice wörtlich im Kopf', notice && kopf.includes(notice));
pruef('index.html: SPDX-Kennung im Kopf', kopf.includes('SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0'));
pruef('index.html: <meta name="author">', /<meta name="author" content="Hazeberry">/.test(html));
pruef('index.html: <link rel="license">', /<link rel="license" href="https:\/\/polyformproject\.org\/licenses\/noncommercial\/1\.0\.0">/.test(html));
pruef('index.html: charset in den ersten 1024 Bytes', Buffer.from(html).indexOf('<meta charset') < 1024);
pruef('index.html: Fußzeile mit Lizenzlink', /class="site-footer"[\s\S]*?LICENSE\.md[\s\S]*?PolyForm Noncommercial 1\.0\.0/.test(html));

const swKopf = (sw.match(/^\/\*([\s\S]*?)\*\//) || [])[1] || '';
pruef('sw.js: Required Notice wörtlich im Kopf', notice && swKopf.includes(notice));
pruef('sw.js: SPDX-Kennung im Kopf', swKopf.includes('SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0'));

const k = [
  ['Kopfkommentar index.html', (kopf.match(/Kennung: (\S+)/) || [])[1]],
  ['<meta name="kennung">', (html.match(/<meta name="kennung" content="([^"]+)">/) || [])[1]],
  ['PROJEKT_KENNUNG', (html.match(/const PROJEKT_KENNUNG = '([^']+)';/) || [])[1]],
  ['Kopfkommentar sw.js', (swKopf.match(/Kennung: (\S+)/) || [])[1]],
];
for (const [wo, wert] of k) pruef(`Kennung vorhanden: ${wo}`, /^hzb-go-[0-9a-f]{8}$/.test(wert || ''));
pruef('Kennung überall gleich (' + k.map(x => x[1]).join(', ') + ')', new Set(k.map(x => x[1])).size === 1);
pruef('Kennung in SGF-Export und Bug-Report verwendet',
  html.includes('AP[Go-PWA:${PROJEKT_KENNUNG}]') && html.includes('kennung:    PROJEKT_KENNUNG'));

console.log(ok ? 'ALLE OK' : 'FEHLER');
process.exit(ok ? 0 : 1);
