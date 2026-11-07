/* ===========================================================
   DEEPAWALI — app.js
   slideshow · fireworks · music · gallery · diya game
   =========================================================== */
(() => {
'use strict';
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const C = window.DIWALI, P = C.photos;
const rnd = (a, b) => a + Math.random() * (b - a);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = () => innerWidth < 600;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let started = false, muted = false, fwOn = true, vol = 0.7;

/* ---------- personal link: ?name=Rahul&from=Ankit ---------- */
const q = new URLSearchParams(location.search);
const NAME = (q.get('name') || '').trim().slice(0, 40);
const FROM = (q.get('from') || '').trim().slice(0, 40);
$('#subtitle').textContent = NAME ? `Happy Diwali, ${NAME}` : C.subtitle;
if (NAME) {
  $('#introSub').textContent = `${NAME}, ye tohfa sirf aapke liye`;
  document.title = `Shubh Deepawali, ${NAME} 🪔`;
}
if (FROM) $('#signoff').textContent = `— ${FROM} ki taraf se, pyaar ke saath ❤️`;

/* ---------- decor: stars, petals, toran, footer diyas ---------- */
function mkStars(el, n) {
  const f = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i'); s.className = 'star';
    s.style.cssText = `left:${rnd(0, 100)}%;top:${rnd(0, 78)}%;animation-delay:${rnd(0, 3)}s;animation-duration:${rnd(2, 5)}s`;
    f.appendChild(s);
  }
  el.appendChild(f);
}
mkStars($('#stars'), 90); mkStars($('.intro-stars'), 70);

if (!reduce) {
  const cols = ['#ff9d1e', '#ffc233', '#ff6a1a', '#ffb000', '#e8590c'];
  const f = document.createDocumentFragment();
  for (let i = 0, n = isSmall() ? 14 : 26; i < n; i++) {
    const p = document.createElement('i'), s = rnd(.6, 1.3);
    p.className = 'petal';
    p.style.cssText = `left:${rnd(0, 100)}%;width:${13 * s}px;height:${19 * s}px;background:${cols[i % cols.length]};` +
      `animation-duration:${rnd(9, 19)}s;animation-delay:${-rnd(0, 19)}s;--dx:${rnd(-140, 140)}px;--rot:${rnd(360, 900)}deg`;
    f.appendChild(p);
  }
  $('#petals').appendChild(f);
}

function buildToran() {
  const svg = $('#toran'), w = innerWidth, H = 120;
  svg.setAttribute('width', w); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${w} ${H}`);
  const arcs = Math.max(2, Math.round(w / 380)), span = w / arcs, sag = Math.min(54, span * .14);
  const cols = ['#ff9d1e', '#ffc233', '#ff6a1a'];
  let h = '';
  for (let a = 0; a < arcs; a++) {
    const x0 = a * span, x1 = x0 + span, cx = (x0 + x1) / 2, cy = 4 + sag * 2;
    h += `<path d="M${x0} 4Q${cx} ${cy} ${x1} 4" fill="none" stroke="#7a3b0c" stroke-width="2"/>`;
    const steps = Math.max(8, Math.round(span / 20));
    for (let k = 0; k <= steps; k++) {
      const t = k / steps, u = 1 - t;
      const x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * 4 + 2 * u * t * cy + t * t * 4;
      h += `<circle cx="${x.toFixed(1)}" cy="${(y + 5).toFixed(1)}" r="9" fill="${cols[k % 3]}" stroke="#a24a00" stroke-width="1"/>` +
           `<circle cx="${x.toFixed(1)}" cy="${(y + 5).toFixed(1)}" r="3.2" fill="#fff0b0" opacity=".85"/>`;
      if (k % 4 === 2) h += `<path d="M${x.toFixed(1)} ${(y + 12).toFixed(1)}q-7 14 0 30q7-16 0-30z" fill="#2e9c4a" stroke="#1a6a2e" stroke-width=".8"/>`;
    }
    h += `<g transform="translate(${x1} 6)"><line y1="0" y2="16" stroke="#ffd873" stroke-width="2"/><path d="M-5 16h10l-2 20h-6z" fill="#e63946"/></g>`;
  }
  svg.innerHTML = h;
}
buildToran();
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { buildToran(); fwResize(); }, 200); });

const DIYA_HTML = '<span class="diya"><span class="flame"></span><svg viewBox="0 0 100 56"><use href="#s-diya"/></svg></span>';
$('#footDiyas').innerHTML = Array.from({ length: 9 }, (_, i) =>
  DIYA_HTML.replace('class="flame"', `class="flame" style="animation-delay:${-i * .13}s"`)).join('');

/* ---------- typed wishes ---------- */
(async function typeLoop() {
  const el = $('#typed'); let i = 0;
  for (;;) {
    const ch = Array.from(C.wishes[i++ % C.wishes.length]);
    for (let k = 1; k <= ch.length; k++) { el.textContent = ch.slice(0, k).join(''); await sleep(42); }
    await sleep(2300);
    for (let k = ch.length; k >= 0; k--) { el.textContent = ch.slice(0, k).join(''); await sleep(14); }
    await sleep(300);
  }
})();

/* ===========================================================
   SLIDESHOW
   =========================================================== */
const layers = [$('#LA'), $('#LB')], thumbsEl = $('#thumbs'), capEl = $('#cap'), ghosts = [$('#ghostA'), $('#ghostB')];
let cur = 0, front = 0, playing = true, tmr = null, anim = null, fxI = 0, gFlip = 0;
const FX = [
  [{ clipPath: 'circle(0% at 50% 62%)' }, { clipPath: 'circle(150% at 50% 62%)' }],                    // diya-glow reveal
  [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],                                // wipe
  [{ opacity: 0, filter: 'blur(16px) brightness(1.7)', transform: 'scale(1.18)' }, { opacity: 1, filter: 'blur(0) brightness(1)', transform: 'scale(1)' }],
  [{ clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0 0 0 0)' }],                               // curtain
  [{ opacity: 0, transform: 'translateY(12%) scale(1.04)' }, { opacity: 1, transform: 'none' }]
];

P.forEach((p, i) => {
  const im = new Image(); im.src = p.thumb; im.alt = ''; im.loading = 'lazy';
  im.addEventListener('click', () => show(i)); thumbsEl.appendChild(im);
});

function restartProgress() {
  const p = $('#progress'); p.style.animation = 'none'; void p.offsetWidth;
  if (playing && started) p.style.animation = `prog ${C.interval}ms linear forwards`; else p.style.width = '0';
}
function schedule() { clearTimeout(tmr); if (playing && started) tmr = setTimeout(() => show(cur + 1), C.interval); }

function show(i, opts = {}) {
  const n = (i + P.length) % P.length, pic = P[n];
  if (anim) { // finish a half-done transition instantly
    anim.cancel(); anim = null;
    layers.forEach((l, k) => { l.style.opacity = k === front ? 1 : 0; l.style.zIndex = k === front ? 2 : 1; });
  }
  const inc = opts.first ? layers[front] : layers[1 - front], out = layers[front];
  inc.innerHTML = `<img src="${pic.src}" alt="Photo ${n + 1}" style="--tx:${rnd(-2.5, 2.5).toFixed(1)}%;--ty:${rnd(-2, 2).toFixed(1)}%;object-position:50% 28%">`;
  if (!opts.first) {
    inc.style.opacity = 1; inc.style.zIndex = 3; out.style.zIndex = 2;
    const a = anim = inc.animate(FX[fxI++ % FX.length], { duration: 1500, easing: 'cubic-bezier(.22,.7,.2,1)', fill: 'both' });
    a.onfinish = () => {
      if (anim !== a) return;
      out.style.opacity = 0; out.innerHTML = ''; inc.style.zIndex = 2; out.style.zIndex = 1;
      a.cancel(); anim = null;
    };
    front = 1 - front;
  }
  // blurred ghost background + accent glow follow the photo
  gFlip ^= 1;
  ghosts[gFlip].style.backgroundImage = `url("${pic.src}")`;
  ghosts[gFlip].classList.add('on'); ghosts[1 - gFlip].classList.remove('on');
  document.documentElement.style.setProperty('--accent', pic.color);
  // caption / counter / thumbs
  if (opts.first) capEl.textContent = pic.cap;
  else { capEl.classList.add('swap'); setTimeout(() => { capEl.textContent = pic.cap; capEl.classList.remove('swap'); }, 260); }
  $('#count').textContent = `${n + 1} / ${P.length}`;
  const ts = $$('img', thumbsEl); ts.forEach((t, k) => t.classList.toggle('on', k === n));
  const t = ts[n]; if (t) thumbsEl.scrollTo({ left: t.offsetLeft - thumbsEl.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' });
  cur = n; restartProgress(); schedule();
  if (started) photoShow(pic);
  new Image().src = P[(n + 1) % P.length].src; // preload next
}
$('#next').onclick = () => show(cur + 1);
$('#prev').onclick = () => show(cur - 1);
$('#bPlay').onclick = () => {
  playing = !playing; $('#bPlay').textContent = playing ? '⏸ Slideshow' : '▶ Slideshow';
  restartProgress(); schedule();
};
let sx = 0, sy = 0; const fi = $('.frame-inner');
fi.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
fi.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? $('#next') : $('#prev')).click();
}, { passive: true });
show(0, { first: true });

/* ===========================================================
   GALLERY + VIEWER (Bootstrap modal)
   =========================================================== */
const grid = $('#grid');
P.forEach((p, i) => {
  const col = document.createElement('div'); col.className = 'col reveal';
  col.style.transitionDelay = `${(i % 4) * 90}ms`;
  col.innerHTML = `<div class="gcard" tabindex="0" role="button" aria-label="Photo ${i + 1}" style="--c:${p.color}">` +
    `<img loading="lazy" src="${p.thumb}" srcset="${p.thumb} 420w, ${p.src} ${p.w}w" sizes="(min-width:1200px) 22vw,(min-width:768px) 30vw,46vw" alt="Photo ${i + 1}">` +
    `<div class="gcap"></div></div>`;
  $('.gcap', col).textContent = p.cap;
  const card = $('.gcard', col);
  card.addEventListener('click', () => openViewer(i));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(i); } });
  grid.appendChild(col);
});
const vModal = new bootstrap.Modal($('#viewer')); let vi = 0;
function openViewer(i) {
  vi = (i + P.length) % P.length;
  $('#vImg').src = P[vi].src; $('#vImg').alt = `Photo ${vi + 1}`; $('#vCap').textContent = P[vi].cap;
  vModal.show();
}
$('#vPrev').onclick = () => openViewer(vi - 1);
$('#vNext').onclick = () => openViewer(vi + 1);

/* reveal on scroll */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
$$('.reveal').forEach(el => io.observe(el));

/* ===========================================================
   AUDIO ENGINE: sfx + ambient fallback music
   =========================================================== */
let ac = null, sfxGain = null, musicGain = null, noiseBuf = null, lastBoom = 0;
function ensureAudio() {
  if (ac) return ac;
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  ac = new AC();
  sfxGain = ac.createGain(); sfxGain.gain.value = muted ? 0 : .5; sfxGain.connect(ac.destination);
  musicGain = ac.createGain(); musicGain.gain.value = muted ? 0 : vol * .9; musicGain.connect(ac.destination);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ac;
}
function boom(size = 1) {
  if (!ac || muted || ac.state !== 'running') return;
  const t = ac.currentTime; if (t - lastBoom < .1) return; lastBoom = t;
  const src = ac.createBufferSource(); src.buffer = noiseBuf;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(120, t + .5);
  const g = ac.createGain(); g.gain.setValueAtTime(.5 * size, t); g.gain.exponentialRampToValueAtTime(.001, t + .7);
  src.connect(lp); lp.connect(g); g.connect(sfxGain); src.start(t); src.stop(t + .8);
  const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + .35);
  const g2 = ac.createGain(); g2.gain.setValueAtTime(.45 * size, t); g2.gain.exponentialRampToValueAtTime(.001, t + .4);
  o.connect(g2); g2.connect(sfxGain); o.start(t); o.stop(t + .45);
  for (let i = 0; i < 4; i++) {
    const tt = t + .18 + i * rnd(.05, .12), s = ac.createBufferSource(); s.buffer = noiseBuf;
    const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3500;
    const gg = ac.createGain(); gg.gain.setValueAtTime(.1, tt); gg.gain.exponentialRampToValueAtTime(.001, tt + .05);
    s.connect(hp); hp.connect(gg); gg.connect(sfxGain); s.start(tt); s.stop(tt + .06);
  }
}
function whistle() {
  if (!ac || muted || ac.state !== 'running') return;
  const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(500, t); o.frequency.exponentialRampToValueAtTime(1700, t + .7);
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.03, t + .08); g.gain.exponentialRampToValueAtTime(.0001, t + .75);
  o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + .8);
}
const Amb = {
  on: false, timer: 0, nodes: [], drone: null, echo: null,
  start() {
    if (!ensureAudio()) return false; ac.resume(); if (this.on) return true; this.on = true;
    const g = this.drone = ac.createGain(); g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(.05, ac.currentTime + 4); g.connect(musicGain);
    [130.81, 196, 261.63].forEach((f, i) => {
      const o = ac.createOscillator(); o.type = i ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = i * 3;
      const og = ac.createGain(); og.gain.value = i ? .5 : .7; o.connect(og); og.connect(g); o.start(); this.nodes.push(o);
    });
    const e = this.echo = ac.createDelay(1); e.delayTime.value = .34;
    const fb = ac.createGain(); fb.gain.value = .38; const lp = ac.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2400; e.connect(lp); lp.connect(fb); fb.connect(e); lp.connect(musicGain);
    this.loop(); return true;
  },
  loop() { if (!this.on) return; if (ac.state === 'running') this.note(); this.timer = setTimeout(() => this.loop(), rnd(700, 1900)); },
  note() {
    const sc = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880];
    const f = sc[(Math.random() * sc.length) | 0] * (Math.random() < .2 ? .5 : 1), t = ac.currentTime;
    const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(rnd(.08, .16), t + .012);
    g.gain.exponentialRampToValueAtTime(.0008, t + rnd(2.2, 3.6));
    [[1, 1], [2.76, .28], [5.4, .1]].forEach(([m, a]) => {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f * m;
      const og = ac.createGain(); og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + 3.8);
    });
    g.connect(musicGain); g.connect(this.echo);
  },
  stop() {
    this.on = false; clearTimeout(this.timer);
    this.nodes.forEach(o => { try { o.stop(); } catch (e) {} }); this.nodes = [];
    try { this.drone && this.drone.disconnect(); } catch (e) {}
  }
};

/* ===========================================================
   MUSIC PLAYER (files first, ambient if none)
   =========================================================== */
const aud = $('#aud'), seek = $('#seek');
let tracks = C.songs.map(s => ({ ...s, builtin: true })), ti = -1, mode = 'none', seeking = false;
aud.volume = vol;
function setPlayUI() {
  const playing = (mode === 'file' && !aud.paused) || (mode === 'amb' && Amb.on);
  $('#mPlay').textContent = playing ? '⏸' : '▶';
  $('#npIco').style.animationPlayState = playing ? 'running' : 'paused';
}
function renderList() {
  const pl = $('#playlist'); pl.innerHTML = '';
  tracks.forEach((t, i) => {
    const b = document.createElement('button'); b.type = 'button';
    b.className = 'list-group-item list-group-item-action' + (i === ti && mode === 'file' ? ' active' : '');
    b.textContent = `${i + 1}.  ${t.title}`; b.onclick = () => playFile(i); pl.appendChild(b);
  });
  $('#ambNote').hidden = mode !== 'amb';
}
function playFile(i) {
  if (!tracks.length) return startAmb();
  Amb.stop(); mode = 'file'; ti = (i + tracks.length) % tracks.length;
  aud.src = tracks[ti].src; aud.volume = vol; aud.muted = muted; aud.play().catch(() => {});
  $('#npTitle').textContent = '🎶 ' + tracks[ti].title; seek.disabled = false; renderList(); setPlayUI();
}
function startAmb() {
  aud.pause(); aud.removeAttribute('src'); mode = 'amb';
  if (!Amb.start()) { $('#npTitle').textContent = 'Audio supported nahi'; return; }
  $('#npTitle').textContent = '🔔 Diya-bell ambient'; seek.disabled = true; seek.value = 0; renderList(); setPlayUI();
}
function startMusic() { tracks.length ? playFile(0) : startAmb(); }
aud.addEventListener('error', () => { // built-in song file missing -> drop it
  if (mode !== 'file') return; const t = tracks[ti];
  if (t && t.builtin) { tracks.splice(ti, 1); tracks.length ? playFile(ti) : startAmb(); }
});
aud.addEventListener('play', setPlayUI); aud.addEventListener('pause', setPlayUI);
aud.addEventListener('ended', () => playFile(ti + 1));
aud.addEventListener('timeupdate', () => { if (!seeking && aud.duration) seek.value = aud.currentTime / aud.duration * 1000; });
seek.addEventListener('input', () => { seeking = true; if (aud.duration) aud.currentTime = seek.value / 1000 * aud.duration; });
seek.addEventListener('change', () => { seeking = false; });
$('#mPlay').onclick = () => {
  ensureAudio(); ac && ac.resume();
  if (mode === 'none') return startMusic();
  if (mode === 'file') aud.paused ? aud.play() : aud.pause(); else Amb.on ? Amb.stop() : Amb.start();
  setPlayUI();
};
$('#mNext').onclick = () => { if (tracks.length) playFile(mode === 'file' ? ti + 1 : 0); };
$('#mPrev').onclick = () => { if (tracks.length) playFile(mode === 'file' ? ti - 1 : 0); };
$('#vol').oninput = e => { vol = +e.target.value; aud.volume = vol; if (musicGain && !muted) musicGain.gain.value = vol * .9; };
$('#bAddSong').onclick = () => $('#fSong').click();
$('#fSong').onchange = e => {
  const fs = [...e.target.files]; if (!fs.length) return;
  const first = tracks.length;
  fs.forEach(f => tracks.push({ title: f.name.replace(/\.[^.]+$/, ''), src: URL.createObjectURL(f) }));
  ensureAudio(); ac && ac.resume(); playFile(first); e.target.value = '';
};
$('#bMute').onclick = () => {
  muted = !muted; aud.muted = muted; $('#bMute').textContent = muted ? '🔇' : '🔊';
  if (sfxGain) sfxGain.gain.value = muted ? 0 : .5;
  if (musicGain) musicGain.gain.value = muted ? 0 : vol * .9;
};
renderList();

/* ===========================================================
   FIREWORKS
   =========================================================== */
const cv = $('#fw'), cx = cv.getContext('2d'); let W = 0, H = 0;
const dpr = Math.min(devicePixelRatio || 1, isSmall() ? 2 : 3); // HD canvas
function fwResize() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
fwResize();
const PAL = [[255, 214, 102], [255, 90, 150], [90, 170, 255], [190, 90, 255], [255, 140, 40], [90, 255, 200], [255, 255, 255], [255, 70, 70]];
const rockets = [], parts = [];

function launch(tx, ty, col) {
  const x = tx ?? rnd(W * .08, W * .92);
  rockets.push({ x, y: H + 8, vx: rnd(-.4, .4), vy: -rnd(11, 15) * (H / 900 + .4), ty: ty ?? rnd(H * .1, H * .42), c: col || PAL[(Math.random() * PAL.length) | 0], trail: [] });
  whistle();
}
function burst(n = 2) { if (!fwOn) return; for (let i = 0; i < n; i++) setTimeout(() => launch(), i * rnd(140, 360)); }

function explode(x, y, c) {
  const k = isSmall() ? .72 : 1, types = ['ball', 'ring', 'willow', 'double', 'heart', 'star', 'spiral'];
  const t = types[(Math.random() * types.length) | 0], c2 = PAL[(Math.random() * PAL.length) | 0];
  const sp = rnd(5, 8) * (Math.min(W, 1000) / 900 + .3);
  const add = (n, spd, col, o = {}) => {
    n = Math.round(n * k);
    for (let i = 0; i < n; i++) {
      const a = Math.PI * 2 * i / n + rnd(-.02, .02); let s = o.ring ? spd : rnd(spd * .2, spd);
      if (o.heart) {
        const th = Math.PI * 2 * i / n;
        parts.push({ x, y, vx: 16 * Math.pow(Math.sin(th), 3) * spd / 16, vy: -(13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th)) * spd / 16, c: col, life: 1, decay: rnd(.008, .013), g: .03, size: 2.2, tw: 0, drag: .985 });
        continue;
      }
      if (o.star) s = spd * (i % 2 ? .5 : 1);
      if (o.spiral) s = spd * (.25 + 0.75 * (i / n));
      const ang = o.spiral ? a * 3 : a;
      parts.push({ x, y, vx: Math.cos(ang) * s, vy: Math.sin(ang) * s, c: col, life: 1, decay: o.decay || rnd(.009, .017), g: o.g ?? .045, size: o.size || 2, tw: Math.random() < .35 ? 1 : 0, drag: .985 });
    }
  };
  if (t === 'ball') add(110, sp, c);
  if (t === 'ring') add(70, sp, c, { ring: 1 });
  if (t === 'willow') add(90, sp * .9, [255, 200, 90], { decay: .006, g: .06, size: 1.8 });
  if (t === 'double') { add(80, sp, c); add(50, sp * .55, c2); }
  if (t === 'heart') add(90, sp * 1.1, [255, 70, 130], { heart: 1 });
  if (t === 'star') add(60, sp, c, { star: 1 });
  if (t === 'spiral') add(120, sp, c, { spiral: 1 });
  if (Math.random() < .3) add(25, sp * .4, [255, 255, 255], { size: 1.4 });
  parts.push({ x, y, vx: 0, vy: 0, c: [255, 230, 180], life: 1, decay: .12, g: 0, size: 60, flash: 1 });
  boom(.6 + sp / 14);
}

function frame() {
  cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = 'rgba(0,0,0,.22)'; cx.fillRect(0, 0, W, H);
  cx.globalCompositeOperation = 'lighter';
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i]; r.trail.push([r.x, r.y]); if (r.trail.length > 10) r.trail.shift();
    r.x += r.vx; r.y += r.vy; r.vy *= .985;
    for (let k = 1; k < r.trail.length; k++) {
      cx.strokeStyle = `rgba(255,220,150,${k / 12})`; cx.lineWidth = 2; cx.beginPath();
      cx.moveTo(r.trail[k - 1][0], r.trail[k - 1][1]); cx.lineTo(r.trail[k][0], r.trail[k][1]); cx.stroke();
    }
    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(r.x, r.y, 2.2, 0, 7); cx.fill();
    if (r.y <= r.ty || r.vy > -1.2) { explode(r.x, r.y, r.c); rockets.splice(i, 1); }
  }
  const glow = parts.length < 1500;
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    if (p.flash) {
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (2 - p.life));
      g.addColorStop(0, `rgba(255,240,200,${p.life * .6})`); g.addColorStop(1, 'rgba(255,200,100,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, p.size * 2, 0, 7); cx.fill();
      p.life -= p.decay; if (p.life <= 0) parts.splice(i, 1); continue;
    }
    p.vx *= p.drag; p.vy *= p.drag; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
    if (p.life <= 0) { parts.splice(i, 1); continue; }
    const a = Math.max(p.tw ? p.life * (.5 + .5 * Math.sin(p.life * 60)) : p.life, 0);
    cx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a})`;
    cx.beginPath(); cx.arc(p.x, p.y, p.size * (.5 + p.life * .7), 0, 7); cx.fill();
    if (glow) { cx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a * .12})`; cx.beginPath(); cx.arc(p.x, p.y, p.size * 3.2, 0, 7); cx.fill(); }
  }
  requestAnimationFrame(frame);
}
frame();


/* ---- har photo ke liye apna fireworks show (poore 20 sec) ---- */
let showT = [];
const hexRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
function photoShow(pic) {
  showT.forEach(clearTimeout); showT = [];
  if (!fwOn) return;
  const b = hexRgb(pic.color).map(v => Math.min(255, v + 70));
  const cols = [b, [255, 214, 102], [255, 255, 255], [b[2], b[0], b[1]]];
  const go = (ms, n = 1) => showT.push(setTimeout(() => {
    if (document.hidden || !fwOn) return;
    for (let i = 0; i < n; i++) setTimeout(() => launch(undefined, undefined, cols[(Math.random() * cols.length) | 0]), i * 220);
  }, ms));
  const T = C.interval;
  go(0, 4);                                            // photo aate hi salvo
  for (let t = 1800; t < T - 3500; t += rnd(1300, 2300)) go(t, Math.random() < .3 ? 2 : 1);
  go(T - 2800, 6);                                     // photo badalne se pehle finale
}
(function auto() {
  setTimeout(auto, reduce ? 3500 : rnd(900, 1800));
})();
// tap/click anywhere (outside controls) = your own firework
document.addEventListener('pointerdown', e => {
  if (!started || !fwOn) return;
  if (e.target.closest('a,button,input,label,.modal,.offcanvas,.navbar,.gcard,.stage,.toast,.glass,.card,.thumbs')) return;
  launch(e.clientX, e.clientY);
});
// sparkler trail for mouse
let lastSpark = 0;
document.addEventListener('pointermove', e => {
  if (!started || e.pointerType !== 'mouse' || reduce) return;
  const now = performance.now(); if (now - lastSpark < 28 || parts.length > 1600) return; lastSpark = now;
  for (let i = 0; i < 2; i++) parts.push({ x: e.clientX, y: e.clientY, vx: rnd(-.8, .8), vy: rnd(-.6, 1), c: [255, rnd(180, 230) | 0, 90], life: 1, decay: rnd(.03, .055), g: .04, size: 1.5, tw: 1, drag: .96 });
});
$('#bFw').onclick = () => { fwOn = !fwOn; if (fwOn) photoShow(P[cur]); $('#bFw').textContent = '🎆 Fireworks: ' + (fwOn ? 'ON' : 'OFF'); };
$('#bReplay').onclick = () => { for (let i = 0; i < 9; i++) setTimeout(() => launch(), i * 240); };
$('#bFs').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();

/* ===========================================================
   DIYA GAME
   =========================================================== */
const DN = 11, row = $('#diyaRow'); let lit = 0;
function diyaMsg() { $('#diyaMsg').textContent = lit < DN ? `${lit} / ${DN} diye jale` : '🎉 Laxmi Maa ka aashirwad hum par sada bana rahe! 🙏'; }
function buildDiyas() {
  row.innerHTML = ''; lit = 0;
  for (let i = 0; i < DN; i++) {
    const b = document.createElement('button'); b.className = 'dbtn'; b.setAttribute('aria-label', `Diya ${i + 1}`);
    b.innerHTML = DIYA_HTML; b.onclick = () => lightDiya(b); row.appendChild(b);
  }
  $('#diyaReset').hidden = true; diyaMsg();
}
function lightDiya(b) {
  if (b.classList.contains('lit')) return;
  b.classList.add('lit'); lit++;
  const r = b.getBoundingClientRect();
  if (fwOn) launch(r.left + r.width / 2, Math.max(70, r.top - rnd(90, 260)));
  diyaMsg();
  if (lit === DN) { $('#diyaReset').hidden = false; for (let i = 0; i < 16; i++) setTimeout(() => launch(), i * 280); }
}
$('#diyaReset').onclick = buildDiyas;
buildDiyas();

/* ===========================================================
   MISC: nav, share, keys, intro
   =========================================================== */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
$$('#menu .nav-link').forEach(a => a.addEventListener('click', () => bootstrap.Collapse.getInstance($('#menu'))?.hide()));

const toastEl = $('#toast'), toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2400 });
const say = t => { $('#toastBody').textContent = t; toast.show(); };
$('#bShare').onclick = async () => {
  const url = location.href;
  try {
    if (navigator.share) await navigator.share({ title: document.title, text: 'Shubh Deepawali! 🪔✨', url });
    else { await navigator.clipboard.writeText(url); say('Link copy ho gaya ✅'); }
  } catch (e) { /* user cancelled */ }
};

document.addEventListener('keydown', e => {
  if ($('#viewer').classList.contains('show')) {
    if (e.key === 'ArrowRight') $('#vNext').click(); if (e.key === 'ArrowLeft') $('#vPrev').click(); return;
  }
  if (e.target.closest('input,textarea')) return;
  if (e.key === 'ArrowRight') $('#next').click();
  if (e.key === 'ArrowLeft') $('#prev').click();
  if (e.key === ' ' && e.target === document.body) { e.preventDefault(); $('#bPlay').click(); }
});

function start() {
  if (started) return; started = true;
  const intro = $('#intro');
  $('.intro-diya').classList.add('lit'); intro.classList.add('go');
  ensureAudio(); ac && ac.resume(); startMusic();            // inside the tap = browser allows sound
  setTimeout(() => {
    intro.classList.add('hide'); document.body.classList.remove('lock');
    photoShow(P[cur]);
    restartProgress(); schedule();
  }, 1300);
}
$('#enter').addEventListener('click', start);
$('#tapHint').addEventListener('click', start);
})();
