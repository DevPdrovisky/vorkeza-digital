// Confere os MP4 finais: formato, duração, volume e extrai quadros reais para revisão.
const { spawnSync } = require('child_process'), path = require('path'), fs = require('fs');
const ff = require('@ffmpeg-installer/ffmpeg').path, dir = path.resolve(__dirname, '../Pack-Instagram-Vorkeza/3-Videos'), prev = path.join(__dirname, '_preview');
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.mp4')).sort()) {
  const full = path.join(dir, f);
  const r = spawnSync(ff, ['-hide_banner', '-i', full, '-af', 'volumedetect', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  console.log('== ' + f, (fs.statSync(full).size / 1e6).toFixed(1) + ' MB');
  console.log(r.split('\n').filter(l => /Duration|Stream #|mean_volume|max_volume/.test(l)).map(l => l.trim()).join('\n'));
  const id = f.match(/video-(\d)/)[1];
  [2.4, 2.5, 2.62, 3.3, 8.2, 12, 19, 29.9].forEach((t, i) => spawnSync(ff, ['-y', '-loglevel', 'error', '-ss', String(t), '-i', full, '-frames:v', '1', '-q:v', '4', path.join(prev, `real${id}-${i}.jpg`)]));
}
