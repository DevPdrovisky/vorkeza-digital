// node render-video.js <1|2|3> [--preview]
const puppeteer = require('puppeteer-core'), path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path, os = require('os');
const OUT = path.resolve(__dirname, '../Pack-Instagram-Vorkeza/3-Videos'), FPS = 30;
const v = process.argv[2] || '1', preview = process.argv.includes('--preview');
const PREV = path.join(__dirname, '_preview'); fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(PREV, { recursive: true });

// ---------- trilha sintetizada (120 BPM) ----------
function music(cuts, total, variant) {
  const sr = 44100, n = Math.ceil(total * sr), L = new Float32Array(n), R = new Float32Array(n), beat = .5;
  const add = (i, l, r = l) => { if (i >= 0 && i < n) { L[i] += l; R[i] += r } };
  let seed = 99 + variant * 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1;
  const root = [0, 2, -3][variant - 1] || 0, f = s => 110 * Math.pow(2, (s + root) / 12);
  const prog = [[0, 3, 7, 12], [-4, 0, 3, 8], [3, 7, 10, 15], [-2, 2, 5, 10]];
  const duck = new Float32Array(n).fill(1);
  const end = total - 1;
  // pad
  for (let c = 0; c * 4 < total; c++) for (const st of prog[c % 4]) {
    const fr = f(st + 12), s0 = c * 4 * sr | 0, len = Math.min(4 * sr | 0, n - s0); let lpL = 0;
    for (let i = 0; i < len; i++) { const t = i / sr; const saw = 2 * ((t * fr) % 1) - 1 + 2 * ((t * fr * 1.006) % 1) - 1; lpL += .07 * (saw - lpL); const env = Math.min(1, t * 6) * Math.min(1, (4 - t) * 8); const pan = Math.sin(t * 1.3 + st) * .25; add(s0 + i, lpL * env * .05 * (1 - pan), lpL * env * .05 * (1 + pan)) }
  }
  for (let b = 0; b * beat < end + .5; b++) {
    const t0 = b * beat, s0 = t0 * sr | 0, chord = prog[Math.floor(t0 / 4) % 4];
    // bumbo com ducking
    for (let i = 0; i < .3 * sr; i++) { const t = i / sr, ph = 2 * Math.PI * (48 * t + (130 / 28) * (1 - Math.exp(-28 * t))); add(s0 + i, Math.sin(ph) * Math.exp(-11 * t) * .62); if (s0 + i < n) duck[s0 + i] = Math.min(duck[s0 + i], 1 - .75 * Math.exp(-9 * t)) }
    // palma
    if (b % 2 === 1) for (let i = 0; i < .16 * sr; i++) { const t = i / sr, x = rnd(); add(s0 + i, x * Math.exp(-22 * t) * .17, rnd() * Math.exp(-22 * t) * .17) }
    // chimbal e baixo em colcheias
    for (const off of [0, .25]) {
      const s1 = (t0 + off) * sr | 0; let prev = 0;
      if (off) for (let i = 0; i < .05 * sr; i++) { const x = rnd(), hp = x - prev; prev = x; add(s1 + i, hp * Math.exp(-90 * (i / sr)) * .10, hp * Math.exp(-70 * (i / sr)) * .10) }
      const fr = f(chord[0] - 24 + (off ? 12 : 0));
      for (let i = 0; i < .22 * sr; i++) { const t = i / sr, e = Math.min(1, t * 200) * Math.exp(-7 * t); add(s1 + i, (Math.sin(2 * Math.PI * fr * t) + .35 * Math.sin(4 * Math.PI * fr * t)) * e * .22) }
    }
    // arpejo
    for (let k = 0; k < 2; k++) {
      const s2 = (t0 + k * .25) * sr | 0, note = chord[(b * 2 + k + variant) % 4], fr = f(note + 24), p = ((b + k) % 2 ? .35 : -.35);
      for (let i = 0; i < .22 * sr; i++) { const t = i / sr, e = Math.exp(-13 * t) * Math.min(1, t * 400), y = (Math.sin(2 * Math.PI * fr * t) + .3 * Math.sin(6 * Math.PI * fr * t)) * e * .085; add(s2 + i, y * (1 - p), y * (1 + p)) }
    }
  }
  for (let i = 0; i < n; i++) { L[i] *= duck[i]; R[i] *= duck[i] }
  // transição suave: sopro abafado que sobe e desce, sem pancada
  cuts.forEach((c, k) => {
    const len = .6 * sr | 0, s0 = (c - .34) * sr | 0, dir = k % 2 ? 1 : -1; let lpL = 0, lpR = 0;
    for (let i = 0; i < len; i++) {
      const p = i / len, env = Math.pow(Math.sin(Math.PI * p), 2), a = .012 + .05 * env;
      lpL += a * (rnd() - lpL); lpR += a * (rnd() - lpR);
      const pan = dir * (p - .5) * .5;
      add(s0 + i, lpL * env * .42 * (1 - pan), lpR * env * .42 * (1 + pan));
    }
  });
  // final: acorde que se apaga e limiter
  const fade = i => { const t = i / sr; return t > total - .7 ? Math.max(0, (total - t) / .7) : 1 };
  let peak = 0; for (let i = 0; i < n; i++) { L[i] = Math.tanh(L[i] * 1.15) * fade(i); R[i] = Math.tanh(R[i] * 1.15) * fade(i); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])) }
  const g = .84 / peak, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { buf.writeInt16LE(L[i] * g * 32767 | 0, 44 + i * 4); buf.writeInt16LE(R[i] * g * 32767 | 0, 46 + i * 4) }
  return buf;
}

(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('ERRO', e.message));
  await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await p.goto(`file:///${path.resolve(__dirname, 'video.html').replace(/\\/g, '/')}?v=${v}`);
  await p.evaluate(() => window.ready);
  const { total, cuts, file } = await p.evaluate(() => ({ total: window.TOTAL, cuts: window.CUTS, file: V.file }));
  console.log(`v${v} ${file}: ${total}s, cortes:`, cuts.join(' '));
  if (total !== 30) console.log('ATENCAO: duracao diferente de 30s');

  if (preview) {
    const starts = [0, ...cuts], times = [];
    starts.forEach((s, i) => { const e = i + 1 < starts.length ? starts[i + 1] : total; times.push(+(e - .35).toFixed(2)) });
    const list = [];
    for (let i = 0; i < times.length; i++) { await p.evaluate(t => seek(t), times[i]); const f = path.join(PREV, `v${v}-${String(i).padStart(2, '0')}.jpg`); await p.screenshot({ path: f, type: 'jpeg', quality: 80 }); list.push(f) }
    console.log(list.length, 'quadros'); await b.close(); return;
  }

  const wav = path.join(os.tmpdir(), `vorkeza-${v}.wav`);
  fs.writeFileSync(wav, music(cuts, total, +v));
  const out = path.join(OUT, file + '.mp4');
  if (process.argv.includes('--audio-only')) { // troca só a música, sem renderizar a imagem de novo
    const { spawnSync } = require('child_process');
    const peak = f => cuts.map(c => +(/max_volume: (-?[\d.]+)/.exec(spawnSync(ffmpeg, ['-hide_banner', '-ss', String(c - .3), '-t', '0.6', '-i', f, '-af', 'volumedetect', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr) || [0, 0])[1]);
    const avg = a => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
    const before = peak(out), tmp = out.replace('.mp4', '.tmp.mp4');
    const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', out, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', String(total), tmp], { encoding: 'utf8' });
    if (r.status !== 0) throw new Error(r.stderr);
    fs.renameSync(tmp, out);
    console.log(`v${v} audio trocado. pico medio nos cortes: antes ${avg(before)} dB, depois ${avg(peak(out))} dB`);
    const all = spawnSync(ffmpeg, ['-hide_banner', '-i', out, '-af', 'volumedetect', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    console.log(all.split('\n').filter(l => /Duration|mean_volume|max_volume/.test(l)).map(l => l.trim().replace(/^\[.*?\] /, '')).join(' | '));
    fs.unlinkSync(wav); await b.close(); return;
  }
  const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wav, '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-profile:v', 'high', '-level', '4.2', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', String(total), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(total * FPS);
  for (let i = 0; i < frames; i++) {
    await p.evaluate(t => seek(t), i / FPS);
    const jpg = await p.screenshot({ type: 'jpeg', quality: 96, optimizeForSpeed: true });
    if (!ff.stdin.write(Buffer.from(jpg))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 90 === 0) console.log(`v${v} ${i}/${frames}`);
  }
  ff.stdin.end();
  const code = await new Promise(r => ff.on('close', r));
  await b.close(); fs.unlinkSync(wav);
  console.log(`v${v} pronto, ffmpeg=${code}, ${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
})().catch(e => { console.error(e); process.exit(1); });
