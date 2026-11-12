import { PNG } from 'pngjs'; import fs from 'fs';
const a1 = process.argv[2], b1 = process.argv[3];
let fehler = 0;
for (const name of ['mobil','desktop']) {
  const a = PNG.sync.read(fs.readFileSync(`/tmp/qa/shots/${a1}-${name}.png`));
  const b = PNG.sync.read(fs.readFileSync(`/tmp/qa/shots/${b1}-${name}.png`));
  if (a.width !== b.width || a.height !== b.height) {
    console.log(`${name}: MASSE ${a.width}x${a.height} vs ${b.width}x${b.height}  -> ABWEICHUNG`); fehler++; continue;
  }
  let n = 0, y0 = -1, x0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
    const i = (a.width*y+x)<<2;
    if (a.data[i]!==b.data[i]||a.data[i+1]!==b.data[i+1]||a.data[i+2]!==b.data[i+2]) {
      n++; if (y0<0) y0=y; if(x<x0)x0=x; if(x>x1)x1=x; y1=y;
    }
  }
  console.log(`${name}: ${a.width}x${a.height}  abweichende Pixel: ${n}` +
    (n ? `  Kasten x ${x0}..${x1} y ${y0}..${y1}` : '  — pixelgleich'));
  if (n) fehler++;
}
process.exit(fehler?1:0);
