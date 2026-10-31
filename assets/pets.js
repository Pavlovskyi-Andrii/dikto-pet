// Original vector pets (v0.3). Each pet is data; renderPet() turns (pet, state) into an SVG
// string, so the same art drives the desktop pet window and the settings gallery.
// Pure: no DOM, no Electron — unit-testable in node.

const FACE = '#2A2233';

// Visual states the art can show.
export const STATES = Object.freeze([
  'idle', 'happy', 'hungry', 'angry', 'sleep', 'work', 'chew', 'peck', 'held', 'dizzy', 'walk', 'listen', 'think',
  'write', 'throw',
]);

export const STATE_LABELS = Object.freeze({
  idle: 'Сыт', happy: 'Радуется', hungry: 'Просит есть', angry: 'Злится', sleep: 'Спит', work: 'Шалит',
  chew: 'Грызёт', peck: 'Клюёт', held: 'В руках', dizzy: 'Кружится голова', walk: 'Гуляет',
  listen: 'Слушает', think: 'Думает', write: 'Записывает', throw: 'Бросает записку',
});

// What each pet writes on while you dictate, and what it throws to the caret afterwards.
export const KITS = Object.freeze({
  cat: { pad: 'notebook', fly: 'ball' },
  dog: { pad: 'notebook', fly: 'plane' },
  bunny: { pad: 'notebook', fly: 'plane' },
  bear: { pad: 'book', fly: 'plane' },
  fox: { pad: 'paper', fly: 'ball' },
  peng: { pad: 'paper', fly: 'boat' },
  ham: { pad: 'notebook', fly: 'ball' },
  panda: { pad: 'scroll', fly: 'plane' },
  frog: { pad: 'paper', fly: 'boat' },
  owl: { pad: 'book', fly: 'plane' },
  chick: { pad: 'paper', fly: 'plane' },
  octo: { pad: 'paper', fly: 'bottle' },
  axo: { pad: 'paper', fly: 'bottle' },
  troll: { pad: 'paper', fly: 'ball' },
  slime: { pad: 'paper', fly: 'bottle' },
  ghost: { pad: 'scroll', fly: 'plane' },
  robot: { pad: 'tablet', fly: 'rocket' },
  dragon: { pad: 'scroll', fly: 'scroll' },
  cloud: { pad: 'paper', fly: 'plane' },
  cactus: { pad: 'notebook', fly: 'plane' },
});
export const kitOf = (id) => KITS[id] || KITS.cat;

export const FLY_LABELS = Object.freeze({
  plane: 'самолётик', ball: 'бумажный комок', bottle: 'записка в бутылке', boat: 'бумажная лодочка', rocket: 'ракета', scroll: 'свиток',
});

// Thrown notes, drawn around (0,0) in a 40x40 box, pointing right (+x).
export const FLYERS = Object.freeze({
  plane: '<path d="M-17 -2 L17 -7 L-6 12Z" fill="#FFFFFF" stroke="#7D86B0" stroke-width="1.6" stroke-linejoin="round"/><path d="M-6 12 L-1 1 L17 -7" fill="#E4E8F7" stroke="#7D86B0" stroke-width="1.6" stroke-linejoin="round"/><path d="M-17 -2 L-1 1" stroke="#7D86B0" stroke-width="1.2"/>',
  ball: '<path d="M-12 -4 L-7 -12 L3 -13 L11 -7 L13 3 L7 11 L-3 13 L-11 8Z" fill="#FBFAF4" stroke="#8C93B8" stroke-width="1.6" stroke-linejoin="round"/><path d="M-7 -12 L-2 -3 L11 -7 M-2 -3 L-3 13 M-2 -3 L-11 8 M-2 -3 L13 3" fill="none" stroke="#B9BED6" stroke-width="1.2"/><path d="M-6 3 H4 M-5 7 H2" stroke="#5B4BFF" stroke-width="1.2" opacity=".6"/>',
  bottle: '<rect x="-13" y="-7" width="22" height="14" rx="6" fill="#BFE9FF" fill-opacity=".75" stroke="#3A9FD6" stroke-width="1.6"/><rect x="9" y="-3.5" width="6" height="7" rx="1.5" fill="#BFE9FF" stroke="#3A9FD6" stroke-width="1.4"/><rect x="14" y="-3" width="4" height="6" rx="1" fill="#B07A52"/><path d="M-9 -3 Q-2 -6 5 -3 L5 3 Q-2 6 -9 3Z" fill="#F6E7C1" stroke="#C9A86A" stroke-width="1"/><path d="M-10 -5 Q-4 -7 2 -6" stroke="#fff" stroke-width="1.5" fill="none" opacity=".8"/>',
  boat: '<path d="M-17 1 L17 1 L11 10 L-11 10Z" fill="#FFFFFF" stroke="#7D86B0" stroke-width="1.6" stroke-linejoin="round"/><path d="M-9 1 L0 -15 L9 1Z" fill="#E4E8F7" stroke="#7D86B0" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 -15 L0 1" stroke="#7D86B0" stroke-width="1.2"/><path d="M-4 -4 H3 M-5 -1 H5" stroke="#5B4BFF" stroke-width="1" opacity=".6"/>',
  rocket: '<path d="M-12 -6 L8 -6 Q18 0 8 6 L-12 6Z" fill="#E8EEF7" stroke="#7D8AA3" stroke-width="1.6" stroke-linejoin="round"/><circle cx="3" cy="0" r="3" fill="#7FF3FF" stroke="#24324D" stroke-width="1.2"/><path d="M-12 -6 L-17 -11 L-8 -6 M-12 6 L-17 11 L-8 6" fill="#FF7AA8" stroke="#7D8AA3" stroke-width="1.4" stroke-linejoin="round"/><path class="flame" d="M-13 -3 L-21 0 L-13 3Z" fill="#FFB23D"/>',
  scroll: '<rect x="-11" y="-8" width="22" height="16" fill="#F6E7C1" stroke="#B08A4A" stroke-width="1.5"/><rect x="-15" y="-10" width="6" height="20" rx="3" fill="#E9D3A0" stroke="#B08A4A" stroke-width="1.5"/><rect x="9" y="-10" width="6" height="20" rx="3" fill="#E9D3A0" stroke="#B08A4A" stroke-width="1.5"/><path d="M-1 -8 V8" stroke="#E5484D" stroke-width="3"/>',
});

// Mischief per species: which visual state it uses, which mark it leaves on the prop, which prop it prefers.
export const PRANKS = Object.freeze({
  scratch: { label: 'дерёт иконки когтями', st: 'work', mark: 'scratch' },
  chew: { label: 'грызёт кнопку «Отправить»', st: 'chew', mark: 'bite', prop: 'send' },
  peck: { label: 'клюёт иконки', st: 'peck', mark: 'dent' },
  tongue: { label: 'облизывает иконки языком', st: 'work', mark: 'lick', far: true },
  hug: { label: 'обнимает иконки щупальцами', st: 'happy', mark: null, icls: 'squeeze' },
  bubble: { label: 'пускает пузыри на иконки', st: 'happy', mark: 'wet' },
  goo: { label: 'обслюнявит иконку слизью', st: 'happy', mark: 'goo' },
  boo: { label: 'пугает иконки', st: 'work', mark: null, icls: 'scared' },
  zap: { label: 'сканирует иконки лазером', st: 'work', mark: 'glitch', far: true },
  fire: { label: 'подпаливает иконки огнём', st: 'work', mark: 'scorch', far: true },
  rain: { label: 'поливает иконки дождиком', st: 'happy', mark: 'wet' },
  poke: { label: 'колет иконки иголками', st: 'work', mark: 'hole', icls: 'deflate' },
});

export const PETS = Object.freeze([
  { id: 'cat', name: 'Мурчик', kind: 'котик', prank: 'scratch', shape: 'round', body: '#FFB36B', ol: '#C9763A', inner: '#FFD3DC', ears: 'cat', tail: 'cat', nose: 1, belly: '#FFE3C4' },
  { id: 'dog', name: 'Бублик', kind: 'пёсик', prank: 'chew', shape: 'round', body: '#F3DDBF', ol: '#B98E5E', ear: '#A8743F', ears: 'dog', tail: 'dog', nose: 1, spot: '#DDBD93' },
  { id: 'bunny', name: 'Пуша', kind: 'зайка', prank: 'chew', shape: 'round', body: '#FFFFFF', ol: '#BFB0D2', inner: '#FFC4D6', ears: 'bunny', nose: 1, noseCol: '#FF8FAB' },
  { id: 'bear', name: 'Тоша', kind: 'мишка', prank: 'scratch', shape: 'round', body: '#B07A52', ol: '#774B2C', inner: '#E6BB95', ears: 'bear', nose: 1, muzzle: '#E6BB95', belly: '#E6BB95' },
  { id: 'fox', name: 'Рыжик', kind: 'лисёнок', prank: 'scratch', shape: 'round', body: '#FF8A3D', ol: '#C25A17', inner: '#FFF1E4', ears: 'fox', tail: 'fox', nose: 1, muzzle: '#FFF1E4', belly: '#FFF1E4' },
  { id: 'peng', name: 'Пинг', kind: 'пингвинёнок', prank: 'peck', shape: 'round', body: '#3B4A66', ol: '#222D44', belly: '#FFFFFF', bellyBig: 1, beak: '#FFA53D', feet: '#FFA53D' },
  { id: 'ham', name: 'Щёчка', kind: 'хомяк', prank: 'chew', shape: 'round', body: '#F6C27A', ol: '#C38C3F', inner: '#FFD9DF', ears: 'bear', earR: 8, cheeks: '#FFE6BF', nose: 1, noseCol: '#E77A8F' },
  { id: 'panda', name: 'Бамбу', kind: 'панда', prank: 'scratch', shape: 'round', body: '#FFFFFF', ol: '#9A9AB0', ear: '#2E2E3A', ears: 'bear', patch: '#2E2E3A', scl: 6.5, nose: 1 },
  { id: 'frog', name: 'Ква', kind: 'лягушонок', prank: 'tongue', shape: 'round', body: '#7BD36A', ol: '#3F9440', ears: 'frog', scl: 8, ex: 16, eyeY: 46, fy: 60, belly: '#D4F2B9' },
  { id: 'owl', name: 'Угу', kind: 'совёнок', prank: 'peck', shape: 'tall', body: '#9C7BD8', ol: '#6A4CA8', ears: 'owl', scl: 9, ex: 13, fy: 62, beak: '#FFB23D', belly: '#D9C9F5', feet: '#FFB23D' },
  { id: 'chick', name: 'Пик', kind: 'цыплёнок', prank: 'peck', shape: 'round', body: '#FFE066', ol: '#D4A91F', ears: 'chick', beak: '#FF9A3D', feet: '#FF9A3D' },
  { id: 'octo', name: 'Буль', kind: 'осьминожка', prank: 'hug', shape: 'round', body: '#FF8FB8', ol: '#D25486', tentacles: 1, noArms: 1, spots: '#FFC2D9' },
  { id: 'axo', name: 'Аксель', kind: 'аксолотль', prank: 'bubble', shape: 'round', body: '#FFC2D8', ol: '#E07AA2', ears: 'gills', gill: '#FF6FA4' },
  { id: 'troll', name: 'Тина', kind: 'болотный тролль', prank: 'chew', shape: 'round', body: '#A3C35E', ol: '#5E7F2A', ears: 'troll', leaf: '#4FA36A', teeth: 1, nose: 1, noseCol: '#6E8F32' },
  { id: 'slime', name: 'Желе', kind: 'слизнячок', prank: 'goo', shape: 'blob', body: '#7FD4FF', ol: '#3A9FD6', shine: 1, fy: 70 },
  { id: 'ghost', name: 'Бу', kind: 'призрачок', prank: 'boo', shape: 'ghost', body: '#F6F4FF', ol: '#A9A3D6', floaty: 1, fy: 62 },
  { id: 'robot', name: 'Байт', kind: 'робот', prank: 'zap', shape: 'square', body: '#C9D3E3', ol: '#7D8AA3', ears: 'antenna', screen: '#24324D', faceCol: '#7FF3FF', ex: 11, fy: 67 },
  { id: 'dragon', name: 'Искра', kind: 'дракончик', prank: 'fire', shape: 'round', body: '#8C7CF0', ol: '#5A49C2', ears: 'horns', horn: '#FFD36B', tail: 'dragon', belly: '#D6CFFF', wings: '#B9AEFF' },
  { id: 'cloud', name: 'Пух', kind: 'облачко', prank: 'rain', shape: 'cloud', body: '#FFFFFF', ol: '#9FB6D9', floaty: 1, fy: 70 },
  { id: 'cactus', name: 'Колюч', kind: 'кактусёнок', prank: 'poke', shape: 'cactus', body: '#5FBF82', ol: '#2F8452', ears: 'flower', pot: '#E58A5B', fy: 56, ex: 10 },
]);

export const DEFAULT_PET = 'cat';
export const petById = (id) => PETS.find((p) => p.id === id) || PETS[0];

// Geometry of the SVG viewBox, shared with the renderer for anchoring and hit-testing.
// The body's rotation centre is (60,72); the box is 148 x 136 units.
export const VIEW = Object.freeze({ x: -14, y: -18, w: 148, h: 136, cx: 60, cy: 72, feet: 109 });

const SHAPES = {
  round: [['ellipse', 'cx="60" cy="72" rx="34" ry="32"']],
  tall: [['rect', 'x="30" y="36" width="60" height="70" rx="30"']],
  blob: [['path', 'd="M26 102 Q22 48 60 40 Q98 48 94 102 Q60 110 26 102Z"']],
  ghost: [['path', 'd="M30 104 L30 66 Q30 34 60 34 Q90 34 90 66 L90 104 Q82 96 75 104 Q67 96 60 104 Q53 96 45 104 Q38 96 30 104Z"']],
  square: [['rect', 'x="30" y="44" width="60" height="58" rx="14"']],
  cloud: [['circle', 'cx="40" cy="80" r="18"'], ['circle', 'cx="60" cy="64" r="24"'], ['circle', 'cx="82" cy="78" r="19"'], ['rect', 'x="30" y="74" width="62" height="26" rx="13"']],
  cactus: [['rect', 'x="40" y="30" width="40" height="66" rx="20"']],
};
const ARMS = { round: [28, 84], tall: [31, 82], square: [27, 80], ghost: [30, 78], blob: [30, 88], cloud: [24, 86], cactus: [34, 70] };
const NOFEET = { ghost: 1, blob: 1, cloud: 1, cactus: 1 };
const STAR = 'M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5Z';
const HEART = 'M0 3 C0 -1 -6 -1 -6 3 C-6 6 -2 8 0 10 C2 8 6 6 6 3 C6 -1 0 -1 0 3Z';
const BEAK_CLOSED = new Set(['idle', 'sleep', 'walk', 'work', 'listen', 'think', 'write']);
// top of the head per body shape, and pets whose head top is already taken (antenna, flower, leaf)
const HEAD_TOP = { round: 40, tall: 36, blob: 42, ghost: 34, square: 44, cloud: 40, cactus: 30 };
const HAT_AT = { antenna: [76, 40], flower: [76, 36], troll: [44, 42] };
const GROW = [0.84, 0.92, 1, 1, 1]; // body scale by level: the pet grows up

function pad(kind, x, y, O) {
  const ink = (col) => `<path class="ink i1" d="M-11 -4 H9" stroke="${col}" stroke-width="1.6" stroke-linecap="round"/><path class="ink i2" d="M-11 1 H11" stroke="${col}" stroke-width="1.6" stroke-linecap="round"/><path class="ink i3" d="M-11 6 H4" stroke="${col}" stroke-width="1.6" stroke-linecap="round"/>`;
  let g;
  switch (kind) {
    case 'book': g = `<path d="M-18 -10 Q-9 -13 0 -9 Q9 -13 18 -10 L18 11 Q9 8 0 12 Q-9 8 -18 11Z" fill="${O}"/><path d="M-16 -11 Q-8 -13 0 -9 L0 10 Q-8 7 -16 9Z M16 -11 Q8 -13 0 -9 L0 10 Q8 7 16 9Z" fill="#FFFFFF" stroke="#9AA3C7" stroke-width="1.2"/>`
      + '<path class="ink i1" d="M-13 -5 H-3" stroke="#5B4BFF" stroke-width="1.5" stroke-linecap="round"/><path class="ink i2" d="M-13 0 H-3" stroke="#5B4BFF" stroke-width="1.5" stroke-linecap="round"/><path class="ink i3" d="M3 -5 H13" stroke="#5B4BFF" stroke-width="1.5" stroke-linecap="round"/>'; break;
    case 'tablet': g = `<rect x="-16" y="-11" width="32" height="22" rx="4" fill="#24324D" stroke="#7D8AA3" stroke-width="2"/>${ink('#7FF3FF')}`; break;
    case 'scroll': g = `<rect x="-14" y="-10" width="28" height="20" fill="#F6E7C1" stroke="#B08A4A" stroke-width="1.4"/><rect x="-18" y="-12" width="6" height="24" rx="3" fill="#E9D3A0" stroke="#B08A4A" stroke-width="1.4"/><rect x="12" y="-12" width="6" height="24" rx="3" fill="#E9D3A0" stroke="#B08A4A" stroke-width="1.4"/>${ink('#7A4A1E')}`; break;
    case 'paper': g = `<path d="M-15 -11 H10 L15 -6 V11 H-15Z" fill="#FFFDF4" stroke="#9AA3C7" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 -11 V-6 H15" fill="#E9E6DA" stroke="#9AA3C7" stroke-width="1.2"/>${ink('#5B4BFF')}`; break;
    default: g = `<rect x="-16" y="-11" width="32" height="22" rx="3" fill="#FFFFFF" stroke="#8C93B8" stroke-width="1.6"/>${[-10, -5, 0, 5, 10].map((cx) => `<circle cx="${cx}" cy="-11" r="1.6" fill="#8C93B8"/>`).join('')}${ink('#5B4BFF')}`;
  }
  return `<g class="pad" transform="translate(${x} ${y}) rotate(-6)">${g}</g>`;
}

/** Accessories that show the pet's level: a curl, a bow tie, glasses, a graduation cap, a crown. */
function stageWear(c, stage, { ey, ex, my, top }, O) {
  let w = '';
  const [hx, hy] = HAT_AT[c.ears] || [60, top];
  const tilt = HAT_AT[c.ears] ? 16 : -6;
  if (stage === 0 && !HAT_AT[c.ears]) w += `<path d="M60 ${top + 1} Q53 ${top - 8} 60 ${top - 10} Q66 ${top - 9} 62 ${top - 4}" fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (stage >= 1) {
    const by = Math.min(my + 15, 100);
    const col = ['', '#E5484D', '#3D7BFF', '#7B4BFF', '#E0A100'][stage];
    w += `<g transform="translate(60 ${by})"><path d="M-9 -5 L0 0 L-9 5Z M9 -5 L0 0 L9 5Z" fill="${col}" stroke="#2A2233" stroke-width="1.2" stroke-linejoin="round"/><circle r="2.4" fill="${col}" stroke="#2A2233" stroke-width="1.2"/></g>`;
  }
  if (stage >= 2) {
    const r = (c.scl || 6) + 3.5;
    w += `<g class="glasses" fill="#FFFFFF" fill-opacity=".18" stroke="#2A2233" stroke-width="2"><circle cx="${60 - ex}" cy="${ey}" r="${r}"/><circle cx="${60 + ex}" cy="${ey}" r="${r}"/><path d="M${60 - ex + r} ${ey - 1} Q60 ${ey - 4} ${60 + ex - r} ${ey - 1}" fill="none"/></g>`;
  }
  if (stage === 3) w += `<g transform="translate(${hx} ${hy - 1}) rotate(${tilt})"><rect x="-7" y="-2" width="14" height="7" rx="1.5" fill="#2A2233"/><path d="M-16 -3 L0 -10 L16 -3 L0 4Z" fill="#2A2233" stroke="#4A4060" stroke-width="1"/><path d="M11 -4 Q15 3 13 9" fill="none" stroke="#FFD84D" stroke-width="1.6"/><circle cx="13" cy="10" r="2" fill="#FFD84D"/></g>`;
  if (stage >= 4) w += `<g transform="translate(${hx} ${hy - 4}) rotate(${tilt})"><path d="M-12 5 L-13 -8 L-6 -2 L0 -12 L6 -2 L13 -8 L12 5Z" fill="#FFD84D" stroke="#C9922A" stroke-width="1.6" stroke-linejoin="round"/><circle cx="0" cy="1" r="2.2" fill="#FF5C8A"/><circle cx="-7" cy="2" r="1.5" fill="#5BC8FF"/><circle cx="7" cy="2" r="1.5" fill="#5BC8FF"/></g>`;
  return w;
}

/**
 * SVG markup for a pet in a visual state.
 * @param {object} c  pet from PETS
 * @param {string} st one of STATES
 */
export function renderPet(c, st = 'idle', { stage = null } = {}) {
  if (!STATES.includes(st)) st = 'idle';
  const F = c.faceCol || FACE;
  const B = c.body;
  const O = c.ol;
  const fy = c.fy || 64;
  const ey = c.eyeY || fy;
  const ex = c.ex || 12;
  const my = c.my || (c.beak ? fy + 11 : fy + 13);
  const stroke = (col, w) => `stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  let back = '';
  let front = '';
  let face = '';
  let arms = '';
  let fx = '';

  // ears, tails, wings — behind the body
  if (c.tail === 'cat') back += `<path d="M88 96 Q116 98 108 68" fill="none" ${stroke(O, 10)}/><path d="M88 96 Q116 98 108 68" fill="none" ${stroke(B, 5)}/>`;
  if (c.tail === 'dog') back += `<path d="M90 94 Q106 90 102 76" fill="none" ${stroke(O, 10)}/><path d="M90 94 Q106 90 102 76" fill="none" ${stroke(B, 5)}/>`;
  if (c.tail === 'fox') back += `<ellipse cx="98" cy="86" rx="12" ry="21" transform="rotate(35 98 86)" fill="${B}" ${stroke(O, 2.5)}/><ellipse cx="108" cy="73" rx="6" ry="7" transform="rotate(35 108 73)" fill="${c.inner}"/>`;
  if (c.tail === 'dragon') back += `<path d="M88 96 Q114 104 112 80" fill="none" ${stroke(O, 11)}/><path d="M88 96 Q114 104 112 80" fill="none" ${stroke(B, 6)}/><path d="M106 80 L113 68 L119 82Z" fill="${c.horn}" ${stroke(O, 2)}/>`;
  if (c.wings) back += `<path d="M32 66 Q8 48 10 80 Q20 74 30 82Z" fill="${c.wings}" ${stroke(O, 2.5)}/><path d="M88 66 Q112 48 110 80 Q100 74 90 82Z" fill="${c.wings}" ${stroke(O, 2.5)}/>`;
  if (c.tentacles) {
    [34, 47, 60, 73, 86].forEach((x, i) => {
      const d = `M${x} 92 Q${x + (i % 2 ? 5 : -5)} 104 ${x + (i % 2 ? -2 : 2)} 113`;
      back += `<path d="${d}" fill="none" ${stroke(O, 12)}/><path d="${d}" fill="none" ${stroke(B, 7)}/>`;
    });
  }
  switch (c.ears) {
    case 'cat': back += `<path d="M33 56 L35 22 L58 42Z" fill="${B}" ${stroke(O, 2.5)}/><path d="M87 56 L85 22 L62 42Z" fill="${B}" ${stroke(O, 2.5)}/><path d="M39 48 L40 31 L51 41Z" fill="${c.inner}"/><path d="M81 48 L80 31 L69 41Z" fill="${c.inner}"/>`; break;
    case 'fox': back += `<path d="M31 58 L33 14 L58 42Z" fill="${B}" ${stroke(O, 2.5)}/><path d="M89 58 L87 14 L62 42Z" fill="${B}" ${stroke(O, 2.5)}/><path d="M38 48 L38 26 L51 41Z" fill="${c.inner}"/><path d="M82 48 L82 26 L69 41Z" fill="${c.inner}"/>`; break;
    case 'bunny': back += `<ellipse cx="45" cy="24" rx="8.5" ry="23" transform="rotate(-10 45 24)" fill="${B}" ${stroke(O, 2.5)}/><ellipse cx="75" cy="24" rx="8.5" ry="23" transform="rotate(10 75 24)" fill="${B}" ${stroke(O, 2.5)}/><ellipse cx="45" cy="25" rx="4" ry="15" transform="rotate(-10 45 25)" fill="${c.inner}"/><ellipse cx="75" cy="25" rx="4" ry="15" transform="rotate(10 75 25)" fill="${c.inner}"/>`; break;
    case 'bear': {
      const r = c.earR || 11;
      const col = c.ear || B;
      back += `<circle cx="35" cy="46" r="${r}" fill="${col}" ${stroke(O, 2.5)}/><circle cx="85" cy="46" r="${r}" fill="${col}" ${stroke(O, 2.5)}/>`;
      if (c.inner) back += `<circle cx="35" cy="46" r="${r * 0.5}" fill="${c.inner}"/><circle cx="85" cy="46" r="${r * 0.5}" fill="${c.inner}"/>`;
      break;
    }
    case 'frog': back += `<circle cx="44" cy="46" r="14" fill="${B}" ${stroke(O, 2.5)}/><circle cx="76" cy="46" r="14" fill="${B}" ${stroke(O, 2.5)}/>`; break;
    case 'owl': back += `<path d="M34 52 L30 24 L52 40Z" fill="${B}" ${stroke(O, 2.5)}/><path d="M86 52 L90 24 L68 40Z" fill="${B}" ${stroke(O, 2.5)}/>`; break;
    case 'gills':
      for (const s of [-1, 1]) {
        const bx = 60 + s * 30;
        for (const [dx, dy] of [[-12, -12], [-16, 0], [-12, 12]]) back += `<path d="M${bx} ${62 + dy * 0.4} L${bx - s * dx} ${62 + dy}" fill="none" ${stroke(c.gill, 6)}/>`;
      }
      break;
    case 'horns': back += `<path d="M42 48 L36 24 L52 42Z" fill="${c.horn}" ${stroke(O, 2.5)}/><path d="M78 48 L84 24 L68 42Z" fill="${c.horn}" ${stroke(O, 2.5)}/>`; break;
    case 'antenna': back += `<path d="M60 44 L60 28" fill="none" ${stroke(O, 3)}/><circle class="eye" cx="60" cy="25" r="5" fill="#FF7AA8" ${stroke(O, 2)}/>`; break;
    default: break;
  }

  // body: outline pass then fill pass, so compound shapes read as one silhouette
  const sh = SHAPES[c.shape];
  const bodyO = sh.map(([t, a]) => `<${t} ${a} fill="${O}" stroke="${O}" stroke-width="5"/>`).join('');
  const bodyF = sh.map(([t, a]) => `<${t} ${a} fill="${B}"/>`).join('');

  // details on top of the body
  let det = '';
  if (c.bellyBig) det += `<ellipse cx="60" cy="77" rx="25" ry="26" fill="${c.belly}"/>`;
  else if (c.belly) det += c.shape === 'tall' ? `<ellipse cx="60" cy="90" rx="20" ry="14" fill="${c.belly}"/>` : `<ellipse cx="60" cy="92" rx="19" ry="11" fill="${c.belly}"/>`;
  if (c.muzzle) det += `<ellipse cx="60" cy="${fy + 12}" rx="13" ry="9" fill="${c.muzzle}"/>`;
  if (c.cheeks) det += `<ellipse cx="38" cy="${fy + 14}" rx="11" ry="9" fill="${c.cheeks}"/><ellipse cx="82" cy="${fy + 14}" rx="11" ry="9" fill="${c.cheeks}"/>`;
  if (c.spot) det += `<ellipse cx="${60 + ex}" cy="${ey}" rx="10" ry="9" fill="${c.spot}"/>`;
  if (c.spots) det += `<circle cx="44" cy="52" r="4" fill="${c.spots}"/><circle cx="76" cy="50" r="5" fill="${c.spots}"/><circle cx="68" cy="44" r="2.5" fill="${c.spots}"/>`;
  if (c.screen) det += `<rect x="37" y="54" width="46" height="31" rx="8" fill="${c.screen}"/>`;
  if (c.shine) det += `<ellipse cx="42" cy="58" rx="5" ry="9" transform="rotate(25 42 58)" fill="#fff" opacity=".6"/><path d="M84 100 Q86 106 83 109 Q80 106 84 100Z" fill="${B}" ${stroke(O, 1.5)}/>`;
  if (c.shape === 'cactus') {
    det += `<path d="M47 40 l-4 -2 M73 44 l4 -2 M46 66 l-4 1 M74 70 l4 1 M52 86 l-3 2 M68 84 l3 2" fill="none" ${stroke(O, 1.6)}/>`;
    det += `<path d="M34 90 L86 90 L81 114 L39 114Z" fill="${c.pot}" ${stroke('#B5603A', 2.5)}/><rect x="31" y="86" width="58" height="9" rx="4" fill="${c.pot}" ${stroke('#B5603A', 2.5)}/>`;
  }
  if (c.ears === 'flower') {
    for (const a of [0, 72, 144, 216, 288]) {
      const r = (a * Math.PI) / 180;
      det += `<circle cx="${(60 + Math.sin(r) * 6).toFixed(2)}" cy="${(28 - Math.cos(r) * 6).toFixed(2)}" r="5" fill="#FF8FB8" ${stroke('#D25486', 1.5)}/>`;
    }
    det += '<circle cx="60" cy="28" r="3.5" fill="#FFD84D"/>';
  }
  if (c.ears === 'dog') front += `<ellipse cx="29" cy="60" rx="10" ry="19" transform="rotate(20 29 60)" fill="${c.ear}" ${stroke(O, 2.5)}/><ellipse cx="91" cy="60" rx="10" ry="19" transform="rotate(-20 91 60)" fill="${c.ear}" ${stroke(O, 2.5)}/>`;
  if (c.ears === 'troll') front += `<path d="M30 62 L6 50 L28 76Z" fill="${B}" ${stroke(O, 2.5)}/><path d="M90 62 L114 50 L92 76Z" fill="${B}" ${stroke(O, 2.5)}/><path d="M60 41 Q70 22 84 26 Q76 42 60 41Z" fill="${c.leaf}" ${stroke(O, 2)}/>`;
  if (c.ears === 'chick') front += `<path d="M58 41 Q52 28 59 25 M61 41 Q64 28 71 30" fill="none" ${stroke(O, 3)}/>`;
  if (!NOFEET[c.shape] && !c.tentacles) front += `<ellipse cx="45" cy="104" rx="9" ry="5" fill="${c.feet || B}" ${stroke(O, 2)}/><ellipse cx="75" cy="104" rx="9" ry="5" fill="${c.feet || B}" ${stroke(O, 2)}/>`;

  // eyes
  const ac = c.patch ? '#fff' : F;
  for (const s of [-1, 1]) {
    const x = 60 + s * ex;
    const y = ey;
    const w = c.scl ? 6.5 : 5;
    if (c.patch) face += `<ellipse cx="${x}" cy="${y + 1}" rx="9" ry="11" transform="rotate(${-s * 28} ${x} ${y})" fill="${c.patch}"/>`;
    if (st === 'happy' || st === 'chew') face += `<path d="M${x - w} ${y + 1.5} Q${x} ${y - 6} ${x + w} ${y + 1.5}" fill="none" ${stroke(ac, 3)}/>`;
    else if (st === 'sleep') face += `<path d="M${x - w} ${y} Q${x} ${y + 4.5} ${x + w} ${y}" fill="none" ${stroke(ac, 3)}/>`;
    else if (st === 'dizzy') face += `<path d="M${x} ${y} m-1 0 a1.6 1.6 0 1 1 2 1.6 a3.2 3.2 0 1 1 -4.2 -3.6 a5 5 0 1 1 6.8 5" fill="none" ${stroke(ac, 2)}/>`;
    else {
      if (c.scl) face += `<circle cx="${x}" cy="${y}" r="${c.scl}" fill="#fff" stroke="${O}" stroke-width="1.5"/>`;
      const r = st === 'hungry' || st === 'held' || st === 'listen' || st === 'throw' ? 6 : st === 'angry' ? 4.2 : 5;
      const [px, py] = st === 'think' ? [2, -2.5] : st === 'write' ? [-1, 2.5] : [0, 0];
      face += `<g class="eye"><circle cx="${x + px}" cy="${y + py}" r="${r}" fill="${F}"/><circle cx="${x + px + 1.8}" cy="${y + py - 2}" r="${st === 'held' ? 2.4 : 1.9}" fill="#fff"/>${st === 'hungry' ? `<circle cx="${x - 2}" cy="${y + 2.3}" r="1" fill="#fff"/>` : ''}</g>`;
    }
    const by = y - (c.scl ? c.scl + 4 : 9);
    if (st === 'angry' || st === 'work' || st === 'throw') face += `<path d="M${x + s * 7} ${by - 3} L${x - s * 5} ${by + (st === 'work' ? 0 : 2)}" fill="none" ${stroke(ac, st === 'work' ? 2.4 : 3)}/>`;
    if (st === 'hungry') face += `<path d="M${x + s * 7} ${by + 1} L${x - s * 5} ${by - 2}" fill="none" ${stroke(ac, 2.5)}/>`;
    if (st === 'held' || st === 'listen') face += `<path d="M${x - s * 4} ${by - 4} Q${x} ${by - 7} ${x + s * 5} ${by - 4}" fill="none" ${stroke(ac, 2.2)}/>`;
  }
  // blush
  const blush = { happy: 0.8, chew: 0.6, held: 0.7, idle: 0.4, walk: 0.4, peck: 0.4, listen: 0.5, hungry: 0.3, work: 0.3, think: 0.3, sleep: 0.35, dizzy: 0.2, angry: 0 }[st];
  if (blush) face += `<ellipse cx="${60 - ex - 10}" cy="${fy + 10}" rx="6" ry="3.5" fill="#FF8FAB" opacity="${blush}"/><ellipse cx="${60 + ex + 10}" cy="${fy + 10}" rx="6" ry="3.5" fill="#FF8FAB" opacity="${blush}"/>`;
  if (c.nose) face += `<ellipse cx="60" cy="${fy + 7}" rx="3.6" ry="2.6" fill="${c.noseCol || F}"/>`;
  // mouth or beak
  if (c.beak) {
    if (BEAK_CLOSED.has(st)) face += `<path d="M53 ${my - 3} L67 ${my - 3} L60 ${my + 4}Z" fill="${c.beak}" ${stroke(O, 1.5)}/>`;
    else face += `<path d="M53 ${my - 4} L67 ${my - 4} L60 ${my}Z" fill="${c.beak}" ${stroke(O, 1.5)}/><path class="${['hungry', 'chew', 'peck'].includes(st) ? 'chomp' : ''}" d="M55 ${my + 2} L65 ${my + 2} L60 ${my + 7}Z" fill="${c.beak}" ${stroke(O, 1.5)}/>`;
  } else {
    if (st === 'happy') face += `<path d="M51 ${my - 1} Q60 ${my + 12} 69 ${my - 1}Z" fill="${F}"/><ellipse cx="60" cy="${my + 5}" rx="4" ry="2.4" fill="#FF7A93"/>`;
    if (st === 'idle' || st === 'walk' || st === 'peck') face += `<path d="M54 ${my} Q60 ${my + 5} 66 ${my}" fill="none" ${stroke(F, 2.6)}/>`;
    if (st === 'hungry') face += `<ellipse class="chomp" cx="60" cy="${my + 2}" rx="5" ry="6" fill="${F}"/>`;
    if (st === 'chew') face += `<ellipse class="chomp" cx="60" cy="${my + 2}" rx="6.5" ry="5" fill="${F}"/>`;
    if (st === 'held') face += `<ellipse cx="60" cy="${my + 2}" rx="3.6" ry="4.6" fill="${F}"/>`;
    if (st === 'listen') face += `<ellipse class="chomp" cx="60" cy="${my + 2}" rx="3" ry="3.4" fill="${F}"/>`;
    if (st === 'think') face += `<path d="M56 ${my + 2} L65 ${my}" fill="none" ${stroke(F, 2.6)}/>`;
    if (st === 'write') face += `<path d="M54 ${my + 1} Q59 ${my + 3} 64 ${my}" fill="none" ${stroke(F, 2.4)}/><ellipse cx="65" cy="${my + 2.6}" rx="2.6" ry="2.2" fill="#FF7A93"/>`;
    if (st === 'throw') face += `<ellipse cx="60" cy="${my + 2}" rx="4.4" ry="4" fill="${F}"/>`;
    if (st === 'work') face += `<path d="M54 ${my + 1} L66 ${my + 1}" fill="none" ${stroke(F, 2.6)}/><ellipse cx="64" cy="${my + 3.6}" rx="2.6" ry="2.2" fill="#FF7A93"/>`;
    if (st === 'angry' || st === 'dizzy') face += `<path d="M52 ${my + 5} Q56 ${my} 60 ${my + 4} Q64 ${my} 68 ${my + 5}" fill="none" ${stroke(F, 2.6)}/>`;
    if (st === 'sleep') face += `<ellipse cx="60" cy="${my + 2}" rx="2.4" ry="3" fill="${F}"/>`;
    if (c.teeth && (st === 'idle' || st === 'angry' || st === 'walk')) face += `<path d="M54.5 ${my + 3} L56 ${my - 2} L57.5 ${my + 3}Z M62.5 ${my + 3} L64 ${my - 2} L65.5 ${my + 3}Z" fill="#fff" ${stroke(O, 1)}/>`;
  }

  // arms: hungry points at its mouth, mischief swipes, held flails
  const [ax, ay] = ARMS[c.shape];
  const arm = (x, rot) => `<ellipse cx="${x}" cy="${ay}" rx="6" ry="10" transform="rotate(${rot} ${x} ${ay})" fill="${B}" ${stroke(O, 2.5)}/>`;
  const armL = arm(ax, 20);
  const armR = arm(120 - ax, -20);
  if (st === 'hungry') {
    const d = `M${120 - ax - 2} ${ay + 4} Q72 ${ay + 2} 67 ${my + 2}`;
    if (!c.noArms) arms += armL;
    arms += `<g class="point"><path d="${d}" fill="none" ${stroke(O, 13)}/><path d="${d}" fill="none" ${stroke(B, 8)}/></g>`;
  } else if (st === 'work' || st === 'held') {
    arms += `<g class="swipe l" style="transform-origin:${ax + 3}px ${ay - 8}px">${armL}</g><g class="swipe r" style="transform-origin:${117 - ax}px ${ay - 8}px">${armR}</g>`;
  } else if (st === 'write') {
    // holds the pad with one arm and scribbles with the other
    const py = Math.max(86, my + 10);
    if (!c.noArms) arms += arm(ax + 4, 40);
    arms += pad(kitOf(c.id).pad, 58, py, O);
    arms += `<g class="scribble"><path d="M66 ${py + 1} L76 ${py - 13}" fill="none" ${stroke('#2A2233', 4.4)}/><path d="M66 ${py + 1} L76 ${py - 13}" fill="none" ${stroke('#5B4BFF', 2.6)}/>${c.noArms ? '' : `<ellipse cx="77" cy="${py - 9}" rx="6" ry="9" transform="rotate(-50 77 ${py - 9})" fill="${B}" ${stroke(O, 2.5)}/>`}</g>`;
  } else if (st === 'throw') {
    if (!c.noArms) arms += armL;
    arms += `<g class="toss" style="transform-origin:${120 - ax - 4}px ${ay - 6}px">${c.noArms ? '' : `<ellipse cx="${120 - ax + 6}" cy="${ay - 18}" rx="6" ry="10" transform="rotate(-150 ${120 - ax + 6} ${ay - 18})" fill="${B}" ${stroke(O, 2.5)}/>`}</g>`;
  } else if (!c.noArms) arms += armL + armR;

  // state effects
  if (st === 'hungry') fx = '<g class="bubble-g"><rect class="bubble" x="82" y="-14" width="56" height="22" rx="11"/><text class="btxt" x="110" y="1" text-anchor="middle">ам-ам!</text></g><circle class="bubble" cx="90" cy="15" r="3"/><circle class="bubble" cx="85" cy="22" r="1.8"/>';
  if (st === 'happy') fx = `<path class="heart" transform="translate(106 20)" d="${HEART}" fill="#FF5C8A"/><path class="heart h2" transform="translate(12 30) scale(.8)" d="${HEART}" fill="#FF5C8A"/>`;
  if (st === 'sleep') fx = '<text class="z" x="94" y="26" font-size="11">z</text><text class="z z2" x="106" y="10" font-size="15">Z</text>';
  if (st === 'angry') fx = `<g class="vein" transform="translate(104 18)" fill="none" ${stroke('#E5484D', 3)}><path d="M-8 -3 Q-3 -3 -3 -8"/><path d="M3 -8 Q3 -3 8 -3"/><path d="M8 3 Q3 3 3 8"/><path d="M-3 8 Q-3 3 -8 3"/></g><path class="drop" d="M20 40 Q14 50 20 53 Q26 50 20 40Z" fill="#7CC8FF" stroke="#3A9FD6" stroke-width="1.2"/>`;
  if (st === 'dizzy') fx = `<g class="orbit">${[[36, 22], [84, 22], [60, 6]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="${STAR}" fill="#FFD84D" stroke="#C9922A" stroke-width="1"/>`).join('')}</g>`;
  if (st === 'held') fx = '<path class="drop" d="M98 36 Q92 46 98 49 Q104 46 98 36Z" fill="#7CC8FF" stroke="#3A9FD6" stroke-width="1.2"/>';
  if (st === 'listen') fx = `<g class="waves" fill="none" ${stroke('#5B4BFF', 3)}><path d="M104 46 q7 9 0 18"/><path class="w2" d="M112 40 q12 15 0 30"/></g>`;
  if (st === 'write') fx = `<g class="waves" fill="none" ${stroke('#5B4BFF', 2.6)}><path d="M104 40 q6 8 0 16"/><path class="w2" d="M111 35 q10 13 0 26"/></g>`;
  if (st === 'throw') fx = `<g class="whoosh" fill="none" ${stroke('#9AA3C7', 2.4)}><path d="M102 30 q10 -6 18 -2"/><path d="M100 40 q12 -4 20 2"/></g>`;
  if (st === 'think') fx = '<circle class="dot" cx="96" cy="14" r="3.2" fill="#6B6688"/><circle class="dot d2" cx="106" cy="8" r="3.2" fill="#6B6688"/><circle class="dot d3" cx="116" cy="2" r="3.2" fill="#6B6688"/>';

  let wear = '';
  let grow = '';
  if (Number.isInteger(stage) && stage >= 0) {
    const lv = Math.min(stage, GROW.length - 1);
    wear = stageWear(c, lv, { ey, ex, my, top: HEAD_TOP[c.shape] }, O);
    if (GROW[lv] !== 1) grow = ` transform="translate(60 ${VIEW.feet}) scale(${GROW[lv]}) translate(-60 ${-VIEW.feet})"`;
  }
  // the pad and pen go in front of the bow tie
  const [under, over] = st === 'write' ? [wear, arms] : [arms, wear];
  return `<svg viewBox="${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}" class="pet st-${st}${c.floaty ? ' floaty' : ''}" role="img" aria-label="${c.name}, ${STATE_LABELS[st].toLowerCase()}">`
    + '<ellipse class="shadow" cx="60" cy="114" rx="30" ry="4.5"/>'
    + `<g class="lift"><g class="bob"><g${grow}>${back}${bodyO}${bodyF}${det}${front}<g>${face}</g>${under}${over}</g></g></g>${fx}</svg>`;
}

// ---- props the pet plays with (48x48 glyphs) -------------------------------------------
export const PROPS = Object.freeze({
  folder: { label: 'Проекты', svg: '<path d="M4 12 Q4 8 8 8 L19 8 L23 13 L40 13 Q44 13 44 17 L44 38 Q44 42 40 42 L8 42 Q4 42 4 38Z" fill="#FFC94D" stroke="#C9922A" stroke-width="2"/><path d="M4 19 L44 19" stroke="#C9922A" stroke-width="2"/>' },
  notes: { label: 'Заметки', svg: '<rect x="9" y="5" width="30" height="38" rx="4" fill="#fff" stroke="#9AA3C7" stroke-width="2"/><path d="M15 15 H33 M15 22 H33 M15 29 H27" stroke="#9AA3C7" stroke-width="2.4" stroke-linecap="round"/>' },
  music: { label: 'Музыка', svg: '<rect x="4" y="4" width="40" height="40" rx="11" fill="#B07CFF"/><path d="M20 32 V14 L34 11 V29" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round"/><circle cx="17" cy="32" r="4.5" fill="#fff"/><circle cx="31" cy="29" r="4.5" fill="#fff"/>' },
  chat: { label: 'Чат', svg: '<path d="M6 12 Q6 6 12 6 H36 Q42 6 42 12 V28 Q42 34 36 34 H20 L11 42 V34 Q6 34 6 28Z" fill="#4DA3FF" stroke="#2A74C9" stroke-width="2"/><circle cx="17" cy="20" r="2.6" fill="#fff"/><circle cx="24" cy="20" r="2.6" fill="#fff"/><circle cx="31" cy="20" r="2.6" fill="#fff"/>' },
  trash: { label: 'Корзина', svg: '<path d="M12 14 H36 L33 42 H15Z" fill="#C9D3E3" stroke="#7D8AA3" stroke-width="2" stroke-linejoin="round"/><rect x="9" y="9" width="30" height="5" rx="2.5" fill="#7D8AA3"/><path d="M20 20 V36 M28 20 V36" stroke="#7D8AA3" stroke-width="2" stroke-linecap="round"/>' },
  send: { label: 'Отправить', svg: '<rect x="1" y="10" width="46" height="28" rx="14" fill="#5B4BFF"/><path d="M14 24 L34 16 L28 33 L24 26Z" fill="#fff"/>' },
});

export const MARKS = Object.freeze({
  scratch: '<path d="M10 12 L28 38 M17 9 L35 35 M24 6 L42 32" stroke="#2A2233" stroke-width="4.5" stroke-linecap="round" opacity=".3"/><path d="M10 12 L28 38 M17 9 L35 35 M24 6 L42 32" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
  bite: '<path d="M37 10 a5 5 0 0 0 10 0 M28 10 a4.5 4.5 0 0 0 9 0" fill="#fff" stroke="#2A2233" stroke-width="1.5" opacity=".9"/><circle cx="42" cy="12" r="1.4" fill="#2A2233"/>',
  dent: '<circle cx="16" cy="18" r="2.4" fill="#2A2233" opacity=".45"/><circle cx="28" cy="26" r="2.4" fill="#2A2233" opacity=".45"/><circle cx="22" cy="34" r="2" fill="#2A2233" opacity=".45"/><circle cx="34" cy="16" r="2" fill="#2A2233" opacity=".45"/>',
  lick: '<path d="M6 22 Q24 8 42 24" stroke="#FF8FB8" stroke-width="7" stroke-linecap="round" fill="none" opacity=".55"/><circle cx="36" cy="14" r="2" fill="#fff"/>',
  wet: '<path d="M14 8 Q10 15 14 17 Q18 15 14 8Z M32 14 Q28 21 32 23 Q36 21 32 14Z M22 28 Q18 35 22 37 Q26 35 22 28Z" fill="#5AB4F0" opacity=".85"/>',
  goo: '<path d="M2 8 Q24 -2 46 8 L46 16 Q42 28 38 16 Q32 32 27 16 Q19 26 15 16 Q8 24 2 16Z" fill="#7FD4FF" opacity=".85"/><ellipse cx="14" cy="9" rx="4" ry="2" fill="#fff" opacity=".7"/>',
  glitch: '<rect x="-4" y="12" width="52" height="5" fill="#7FF3FF" opacity=".85"/><rect x="6" y="27" width="44" height="4" fill="#FF5CC8" opacity=".75"/><rect x="-2" y="36" width="20" height="3" fill="#7FF3FF" opacity=".8"/>',
  scorch: '<ellipse cx="26" cy="27" rx="19" ry="16" fill="#2A2233" opacity=".42"/><path d="M18 8 Q14 2 20 -4 M30 6 Q26 0 32 -6" stroke="#8A8A9A" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>',
  hole: '<circle cx="14" cy="14" r="1.8" fill="#2A2233"/><circle cx="30" cy="20" r="1.8" fill="#2A2233"/><circle cx="20" cy="32" r="1.8" fill="#2A2233"/><circle cx="36" cy="34" r="1.8" fill="#2A2233"/>',
});
