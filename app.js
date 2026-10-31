// Landing page logic: theme/lang, latest-release download links, live pet demo, gallery.
// The pets are the app's own renderer (assets/pets.js is copied from src/pets/catalog.js).
import { PETS, renderPet, petById, kitOf, FLYERS, STATE_LABELS } from './assets/pets.js';
import { VERSION } from './assets/meta.js';

const REPO = 'Pavlovskyi-Andrii/dikto-pet';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;
const lang = () => root.dataset.lang || 'ru';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const store = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
const load = (k) => { try { return localStorage.getItem(k); } catch { return null; } };

// ---------------------------------------------------------------- theme + language
$('#theme-btn').addEventListener('click', () => {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  store('theme', root.dataset.theme);
});
$('#lang-btn').addEventListener('click', () => {
  const l = lang() === 'ru' ? 'en' : 'ru';
  root.dataset.lang = l;
  root.lang = l;
  store('lang', l);
  renderStates();
  renderGallery();
  renderLevels();
});

// ---------------------------------------------------------------- downloads
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
$$('.dl').forEach((a) => {
  const mine = (a.dataset.os === 'mac') === isMac;
  a.classList.toggle('recommended', mine);
  a.classList.toggle('btn-primary', mine);
  a.classList.toggle('btn-ghost', !mine);
});
$$('.ver').forEach((v) => { v.textContent = `v${VERSION}`; });

fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
  .then((r) => (r.ok ? r.json() : null))
  .then((rel) => {
    if (!rel || !Array.isArray(rel.assets)) return;
    const pick = (re) => rel.assets.find((x) => re.test(x.name));
    const mb = (x) => `${Math.round(x.size / 1048576)} MB`;
    const win = pick(/Setup.*\.exe$/i);
    const mac = pick(/\.dmg$/i);
    const portable = pick(/portable.*\.exe$/i);
    const tag = rel.tag_name || `v${VERSION}`;
    $$('.ver').forEach((v) => { v.textContent = tag; });
    if (win) {
      $('.dl[data-os="win"]').href = win.browser_download_url;
      $('[data-meta="win"]').textContent = `${tag} · Windows 10/11 x64 · ${mb(win)}`;
    }
    if (mac) {
      $('.dl[data-os="mac"]').href = mac.browser_download_url;
      $('[data-meta="mac"]').textContent = `${tag} · Apple Silicon · ${mb(mac)}`;
    }
    if (portable) {
      const p = document.createElement('a');
      p.href = portable.browser_download_url;
      p.innerHTML = '<span lang="ru">Портативная версия .exe (без установки)</span><span lang="en">Portable .exe (no install)</span>';
      $('#release-line').prepend(p, ' · ');
    }
  })
  .catch(() => { /* offline or rate-limited: buttons keep the releases-page link */ });

// ---------------------------------------------------------------- pet choice
let pet = petById(load('pet') || 'cat');
const brand = $('#brand-pet');
const drawBrand = () => { brand.innerHTML = renderPet(pet, 'idle'); };
drawBrand();

// ---------------------------------------------------------------- live demo
const stage = $('#stage');
const stagePet = $('#stage-pet');
const docText = $('#doc-text');
const caret = $('#caret');
const say = $('#say');
const flyer = $('#flyer');
const keycap = $('#keycap');
const foodPop = $('#food-pop');

const PHRASES = {
  ru: [
    'Привет! Давай созвонимся завтра в десять, я подготовлю макеты.',
    'Скинь, пожалуйста, ссылку на документ — посмотрю вечером.',
    'Кстати, это я не печатаю: говорю голосом, а записку приносит питомец 🙂',
  ],
  en: [
    'Hi! Let’s jump on a call tomorrow at ten, I’ll have the mockups ready.',
    'Could you send me the doc link? I’ll take a look tonight.',
    'By the way, I’m not typing this: I’m talking, and my pet delivers the note 🙂',
  ],
};
let petState = '';
function setPet(st) {
  petState = st;
  stagePet.innerHTML = renderPet(pet, st);
}
setPet('idle');

let token = 0; // bumps to cancel the auto loop
let resumeTimer = null;
let phraseIx = 0;
let spoken = []; // words said in the current take
let held = false;
let flying = false;

const phrase = () => PHRASES[lang()][phraseIx % PHRASES[lang()].length];

function showSay() {
  say.hidden = false;
  say.innerHTML = `<span class="wave"><i></i><i></i><i></i><i></i></span><span class="said">${spoken.join(' ') || '…'}</span>`;
}

function press() {
  held = true;
  spoken = [];
  keycap.classList.add('down');
  setPet('listen');
  showSay();
  setTimeout(() => { if (held && petState === 'listen') setPet('write'); }, 500);
}

/** Say the current phrase word by word while the key is held (or until it ends). */
async function speak(my, auto) {
  const words = phrase().split(' ');
  for (const w of words) {
    await sleep(170 + Math.random() * 120);
    if (!held || (auto && my !== token)) return;
    spoken.push(w);
    showSay();
  }
}

async function release() {
  if (!held) return;
  held = false;
  keycap.classList.remove('down');
  say.hidden = true;
  const words = spoken.slice();
  if (!words.length) { setPet('idle'); return; }
  phraseIx += 1;
  setPet('throw');
  await sleep(230);
  await fly(words.length);
  land(words);
}

function fly(nWords) {
  flying = true;
  const s = stage.getBoundingClientRect();
  const p = stagePet.getBoundingClientRect();
  const c = caret.getBoundingClientRect();
  // the stage pet is mirrored (faces the window), so its throwing hand is on the left
  const from = { x: p.left - s.left + p.width * 0.18, y: p.top - s.top + p.height * 0.32 };
  const to = { x: c.left - s.left + 2, y: c.top - s.top + c.height / 2 };
  const ctrl = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 90 };
  const kind = kitOf(pet.id).fly;
  flyer.innerHTML = `<svg viewBox="-22 -22 44 44">${FLYERS[kind]}</svg>`;
  flyer.hidden = false;
  const dur = 900 + Math.min(nWords, 14) * 25; // like the app: flight ~ recognition time
  const t0 = performance.now();
  return new Promise((done) => {
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const q = (a, b, cc) => (1 - e) ** 2 * a + 2 * (1 - e) * e * b + e * e * cc;
      const x = q(from.x, ctrl.x, to.x);
      const y = q(from.y, ctrl.y, to.y);
      const dx = 2 * (1 - e) * (ctrl.x - from.x) + 2 * e * (to.x - ctrl.x);
      const dy = 2 * (1 - e) * (ctrl.y - from.y) + 2 * e * (to.y - ctrl.y);
      const a = (Math.atan2(dy, dx) * 180) / Math.PI;
      const spin = kind === 'ball' ? `rotate(${t * 720}deg)` : (dx < 0 ? `scale(-1,1) rotate(${180 - a}deg)` : `rotate(${a}deg)`);
      const sc = 1 - 0.35 * e;
      flyer.style.transform = `translate(${x - 22}px, ${y - 22}px) scale(${sc}) ${spin}`;
      if (t < 1) requestAnimationFrame(step);
      else { flyer.hidden = true; flying = false; done(); }
    };
    requestAnimationFrame(step);
  });
}

function land(words) {
  $$('.doc .new').forEach((n) => n.classList.add('done'));
  const span = document.createElement('span');
  span.className = 'new';
  span.textContent = (docText.textContent ? ' ' : '') + words.join(' ');
  docText.append(span);
  requestAnimationFrame(() => setTimeout(() => span.classList.add('done'), 900));
  foodPop.hidden = false;
  foodPop.textContent = lang() === 'ru' ? `+${words.length} слов · ням!` : `+${words.length} words · yum!`;
  foodPop.style.animation = 'none';
  void foodPop.offsetWidth; // restart the CSS animation
  foodPop.style.animation = '';
  setPet('happy');
  setTimeout(() => { if (!held && petState === 'happy') setPet('idle'); }, 1500);
}

async function autoLoop() {
  const my = ++token;
  while (my === token) {
    await sleep(1700);
    if (my !== token) return;
    if (docText.children.length >= 3) {
      docText.style.transition = 'opacity .5s';
      docText.style.opacity = '0';
      await sleep(550);
      docText.textContent = '';
      docText.style.opacity = '1';
      if (my !== token) return;
    }
    press();
    await speak(my, true);
    if (my !== token) return;
    await sleep(350);
    await release();
  }
}

// manual: hold the on-screen key, or the real Right Ctrl / Right Option
function manualDown() {
  if (held || flying) return;
  token += 1; // stop the auto loop
  clearTimeout(resumeTimer);
  if (docText.children.length >= 3) docText.textContent = '';
  press();
  speak(token, false);
}
async function manualUp() {
  if (!held) return;
  await release();
  clearTimeout(resumeTimer);
  resumeTimer = setTimeout(autoLoop, 6000);
}
keycap.addEventListener('pointerdown', (e) => { e.preventDefault(); keycap.setPointerCapture(e.pointerId); manualDown(); });
keycap.addEventListener('pointerup', manualUp);
keycap.addEventListener('pointercancel', manualUp);
keycap.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); manualDown(); } });
keycap.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') manualUp(); });
const HOT = new Set(['ControlRight', 'AltRight']);
addEventListener('keydown', (e) => { if (HOT.has(e.code) && !e.repeat && stageVisible) manualDown(); });
addEventListener('keyup', (e) => { if (HOT.has(e.code)) manualUp(); });
stagePet.addEventListener('click', () => { if (!held && !flying) { setPet('happy'); setTimeout(() => { if (petState === 'happy' && !held) setPet('idle'); }, 1400); } });

let stageVisible = true;
new IntersectionObserver(([en]) => { stageVisible = en.isIntersecting; }).observe(stage);
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) autoLoop();
else docText.textContent = PHRASES[lang()][0];

// ---------------------------------------------------------------- gallery
const STATE_EN = {
  idle: 'Full', happy: 'Happy', hungry: 'Hungry', angry: 'Angry', sleep: 'Asleep', work: 'Mischief', chew: 'Chewing',
  peck: 'Pecking', held: 'Picked up', dizzy: 'Dizzy', walk: 'Walking', listen: 'Listening', think: 'Thinking',
  write: 'Writing', throw: 'Throwing a note',
};
const SHOWN = ['idle', 'listen', 'write', 'think', 'happy', 'hungry', 'sleep', 'work', 'angry', 'held'];
let galleryState = 'write';

function renderStates() {
  const box = $('#states');
  box.innerHTML = '';
  for (const st of SHOWN) {
    const b = document.createElement('button');
    b.type = 'button';
    b.role = 'tab';
    b.textContent = lang() === 'ru' ? STATE_LABELS[st] : STATE_EN[st];
    b.setAttribute('aria-selected', String(st === galleryState));
    b.addEventListener('click', () => { galleryState = st; renderStates(); renderGallery(); });
    box.append(b);
  }
}

const KIND_EN = {
  cat: 'kitten', dog: 'puppy', bunny: 'bunny', bear: 'bear cub', fox: 'fox kit', peng: 'penguin', ham: 'hamster', panda: 'panda',
  frog: 'froggy', owl: 'owlet', chick: 'chick', octo: 'octopus', axo: 'axolotl', troll: 'swamp troll', slime: 'slime',
  ghost: 'ghostie', robot: 'robot', dragon: 'dragon', cloud: 'cloud', cactus: 'cactus',
};

function renderGallery() {
  const g = $('#gallery');
  g.innerHTML = '';
  for (const p of PETS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `pet-card${p.id === pet.id ? ' sel' : ''}`;
    b.innerHTML = `${renderPet(p, galleryState)}<b>${p.name}</b><small>${lang() === 'ru' ? p.kind : KIND_EN[p.id] || p.kind}</small>`;
    b.title = lang() === 'ru' ? 'Сделать питомцем в демо' : 'Use in the demo';
    b.addEventListener('click', () => {
      pet = p;
      store('pet', p.id);
      drawBrand();
      if (!held && !flying) setPet('happy');
      renderGallery();
      renderLevels();
      stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    g.append(b);
  }
}

const LEVELS = [
  ['Малыш', 'Baby', 0], ['Ученик', 'Student', 2000], ['Знаток', 'Expert', 5000], ['Мастер', 'Master', 10000], ['Легенда', 'Legend', 25000],
];
function renderLevels() {
  const row = $('#levels');
  row.innerHTML = '';
  LEVELS.forEach(([ru, en, words], i) => {
    const d = document.createElement('div');
    d.className = 'level';
    const n = words.toLocaleString(lang() === 'ru' ? 'ru-RU' : 'en-US');
    d.innerHTML = `${renderPet(pet, i === 4 ? 'happy' : 'idle', { stage: i })}<b>${lang() === 'ru' ? ru : en}</b><small>${i ? `${n} ${lang() === 'ru' ? 'слов' : 'words'}` : (lang() === 'ru' ? 'старт' : 'start')}</small>`;
    row.append(d);
  });
}

renderStates();
renderGallery();
renderLevels();

// ---------------------------------------------------------------- footer + reveal
const foot = $('#foot-pets');
const few = [...PETS].sort(() => Math.random() - 0.5).slice(0, 7);
foot.innerHTML = few.map((p, i) => renderPet(p, ['idle', 'sleep', 'happy', 'think'][i % 4])).join('');

const io = new IntersectionObserver((ents) => {
  for (const en of ents) if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
}, { threshold: 0.12 });
$$('.card, .diagram, .pet-card, .svc, .person, .levels').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
