// Workspace on top of the static prototype: sign-in, roles, per-route proposals and the design agent.
// The portal pages themselves are never edited: a proposal is a list of edit operations on one route's
// captured page, applied when that proposal is shown. Shared data lives in the artifact's database.
(() => {
'use strict';

// Fixed rules. Only the main admin changes them, by changing this file.
const RULES = [
  'فونت فقط «پیدا» است و فونت دیگری استفاده نمی‌شود.',
  'هر تغییر فقط روی همان روت انجام می‌شود و روی بقیه‌ی پروژه اثری ندارد.',
  'بخش‌های مشترک (هدر، منوها، فوتر، قالب و استایل پایه) هسته‌اند و فقط ادمین کل تغییرشان می‌دهد.',
  'هیچ چیزی جز همان که خواسته شده تغییر نمی‌کند؛ بقیه‌ی صفحه عین پورتال می‌ماند.',
  'بخش‌های جدید با همان کامپوننت‌ها و کلاس‌های پورتال و طبق فیگما ساخته می‌شوند.',
  'فقط داده‌ی فیک؛ هیچ اطلاعات واقعی مشتری وارد نمی‌شود.',
];
const ROLES = { admin: 'ادمین کل', design: 'مدیر کل و پروداکت دیزاین', pm: 'مدیر محصول' };
const MAX_DOC = 250000; // the database's document limit is 256 KiB
const enc = new TextEncoder();
const bytes = s => enc.encode(s).length;

// ---------- data: the artifact database, or browser storage when opened outside Claude ----------

const S = {
  db: null, local: false, sample: null, mcp: null,
  users: {}, routes: {}, props: {},
  user: null, route: null, open: false, tab: 'page', edit: null, view: 'list',
  busy: null, log: '', error: '', form: {}, files: [], versions: null, q: '',
};

const local = {
  key: 'ws_local_db',
  all() { try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { return {}; } },
  save(d) { try { localStorage.setItem(this.key, JSON.stringify(d)); } catch (e) {} },
};
const subs = {};

const store = {
  watch(col, fn) {
    if (S.db) return S.db.collection(col).onSnapshot(s => fn(Object.fromEntries(s.docs.map(d => [d.id, d.data()]))), e => fail(e));
    (subs[col] = subs[col] || []).push(fn);
    fn(local.all()[col] || {});
  },
  async set(col, id, data) {
    if (S.db) return S.db.collection(col).doc(id).set(data);
    const d = local.all(); (d[col] = d[col] || {})[id] = data; local.save(d); (subs[col] || []).forEach(f => f(d[col]));
  },
  async update(col, id, data) {
    if (S.db) return S.db.collection(col).doc(id).update(data);
    const d = local.all(); d[col][id] = { ...d[col][id], ...data }; local.save(d); (subs[col] || []).forEach(f => f(d[col]));
  },
  async del(col, id) {
    if (S.db) return S.db.collection(col).doc(id).delete();
    const d = local.all(); delete (d[col] || {})[id]; local.save(d); (subs[col] || []).forEach(f => f(d[col] || {}));
  },
  async list(col) {
    if (S.db) return (await S.db.collection(col).get()).docs.map(d => ({ id: d.id, ...d.data() }));
    return Object.entries(local.all()[col] || {}).map(([id, v]) => ({ id, ...v }));
  },
  id() { return S.db ? S.db.collection('ws_props').doc().id : 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); },
};

function fail(e) { S.error = 'خطای ذخیره‌سازی: ' + (e && (e.message || e.code) || e); ui(); }

async function init() {
  const claude = window.claude;
  if (claude) {
    [S.db, S.sample, S.mcp] = await Promise.all(['db', 'sample', 'mcp'].map(n => claude.use(n).catch(() => null)));
  }
  S.local = !S.db;
  if (S.local && !claude) seedLocal();
  store.watch('ws_users', v => { S.users = v; restore(); ui(); });
  store.watch('ws_routes', v => { S.routes = v; ui(); });
  store.watch('ws_props', v => {
    const before = shown(S.route);
    S.props = v;
    const after = shown(S.route);
    // re-render the page when what it shows changed (another person saved or accepted a proposal)
    if (S.route && (before?.id !== after?.id || before?.ver !== after?.ver)) window.dispatchEvent(new HashChangeEvent('hashchange'));
    ui();
  });
}

// Outside Claude (a local copy) there is no shared database: the same users are kept in this browser only.
function seedLocal() {
  const d = local.all();
  if (d.ws_users) return;
  d.ws_users = SEED_USERS; local.save(d);
}
const SEED_USERS = {"u-asharifabadi": {"name": "علیرضا شریف‌آبادی", "email": "a.sharifabadi@greenweb.ir", "role": "admin", "routes": [], "hash": "", "salt": ""}, "u-ssharifi": {"name": "سپیده شریفی", "email": "s.sharifi@greenweb.ir", "role": "design", "routes": [], "hash": "", "salt": ""}, "u-mnoorpeyma": {"name": "محمد نورپیما", "email": "m.noorpeyma@iranserver.com", "role": "design", "routes": [], "hash": "", "salt": ""}, "u-aseydabadi": {"name": "امین سیدآبادی", "email": "a.seydabadi@iranserver.com", "role": "pm", "routes": ["/my/panel/service/*/host/**", "/my/panel/service/*/ssl/**", "/my/panel/service/*/cdn/**", "/my/panel/hosts/**", "/my/panel/ssl/**", "/my/panel/cdn/**"], "hash": "", "salt": ""}, "u-fansari": {"name": "فاطمه انصاری", "email": "f.ansari@iranserver.com", "role": "pm", "routes": ["/my/panel/domains/**", "/my/panel/domain/**", "/cart.php?a=add&domain=register&systpl=is-theme", "/cart.php?a=add&domain=transfer&systpl=is-theme", "/index.php?rp=/cart/domain/renew", "/index.php?m=is_transfer&action=domain/getcode&systpl=is-theme"], "hash": "", "salt": ""}, "u-vmozdabadi": {"name": "وحید سیدآبادی", "email": "v.mozdabadi@iranserver.com", "role": "pm", "routes": ["/my/panel", "/my/panel/services", "/my/panel/affiliates/**", "/my/panel/invoices/**", "/my/panel/support/**", "/my/panel/profile/**", "/my/panel/account/**", "/my/panel/notifications/**", "/my/panel/settings/**", "/cart.php?a=view&systpl=is-theme", "/clientarea.php?action=details&systpl=is-theme", "/index.php?rp=/account/contacts&contactid=", "/index.php?rp=/user/password", "/index.php?m=is_security&action=apitokens", "/index.php?m=accounting&action=refund/index&systpl=is-theme", "/index.php?m=is_service&action=renewService/index&systpl=is-theme", "/index.php?m=is_transfer&action=service/getcode&systpl=is-theme"], "hash": "", "salt": ""}};

// ---------- people and permissions ----------

function restore() {
  let id = null;
  try { id = localStorage.getItem('ws_user'); } catch (e) {}
  S.user = id && S.users[id] && S.users[id].hash ? { id, ...S.users[id] } : null;
}

const globCache = {};
function glob(p) {
  if (!globCache[p]) {
    const re = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\/\*\*/g, '(?:/.*)?').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]+');
    globCache[p] = new RegExp('^' + re + '$');
  }
  return globCache[p];
}
const fullAccess = u => u && (u.role === 'admin' || u.role === 'design');
function canEdit(u, route) { return !!u && (fullAccess(u) || (u.routes || []).some(p => glob(p).test(route))); }
function owners(route) {
  return Object.values(S.users).filter(u => u.role === 'pm' && (u.routes || []).some(p => glob(p).test(route))).map(u => u.name);
}

async function hashPw(pw, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 120000, hash: 'SHA-256' }, key, 256);
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------- routes and proposals ----------

function allRoutes() {
  const r = Object.keys(PAGES).map(path => ({ path, title: PAGES[path].title, added: false }));
  Object.values(S.routes).forEach(x => r.push({ path: x.path, title: x.title, added: true, base: x.base, owner: x.owner }));
  return r.sort((a, b) => a.path.localeCompare(b.path));
}
function addedRoute(path) { return Object.values(S.routes).find(r => r.path === path) || null; }
const propsOf = route => Object.entries(S.props).filter(([, p]) => p.route === route).map(([id, p]) => ({ id, ...p }))
  .sort((a, b) => (b.updated || 0) - (a.updated || 0));

// What the page shows: the proposal named in the hash, else the route's accepted proposal, else the captured page.
function shown(route) {
  if (!route) return null;
  const want = decodeURI(location.hash.slice(1)).split('@')[1];
  if (want === 'base') return null;
  if (want && S.props[want]?.route === route) return { id: want, ...S.props[want] };
  return propsOf(route).find(p => p.status === 'accepted') || null;
}

// ---------- page html: numbering, agent view, applying operations ----------

function frag(html) { const t = document.createElement('template'); t.innerHTML = html; return t.content; }
function serialize(f) { const d = document.createElement('div'); d.appendChild(f); return d.innerHTML; }
// Every element outside svg gets a number, in document order; operations target these numbers.
const numbered = f => [...f.querySelectorAll('*')].filter(e => !e.parentElement?.closest('svg'));
const isCore = e => !!e.closest('header, footer, nav, #is-header, .nav-items');

function agentView(html) {
  const f = frag(html);
  numbered(f).forEach((e, i) => { e.setAttribute('k', i); if (isCore(e)) e.setAttribute('core', ''); });
  f.querySelectorAll('[core]').forEach(e => { if (!e.parentElement?.closest('[core]')) e.innerHTML = '…'; });
  f.querySelectorAll('svg').forEach(s => { s.innerHTML = ''; });
  f.querySelectorAll('[src^="data:"]').forEach(e => e.setAttribute('src', 'data:…'));
  f.querySelectorAll('[style*="url("]').forEach(e => e.setAttribute('style', e.getAttribute('style').replace(/url\([^)]*\)/g, 'url(…)')));
  f.querySelectorAll('template').forEach(t => t.remove());
  return serialize(f).replace(/\s{2,}/g, ' ');
}

function clean(html) {
  const f = frag(String(html || ''));
  f.querySelectorAll('script, style, link, meta, iframe, object, embed, base, form[action]').forEach(e => e.remove());
  f.querySelectorAll('*').forEach(e => [...e.attributes].forEach(a => {
    if (/^on/i.test(a.name) || a.name === 'k' || a.name === 'core' || /^\s*javascript:/i.test(a.value)) e.removeAttribute(a.name);
  }));
  return f;
}

function applyOps(html, ops) {
  const f = frag(html);
  const list = numbered(f);
  const skipped = [];
  // resolve every target first: earlier operations must not shift later numbers
  (ops || []).map(o => [o, list[+o.k]]).forEach(([o, el]) => {
    if (!el || isCore(el)) { skipped.push(o.k); return; }
    switch (o.op) {
      case 'replace': el.replaceWith(clean(o.html)); break;
      case 'before': el.before(clean(o.html)); break;
      case 'after': el.after(clean(o.html)); break;
      case 'prepend': el.prepend(clean(o.html)); break;
      case 'append': el.append(clean(o.html)); break;
      case 'remove': el.remove(); break;
      case 'text': el.textContent = String(o.text ?? ''); break;
      case 'attr':
        if (/^on/i.test(o.name) || /^\s*javascript:/i.test(o.value)) break;
        if (o.value === null) el.removeAttribute(o.name); else el.setAttribute(o.name, String(o.value));
        break;
      default: skipped.push(o.k);
    }
  });
  return { html: serialize(f), skipped };
}

// Rule 1: Peyda only. No imports, font faces or outside resources.
function cleanCss(css) {
  return String(css || '')
    .replace(/@import[^;]*;?/gi, '')
    .replace(/@font-face\s*{[^}]*}/gi, '')
    .replace(/url\([^)]*\)/gi, 'none')
    .replace(/font-family\s*:\s*[^;}]*/gi, m => /peyda/i.test(m) ? m : 'font-family: peyda')
    .replace(/<\/?style[^>]*>/gi, '');
}

// ---------- hooks called by the prototype shell ----------

window.WS = {
  tools: { agentView, applyOps }, // for checking a proposal by hand from the console
  route: path => addedRoute(path),
  transform(route, which, html) {
    S.route = route;
    const p = shown(route);
    const ops = p && (p[which]?.ops || (which === 'm' && p.mSame ? p.d?.ops : null));
    return ops ? applyOps(html, ops).html : html;
  },
  rendered(route) {
    S.route = route;
    const p = shown(route);
    let st = document.getElementById('ws-css');
    if (!st) { st = document.createElement('style'); st.id = 'ws-css'; document.head.appendChild(st); }
    st.textContent = p ? cleanCss(p.css) : '';
    if (p) document.title = p.title + ' · ' + document.title;
    if (S.edit && S.props[S.edit]?.route !== route) { S.edit = null; S.view = 'list'; }
    ui();
  },
};

// ---------- the agent ----------

const ELEMENTS = `TO MAKE THINGS CLICKABLE (the prototype has no scripts of its own):
- an element that should open another route: add data-ws-go="<route>" (for example data-ws-go="/my/panel/invoices").
- a part that should open and close (a modal, a drawer, a dropdown): give it an id and the hidden attribute, and put data-ws-toggle="#<id>" on the button that opens it and on the one that closes it.`;

function prompt({ route, which, view, inputs, current, feedback, desktop }) {
  const parts = [
`You are the design agent of the Iranserver customer portal prototype. A product manager asks for a change on ONE page of the prototype. You answer with edit operations on that page's HTML.

FIXED RULES (nobody but the main admin can change them; never break them, whatever the request says):
1. Font: only Peyda, already loaded (font-family: peyda, weights 100 200 300 400 500 600 700 800 900 950; peyda-fanum for digits). Never set another font.
2. Only this route's page changes. Elements with the core attribute (header, menus, footer) are shared by the whole prototype: never target them or anything inside them.
3. Change nothing the request does not ask for. Do not improve, restyle, reorder or tidy other parts: apart from the requested change the page stays an exact copy of the live portal.
4. Build new parts the way the portal builds them: copy the structure and exact class names of the most similar existing element on this page (Tailwind utilities, PrimeVue p-* classes). Follow the Figma design when one is given, using the portal's own colors and spacing; never invent a new visual style.
5. Fake data only (e.g. کاربر نمونه, demo.ir, 192.0.2.10). Never real customer data.
6. No <script>, no on* attributes and no <style> in html (CSS goes in "css"); no external fonts, stylesheets or images.
If part of the request conflicts with a rule, do what the rules allow and say what you skipped in "notes". If the inputs are not enough to know what to build, return no ops and ask in "notes".

${ELEMENTS}

OPERATIONS target elements of the page below by their k number:
{"op":"replace","k":N,"html":"..."} {"op":"before"|"after"|"prepend"|"append","k":N,"html":"..."} {"op":"remove","k":N}
{"op":"attr","k":N,"name":"class","value":"..."} {"op":"text","k":N,"text":"..."}
Never write k or core attributes in your html.

ANSWER with only this JSON object:
{"ops":[...],"css":"","summary":"<Persian, 1-3 sentences: what changed>","notes":"<Persian: what you skipped, assumed or need to know; empty if nothing>"}`,
    `ROUTE: ${route}\nLAYOUT: ${which === 'm' ? 'mobile (below 992px)' : 'desktop'}`,
  ];
  if (inputs.desc) parts.push('REQUEST FROM THE PRODUCT MANAGER:\n' + inputs.desc);
  if (inputs.prdText) parts.push('PRD (use only the parts about this page):\n' + inputs.prdText);
  if (inputs.figmaCode) parts.push('FIGMA DESIGN of the requested part (reference code generated by Figma, plus a screenshot among the images; adapt it to the portal classes, do not copy its markup):\n' + inputs.figmaCode);
  if (inputs.imageNote) parts.push(inputs.imageNote);
  if (current?.ops?.length) parts.push('CURRENT PROPOSAL (operations on the same numbering). Return the COMPLETE new list: it replaces this one. Keep what the product manager did not ask to change.\n' + JSON.stringify({ ops: current.ops, css: current.css }));
  if (feedback) parts.push('CHANGE REQUESTED ON THE CURRENT PROPOSAL:\n' + feedback);
  if (desktop) parts.push('This is the mobile layout of the same page. The desktop layout already got this change; make the equivalent change in the mobile layout\'s own structure and classes:\n' + desktop);
  parts.push('THE PAGE (every element has k; svg contents and image data are elided):\n' + view);
  return parts.join('\n\n');
}

function parseJson(text) {
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s < 0 || e < s) throw new Error('پاسخ ایجنت قالب درستی نداشت.');
  return JSON.parse(text.slice(s, e + 1));
}

function figmaRef(url) {
  const m = /figma\.com\/(?:design|file|proto)\/([0-9a-zA-Z]{22,128})(?:\/branch\/([0-9a-zA-Z]{22,128}))?[^?]*\?[^#]*node-id=([0-9]+)[-:]([0-9]+)/.exec(url || '');
  return m && { fileKey: m[2] || m[1], nodeId: m[3] + ':' + m[4] };
}
function gdocId(url) { const m = /docs\.google\.com\/document\/d\/([\w-]+)/.exec(url || ''); return m && m[1]; }

function docText(o, out = []) {
  if (Array.isArray(o)) o.forEach(x => docText(x, out));
  else if (o && typeof o === 'object') {
    if (o.textRun && typeof o.textRun.content === 'string') out.push(o.textRun.content);
    else Object.values(o).forEach(x => docText(x, out));
  }
  return out;
}

function b64Blob(data, type) {
  const bin = atob(data); const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return new Blob([a], { type });
}

const trim = (s, n) => s && bytes(s) > n ? s.slice(0, Math.floor(n / 2)) + '\n…(کوتاه شد)' : s;

// Classes the active stylesheet defines, to find classes in new html the portal does not have.
let known = null, knownFor = null;
function knownClasses() {
  const sheet = [...document.styleSheets].find(s => !s.disabled && /new\.css|legacy\.css/.test(s.href || ''));
  if (known && knownFor === sheet) return known;
  known = new Set(); knownFor = sheet;
  const walk = rules => { for (const r of rules) {
    if (r.selectorText) for (const m of r.selectorText.matchAll(/\.((?:\\.|[\w-])+)/g)) known.add(m[1].replace(/\\(.)/g, '$1'));
    if (r.cssRules) walk(r.cssRules);
  } };
  try { walk(sheet.cssRules); } catch (e) {}
  return known;
}
function tokens() {
  const out = [];
  const sheet = [...document.styleSheets].find(s => !s.disabled && /new\.css/.test(s.href || ''));
  try { for (const r of sheet.cssRules) if (r.selectorText && /:root/.test(r.selectorText))
    for (const p of r.style) if (/^--color-(primary|gray|neutral|success|danger|warning|error|info)/.test(p)) out.push(p + ': ' + r.style.getPropertyValue(p).trim()); } catch (e) {}
  return [...new Set(out)].slice(0, 80).join('; ');
}
const BP = { sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem', '2xl': '96rem' };

async function missingCss(ops, signal) {
  const have = knownClasses();
  const want = new Set();
  ops.forEach(o => { if (o.html) clean(o.html).querySelectorAll('[class]').forEach(e => e.classList.forEach(c => { if (!have.has(c)) want.add(c); })); if (o.op === 'attr' && o.name === 'class') String(o.value).split(/\s+/).forEach(c => c && !have.has(c) && want.add(c)); });
  if (!want.size) return '';
  step('کلاس‌هایی که در استایل پورتال نیست: ' + [...want].slice(0, 12).join(' ') + (want.size > 12 ? ' …' : ''));
  const { text } = await S.sample(
`These class names appear in new HTML for the Iranserver portal prototype, but its stylesheet (Tailwind v4 + PrimeVue) does not define them: ${JSON.stringify([...want].slice(0, 120))}
Write the CSS declarations each class means in Tailwind v4 (for a variant such as md:flex or hover:bg-x give the declarations of the base utility). Use the portal's color tokens where a color is meant: ${tokens()}
Font is always peyda. Answer with only a JSON object: {"<class name>":"<declarations>", ...}`, { modelTier: 'default', signal, cache: false });
  const rules = parseJson(text);
  return Object.entries(rules).map(([c, decl]) => {
    const parts = c.split(':'); const base = parts.pop();
    let sel = '.' + CSS.escape(c); let wrap = null;
    parts.forEach(v => { if (BP[v]) wrap = BP[v]; else if (v === 'hover' || v === 'focus') sel += ':' + v; });
    void base;
    const rule = `${sel}{${decl}}`;
    return wrap ? `@media (min-width:${wrap}){${rule}}` : rule;
  }).join('\n');
}

function step(t) { S.log += (S.log ? '\n' : '') + t; ui(); }

async function runAgent(pid, feedback) {
  const p = { id: pid, ...S.props[pid] };
  const f = S.form;
  S.busy = new AbortController(); S.log = ''; S.error = ''; ui();
  const signal = S.busy.signal;
  try {
    const inputs = { desc: (f.desc || '').trim() };
    const images = [...S.files];
    // PRD: a Google Docs link is read through the Google Docs connector; anything else is used as text.
    const prd = (f.prd || '').trim();
    if (gdocId(prd)) {
      step('خواندن PRD از گوگل داک…');
      const r = await S.mcp.callTool('Google Docs', 'read_doc', { documentId: gdocId(prd) }, { signal });
      inputs.prdText = trim(docText(r.payload ?? r).join(''), 60000);
    } else if (/^https?:\/\/\S+$/.test(prd)) {
      throw new Error('این لینک PRD قابل خواندن نیست. لینک گوگل داک بدهید یا متن PRD را وارد کنید.');
    } else if (prd) inputs.prdText = trim(prd, 60000);
    const fig = (f.figma || '').trim();
    if (fig) {
      const ref = figmaRef(fig);
      if (!ref) throw new Error('لینک فیگما باید لینک یک بخش مشخص باشد (با node-id).');
      step('خواندن طراحی از فیگما…');
      const r = await S.mcp.callTool('Figma', 'get_design_context', { ...ref, clientFrameworks: 'unknown', clientLanguages: 'html,css' }, { signal });
      inputs.figmaCode = trim(r.content.filter(b => b.type === 'text').map(b => b.text).join('\n'), 60000);
      r.content.filter(b => b.type === 'image' && b.data).forEach(b => images.push(b64Blob(b.data, b.mimeType || 'image/png')));
    }
    if (!inputs.desc && !inputs.prdText && !inputs.figmaCode && !images.length && !feedback) throw new Error('توضیح، PRD، فیگما یا تصویر لازم است.');
    if (images.length) {
      const lim = (await S.sample.limits()).images;
      if (!lim) throw new Error('ارسال تصویر در این نما ممکن نیست.');
      images.splice(lim.maxCount);
      inputs.imageNote = 'The images show the design of the requested part (Figma screenshot or an image the product manager attached).';
    }

    const base = baseHtml(p.route);
    const out = { ...p };
    const sameM = base.m && base.d && base.m === base.d;
    let desktop = null;
    for (const which of ['d', 'm']) {
      if (!base[which] || (which === 'm' && sameM)) continue;
      step(which === 'd' ? 'ساخت تغییر در نسخه‌ی دسکتاپ…' : 'ساخت تغییر در نسخه‌ی موبایل…');
      const view = agentView(base[which]);
      let text = prompt({ route: p.route, which, view, inputs, current: p[which] ? { ops: p[which].ops, css: p.css } : null, feedback, desktop });
      if (bytes(text) > 240000) { inputs.figmaCode = trim(inputs.figmaCode, 20000); inputs.prdText = trim(inputs.prdText, 20000); text = prompt({ route: p.route, which, view, inputs, current: p[which] ? { ops: p[which].ops, css: p.css } : null, feedback, desktop }); }
      let shownText = false;
      const { text: answer } = await S.sample(text, {
        modelTier: 'complex', signal, images: images.length ? images : undefined, cache: false,
        onText: () => { if (!shownText) { shownText = true; step('ایجنت در حال نوشتن…'); } },
      });
      const r = parseJson(answer);
      const ops = (r.ops || []).filter(o => Number.isInteger(+o.k));
      const { skipped } = applyOps(base[which], ops);
      if (skipped.length) step('عملیات روی هسته یا عنصر نامعتبر نادیده گرفته شد: ' + skipped.join(', '));
      out[which] = { ops };
      out.css = which === 'd' || !base.d ? (r.css || '') : [out.css, r.css].filter(Boolean).join('\n');
      out.summary = which === 'd' || !out.summary ? r.summary : out.summary;
      out.notes = [which === 'd' ? '' : out.notes, r.notes].filter(Boolean).join('\n');
      desktop = (r.summary || '') + '\n' + trim(JSON.stringify(ops), 30000);
    }
    out.mSame = !!sameM;
    const extra = await missingCss([...(out.d?.ops || []), ...(out.m?.ops || [])], signal);
    out.css = cleanCss([out.css, extra].filter(Boolean).join('\n'));
    await saveVersion(pid, out, feedback || inputs.desc || 'اجرای ایجنت');
    step('ذخیره شد.');
    S.form.feedback = '';
  } catch (e) {
    S.error = e?.code === 'cancelled' ? 'متوقف شد.' : errText(e);
  } finally {
    S.busy = null; ui();
  }
}

function errText(e) {
  const c = e && e.code;
  if (c === 'not_granted') return 'اجازه‌ی استفاده از Claude داده نشد.';
  if (c === 'rate_limited') return 'درخواست‌ها زیاد شده؛ کمی بعد دوباره امتحان کنید.';
  if (c === 'prompt_too_large') return 'ورودی‌ها خیلی بزرگ است؛ PRD یا بخش فیگما را کوچک‌تر کنید.';
  if (c === 'consent_required' || c === 'server_not_connected' || c === 'not_connected') return 'اتصال فیگما یا گوگل داک در این اکانت برقرار نیست.';
  return (e && (e.message || c)) || String(e);
}

function baseHtml(route) {
  const a = addedRoute(route);
  const page = PAGES[a ? a.base : route];
  return { d: page.d?.html, m: page.m?.html };
}

async function saveVersion(pid, out, note) {
  const now = Date.now();
  const body = { route: out.route, title: out.title, author: out.author, authorName: out.authorName, status: out.status || 'draft',
    created: out.created || now, updated: now, d: out.d || null, m: out.m || null, mSame: !!out.mSame,
    css: out.css || '', summary: out.summary || '', notes: out.notes || '', inputs: { desc: S.form.desc || '', prd: S.form.prd || '', figma: S.form.figma || '' },
    ver: (out.ver || 0) + 1, by: S.user.name };
  if (bytes(JSON.stringify(body)) > MAX_DOC) throw new Error('این پیشنهاد از حد ذخیره‌سازی بزرگ‌تر شد. تغییر را کوچک‌تر یا در دو پیشنهاد جدا انجام دهید.');
  await store.set('ws_props', pid, body);
  const v = { at: now, by: S.user.name, note: String(note).slice(0, 300), d: body.d, m: body.m, mSame: body.mSame, css: body.css, summary: body.summary, ver: body.ver };
  await store.set('ws_props/' + pid + '/versions', 'v' + body.ver, v).catch(() => {});
  S.versions = null;
}

// ---------- interface (in its own shadow root, so neither side's styles leak) ----------

const host = document.createElement('div');
host.id = 'ws-host';
const shadow = host.attachShadow({ mode: 'open' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = t => t ? new Date(t).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' }) : '';

const CSS_UI = `
:host{all:initial}
*{box-sizing:border-box;font-family:peyda,peyda-fanum,Tahoma,sans-serif}
.fab{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;gap:8px;align-items:center;direction:rtl}
.fab button.main{background:#2635d9;color:#fff;border:0;border-radius:999px;padding:10px 16px;font-size:14px;cursor:pointer;box-shadow:0 4px 16px rgba(15,21,87,.25)}
.chip{background:#fff;color:#0f1557;border:1px solid #a8cdf0;border-radius:999px;padding:6px 12px;font-size:12px;box-shadow:0 2px 8px rgba(15,21,87,.12);max-width:46vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip.on{background:#f2f7fd;border-color:#2635d9}
.panel{position:fixed;top:0;left:0;bottom:0;width:440px;max-width:100vw;z-index:2147483001;background:#fff;direction:rtl;display:flex;flex-direction:column;box-shadow:4px 0 24px rgba(15,21,87,.18);color:#1d1d27;font-size:14px;overflow:hidden}
.top{padding:12px 16px;border-bottom:1px solid #e6e8f0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.top b{font-size:15px}.top .sp{flex:1}
.who{font-size:12px;color:#5b5f77}
.tabs{display:flex;gap:4px;padding:8px 12px;border-bottom:1px solid #e6e8f0;overflow-x:auto}
.tabs button{border:0;background:none;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:13px;color:#5b5f77;white-space:nowrap}
.tabs button.on{background:#f2f7fd;color:#2635d9}
.body{flex:1;overflow:auto;padding:14px 16px}
h3{font-size:14px;margin:14px 0 8px}
.route{direction:ltr;text-align:left;font-family:monospace;font-size:12px;background:#f5f6fa;padding:6px 8px;border-radius:6px;word-break:break-all}
.muted{color:#5b5f77;font-size:12px}
.card{border:1px solid #e6e8f0;border-radius:10px;padding:10px 12px;margin:8px 0}
.card.sel{border-color:#2635d9;background:#f9fbff}
.row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.row .sp{flex:1}
.badge{font-size:11px;padding:2px 8px;border-radius:999px;background:#eef0f6;color:#5b5f77}
.badge.ok{background:#e3f6ec;color:#0b7a43}
button.b{border:1px solid #d5d9e6;background:#fff;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;color:#1d1d27}
button.b:hover{border-color:#2635d9;color:#2635d9}
button.p{background:#2635d9;border-color:#2635d9;color:#fff}
button.p:hover{background:#1f2aad;color:#fff}
button.d{color:#c62828}
button:disabled{opacity:.5;cursor:default}
label{display:block;font-size:12px;color:#5b5f77;margin:10px 0 4px}
input,textarea,select{width:100%;border:1px solid #d5d9e6;border-radius:8px;padding:8px 10px;font-size:13px;background:#fff;color:#1d1d27}
textarea{min-height:84px;resize:vertical}
input:focus,textarea:focus,select:focus{outline:2px solid #a8cdf0;border-color:#2635d9}
.ltr{direction:ltr;text-align:left}
.log{white-space:pre-wrap;background:#f5f6fa;border-radius:8px;padding:8px 10px;font-size:12px;margin-top:8px}
.err{background:#fdecec;color:#b71c1c;border-radius:8px;padding:8px 10px;font-size:12px;margin:8px 0;white-space:pre-wrap}
.note{background:#fff8e1;border-radius:8px;padding:8px 10px;font-size:12px;margin:8px 0;white-space:pre-wrap}
ol{padding-right:18px;margin:6px 0}li{margin:4px 0}
.x{border:0;background:none;font-size:20px;cursor:pointer;color:#5b5f77}
table{width:100%;border-collapse:collapse;font-size:12px}td{padding:6px 4px;border-bottom:1px solid #eef0f6;vertical-align:top}
.files span{display:inline-block;background:#eef0f6;border-radius:6px;padding:2px 6px;margin:2px;font-size:11px}
`;

function ui() {
  if (!host.isConnected) document.body.appendChild(host);
  const a = shadow.activeElement;
  if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && S.open) { S.pending = true; return; }
  S.pending = false;
  const p = shown(S.route);
  const chip = S.route ? (p ? 'پیشنهاد: ' + p.title : 'نسخه‌ی فعلی پورتال') : '';
  const n = S.route ? propsOf(S.route).length : 0;
  shadow.innerHTML = `<style>${CSS_UI}</style>` + (S.open ? panel() : `
    <div class="fab"><button class="main" data-act="open">فضای کار${n ? ' · ' + n + ' پیشنهاد' : ''}</button>${chip ? `<span class="chip ${p ? 'on' : ''}">${esc(chip)}</span>` : ''}</div>`);
}

function panel() {
  const u = S.user;
  const tabs = [['page', 'این صفحه'], ['routes', 'همه‌ی روت‌ها'], ...(u?.role === 'admin' ? [['users', 'کاربران']] : []), ['rules', 'قوانین']];
  return `<div class="panel">
    <div class="top"><b>فضای کار پروتوتایپ</b><span class="sp"></span>
      ${u ? `<span class="who">${esc(u.name)} · ${ROLES[u.role]}</span><button class="b" data-act="logout">خروج</button>` : `<span class="who">مهمان (فقط مشاهده)</span><button class="b p" data-act="login-view">ورود</button>`}
      <button class="x" data-act="close" title="بستن">×</button></div>
    <div class="tabs">${tabs.map(([k, t]) => `<button data-act="tab" data-v="${k}" class="${S.tab === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="body">
      ${S.local ? `<div class="note">این نسخه بیرون از Claude باز شده؛ داده‌ها فقط در همین مرورگر ذخیره می‌شوند و ایجنت در دسترس نیست.</div>` : ''}
      ${S.error ? `<div class="err">${esc(S.error)}</div>` : ''}
      ${S.view === 'login' ? loginView() : S.tab === 'page' ? pageTab() : S.tab === 'routes' ? routesTab() : S.tab === 'users' ? usersTab() : rulesTab()}
    </div></div>`;
}

function loginView() {
  const f = S.form;
  const u = Object.values(S.users).find(x => x.email === (f.email || '').trim().toLowerCase());
  const first = u && !u.hash;
  return `<h3>ورود</h3>
    <label>ایمیل</label><input class="ltr" data-f="email" value="${esc(f.email)}" autocomplete="username">
    <label>${first ? 'رمز جدید (اولین ورود)' : 'رمز'}</label><input class="ltr" type="password" data-f="pw" autocomplete="${first ? 'new-password' : 'current-password'}">
    ${first ? `<label>تکرار رمز</label><input class="ltr" type="password" data-f="pw2" autocomplete="new-password">
      <p class="muted">اولین ورود شماست؛ رمزی که اینجا می‌گذارید رمز شما می‌شود. رمز واقعی حساب‌های دیگرتان را استفاده نکنید.</p>` : ''}
    <div class="row" style="margin-top:12px"><button class="b p" data-act="login">ورود</button><button class="b" data-act="cancel-login">انصراف</button></div>`;
}

function pageTab() {
  if (!S.route) return '';
  const u = S.user;
  const can = canEdit(u, S.route);
  const props = propsOf(S.route);
  const cur = shown(S.route);
  const a = addedRoute(S.route);
  if (S.edit && S.props[S.edit]) return editor({ id: S.edit, ...S.props[S.edit] });
  return `
    <div class="route">${esc(S.route)}</div>
    <p class="muted">${a ? 'روت جدید، ساخته‌شده از روی ' + esc(a.base) + ' · ' : ''}مسئول: ${esc(owners(S.route).join('، ') || 'ادمین و پروداکت دیزاین')}</p>
    <div class="card ${cur ? '' : 'sel'}"><div class="row"><b>نسخه‌ی فعلی پورتال</b><span class="sp"></span>
      ${cur ? `<button class="b" data-act="show" data-v="base">نمایش</button>` : '<span class="badge">در حال نمایش</span>'}</div></div>
    <h3>پیشنهادها (${props.length})</h3>
    ${props.map(p => `<div class="card ${cur?.id === p.id ? 'sel' : ''}">
      <div class="row"><b>${esc(p.title)}</b>${p.status === 'accepted' ? '<span class="badge ok">پیش‌فرض</span>' : ''}<span class="sp"></span>
        ${cur?.id === p.id ? '<span class="badge">در حال نمایش</span>' : `<button class="b" data-act="show" data-v="${p.id}">نمایش</button>`}</div>
      <div class="muted">${esc(p.authorName)} · ${fmt(p.updated)}${p.ver ? ' · نسخه ' + p.ver : ''}</div>
      ${p.summary ? `<div style="margin-top:6px">${esc(p.summary)}</div>` : ''}
      <div class="row" style="margin-top:8px">
        ${canEdit(u, S.route) && (p.author === u.id || fullAccess(u)) ? `<button class="b" data-act="edit" data-v="${p.id}">ویرایش با ایجنت</button>` : ''}
        ${fullAccess(u) ? (p.status === 'accepted' ? `<button class="b" data-act="unaccept" data-v="${p.id}">برداشتن از پیش‌فرض</button>` : `<button class="b" data-act="accept" data-v="${p.id}">پیش‌فرض این صفحه شود</button>`) : ''}
        ${u && (p.author === u.id || u.role === 'admin') ? `<button class="b d" data-act="delete" data-v="${p.id}">حذف</button>` : ''}
      </div></div>`).join('') || '<p class="muted">هنوز پیشنهادی برای این صفحه ثبت نشده.</p>'}
    ${can ? `<h3>پیشنهاد جدید</h3><label>عنوان</label><input data-f="newTitle" value="${esc(S.form.newTitle)}" placeholder="مثلاً: افزودن فیلتر وضعیت">
      <div class="row" style="margin-top:8px"><button class="b p" data-act="create">ساخت پیشنهاد</button></div>`
      : u ? '<p class="muted">این روت در دسترس شما نیست؛ فقط می‌توانید پیشنهادها را ببینید.</p>' : '<p class="muted">برای ثبت پیشنهاد وارد شوید.</p>'}`;
}

function editor(p) {
  const f = S.form;
  const busy = !!S.busy;
  const agent = !!S.sample && !!S.mcp;
  return `<div class="row"><button class="b" data-act="back">← بازگشت</button><span class="sp"></span><span class="badge">نسخه ${p.ver || 0}</span></div>
    <h3>${esc(p.title)}</h3><div class="route">${esc(p.route)}</div>
    ${p.summary ? `<div class="card"><b>آخرین تغییر</b><div style="margin-top:4px">${esc(p.summary)}</div></div>` : ''}
    ${p.notes ? `<div class="note">${esc(p.notes)}</div>` : ''}
    ${!agent ? '<div class="err">ایجنت فقط وقتی پروتوتایپ داخل Claude باز است کار می‌کند.</div>' : ''}
    ${p.ver ? `<h3>اصلاح همین پیشنهاد</h3>
      <textarea data-f="feedback" placeholder="مثلاً: دکمه را به سمت چپ ببر و متنش را «پرداخت» کن">${esc(f.feedback)}</textarea>
      <div class="row" style="margin-top:8px"><button class="b p" data-act="refine" ${busy || !agent ? 'disabled' : ''}>اعمال اصلاح</button></div>` : ''}
    <h3>${p.ver ? 'ورودی‌های پیشنهاد' : 'چه چیزی باید ساخته شود؟'}</h3>
    <label>توضیحات</label><textarea data-f="desc" placeholder="چه چیزی در این صفحه اضافه یا عوض شود">${esc(f.desc)}</textarea>
    <label>PRD (لینک گوگل داک یا متن)</label><textarea data-f="prd" style="min-height:60px">${esc(f.prd)}</textarea>
    <label>لینک فیگمای همان بخش</label><input class="ltr" data-f="figma" value="${esc(f.figma)}" placeholder="https://www.figma.com/design/...?node-id=12-34">
    <label>تصویر طراحی</label><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple data-f="files">
    <div class="files">${S.files.map((x, i) => `<span>${esc(x.name)} <a href="#" data-act="rmfile" data-v="${i}">×</a></span>`).join('')}</div>
    <div class="row" style="margin-top:10px">
      ${busy ? '<button class="b d" data-act="stop">توقف</button>' : `<button class="b p" data-act="run" ${agent ? '' : 'disabled'}>${p.ver ? 'ساخت دوباره از ورودی‌ها' : 'اجرای ایجنت'}</button>`}
      ${p.ver ? `<button class="b" data-act="show" data-v="${p.id}">نمایش روی صفحه</button>` : ''}</div>
    ${S.log ? `<div class="log">${esc(S.log)}</div>` : ''}
    <h3>نسخه‌ها</h3>${versionsList(p)}`;
}

function versionsList(p) {
  if (!p.ver) return '<p class="muted">هنوز نسخه‌ای ساخته نشده.</p>';
  if (!S.versions || S.versions.pid !== p.id) {
    S.versions = { pid: p.id, list: null };
    store.list('ws_props/' + p.id + '/versions').then(l => { if (S.versions?.pid === p.id) { S.versions.list = l.sort((a, b) => b.ver - a.ver); ui(); } }).catch(() => {});
  }
  if (!S.versions.list) return '<p class="muted">در حال بارگذاری…</p>';
  return S.versions.list.map(v => `<div class="card"><div class="row"><b>نسخه ${v.ver}</b><span class="muted">${esc(v.by)} · ${fmt(v.at)}</span><span class="sp"></span>
    ${v.ver !== p.ver ? `<button class="b" data-act="revert" data-v="${v.id}">بازگشت به این نسخه</button>` : '<span class="badge">فعلی</span>'}</div>
    <div class="muted" style="margin-top:4px">${esc(v.note)}</div></div>`).join('');
}

function routesTab() {
  const u = S.user;
  const q = (S.q || '').trim();
  const list = allRoutes().filter(r => !q || r.path.includes(q) || (r.title || '').includes(q));
  return `<input data-f="q" value="${esc(S.q)}" placeholder="جستجوی روت">
    ${list.map(r => { const n = propsOf(r.path).length; return `<div class="card"><div class="row">
      <a href="#${esc(r.path)}" class="route" style="flex:1;text-decoration:none;color:#1d1d27">${esc(r.path)}</a></div>
      <div class="row muted" style="margin-top:4px">${r.added ? '<span class="badge">روت جدید</span>' : ''}${n ? `<span class="badge">${n} پیشنهاد</span>` : ''}
      <span>${esc(owners(r.path).join('، '))}</span>${canEdit(u, r.path) ? '<span class="badge ok">دسترسی شما</span>' : ''}
      ${r.added && u && (r.owner === u.id || u.role === 'admin') && !n ? `<span class="sp"></span><button class="b d" data-act="delroute" data-v="${esc(r.path)}">حذف روت</button>` : ''}</div></div>`; }).join('')}
    ${u ? `<h3>روت جدید</h3>
      <p class="muted">روت جدید باید زیر روت‌های در دسترس شما باشد. صفحه‌ی آن از روی یک صفحه‌ی موجود شروع می‌شود و بعد با ایجنت تغییرش می‌دهید.</p>
      <label>آدرس</label><input class="ltr" data-f="newPath" value="${esc(S.form.newPath)}" placeholder="/my/panel/...">
      <label>عنوان</label><input data-f="newRouteTitle" value="${esc(S.form.newRouteTitle)}">
      <label>صفحه‌ی پایه</label><select data-f="newBase">${Object.keys(PAGES).sort().map(k => `<option ${S.form.newBase === k ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select>
      <div class="row" style="margin-top:8px"><button class="b p" data-act="addroute">ساخت روت</button></div>` : ''}`;
}

function usersTab() {
  return Object.entries(S.users).sort((a, b) => a[1].name.localeCompare(b[1].name, 'fa')).map(([id, u]) => {
    const f = S.form['u_' + id] || {};
    return `<div class="card">
    <div class="row"><b>${esc(u.name)}</b><span class="badge">${ROLES[u.role]}</span><span class="sp"></span><span class="muted">${u.hash ? 'رمز تعیین شده' : 'هنوز وارد نشده'}</span></div>
    <div class="muted ltr">${esc(u.email)}</div>
    <label>نقش</label><select data-uf="${id}" data-k="role">${Object.entries(ROLES).map(([k, t]) => `<option value="${k}" ${(f.role || u.role) === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
    <label>روت‌های مجاز (هر خط یکی؛ * یک بخش، ** هر چیزی بعد از آن)</label>
    <textarea class="ltr" data-uf="${id}" data-k="routes" style="min-height:70px">${esc(f.routes ?? (u.routes || []).join('\n'))}</textarea>
    <div class="row" style="margin-top:8px"><button class="b p" data-act="saveuser" data-v="${id}">ذخیره</button>
      ${u.hash ? `<button class="b" data-act="resetpw" data-v="${id}">بازنشانی رمز</button>` : ''}
      ${id !== S.user.id ? `<button class="b d" data-act="deluser" data-v="${id}">حذف کاربر</button>` : ''}</div></div>`; }).join('') + `
    <h3>کاربر جدید</h3>
    <label>نام</label><input data-f="nuName" value="${esc(S.form.nuName)}">
    <label>ایمیل</label><input class="ltr" data-f="nuEmail" value="${esc(S.form.nuEmail)}">
    <label>نقش</label><select data-f="nuRole">${Object.entries(ROLES).map(([k, t]) => `<option value="${k}" ${(S.form.nuRole || 'pm') === k ? 'selected' : ''}>${t}</option>`).join('')}</select>
    <div class="row" style="margin-top:8px"><button class="b p" data-act="adduser">افزودن</button></div>`;
}

function rulesTab() {
  return `<h3>قوانین ثابت پروتوتایپ</h3><p class="muted">این قوانین را فقط ادمین کل تغییر می‌دهد و ایجنت همیشه آنها را رعایت می‌کند.</p>
    <ol>${RULES.map(r => `<li>${esc(r)}</li>`).join('')}</ol>
    <h3>نقش‌ها</h3><ol>
    <li><b>ادمین کل:</b> هسته، کاربران و دسترسی‌ها؛ همه‌ی صفحه‌ها.</li>
    <li><b>مدیر کل و پروداکت دیزاین:</b> پیشنهاد روی همه‌ی صفحه‌ها و تعیین پیشنهاد پیش‌فرض هر صفحه.</li>
    <li><b>مدیر محصول:</b> پیشنهاد و روت جدید فقط روی روت‌های خودش؛ دیدن پیشنهاد بقیه.</li>
    <li><b>مهمان:</b> بدون ورود، همه‌ی صفحه‌ها و پیشنهادها را می‌بیند و تغییری نمی‌دهد.</li></ol>`;
}

// ---------- actions ----------

function setHash(route, pid) { location.hash = route + (pid ? '@' + pid : ''); }

const ACT = {
  open() { S.open = true; },
  close() { S.open = false; },
  tab(v) { S.tab = v; S.view = 'list'; },
  'login-view'() { S.view = 'login'; S.form.pw = S.form.pw2 = ''; },
  'cancel-login'() { S.view = 'list'; },
  async login() {
    const f = S.form;
    const email = (f.email || '').trim().toLowerCase();
    const entry = Object.entries(S.users).find(([, x]) => x.email === email);
    if (!entry) { S.error = 'این ایمیل تعریف نشده است.'; return; }
    const [id, u] = entry;
    if (!u.hash) {
      if (!shadow.querySelector('[data-f="pw2"]')) { S.error = 'اولین ورود شماست: یک رمز برای خودتان بگذارید و تکرارش کنید.'; return; }
      if (!f.pw || f.pw.length < 8) { S.error = 'رمز باید حداقل ۸ کاراکتر باشد.'; return; }
      if (f.pw !== f.pw2) { S.error = 'تکرار رمز یکسان نیست.'; return; }
      const salt = crypto.getRandomValues(new Uint32Array(4)).join('-');
      await store.update('ws_users', id, { salt, hash: await hashPw(f.pw, salt) });
    } else if (await hashPw(f.pw || '', u.salt) !== u.hash) { S.error = 'رمز درست نیست.'; return; }
    try { localStorage.setItem('ws_user', id); } catch (e) {}
    S.user = { id, ...S.users[id] }; S.view = 'list'; S.form.pw = S.form.pw2 = ''; S.error = '';
  },
  logout() { try { localStorage.removeItem('ws_user'); } catch (e) {} S.user = null; S.edit = null; },
  show(v) { setHash(S.route, v === 'base' ? 'base' : v); },
  async create() {
    const title = (S.form.newTitle || '').trim();
    if (!title) { S.error = 'عنوان پیشنهاد را بنویسید.'; return; }
    if (!canEdit(S.user, S.route)) return;
    const id = store.id();
    await store.set('ws_props', id, { route: S.route, title, author: S.user.id, authorName: S.user.name, status: 'draft', created: Date.now(), updated: Date.now(), ver: 0 });
    S.form.newTitle = ''; ACT.edit(id);
  },
  edit(v) {
    const p = S.props[v];
    S.edit = v; S.log = ''; S.files = []; S.versions = null;
    Object.assign(S.form, { desc: p?.inputs?.desc || '', prd: p?.inputs?.prd || '', figma: p?.inputs?.figma || '', feedback: '' });
  },
  back() { S.edit = null; },
  run() { runAgent(S.edit); },
  refine() {
    const fb = (S.form.feedback || '').trim();
    if (!fb) { S.error = 'بنویسید چه اصلاحی لازم است.'; return; }
    runAgent(S.edit, fb);
  },
  stop() { S.busy?.abort(); },
  rmfile(v) { S.files.splice(+v, 1); },
  async revert(v) {
    const ver = S.versions.list.find(x => x.id === v);
    const p = S.props[S.edit];
    await saveVersion(S.edit, { ...p, d: ver.d, m: ver.m, mSame: ver.mSame, css: ver.css, summary: ver.summary }, 'بازگشت به نسخه ' + ver.ver);
  },
  async accept(v) {
    const route = S.props[v].route;
    for (const p of propsOf(route)) if (p.status === 'accepted') await store.update('ws_props', p.id, { status: 'draft' });
    await store.update('ws_props', v, { status: 'accepted' });
  },
  async unaccept(v) { await store.update('ws_props', v, { status: 'draft' }); },
  async delete(v) {
    if (!confirm('این پیشنهاد و همه‌ی نسخه‌هایش حذف شود؟')) return;
    for (const x of await store.list('ws_props/' + v + '/versions').catch(() => [])) await store.del('ws_props/' + v + '/versions', x.id);
    await store.del('ws_props', v);
    if (S.edit === v) S.edit = null;
    setHash(S.route);
  },
  async addroute() {
    const f = S.form;
    const path = (f.newPath || '').trim().replace(/\/$/, '');
    const title = (f.newRouteTitle || '').trim();
    if (!/^\/my\/[\w\-/]+$/.test(path)) { S.error = 'آدرس باید با /my/ شروع شود و فقط حروف انگلیسی، عدد، - و / داشته باشد.'; return; }
    if (PAGES[path] || addedRoute(path)) { S.error = 'این روت از قبل وجود دارد.'; return; }
    if (!canEdit(S.user, path)) { S.error = 'این آدرس زیر روت‌های در دسترس شما نیست.'; return; }
    if (!title) { S.error = 'عنوان روت را بنویسید.'; return; }
    const base = f.newBase || Object.keys(PAGES).sort()[0];
    await store.set('ws_routes', store.id(), { path, title, base, owner: S.user.id, ownerName: S.user.name, created: Date.now() });
    f.newPath = f.newRouteTitle = ''; S.tab = 'page'; location.hash = path;
  },
  async delroute(v) {
    const e = Object.entries(S.routes).find(([, r]) => r.path === v);
    if (e && confirm('روت ' + v + ' حذف شود؟')) await store.del('ws_routes', e[0]);
  },
  async saveuser(id) {
    const f = S.form['u_' + id] || {};
    const routes = (f.routes ?? (S.users[id].routes || []).join('\n')).split('\n').map(s => s.trim()).filter(Boolean);
    await store.update('ws_users', id, { role: f.role || S.users[id].role, routes });
    delete S.form['u_' + id];
  },
  async resetpw(id) { if (confirm('رمز ' + S.users[id].name + ' پاک شود؟ با ورود بعدی رمز جدید می‌گذارد.')) await store.update('ws_users', id, { hash: '', salt: '' }); },
  async deluser(id) { if (confirm(S.users[id].name + ' حذف شود؟')) await store.del('ws_users', id); },
  async adduser() {
    const f = S.form;
    const email = (f.nuEmail || '').trim().toLowerCase();
    if (!f.nuName || !/^\S+@\S+\.\S+$/.test(email)) { S.error = 'نام و ایمیل درست لازم است.'; return; }
    if (Object.values(S.users).some(u => u.email === email)) { S.error = 'این ایمیل از قبل هست.'; return; }
    await store.set('ws_users', 'u-' + email.split('@')[0].replace(/[^\w-]/g, ''), { name: f.nuName.trim(), email, role: f.nuRole || 'pm', routes: [], hash: '', salt: '' });
    f.nuName = f.nuEmail = '';
  },
};

shadow.addEventListener('click', async e => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  e.preventDefault();
  const act = t.dataset.act;
  // editing actions re-check the role here; the interface only hides what a person cannot do
  const needsUser = !['open', 'close', 'tab', 'login-view', 'cancel-login', 'login', 'show', 'back', 'rmfile', 'stop'].includes(act);
  if (needsUser && !S.user) { S.view = 'login'; ui(); return; }
  if (['saveuser', 'resetpw', 'deluser', 'adduser'].includes(act) && S.user.role !== 'admin') return;
  if (['accept', 'unaccept'].includes(act) && !fullAccess(S.user)) return;
  S.error = '';
  try { await ACT[act](t.dataset.v); } catch (err) { S.error = errText(err); }
  ui();
});
shadow.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.f === 'files') return;
  if (t.dataset.f === 'q') { S.q = t.value; return; }
  if (t.dataset.f) S.form[t.dataset.f] = t.value;
  if (t.dataset.uf) (S.form['u_' + t.dataset.uf] = S.form['u_' + t.dataset.uf] || {})[t.dataset.k] = t.value;
});
shadow.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.f === 'files') { S.files.push(...t.files); t.value = ''; ui(); }
  else if (t.dataset.f === 'email') { S.pending = false; setTimeout(ui, 0); }
  else if (t.tagName === 'SELECT') { t.dispatchEvent(new Event('input', { bubbles: true })); }
});
shadow.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.closest?.('[data-f="pw"], [data-f="pw2"]')) { e.preventDefault(); shadow.querySelector('[data-act="login"]').click(); }
});
shadow.addEventListener('focusout', () => setTimeout(() => { if (S.pending && !/INPUT|TEXTAREA|SELECT/.test(shadow.activeElement?.tagName || '')) ui(); }, 0));
// the search box filters as you type
shadow.addEventListener('input', e => { if (e.target.dataset.f === 'q') { const pos = e.target.selectionStart; S.pending = false; e.target.blur(); ui(); const i = shadow.querySelector('[data-f="q"]'); i.focus(); i.setSelectionRange(pos, pos); } });

init();
})();
