// node render-grupo.js <grupo|formula> [--preview t1,t2,...] [--audio-only]   (Reels do Grupo Vorkeza, a partir de grupo.html)
// Renderiza motion.html quadro a quadro (60 qps, misturados 2 a 2 = desfoque de movimento) e cria a trilha.
const puppeteer = require('puppeteer-core'), path = require('path'), fs = require('fs'), os = require('os');
const { spawn, spawnSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const v = process.argv[2] || 'grupo', FPS = 30, SUB = 2;
const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null };
const OUTDIR = path.resolve(__dirname, '../Pack-Grupo-Vorkeza/1-Videos');
const PREV = path.join(__dirname, '_preview');

// ================= efeitos sonoros do pack (amostras reais) =================
const PACK = 'C:/Users/cmraj/Documents/O MELHOR PACK DE EDIÇÃO/5 - Efeitos Sonoros/';
// Músicas: trecho escolhido para o drop cair no corte seco para o quadro (4,8 s do vídeo).
const V_ = v, MUSIC = {
  grupo: { file: path.join(__dirname, 'musicas/continue-eluzai.mp3'), start: 23.16 - 2.6 },          // drop no 'grupo.' (2,6 s)
  formula: { file: path.join(__dirname, 'musicas/foco-dedicacao-ruyter.mp3'), start: 117.14 - 1.62 }, // drop no 'AQUI NÃO' (1,62 s)
};
const withMusic = () => MUSIC[V_] && !process.argv.includes('--sem-musica');
const SND = {
  air: '1- Impact/Hit Fast Air Burst 01.wav', boomSub: 'Específicos/Boom/Soft/Soft Cinematic Boom 10.wav',
  boomSoft: 'Específicos/Boom/Soft/Soft Cinematic Boom 01.wav', slam: '1- Impact/Hit Impact Slam 01.wav',
  boomBig: 'Específicos/Boom/Strong/Strong Cinematic Boom 01.wav', slamCym: '1- Impact/Hit Slam Cymbal 01.wav',
  bell: '1- Impact/Hit Bell Reverb 01.wav', sparkle: 'Específicos/Clink/Glittering Musicbox Clinks 01.wav',
  whip: '5- Woosh-Swish/Artlist Studios - Balanced Transitions - Wind Whip Whoosh.wav',
  deep: '5- Woosh-Swish/Artlist Studios - Balanced Transitions - Deep Air Whoosh.wav',
  suction: '5- Woosh-Swish/Whoosh Airy Suction 01.wav', sharp: '5- Woosh-Swish/Sharp swoosh.mp3',
  passby: '5- Woosh-Swish/SFX Whoosh Breath Pass By 01.wav',
  sw1: '5- Woosh-Swish/Swoosh 01 - 01.wav', sw2: '5- Woosh-Swish/Swoosh 04 - 01.wav',
  revCym: '7- Drumbs/Cymbals/Reverse 01.mp3', revCym2: '7- Drumbs/Cymbals/Reverse 03.mp3', riser: '6- Rise/Riser Short 01.wav',
  shutter: 'Específicos/Click/Camera Shutter Click 01.wav', knock: 'Específicos/Tap _ Knock/Single Knock 01.wav',
  slapPop: 'Específicos/Pop/Slap Pop 01.wav', smallPop: 'Específicos/Pop/Small Pop 01.wav', synthPop: 'Específicos/Pop/Synthetic Pop 01.wav',
  clock: '14- Relógio/Clock 4.wav', amb: '2- Ambience/Atmosfera/Bright Atmosphere 04.wav',
  pen: 'Específicos/Click/Pen Click 02.wav', airSlow: '5- Woosh-Swish/Whoosh Airy Slow 01.wav',
};
const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(i => `Específicos/Click/Mechanical Keyboard Click ${String(i).padStart(2, '0')}.wav`);
const POPS = [1, 2, 3].map(i => `Específicos/Pop/Hollow Pop ${String(i).padStart(2, '0')}.wav`);
const SCRAPES = [1, 2, 3, 4].map(i => `Específicos/Slide/Hard Slide 02 - Short ${String(i).padStart(2, '0')}.wav`);
const DRAWS = [1, 2, 3].map(i => `Específicos/Slide/Soft Slide 01 - Short ${String(i).padStart(2, '0')}.wav`);

// Eventos do grupo.html (window.SFX) -> amostras do pack. at: 'on' = ataque no tempo, 'pk' = pico no tempo.
function cues(sfx) {
  const out = [], c = (f, t, o = {}) => out.push({ f, t, at: 'on', lv: -20, ...o });
  let key = 0, pop = 0, scr = 0, drw = 0, wh = 0;
  const WH = [SND.whip, SND.suction, SND.sharp, SND.deep, SND.passby];
  for (const [type, t, a, b] of sfx) {
    if (type === 'open') { c(SND.air, t, { lv: -24 }); c(SND.boomSub, t, { lv: -30, len: 1 }) }
    else if (type === 'impact') { c(SND.revCym, t, { at: 'pk', lv: -27, cut: .05 }); c(SND.slam, t, { lv: -22, len: .6 }); c(SND.boomSoft, t, { lv: -30, len: 1.2 }) }
    else if (type === 'whoosh') c(WH[wh++ % WH.length], t + .3, { at: 'pk', lv: b === 'leve' ? -29 : -25, len: 1 });
    else if (type === 'pop') c(POPS[pop++ % 3], t + .1, { lv: -25 });
    else if (type === 'type') c(KEYS[(key++ * 5 + 3) % KEYS.length], t, { lv: -29 });
    else if (type === 'slap') c(SND.slapPop, t, { lv: -25 });
    else if (type === 'scratch') c(SCRAPES[scr++ % 4], t, { lv: -26 });
    else if (type === 'snap') c(SND.shutter, t, { lv: -27 });
    else if (type === 'draw') c(DRAWS[drw++ % 3], t, { lv: -29 });
    else if (type === 'riser') c(SND.riser, t + a, { at: 'pk', lv: -26, cut: .03 });
    else if (type === 'drift') c(SND.airSlow, t + a / 2, { at: 'pk', lv: -30 });
  }
  if (!withMusic()) out.push({ f: SND.amb, t: 0, at: 'start', lv: -38, from: 4, to: 4 + Math.max(...sfx.map(e => e[1])) + 4, fin: .4 });
  return out;
}
const decoded = {};
function decode(f) {
  if (decoded[f]) return decoded[f];
  const r = spawnSync(ffmpeg, ['-v', 'error', '-i', PACK + f, '-ac', '2', '-ar', '44100', '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  if (r.status) throw new Error('nao abriu ' + f + ' ' + r.stderr);
  const x = new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length));
  return decoded[f] = x;
}
function sampleBus(total, sfx) {
  const sr = 44100, n = Math.ceil(total * sr), L = new Float32Array(n), R = new Float32Array(n);
  for (const q of cues(sfx)) {
    let x = decode(q.f); const frames = x.length / 2;
    const s0 = Math.round((q.from || 0) * sr), s1 = q.to ? Math.min(frames, Math.round(q.to * sr)) : frames;
    let pk = 0; for (let i = s0; i < s1; i++) pk = Math.max(pk, Math.abs(x[2 * i]), Math.abs(x[2 * i + 1]));
    const win = 441, env = []; for (let i = s0; i < s1; i += win) { let s = 0; for (let j = i; j < Math.min(s1, i + win); j++) s += x[2 * j] ** 2 + x[2 * j + 1] ** 2; env.push(Math.sqrt(s / win)) }
    const emax = Math.max(...env), on = env.findIndex(e => e > emax * .08) * win, epk = env.indexOf(emax) * win;
    const anchor = s0 + (q.at === 'pk' ? epk : q.at === 'start' ? 0 : Math.max(0, on - 64));
    const start = Math.round(q.t * sr) - (anchor - s0);
    const end = q.cut != null && q.at === 'pk' ? anchor + Math.round(q.cut * sr) : q.len ? anchor + Math.round(q.len * sr) : s1;
    const fadeLen = Math.round((q.cut != null ? .04 : .25) * sr), last = Math.min(s1, end);
    // volume percebido: passa-altas de 120 Hz (alto-falante de celular) e maior RMS em janelas de 250 ms
    const hpA = 1 / (1 + 2 * Math.PI * 120 / sr); let px = 0, py = 0; const hp = new Float32Array(last - s0);
    for (let i = s0; i < last; i++) { const m = (x[2 * i] + x[2 * i + 1]) / 2; py = hpA * (py + m - px); px = m; hp[i - s0] = py }
    let best = 0; const W = Math.round(.25 * sr); for (let i = 0; i === 0 || i + W <= hp.length; i += 2205) { let e = 0; for (let j = i; j < Math.min(hp.length, i + W); j++) e += hp[j] * hp[j]; best = Math.max(best, Math.sqrt(e / W)) }
    const ld = 20 * Math.log10(best || 1e-6), gDb = Math.min(q.lv - ld, -20 * Math.log10(pk || 1)), g = Math.pow(10, gDb / 20);
    if (process.argv.includes('--debug-sfx')) console.log(q.t.toFixed(2).padStart(6), (q.lv + '').padStart(4), 'ganho', gDb.toFixed(1).padStart(6), q.f.split('/').pop());
    for (let i = s0; i < last; i++) {
      const o = start + (i - s0); if (o < 0 || o >= n) continue;
      const fo = (q.len || q.cut != null) ? Math.min(1, (last - i) / fadeLen) : 1, fi = Math.min(1, (i - s0) / (q.fin ? q.fin * sr : 32));
      L[o] += x[2 * i] * g * fo * fi; R[o] += x[2 * i + 1] * g * fo * fi;
    }
  }
  return { L, R };
}

// Só efeitos, sem música de fundo: soma as amostras, limiter suave e fade no final.
function sfxTrack(total, sfx) {
  const sr = 44100, { L, R } = sampleBus(total, sfx), n = L.length;
  for (const ch of [L, R]) { const a = 1 / (1 + 2 * Math.PI * 30 / sr); let px = 0, py = 0; for (let i = 0; i < n; i++) { const v = ch[i]; py = a * (py + v - px); px = v; ch[i] = py } }
  if (withMusic()) { // música por baixo, com leve abaixada quando um efeito toca
    const mu = MUSIC[V_];
    const r = spawnSync(ffmpeg, ['-v', 'error', '-ss', String(mu.start), '-t', String(total + .2), '-i', mu.file, '-ac', '2', '-ar', String(sr), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
    const m = new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length));
    let e = 0; for (let i = 0; i < Math.min(n, m.length / 2); i++) e += m[2 * i] ** 2 + m[2 * i + 1] ** 2;
    const mg = Math.pow(10, -19 / 20) / Math.sqrt(e / (2 * Math.min(n, m.length / 2)));
    let env = 0; const rel2 = Math.exp(-1 / (.2 * sr));
    for (let i = 0; i < n && 2 * i + 1 < m.length; i++) {
      const a = Math.max(Math.abs(L[i]), Math.abs(R[i])); env = a > env ? a : env * rel2;
      const t = i / sr, duck = 1 - Math.min(.3, env * 1.5), fade = Math.min(1, t / .03, (total - t) / 1.8);
      L[i] += m[2 * i] * mg * duck * fade; R[i] += m[2 * i + 1] * mg * duck * fade;
    }
    console.log('musica:', path.basename(mu.file), 'a partir de', mu.start.toFixed(2) + 's');
  }
  let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
  const pre = 1 / pk, thr = Math.pow(10, -4 / 20), look = Math.round(.004 * sr), rel = Math.exp(-1 / (.15 * sr));
  const need = new Float32Array(n); // ganho necessário em cada ponto (com antecipação)
  for (let i = 0; i < n; i++) { const a = Math.max(Math.abs(L[i]), Math.abs(R[i])) * pre; need[i] = a > thr ? thr / a : 1 }
  let g = 1; const out = Buffer.alloc(44 + n * 4);
  const ceil = Math.pow(10, -1.5 / 20) / thr;
  for (let i = 0; i < n; i++) {
    let m = 1; for (let j = i; j < Math.min(n, i + look); j += 8) m = Math.min(m, need[j]); m = Math.min(m, need[Math.min(n - 1, i + look - 1)]);
    g = m < g ? m : 1 - (1 - g) * rel;
    const t = i / sr, fade = t > total - .8 ? Math.max(0, (total - t) / .8) : 1, k = pre * g * ceil * fade;
    out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * k)) * 32767), 44 + i * 4);
    out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * k)) * 32767), 46 + i * 4);
  }
  out.write('RIFF', 0); out.writeUInt32LE(36 + n * 4, 4); out.write('WAVEfmt ', 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22); out.writeUInt32LE(sr, 24); out.writeUInt32LE(sr * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(n * 4, 40);
  return out;
}
// volume final por medição (2 passadas, linear): -16 LUFS, pico -1,5 dB
function loudnormArgs(wav) {
  const I = withMusic() ? -14 : -16;
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', wav, '-af', `loudnorm=I=${I}:TP=-1.5:LRA=11:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
  const j = JSON.parse(r.stderr.slice(r.stderr.lastIndexOf('{'), r.stderr.lastIndexOf('}') + 1));
  console.log(`antes: ${j.input_i} LUFS, pico ${j.input_tp} dB`);
  return `loudnorm=I=${I}:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true`;
}

// ================= trilha antiga (música sintetizada, não usada mais) =================
// 100 BPM (batida 0,6 s), igual ao pulso do vídeo de referência. Cortes caem na batida.
function soundtrack(total, sfx, variant) {
  const sr = 44100, n = Math.ceil(total * sr), L = new Float32Array(n), R = new Float32Array(n);
  const M = { L: new Float32Array(n), R: new Float32Array(n) }; // música (sofre ducking)
  const duck = new Float32Array(n).fill(1);
  let seed = variant === 'marca' ? 1234 : 4321; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1;
  const put = (buf, i, l, r = l) => { if (i >= 0 && i < n) { buf.L[i] += l; buf.R[i] += r } };
  const FX = { L, R };
  const beat = .6, bar = 2.4;
  // ---- harmonia ----
  const A = variant === 'marca'
    ? { root: 146.83, prog: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]] }   // Ré menor: i VI III VII
    : { root: 130.81, prog: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]] }; // Dó maior: I V vi IV
  const fr = s => A.root * Math.pow(2, s / 12);
  const chordAt = t => A.prog[Math.floor(t / bar) % 4];
  // seções
  const INTRO = 4.8, BREAK = 15.0, HIT = 15.6, END = total;
  // pad (sempre)
  for (let c = 0; c * bar < total; c++) for (const st of A.prog[c % 4]) for (const det of [1, 1.004]) {
    const f = fr(st), s0 = Math.round(c * bar * sr), len = Math.min(Math.round(bar * sr), n - s0); let lp = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr, g = s0 / sr + t, saw = 2 * ((t * f * det) % 1) - 1;
      lp += (g < INTRO ? .035 : .06) * (saw - lp);
      const env = Math.min(1, t * 3) * Math.min(1, (bar - t) * 6), lvl = (g > BREAK && g < HIT ? .5 : 1) * .03;
      const pan = det > 1 ? .3 : -.3; put(M, s0 + i, lp * env * lvl * (1 - pan), lp * env * lvl * (1 + pan));
    }
  }
  for (let b = 0; b * beat < total - .2; b++) {
    const t0 = b * beat, s0 = Math.round(t0 * sr), ch = chordAt(t0), main = t0 >= INTRO && t0 < BREAK, outro = t0 >= HIT;
    // bumbo
    if (main || (outro && b % 2 === 0)) for (let i = 0; i < .35 * sr; i++) { const t = i / sr, ph = 2 * Math.PI * (46 * t + (120 / 30) * (1 - Math.exp(-30 * t))); put(M, s0 + i, Math.sin(ph) * Math.exp(-9 * t) * .7); if (s0 + i < n) duck[s0 + i] = Math.min(duck[s0 + i], 1 - .55 * Math.exp(-10 * t)) }
    // palma no 2 e 4
    if (main && b % 2 === 1) { let lp = 0; for (let i = 0; i < .18 * sr; i++) { const t = i / sr, x = rnd(); lp += .5 * (x - lp); const e = Math.exp(-20 * t) * (1 + .6 * Math.exp(-300 * ((t - .012) ** 2) * 1e3)); put(M, s0 + i, (x - lp) * e * .2, (rnd() - lp) * e * .2) } }
    // chimbal em colcheias (introdução: só o contratempo, como um relógio)
    for (const off of [0, .3]) {
      if (!main && !outro && off === 0) continue;
      const s1 = Math.round((t0 + off) * sr); let prev = 0;
      for (let i = 0; i < .045 * sr; i++) { const x = rnd(), hp = x - prev; prev = x; const e = Math.exp(-95 * (i / sr)) * (t0 < INTRO ? .07 : .1) * (off ? 1 : .6); put(M, s1 + i, hp * e * .9, hp * e) }
    }
    // baixo
    if (main || outro) for (const off of [0, .3]) {
      const s1 = Math.round((t0 + off) * sr), f = fr(ch[0] - 24 + (off ? 12 : 0));
      for (let i = 0; i < .26 * sr; i++) { const t = i / sr, e = Math.min(1, t * 300) * Math.exp(-6 * t); put(M, s1 + i, (Math.sin(2 * Math.PI * f * t) + .3 * Math.sin(4 * Math.PI * f * t)) * e * .24) }
    }
    // arpejo (pluck na marca, piano elétrico no Pedro)
    if (t0 < BREAK || outro) for (let k = 0; k < 2; k++) {
      const s2 = Math.round((t0 + k * .3) * sr), note = ch[(b * 2 + k) % 3] + 12 * ((b + k) % 4 === 3 ? 2 : 1), f = fr(note), p = (b + k) % 2 ? .4 : -.4;
      const lvl = t0 < INTRO ? .05 : .07;
      for (let i = 0; i < .5 * sr; i++) {
        const t = i / sr, e = Math.exp((variant === 'marca' ? -9 : -5) * t) * Math.min(1, t * 500);
        const y = variant === 'marca' ? (Math.sin(2 * Math.PI * f * t) + .5 * Math.sin(2 * Math.PI * 2 * f * t) * Math.exp(-20 * t)) * e * lvl
          : (Math.sin(2 * Math.PI * f * t + .8 * Math.sin(2 * Math.PI * f * t) * Math.exp(-6 * t))) * e * lvl * (1 + .15 * Math.sin(2 * Math.PI * 5 * t));
        put(M, s2 + i, y * (1 - p), y * (1 + p));
      }
    }
  }
  // ---- efeitos ----
  const svf = () => { let lo = 0, bp = 0; return (x, fc, q = .7) => { const f = 2 * Math.sin(Math.PI * Math.min(fc, 12000) / sr); const hi = x - lo - q * bp; bp += f * hi; lo += f * bp; return { lo, bp, hi } } };
  const DUCK = (s0, len, depth) => { for (let i = 0; i < len; i++) if (s0 + i < n && s0 + i >= 0) duck[s0 + i] = Math.min(duck[s0 + i], 1 - depth * Math.exp(-3 * i / len)) };
  const S = {
    impact(t, g = 1) { const s0 = Math.round(t * sr); const fl = svf(), fr2 = svf(); DUCK(s0, sr * .9 | 0, .7 * g);
      for (let i = 0; i < 1.8 * sr; i++) { const u = i / sr, ph = 2 * Math.PI * (34 * u + (70 / 7) * (1 - Math.exp(-7 * u))); const sub = Math.sin(ph) * Math.exp(-2.6 * u) * .9;
        const nz = fl(rnd(), 900 * Math.exp(-3 * u) + 120).lo * Math.exp(-5 * u) * 1.4, nzr = fr2(rnd(), 900 * Math.exp(-3 * u) + 120).lo * Math.exp(-5 * u) * 1.4;
        put(FX, s0 + i, (sub + nz) * g, (sub + nzr) * g) } },
    whoosh(t, dur, dir = 1, g = 1) { const s0 = Math.round(t * sr), len = Math.round(dur * sr), a = svf(), b = svf();
      for (let i = 0; i < len; i++) { const p = i / len, env = Math.pow(Math.sin(Math.PI * Math.pow(p, .8)), 2), fc = 300 + 5200 * Math.pow(Math.sin(Math.PI * p), 1.5);
        const pan = dir * (p * 2 - 1) * .7, x = a(rnd(), fc, .5).bp, y = b(rnd(), fc * 1.05, .5).bp; put(FX, s0 + i, x * env * .55 * g * (1 - pan), y * env * .55 * g * (1 + pan)) } },
    riser(t, dur) { const s0 = Math.round(t * sr), len = Math.round(dur * sr), a = svf(), b = svf(); let ph = 0;
      for (let i = 0; i < len; i++) { const p = i / len, env = Math.pow(p, 2.2), fc = 400 + 7000 * p * p; ph += 2 * Math.PI * (180 + 900 * p * p) / sr;
        const x = a(rnd(), fc, .4).bp * .5 + Math.sin(ph) * .08 + Math.sin(ph * 1.5) * .05, y = b(rnd(), fc, .4).bp * .5 + Math.sin(ph * 1.01) * .08; put(FX, s0 + i, x * env, y * env) }
      DUCK(Math.round((t + dur * .4) * sr), Math.round(dur * .6 * sr), .35) },
    swell(t, dur) { const s0 = Math.round(t * sr), len = Math.round(dur * sr), a = svf();
      for (let i = 0; i < len; i++) { const p = i / len, env = Math.pow(p, 3); const x = a(rnd(), 500 + 4000 * p, .5).bp; put(FX, s0 + i, x * env * .5, x * env * .5) } },
    thump(t, g = .6) { const s0 = Math.round(t * sr); for (let i = 0; i < .4 * sr; i++) { const u = i / sr, y = Math.sin(2 * Math.PI * (60 * u + 3 * (1 - Math.exp(-25 * u)))) * Math.exp(-8 * u) * g; put(FX, s0 + i, y) } },
    key(t, idx, g = 1) { const s0 = Math.round(t * sr), f = 2600 + ((idx * 37) % 9) * 110, hp = svf();
      for (let i = 0; i < .03 * sr; i++) { const u = i / sr, x = hp(rnd(), 4000, .6).hi * Math.exp(-260 * u) * .28 + Math.sin(2 * Math.PI * f * u) * Math.exp(-400 * u) * .06; put(FX, s0 + i, x * g * (idx % 2 ? .8 : 1), x * g * (idx % 2 ? 1 : .8)) }
      if (g > 1) this.thump(t, .35) },
    tick(t) { const s0 = Math.round(t * sr); for (let i = 0; i < .025 * sr; i++) { const u = i / sr, x = (Math.sin(2 * Math.PI * 3300 * u) * .7 + rnd() * .3) * Math.exp(-300 * u) * .16; put(FX, s0 + i, x) } },
    type(t) { const s0 = Math.round(t * sr), hp = svf(); for (let i = 0; i < .05 * sr; i++) { const u = i / sr, x = hp(rnd(), 2500, .7).bp * Math.exp(-120 * u) * .35 + Math.sin(2 * Math.PI * 1800 * u) * Math.exp(-160 * u) * .05; put(FX, s0 + i, x) } },
    pop(t, g = .8) { const s0 = Math.round(t * sr); for (let i = 0; i < .14 * sr; i++) { const u = i / sr, y = Math.sin(2 * Math.PI * (300 * u + 260 * (1 - Math.exp(-40 * u)) / 40 * 40 / 40)) * Math.exp(-28 * u) * .3 * g; put(FX, s0 + i, y) } this.type(t) },
    draw(t) { const s0 = Math.round(t * sr), len = Math.round(.55 * sr), a = svf(); for (let i = 0; i < len; i++) { const p = i / len, env = Math.sin(Math.PI * p) * .08; const x = a(rnd(), 5000 + 3000 * p, .3).bp; put(FX, s0 + i, x * env * .8, x * env) } },
    slap(t) { const s0 = Math.round(t * sr), lp = svf(); for (let i = 0; i < .2 * sr; i++) { const u = i / sr, x = lp(rnd(), 1800, .8).lo * Math.exp(-30 * u) * .9 + Math.sin(2 * Math.PI * 140 * u) * Math.exp(-25 * u) * .4; put(FX, s0 + i, x) } },
    scratch(t, dur) { const s0 = Math.round(t * sr), len = Math.round(dur * sr), a = svf(), b = svf();
      for (let i = 0; i < len; i++) { const p = i / len, env = Math.sin(Math.PI * p) * (.6 + .4 * Math.abs(Math.sin(i / sr * 2 * Math.PI * 38))); const x = a(rnd(), 3200 + 800 * Math.sin(p * 9), 1.2).bp, y = b(rnd(), 3400, 1.2).bp; put(FX, s0 + i, x * env * .32, y * env * .32) } },
    snap(t) { const s0 = Math.round(t * sr); for (let i = 0; i < .25 * sr; i++) { const u = i / sr, x = Math.sin(2 * Math.PI * 1760 * u) * Math.exp(-18 * u) * .09 + Math.sin(2 * Math.PI * 2640 * u) * Math.exp(-25 * u) * .05 + rnd() * Math.exp(-400 * u) * .25; put(FX, s0 + i, x) } },
    chime(t) { const s0 = Math.round(t * sr), base = variant === 'marca' ? 587.33 : 523.25;
      [[1, .22, 2.2], [2.76, .08, 3.5], [5.4, .04, 5], [1.5, .1, 2.6], [2, .07, 3]].forEach(([m, a, d], k) => { const f = base * m, pan = (k % 2 ? .35 : -.35);
        for (let i = 0; i < 3 * sr; i++) { const u = i / sr, y = Math.sin(2 * Math.PI * f * u) * Math.exp(-d * u / 2) * a * Math.min(1, u * 800); put(FX, s0 + i, y * (1 - pan), y * (1 + pan)) } }) },
  };
  for (const [type, t, ...a] of sfx) S[type](t, ...a);
  // mix final, fade e limiter suave
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sr, fade = t > total - 1.6 ? Math.max(0, (total - t) / 1.6) : 1, fin = Math.min(1, t * 40);
    L[i] = Math.tanh((L[i] + M.L[i] * duck[i]) * 1.1) * fade * fin; R[i] = Math.tanh((R[i] + M.R[i] * duck[i]) * 1.1) * fade * fin;
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const g = .89 / peak, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { buf.writeInt16LE(Math.round(L[i] * g * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * g * 32767), 46 + i * 4) }
  return buf;
}

function levels(f, sfx) { // pico de cada evento no arquivo final, para conferir o equilíbrio
  const r = spawnSync(ffmpeg, ['-v', 'error', '-i', f, '-ac', '1', '-ar', '44100', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  const x = new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.length)), sr = 44100;
  const row = {}; for (const [type, t] of sfx) { let p = 0; for (let i = Math.max(0, Math.round((t - .05) * sr)); i < Math.min(x.length, Math.round((t + .4) * sr)); i++) p = Math.max(p, Math.abs(x[i])); (row[type] = row[type] || []).push((20 * Math.log10(p)).toFixed(0) + '@' + t.toFixed(1)) }
  for (const k in row) console.log(k.padEnd(8), row[k].slice(0, 8).join(' '));
  const all = spawnSync(ffmpeg, ['-hide_banner', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; console.log(all.split(/\r?\n/).filter(l => /^\s+(I:|Peak:)/.test(l)).map(l => l.trim()).join(' | '));
}
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('ERRO', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()) });
  await p.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await p.goto(`file:///${path.resolve(__dirname, 'grupo.html').replace(/\\/g, '/')}?v=${v}`);
  await p.evaluate(() => window.ready);
  const { total, sfx, file } = await p.evaluate(() => ({ total: window.TOTAL, sfx: window.SFX, file: window.FILE }));

  const prev = arg('--preview');
  if (prev) {
    fs.mkdirSync(PREV, { recursive: true });
    for (const t of prev.split(',').map(Number)) { await p.evaluate(t => seek(t), t); await p.screenshot({ path: path.join(PREV, `m-${v}-${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 70 }) }
    console.log('preview ok'); await b.close(); return;
  }
  fs.mkdirSync(OUTDIR, { recursive: true });
  const wav = path.join(os.tmpdir(), `motion-${v}.wav`);
  fs.writeFileSync(wav, sfxTrack(total, sfx)); const LN = loudnormArgs(wav);
  const out = path.join(OUTDIR, file + '.mp4');
  if (process.argv.includes('--audio-only')) {
    const tmp = out.replace('.mp4', '.tmp.mp4');
    const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', out, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', LN, '-ar', '44100', '-ac', '2', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', String(total), tmp], { encoding: 'utf8' });
    if (r.status) throw new Error(r.stderr); fs.renameSync(tmp, out); fs.unlinkSync(wav); console.log('audio trocado'); levels(out, sfx); await b.close(); return;
  }
  if (process.argv.includes('--wav')) { fs.copyFileSync(wav, path.join(PREV, `m-${v}.wav`)); console.log('wav salvo'); await b.close(); return }
  const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
    '-vf', `tmix=frames=${SUB},fps=${FPS},scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-profile:v', 'high', '-level', '4.2', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-af', LN, '-ar', '44100', '-ac', '2', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', String(total), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(total * FPS * SUB), t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    await p.evaluate(t => seek(t), i / (FPS * SUB));
    const jpg = await p.screenshot({ type: 'jpeg', quality: 95, optimizeForSpeed: true });
    if (!ff.stdin.write(Buffer.from(jpg))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 240 === 0) console.log(`${v} ${i}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  const code = await new Promise(r => ff.on('close', r));
  await b.close(); fs.unlinkSync(wav);
  console.log(`${v} pronto: ${out} ffmpeg=${code} ${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
})().catch(e => { console.error(e); process.exit(1); });
