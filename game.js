(() => {
'use strict';
/* ================= 設定 ================= */
const W = 960, H = 540, GY = 400, PH = 120, S = 2, MAX = 5;
const FACE = 1;     // 画像が右向きなら 1、左向きなら -1
const TILT = true;  // 滑る画像を坂に合わせて傾ける。画像がすでに傾いた絵なら false

/* 速度: SPEED は全体の倍率(大きいほど速い)。DUR は各動作の基準時間(ミリ秒) */
const SPEED = 2.4;
const DUR = {
  morph: 350,    // 地面が坂に変わる
  slideOut: 1100, // 坂を滑って画面外へ
  slideIn: 1000,  // 反対側から滑ってくる
  runOut: 1300,   // 走って画面外へ
  runIn: 1100,    // 反対側から走ってくる
  pause: 200,     // 画面外での間
  walk: 900,      // ↴ の歩き
  crack: 400,     // 地面が割れる
  fall: 850,      // 落下
  hole: 250,      // 穴が閉じる
  fallIn: 800,    // 上から落ちてくる
  land: 180       // 着地
};

/* 効果音: 置いたファイルが優先。無ければ内蔵の簡易音が鳴る */
const SFX_VOL = 0.8;
const SFX_FILES = {
  click: 'sfx/click.mp3', run: 'sfx/run.mp3', slide: 'sfx/slide.mp3',
  break: 'sfx/break.mp3', fall: 'sfx/fall.mp3',
  found: 'sfx/found.mp3', clear: 'sfx/clear.mp3' // 上下左右のどれかが出た時 / 4つそろった時
};

/* クリア投稿・リンク */
const TITLE = '上下左右';
const PUZZLE_URL = 'https://yuarika.github.io/UDLR/';
const ANNOUNCEMENT_POST_URL = 'https://x.com/yuarikaa/status/2113564732238295257';  // ← 告知ポストのURLを入れる(空欄なら投稿文に含めない)
const CLEAR_TAGS = '#Web_上下左右';
const PROFILE_URL = 'https://yuarika.github.io/Yuarika_Profile/';

/* ================= データ ================= */
const _b = ['C0sMVgoRnMjjj8y71s/WjOTHEh9aFEtRL2sRSUBZSVgS18D6SzZYaxFIQV1JWBLXwPtLNlhrEUhCWVpEEh9ald7NVm0fI1JbW0UDA1pcS477gxElXDJJRBIfWpTR61ZtHyNSWVtWHBGcyuVJKRxoWkBZW1YcEZzI4EkpHGhaQVpbVhwRnf/KSSkcaFpBWlpEEh9ale/tVm0fI1JZWkQSH1qV9fRWbR8jUllaRAARVFKO5f8SblQrS1lAEh9alNPRVm0fI1JZWlYcEZ396EkpHGhaQFlaVhwRncnbSSkcaFpAW19WHBGd1M5JKRxoWkBZWUASH1qVzcJWbR8jUltaRAARVFKN0PUSblQrS1lAAgdaXEuM/IYRJVwySUYAAktBS0dW1Yv7UjRHLxIDSUJdSVgS1eTYSzZYaxFIQVtfRBIfWpb1x1ZtHyNSWVtFAgdaXEuN6JsRJVwySUACAUxSRUmTsZhaLUUwVgEASEBLR1bWpN1SNEcvEgJLRFlbVhwRn+TZSS',
            'kcaFpCWVpWHBGd/epJKRxoWkJdSVgS1v3bSzZYaxFJQl1JWBLWyP9LNlhrEUlBWElYEtbP7Us2WGsRSEFbSVgS1fH9SzZYaxFIQV1JWBLW18hLNlhrEUhCWltWHBGcyv1JKRxoWkFZWUASH1qV7MZWbR8jUlhYRAERVFKN09kSblQrS1tGBAdaXEuM/pwRJVwySUYAA0lSRUmSubhaLUUwVgEDSUBLR1bWntpSNEcvEgJLQl1JWBLW/vVLNlhrEUpAWVpWHBGd/eFJKRxoWkFbX0YSH1qV2fpWbR8jUllYRAIRVFKP48wSblQrS1tGAQdaXEuPzL0RJVwySUQAAUlSRUmQiqZaLUUwVgICSENLR1bXuv9SNEcvEgBIQlhJWBLWyMpLNlhrEUpAWFtEEh9al/30Vm0fI1JbWkcAA1pcS4ztjRElXDJJRAEDSUBLR1bWnttSNEcvEgNLQFlbVhwRn+vHSSkcaFpBWV9GABFUUo7A/xJuVCtLW0UAA0xSRUmTvrpa',
            'LUUwVgABSENZSVgS1OfDSzZYaxFIQVlYRBIfWpXmz1ZtHyNSWFtFAwJaXEuOzLIRJVwySUACA0hBS0dW1b7yUjRHLxIBS0BZWlYcEZ/kwUkpHGhaQllbRgQRVFKO9NYSblQrS1pHAQNIUkVJk6SCWi1FMFYAB0pAWElYEtbBw0s2WGsRSUNZW0USH1qX/dhWbR8jUl1bRQADWlxLj8yLESVcMklGAQNJQEtHVtSI7VI0Ry8SAktBWFtWHBGf6tZJKRxoWkFaW0YEEVRSjM/aEm5UK0tZRQACTFJFSZCLq1otRTBWAgNIQl1JWBLW3MFLNlhrEUtAWFhEEh9alebTVm0fI1JZW0UCB1pcS4zQihElXDJJRQMDSkRLR1bVvMpSNEcvEgJJQ1lbVhwRnufOSSkcaFpAWVpFARFUUozj/hJuVCtLW0UDA0lSRUmRv5xaLUUwVgABSEFZSVgS1uTXSzZYaxFJQFtbRRIfWpXT6lZtHyNSWFhFAQNaXEuO8roRJS0U'].join('');
const _k = ['pik', 't03', 'x'].join('');
const _d = (() => {
  const s = atob(_b);
  const u = Uint8Array.from(s, (c, i) => c.charCodeAt(0) ^ _k.charCodeAt(i % _k.length));
  return JSON.parse(new TextDecoder().decode(u));
})();
const GOAL = [..._d.g];
const DIC = {};
_d.d.forEach(([q, c]) => { if (!DIC[q]) DIC[q] = [c]; }); // 同じ並びが複数ある場合は先に書いた漢字だけ出す

/* ================= 効果音 ================= */
let ac = null;
const ctx = () => {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)();
  if (ac.state === 'suspended') ac.resume();
  return ac;
};
function tone(f0, f1, d, type, vol, delay = 0) {
  const c = ctx(), t = c.currentTime + delay, o = c.createOscillator(), n = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
  n.gain.setValueAtTime(.0001, t); n.gain.exponentialRampToValueAtTime(vol, t + .01);
  n.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(n); n.connect(c.destination); o.start(t); o.stop(t + d + .02);
}
function noise(d, vol, delay = 0, hz = 1200) {
  const c = ctx(), t = c.currentTime + delay, len = Math.ceil(c.sampleRate * d);
  const buf = c.createBuffer(1, len, c.sampleRate), a = buf.getChannelData(0);
  for (let i = 0; i < len; i++) a[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(), f = c.createBiquadFilter(), n = c.createGain();
  s.buffer = buf; f.type = 'lowpass'; f.frequency.value = hz;
  n.gain.setValueAtTime(vol, t); n.gain.exponentialRampToValueAtTime(.0001, t + d);
  s.connect(f); f.connect(n); n.connect(c.destination); s.start(t);
}
const synth = {
  click() { tone(620, 620, .055, 'square', .03); },
  run() { for (let i = 0; i < 6; i++) { noise(.05, .08, i * .1, 900); tone(130, 90, .05, 'square', .02, i * .1); } },
  slide() { tone(900, 200, .5, 'sawtooth', .02); noise(.5, .06, 0, 2500); },
  break() { noise(.35, .2, 0, 700); tone(170, 50, .25, 'square', .05); },
  fall() { tone(950, 120, .8, 'sine', .04); },
  found() { tone(660, 660, .12, 'sine', .05); tone(880, 880, .22, 'sine', .05, .12); },
  clear() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, f, i === 3 ? .5 : .14, 'sine', .055, i * .14)); }
};
const aud = {};
Object.keys(SFX_FILES).forEach(k => {
  const a = new Audio(SFX_FILES[k]); a.preload = 'auto';
  a.addEventListener('canplaythrough', () => { a._ok = 1; });
  a.addEventListener('error', () => { a._bad = 1; });
  aud[k] = a;
});
function sfx(k) {
  try {
    const a = aud[k];
    if (a && a._ok) { const c = a.cloneNode(); c.volume = SFX_VOL; c.play().catch(() => {}); return; }
    synth[k]();
  } catch (e) { /* 音が出せなくても進行する */ }
}

/* ================= 準備 ================= */
const $ = id => document.getElementById(id);
const cv = $('cv'), g = cv.getContext('2d'), st = document.querySelector('.wrap');
cv.width = W * S; cv.height = H * S;

// 状態別画像: img/pict_idle|run|slide|fall.png (無ければ idle → pict.png → pict.svg)
// 地面を壊すときと落ちるときは fall を共用
const pic = n => {
  const c = ['img/pict_' + n + '.png', 'img/pict_idle.png', 'img/pict.png', 'img/pict.svg'];
  const m = new Image(); let i = 0;
  m.onerror = () => { if (++i < c.length) m.src = c[i]; };
  m.src = c[0]; return m;
};
const SP = {};
['idle', 'run', 'slide', 'fall'].forEach(n => { SP[n] = pic(n); });

const P = { x: 480, y: GY, f: 1, s: 'idle', lift: 0, sx: 1, sy: 1, vis: true, stick: true };
const T = { r: 0, l: 0, ul: 0, ur: 0 };
const hole = { x: 480, w: 0, t: 0 };
const topY = x => GY + T.r * Math.max(0, x - 460) + T.l * Math.max(0, 500 - x)
                 - T.ul * Math.max(0, 460 - x) - T.ur * Math.max(0, x - 500);

/* ================= 描画 ================= */
function sky() {
  const a = g.createLinearGradient(0, 0, 0, GY);
  a.addColorStop(0, '#9fcbff'); a.addColorStop(1, '#e3f1ff');
  g.fillStyle = a; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.75)';
  [[120, 90, 150], [700, 60, 190], [250, 190, 110], [850, 210, 130]].forEach(([x, y, w]) => {
    g.beginPath(); g.roundRect(x, y, w, 22, 11); g.fill();
  });
}
function ground() {
  const p = new Path2D();
  p.moveTo(-10, H + 10);
  for (let x = -10; x <= W + 10; x += 10) p.lineTo(x, topY(x));
  p.lineTo(W + 10, H + 10); p.closePath();
  if (hole.w > 0) p.rect(hole.x - hole.w / 2, GY, hole.w, H + 10 - GY);
  g.fillStyle = '#0a1f4d'; g.fill(p, 'evenodd');
  g.save(); g.clip(p, 'evenodd');
  g.strokeStyle = '#17408f'; g.lineWidth = 2; g.beginPath();
  for (let i = -14; i < 6; i++) {
    const y = GY + 48 * i;
    g.moveTo(-10, y); g.lineTo(W + 10, y);
    for (let x = (i & 1) * 24; x < W + 48; x += 48) { g.moveTo(x, y); g.lineTo(x, y + 48); }
  }
  g.stroke();
  g.strokeStyle = '#5cc8ff'; g.lineWidth = 12; g.lineJoin = 'round'; g.beginPath();
  for (let x = -10; x <= W + 10; x += 10) x < 0 ? g.moveTo(x, topY(x)) : g.lineTo(x, topY(x));
  g.stroke();
  g.restore();
  if (hole.t > 0 && hole.t < 1) {
    g.fillStyle = '#0a1f4d';
    for (let i = 0; i < 6; i++) {
      const dy = hole.t * hole.t * 520 * (0.8 + i * 0.08);
      g.save(); g.globalAlpha = 1 - hole.t;
      g.translate(hole.x + (i - 2.5) * 16, GY + 10 + dy); g.rotate(hole.t * (i % 2 ? 3 : -3));
      g.fillRect(-8, -8, 16, 16); g.restore();
    }
  }
}
function pict() {
  const im = SP[P.s];
  if (!P.vis || !im || !im.naturalWidth) return;
  let y = P.y, r = 0;
  if (P.stick) {
    y = topY(P.x) - P.lift;
    if (P.s === 'slide' && TILT) r = Math.atan2(topY(P.x + 1) - topY(P.x - 1), 2);
  }
  const h = PH, w = h * im.naturalWidth / im.naturalHeight;
  g.save(); g.translate(P.x, y); g.rotate(r); g.scale(P.f * FACE * P.sx, P.sy);
  g.drawImage(im, -w / 2, -h, w, h); g.restore();
}
(function loop() {
  g.setTransform(S, 0, 0, S, 0, 0);
  sky(); ground(); pict();
  requestAnimationFrame(loop);
})();

/* ================= アニメーション ================= */
const tw = (ms, fn) => new Promise(res => {
  const real = ms / SPEED, s = performance.now();
  (function f(now) {
    const e = now - s, t = Math.min(1, e / real);
    fn(t, e * SPEED);
    t < 1 ? requestAnimationFrame(f) : res();
  })(s);
});
const wait = ms => new Promise(r => setTimeout(r, ms / SPEED));
const out = t => 1 - (1 - t) * (1 - t);
const calm = () => { P.s = 'idle'; P.lift = 0; P.sx = P.sy = 1; P.f = 1; };

async function fallIn() {
  P.x = 480; P.stick = false; P.vis = true; P.f = 1; P.s = 'fall';
  sfx('fall');
  await tw(DUR.fallIn, t => { P.y = -PH - 20 + (GY + PH + 20) * t * t; });
  P.y = GY; P.stick = true; P.s = 'idle';
  await tw(DUR.land, t => { const k = Math.sin(t * Math.PI); P.sy = 1 - .12 * k; P.sx = 1 + .08 * k; });
  calm();
}
async function dropHere() {
  hole.x = P.x; P.s = 'fall'; P.lift = 0;
  sfx('break');
  await tw(DUR.crack, t => { hole.w = 120 * t; });
  P.stick = false; P.y = GY;
  sfx('fall');
  await tw(DUR.fall, t => { P.y = GY + t * t * (H - GY + PH + 30); hole.t = t; });
  P.vis = false;
  await tw(DUR.hole, t => { hole.w = 120 * (1 - t); });
  hole.t = 0; hole.w = 0;
}
async function slide(dir) {
  const k = dir > 0 ? 'r' : 'l', e = dir > 0 ? 'ul' : 'ur';
  P.f = dir;
  await tw(DUR.morph, t => { T[k] = t; });
  P.s = 'slide'; sfx('slide');
  await tw(DUR.slideOut, t => { P.x = 480 + dir * t * t * 640; });
  P.vis = false;
  await tw(DUR.hole, t => { T[k] = 1 - t; });
  await tw(DUR.morph, t => { T[e] = t; });
  P.vis = true; P.f = dir; P.s = 'slide'; sfx('slide');
  await tw(DUR.slideIn, t => { P.x = 480 - dir * 640 * (1 - out(t)); });
  P.x = 480; calm();
  await tw(DUR.morph, t => { T[e] = 1 - t; });
  T.r = T.l = T.ul = T.ur = 0;
}
async function run() {
  P.s = 'run'; sfx('run');
  await tw(DUR.runOut, (t, e) => { P.x = 480 + t * t * 640; P.lift = Math.abs(Math.sin(e / 80)) * 8; });
  P.vis = false;
  await wait(DUR.pause);
  P.x = -160; P.vis = true; P.f = 1; sfx('run');
  await tw(DUR.runIn, (t, e) => { P.x = -160 + 640 * out(t); P.lift = Math.abs(Math.sin(e / 80)) * 8 * (1 - t); });
  P.x = 480; calm();
}
async function walkDrop() {
  P.s = 'run'; sfx('run');
  await tw(DUR.walk, (t, e) => { P.x = 480 + 130 * t; P.lift = Math.abs(Math.sin(e / 110)) * 5; });
  P.x = 610;
  await dropHere();
  await fallIn();
}
const moves = [run, async () => { await dropHere(); await fallIn(); }, () => slide(-1), walkDrop, () => slide(1)];

/* ================= 入力と判定 ================= */
const gs = $('gs'), now = $('now'), msg = $('msg'), rs = $('rs');
const buf = [], got = GOAL.map(() => false);
GOAL.forEach(c => { const b = document.createElement('b'); b.textContent = c; gs.appendChild(b); });

const tn = $('tn'), tc = $('tc');
for (let i = 0; i < MAX; i++) { const p = document.createElement('i'); p.textContent = i + 1; tn.appendChild(p); }
const turns = () => {
  [...tn.children].forEach((p, i) => { p.className = i < buf.length ? 'd' : i === buf.length ? 'n' : ''; });
  tc.textContent = buf.length >= MAX ? '5 / 5 終了' : (buf.length + 1) + '回目 / ' + MAX;
};
turns();

const show = k => {
  now.classList.remove('on'); void now.offsetWidth;
  now.textContent = k || '';
  if (k) now.classList.add('on');
};

document.querySelectorAll('.act').forEach(b => b.addEventListener('click', async () => {
  if (st.classList.contains('busy') || buf.length >= MAX) return;
  st.classList.add('busy');
  sfx('click');
  const n = +b.dataset.n;
  await moves[n]();
  buf.push(n);
  turns();
  const ks = DIC[buf.join('')] || [];
  show(ks.join(''));
  let fresh = false;
  ks.forEach(k => {
    const gi = GOAL.indexOf(k);
    if (gi >= 0 && !got[gi]) { got[gi] = true; fresh = true; gs.children[gi].classList.add('on'); }
  });
  if (buf.length >= MAX) {
    st.classList.add('full'); rs.classList.add('hot');
    msg.textContent = '5回行動しました。RESETでやり直せます(見つけた漢字はそのまま残ります)';
  }
  st.classList.remove('busy');
  if (fresh && !got.every(Boolean)) sfx('found');
  if (got.every(Boolean)) {
    if (fresh) sfx('clear');
    setTimeout(() => {
      got.forEach((_, i) => { $('c' + i).textContent = GOAL[i]; });
      $('cl').hidden = false;
    }, 1100 / SPEED);
  }
}));
rs.addEventListener('click', () => {
  if (st.classList.contains('busy')) return;
  sfx('click');
  buf.length = 0; show(''); turns();
  st.classList.remove('full'); rs.classList.remove('hot'); msg.textContent = '';
});

/* ================= クリア画面 ================= */
$('profile').href = PROFILE_URL;
$('xPost').addEventListener('click', () => {
  sfx('click');
  const text = 'Web謎「' + TITLE + '」をクリアしました！\n\n' +
    (ANNOUNCEMENT_POST_URL ? ANNOUNCEMENT_POST_URL + '\n\n' : '') +
    PUZZLE_URL + '\n\n' + CLEAR_TAGS;
  const url = 'https://x.com/intent/post?text=' + encodeURIComponent(text);
  window.open(url, '_blank', 'noopener,noreferrer');
});
})();
