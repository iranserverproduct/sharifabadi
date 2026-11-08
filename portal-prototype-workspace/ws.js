// Workspace on top of the static prototype: sign-in, roles, per-route changes with versions, approval, and the design agent.
// The captured portal pages are never edited. Each route has a "main design": the captured page plus every approved
// change, kept as numbered versions. A product manager's change is a list of edit operations on the main design version
// it started from; each agent run saves a new version of it. Only the route's product manager (or the main admin)
// approves a version onto the main design. Shared data lives in the artifact's database.
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
  'هر تغییر فقط بعد از تأیید نهایی مدیر محصولِ آن حوزه (یا ادمین کل) روی طرح اصلی می‌آید.',
];
const ROLES = { admin: 'ادمین کل', design: 'مدیر کل و پروداکت دیزاین', pm: 'مدیر محصول' };
const STATUS = { draft: 'پیش‌نویس', pending: 'منتظر تأیید', approved: 'تأییدشده', rejected: 'ردشده' };
const MAX_DOC = 250000; // the database's document limit is 256 KiB
const enc = new TextEncoder();
const bytes = s => enc.encode(s).length;

// ---------- data: the artifact database, or browser storage when opened outside Claude ----------

const S = {
  db: null, local: false, sample: null, mcp: null,
  users: {}, routes: {}, props: {}, main: {},
  user: null, route: null, open: false, tab: 'page', edit: null, view: 'list',
  busy: null, log: '', error: '', form: {}, files: [], versions: null, mainVersions: null, q: '', who: '',
  armed: null, hl: false, sig: '',
};
try { S.hl = localStorage.getItem('ws_hl') === '1'; } catch (e) {}

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
  async get(col, id) {
    if (S.db) { const d = await S.db.collection(col).doc(id).get(); return d.exists ? d.data() : null; }
    return (local.all()[col] || {})[id] || null;
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
  store.watch('ws_main', v => { S.main = v; S.mainVersions = null; refresh(); });
  store.watch('ws_props', v => { S.props = v; refresh(); });
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
const ownsRoute = (u, route) => (u.routes || []).some(p => glob(p).test(route));
// who may start a change on a route
function canEdit(u, route) { return !!u && (fullAccess(u) || ownsRoute(u, route)); }
// who may approve onto the main design: the route's product manager, or the main admin anywhere
function canApprove(u, route) { return !!u && (u.role === 'admin' || (u.role === 'pm' && ownsRoute(u, route))); }
const canChange = (u, p) => !!u && (p.author === u.id || u.role === 'admin');
function owners(route) {
  return Object.values(S.users).filter(u => u.role === 'pm' && ownsRoute(u, route)).map(u => u.name);
}
const approvers = route => owners(route).join('، ') || ROLES.admin;

async function hashPw(pw, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 120000, hash: 'SHA-256' }, key, 256);
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------- routes, main designs and changes ----------

function allRoutes() {
  const r = Object.keys(PAGES).map(path => ({ path, title: PAGES[path].title, added: false }));
  Object.values(S.routes).forEach(x => r.push({ path: x.path, title: x.title, added: true, base: x.base, owner: x.owner }));
  return r.sort((a, b) => a.path.localeCompare(b.path));
}
function addedRoute(path) { return Object.values(S.routes).find(r => r.path === path) || null; }
const propsOf = route => Object.entries(S.props).filter(([, p]) => p.route === route).map(([id, p]) => ({ id, ...p }))
  .sort((a, b) => (b.updated || 0) - (a.updated || 0));
// database ids cannot hold a route's characters: name each route's main design by its bytes in hex
const rid = route => 'r' + [...enc.encode(route)].map(b => b.toString(16).padStart(2, '0')).join('');
const mainVer = route => S.main[rid(route)]?.ver || 0;
const stale = p => p.status !== 'approved' && p.ver > 0 && (p.baseVer || 0) !== mainVer(p.route);

function captured(route) {
  const a = addedRoute(route);
  const page = PAGES[a ? a.base : route];
  const d = page.d?.html, m = page.m?.html;
  return { d, m: m === d ? null : m, mSame: !m || m === d, css: '' };
}

// Main design versions and older change versions are loaded on demand and kept here.
const cache = {};
const loading = {};
function load(key, fn) {
  if (key in cache) return cache[key];
  if (!loading[key]) loading[key] = fn().then(v => { cache[key] = v; refresh(true); }, e => { delete loading[key]; fail(e); });
  return undefined;
}
// the main design of a route at a version (0 = the captured page); undefined while loading
function mainAt(route, ver) {
  if (!ver) return captured(route);
  return load('m:' + rid(route) + ':' + ver, () => store.get('ws_main/' + rid(route) + '/versions', 'v' + ver));
}
async function mainAtAsync(route, ver) {
  if (!ver) return captured(route);
  const k = 'm:' + rid(route) + ':' + ver;
  if (!(k in cache)) cache[k] = await store.get('ws_main/' + rid(route) + '/versions', 'v' + ver);
  return cache[k];
}
// a change at a version: the latest is on the change itself, older ones in its versions
function propAt(pid, ver) {
  const p = S.props[pid];
  if (!p) return null;
  if (!ver || ver === p.ver) return p;
  return load('p:' + pid + ':' + ver, () => store.get('ws_props/' + pid + '/versions', 'v' + ver));
}
async function propAtAsync(pid, ver) {
  const p = S.props[pid];
  if (ver === p.ver) return p;
  const k = 'p:' + pid + ':' + ver;
  if (!(k in cache)) cache[k] = await store.get('ws_props/' + pid + '/versions', 'v' + ver);
  return cache[k];
}

// What the page shows, from the hash after "@": nothing = the main design; base = the captured portal page;
// m~N = main design version N; p~ID~N = version N of a change (latest without ~N).
function view(route) {
  const want = (decodeURI(location.hash.slice(1)).split('@')[1] || '');
  const [kind, a, b] = want.split('~');
  if (kind === 'base') return { kind: 'base' };
  if (kind === 'm' && +a > 0 && +a <= mainVer(route)) return { kind: 'main', ver: +a };
  if (kind === 'p' && S.props[a]?.route === route) {
    const p = S.props[a];
    return { kind: 'prop', pid: a, ver: Math.min(+b || p.ver, p.ver) };
  }
  return { kind: 'main', ver: mainVer(route), current: true };
}
const viewKey = v => JSON.stringify(v) + (v.kind === 'prop' ? ':' + (S.props[v.pid]?.updated || 0) : '');

// html and css for one layout of the current view; null while something is loading
function content(route, which, v) {
  if (v.kind === 'base') return { html: captured(route)[which] ?? captured(route).d, css: '' };
  if (v.kind === 'main') {
    const m = mainAt(route, v.ver);
    return m ? { html: m[which] ?? m.d, css: m.css || '' } : null;
  }
  const pv = propAt(v.pid, v.ver);
  if (!pv) return null;
  if (!pv.ver) return content(route, which, { kind: 'main', ver: pv.baseVer || 0 });
  const m = mainAt(route, pv.baseVer || 0);
  if (!m) return null;
  const html = m[which] ?? m.d;
  const ops = pv[which]?.ops || (which === 'm' && pv.mSame ? pv.d?.ops : null) || [];
  return { html: applyOps(html, ops, true).html, css: [m.css, pv.css].filter(Boolean).join('\n') };
}

// Re-render the page when what it shows changed (someone saved, approved or reverted).
function refresh(force) {
  if (S.route) {
    const k = viewKey(view(S.route));
    if (force || k !== S.sig) window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
  ui();
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

function clean(html, mark) {
  const f = frag(String(html || ''));
  f.querySelectorAll('script, style, link, meta, iframe, object, embed, base, form[action]').forEach(e => e.remove());
  f.querySelectorAll('*').forEach(e => [...e.attributes].forEach(a => {
    if (/^on/i.test(a.name) || a.name === 'k' || a.name === 'core' || a.name === 'data-ws-changed' || /^\s*javascript:/i.test(a.value)) e.removeAttribute(a.name);
  }));
  if (mark) [...f.children].forEach(e => e.setAttribute('data-ws-changed', ''));
  return f;
}

// mark: tag what the operations touched, so the view can outline a change
function applyOps(html, ops, mark) {
  const f = frag(html);
  const list = numbered(f);
  const skipped = [];
  // resolve every target first: earlier operations must not shift later numbers
  (ops || []).map(o => [o, list[+o.k]]).forEach(([o, el]) => {
    if (!el || isCore(el)) { skipped.push(o.k); return; }
    switch (o.op) {
      case 'replace': el.replaceWith(clean(o.html, mark)); break;
      case 'before': el.before(clean(o.html, mark)); break;
      case 'after': el.after(clean(o.html, mark)); break;
      case 'prepend': el.prepend(clean(o.html, mark)); break;
      case 'append': el.append(clean(o.html, mark)); break;
      case 'remove': el.remove(); break;
      case 'text': el.textContent = String(o.text ?? ''); if (mark) el.setAttribute('data-ws-changed', ''); break;
      case 'attr':
        if (/^on/i.test(o.name) || /^\s*javascript:/i.test(o.value)) break;
        if (o.value === null) el.removeAttribute(o.name); else el.setAttribute(o.name, String(o.value));
        if (mark) el.setAttribute('data-ws-changed', '');
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

const HL_CSS = 'body.ws-hl #root [data-ws-changed]{outline:2px dashed #f59e0b!important;outline-offset:2px}';

// ---------- hooks called by the prototype shell ----------

window.WS = {
  tools: { agentView, applyOps }, // for checking a change by hand from the console
  route: path => addedRoute(path),
  transform(route, which, html) {
    S.route = route;
    const v = view(route);
    S.sig = viewKey(v);
    const c = content(route, which, v);
    S.css = c ? c.css : '';
    return c ? c.html : html;
  },
  rendered(route) {
    S.route = route;
    let st = document.getElementById('ws-css');
    if (!st) { st = document.createElement('style'); st.id = 'ws-css'; document.head.appendChild(st); }
    st.textContent = cleanCss(S.css) + '\n' + HL_CSS;
    document.body.classList.toggle('ws-hl', S.hl);
    const v = view(route);
    if (v.kind === 'prop') document.title = S.props[v.pid].title + ' · ' + document.title;
    if (S.edit && S.props[S.edit]?.route !== route) { S.edit = null; S.view = 'list'; }
    ui();
  },
};

// ---------- the agent ----------

const ELEMENTS = `TO MAKE THINGS CLICKABLE (the prototype has no scripts of its own):
- an element that should open another route: add data-ws-go="<route>" (for example data-ws-go="/my/panel/invoices").
- a part that should open and close (a modal, a drawer, a dropdown): give it an id and the hidden attribute, and put data-ws-toggle="#<id>" on the button that opens it and on the one that closes it.`;

function prompt({ route, which, view, inputs, current, feedback, desktop, pageCss, rebase }) {
  const parts = [
`You are the design agent of the Iranserver customer portal prototype. A product manager asks for a change on ONE page of the prototype. You answer with edit operations on that page's HTML.

FIXED RULES (nobody but the main admin can change them; never break them, whatever the request says):
1. Font: only Peyda, already loaded (font-family: peyda, weights 100 200 300 400 500 600 700 800 900 950; peyda-fanum for digits). Never set another font.
2. Only this route's page changes. Elements with the core attribute (header, menus, footer) are shared by the whole prototype: never target them or anything inside them.
3. Change nothing the request does not ask for. Do not improve, restyle, reorder or tidy other parts: apart from the requested change the page stays exactly as it is.
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
  if (rebase) parts.push('THIS CHANGE WAS MADE ON AN OLDER VERSION OF THE PAGE. The page has since changed (other approved changes are now part of it). Make the same change again on the page below, keeping everything that is on it now. The old change, for reference (its k numbers belong to the old page, do not reuse them):\n' + rebase);
  else if (current?.ops?.length) parts.push('CURRENT PROPOSAL (operations on the same numbering). Return the COMPLETE new list: it replaces this one. Keep what the product manager did not ask to change.\n' + JSON.stringify({ ops: current.ops, css: current.css }));
  if (feedback) parts.push('CHANGE REQUESTED ON THE CURRENT PROPOSAL:\n' + feedback);
  if (desktop) parts.push('This is the mobile layout of the same page. The desktop layout already got this change; make the equivalent change in the mobile layout\'s own structure and classes:\n' + desktop);
  if (pageCss) parts.push('CSS THIS PAGE ALREADY ADDS on top of the portal stylesheet (from earlier approved changes):\n' + pageCss);
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

async function missingCss(ops, pageCss, signal) {
  const have = knownClasses();
  const want = new Set();
  const add = c => { if (c && !have.has(c) && !(pageCss || '').includes('.' + CSS.escape(c))) want.add(c); };
  ops.forEach(o => { if (o.html) clean(o.html).querySelectorAll('[class]').forEach(e => e.classList.forEach(add)); if (o.op === 'attr' && o.name === 'class') String(o.value).split(/\s+/).forEach(add); });
  if (!want.size) return '';
  step('کلاس‌هایی که در استایل پورتال نیست: ' + [...want].slice(0, 12).join(' ') + (want.size > 12 ? ' …' : ''));
  const { text } = await S.sample(
`These class names appear in new HTML for the Iranserver portal prototype, but its stylesheet (Tailwind v4 + PrimeVue) does not define them: ${JSON.stringify([...want].slice(0, 120))}
Write the CSS declarations each class means in Tailwind v4 (for a variant such as md:flex or hover:bg-x give the declarations of the base utility). Use the portal's color tokens where a color is meant: ${tokens()}
Font is always peyda. Answer with only a JSON object: {"<class name>":"<declarations>", ...}`, { modelTier: 'default', signal, cache: false });
  const rules = parseJson(text);
  return Object.entries(rules).map(([c, decl]) => {
    const parts = c.split(':'); parts.pop();
    let sel = '.' + CSS.escape(c); let wrap = null;
    parts.forEach(v => { if (BP[v]) wrap = BP[v]; else if (v === 'hover' || v === 'focus') sel += ':' + v; });
    const rule = `${sel}{${decl}}`;
    return wrap ? `@media (min-width:${wrap}){${rule}}` : rule;
  }).join('\n');
}

function step(t) { S.log += (S.log ? '\n' : '') + t; ui(); }

// The html an old change inserted or set, so a rebase can make the same change on the new main design.
function describe(p) {
  const pick = ops => (ops || []).filter(o => o.html || o.text || o.op === 'attr' || o.op === 'remove')
    .map(o => o.op + (o.html ? ': ' + o.html : o.text ? ': ' + o.text : o.op === 'attr' ? ': ' + o.name + '=' + o.value : ''));
  return trim([p.summary && 'Summary: ' + p.summary, 'Desktop:', ...pick(p.d?.ops), 'Mobile:', ...pick(p.m?.ops), p.css && 'CSS: ' + p.css].filter(Boolean).join('\n'), 40000);
}

// mode: undefined (build from the inputs), 'refine' (feedback on the current version), 'rebase' (same change on the new main design)
async function runAgent(pid, feedback, mode) {
  const p = { id: pid, ...S.props[pid] };
  const f = S.form;
  S.busy = new AbortController(); S.log = ''; S.error = ''; ui();
  const signal = S.busy.signal;
  try {
    const inputs = { desc: (f.desc || '').trim() };
    const images = mode === 'rebase' ? [] : [...S.files];
    if (mode !== 'rebase') {
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
    }

    // a new change, and a rebase, start from the current main design; a refinement stays on the version it was built on
    const baseVer = mode === 'refine' && p.ver ? (p.baseVer || 0) : mainVer(p.route);
    const base = await mainAtAsync(p.route, baseVer);
    const rebase = mode === 'rebase' ? describe(p) : null;
    const out = { ...p, baseVer };
    let desktop = null;
    for (const which of ['d', 'm']) {
      if (which === 'm' && base.mSame) continue;
      step(which === 'd' ? 'ساخت تغییر در نسخه‌ی دسکتاپ…' : 'ساخت تغییر در نسخه‌ی موبایل…');
      const args = { route: p.route, which, view: agentView(base[which]), inputs, current: mode === 'refine' && p[which] ? { ops: p[which].ops, css: p.css } : null, feedback, desktop, pageCss: base.css, rebase };
      let text = prompt(args);
      if (bytes(text) > 240000) { inputs.figmaCode = trim(inputs.figmaCode, 20000); inputs.prdText = trim(inputs.prdText, 20000); text = prompt(args); }
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
      out.css = which === 'd' ? (r.css || '') : [out.css, r.css].filter(Boolean).join('\n');
      out.summary = which === 'd' || !out.summary ? r.summary : out.summary;
      out.notes = [which === 'd' ? '' : out.notes, r.notes].filter(Boolean).join('\n');
      desktop = (r.summary || '') + '\n' + trim(JSON.stringify(ops), 30000);
    }
    if (base.mSame) out.m = null;
    out.mSame = !!base.mSame;
    const extra = await missingCss([...(out.d?.ops || []), ...(out.m?.ops || [])], base.css, signal);
    out.css = cleanCss([out.css, extra].filter(Boolean).join('\n'));
    await saveVersion(pid, out, mode === 'rebase' ? 'به‌روزرسانی روی طرح اصلی نسخه‌ی ' + fa(baseVer) : feedback || inputs.desc || 'اجرای ایجنت');
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

// Each save is a new version. A change that was waiting for approval goes back to draft: what was sent is no longer the latest.
async function saveVersion(pid, out, note) {
  const now = Date.now();
  const body = { route: out.route, title: out.title, author: out.author, authorName: out.authorName,
    status: 'draft', submittedVer: 0,
    created: out.created || now, updated: now, d: out.d || null, m: out.m || null, mSame: !!out.mSame, baseVer: out.baseVer || 0,
    css: out.css || '', summary: out.summary || '', notes: out.notes || '', inputs: { desc: S.form.desc || '', prd: S.form.prd || '', figma: S.form.figma || '' },
    ver: (out.ver || 0) + 1, by: S.user.name, review: out.review || null, approvedVers: out.approvedVers || [] };
  if (bytes(JSON.stringify(body)) > MAX_DOC) throw new Error('این تغییر از حد ذخیره‌سازی بزرگ‌تر شد. آن را کوچک‌تر یا در دو تغییر جدا انجام دهید.');
  await store.set('ws_props', pid, body);
  const v = { at: now, by: S.user.name, note: String(note).slice(0, 300), d: body.d, m: body.m, mSame: body.mSame, baseVer: body.baseVer, css: body.css, summary: body.summary, ver: body.ver };
  await store.set('ws_props/' + pid + '/versions', 'v' + body.ver, v);
  S.versions = null;
}

// Approving puts the submitted version on the main design as its next version.
async function approve(pid) {
  const p = S.props[pid];
  if (p.status !== 'pending' || !canApprove(S.user, p.route)) return;
  if (stale(p)) throw new Error('طرح اصلی این صفحه بعد از ساخت این تغییر عوض شده؛ اول باید سازنده‌اش آن را به‌روزرسانی کند.');
  const pv = await propAtAsync(pid, p.submittedVer);
  const base = await mainAtAsync(p.route, pv.baseVer || 0);
  const d = applyOps(base.d, pv.d?.ops).html;
  const m = base.mSame ? null : applyOps(base.m, pv.m?.ops || []).html;
  const ver = mainVer(p.route) + 1;
  const now = Date.now();
  const doc = { ver, route: p.route, d, m, mSame: !!base.mSame, css: [base.css, pv.css].filter(Boolean).join('\n'),
    title: p.title, pid, pver: pv.ver, author: p.authorName, by: S.user.name, at: now, note: 'تأیید «' + p.title + '» (' + p.authorName + '، نسخه‌ی ' + fa(pv.ver) + ')' };
  if (bytes(JSON.stringify(doc)) > MAX_DOC) throw new Error('طرح اصلی این صفحه از حد ذخیره‌سازی بزرگ‌تر می‌شود.');
  await store.set('ws_main/' + rid(p.route) + '/versions', 'v' + ver, doc);
  await store.set('ws_main', rid(p.route), { route: p.route, ver, title: p.title, by: S.user.name, at: now });
  await store.update('ws_props', pid, { status: 'approved', review: { by: S.user.name, at: now, mainVer: ver, ver: pv.ver }, approvedVers: [...(p.approvedVers || []), pv.ver] });
}

// ---------- interface (in its own shadow root, so neither side's styles leak) ----------

const host = document.createElement('div');
host.id = 'ws-host';
const shadow = host.attachShadow({ mode: 'open' });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fa = n => Number(n || 0).toLocaleString('fa-IR');
const fmt = t => t ? new Date(t).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' }) : '';
const badge = p => `<span class="badge ${p.status}">${STATUS[p.status] || ''}</span>${stale(p) ? '<span class="badge warn">نیاز به به‌روزرسانی</span>' : ''}`;

const CSS_UI = `
:host{all:initial}
*{box-sizing:border-box;font-family:peyda,peyda-fanum,Tahoma,sans-serif}
.fab{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;gap:8px;align-items:center;direction:rtl;flex-wrap:wrap;max-width:calc(100vw - 32px)}
.fab button.main{background:#2635d9;color:#fff;border:0;border-radius:999px;padding:10px 16px;font-size:14px;cursor:pointer;box-shadow:0 4px 16px rgba(15,21,87,.25)}
.bar{display:flex;gap:6px;align-items:center;background:#fff;border:1px solid #a8cdf0;border-radius:999px;padding:4px 10px;box-shadow:0 2px 8px rgba(15,21,87,.12);font-size:12px;color:#0f1557;flex-wrap:wrap}
.bar select{width:auto;max-width:260px;border:0;background:transparent;padding:4px;font-size:12px;color:#0f1557}
.bar label{margin:0;display:flex;gap:4px;align-items:center;font-size:12px;color:#0f1557;white-space:nowrap}
.bar input{width:auto}
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
.badge{font-size:11px;padding:2px 8px;border-radius:999px;background:#eef0f6;color:#5b5f77;white-space:nowrap}
.badge.approved{background:#e3f6ec;color:#0b7a43}
.badge.pending{background:#fff3d6;color:#8a5a00}
.badge.rejected{background:#fdecec;color:#b71c1c}
.badge.warn{background:#fde7d4;color:#a14a00}
button.b{border:1px solid #d5d9e6;background:#fff;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;color:#1d1d27}
button.b:hover{border-color:#2635d9;color:#2635d9}
button.p{background:#2635d9;border-color:#2635d9;color:#fff}
button.p:hover{background:#1f2aad;color:#fff}
button.ok{background:#0b7a43;border-color:#0b7a43;color:#fff}
button.d{color:#c62828}
button.armed{background:#c62828;border-color:#c62828;color:#fff}
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
.files span{display:inline-block;background:#eef0f6;border-radius:6px;padding:2px 6px;margin:2px;font-size:11px}
`;

function ui() {
  if (!host.isConnected) document.body.appendChild(host);
  const a = shadow.activeElement;
  if (a && /INPUT|TEXTAREA/.test(a.tagName) && S.open) { S.pending = true; return; }
  S.pending = false;
  const n = queue().length;
  shadow.innerHTML = `<style>${CSS_UI}</style>` + (S.open ? panel() : `
    <div class="fab"><button class="main" data-act="open">فضای کار${n ? ' · ' + fa(n) + ' منتظر تأیید شما' : ''}</button>${S.route ? bar() : ''}</div>`);
}

// The view bar: main design, its history, the captured page, or any person's change and its versions.
function bar() {
  const v = view(S.route);
  const mv = mainVer(S.route);
  const cur = v.kind === 'base' ? 'base' : v.kind === 'main' ? (v.current ? '' : 'm~' + v.ver) : 'p~' + v.pid;
  const opt = (val, label) => `<option value="${esc(val)}" ${val === cur ? 'selected' : ''}>${esc(label)}</option>`;
  const byPerson = {};
  propsOf(S.route).forEach(p => (byPerson[p.authorName] = byPerson[p.authorName] || []).push(p));
  let html = `<select data-bar="view" title="نمایش">${opt('', 'طرح اصلی' + (mv ? ' (نسخه‌ی ' + fa(mv) + ')' : ''))}`;
  if (mv > 1 || cur.startsWith('m~')) html += `<optgroup label="تاریخچه‌ی طرح اصلی">${[...Array(mv - 1)].map((_, i) => opt('m~' + (mv - 1 - i), 'طرح اصلی، نسخه‌ی ' + fa(mv - 1 - i))).join('')}</optgroup>`;
  html += opt('base', 'کپی اصلی پورتال');
  Object.entries(byPerson).forEach(([name, list]) => {
    html += `<optgroup label="تغییرات ${esc(name)}">${list.map(p => opt('p~' + p.id, p.title + ' · ' + (STATUS[p.status] || ''))).join('')}</optgroup>`;
  });
  html += '</select>';
  if (v.kind === 'prop') {
    const p = S.props[v.pid];
    html += `<select data-bar="ver" title="نسخه">${[...Array(p.ver)].map((_, i) => {
      const n = p.ver - i;
      const tag = (p.approvedVers || []).includes(n) ? ' · تأییدشده' : p.status === 'pending' && p.submittedVer === n ? ' · ارسال‌شده' : '';
      return `<option value="${n}" ${n === v.ver ? 'selected' : ''}>نسخه‌ی ${fa(n)}${tag}</option>`;
    }).join('')}</select>`;
  }
  html += `<label><input type="checkbox" data-bar="hl" ${S.hl ? 'checked' : ''}>برجسته‌کردن تغییرات</label>`;
  return `<div class="bar">${html}</div>`;
}

// Changes waiting for this person's approval.
function queue() {
  const u = S.user;
  if (!u) return [];
  return Object.entries(S.props).filter(([, p]) => p.status === 'pending' && canApprove(u, p.route)).map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (a.updated || 0) - (b.updated || 0));
}

function panel() {
  const u = S.user;
  const q = queue().length;
  const tabs = [['page', 'این صفحه'], ...(u && (u.role === 'admin' || u.role === 'pm') ? [['queue', 'منتظر تأیید من' + (q ? ' (' + fa(q) + ')' : '')]] : []),
    ['routes', 'همه‌ی روت‌ها'], ...(u?.role === 'admin' ? [['users', 'کاربران']] : []), ['rules', 'قوانین']];
  return `<div class="panel">
    <div class="top"><b>فضای کار پروتوتایپ</b><span class="sp"></span>
      ${u ? `<span class="who">${esc(u.name)} · ${ROLES[u.role]}</span><button class="b" data-act="logout">خروج</button>` : `<span class="who">مهمان (فقط مشاهده)</span><button class="b p" data-act="login-view">ورود</button>`}
      <button class="x" data-act="close" title="بستن">×</button></div>
    <div class="tabs">${tabs.map(([k, t]) => `<button data-act="tab" data-v="${k}" class="${S.tab === k ? 'on' : ''}">${t}</button>`).join('')}</div>
    <div class="body">
      ${S.local ? `<div class="note">این نسخه بیرون از Claude باز شده؛ داده‌ها فقط در همین مرورگر ذخیره می‌شوند و ایجنت در دسترس نیست.</div>` : ''}
      ${S.error ? `<div class="err">${esc(S.error)}</div>` : ''}
      ${S.view === 'login' ? loginView() : S.tab === 'page' ? pageTab() : S.tab === 'queue' ? queueTab() : S.tab === 'routes' ? routesTab() : S.tab === 'users' ? usersTab() : rulesTab()}
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

// A button that needs a second click to confirm (dialogs may be blocked inside the viewer).
function confirmBtn(act, v, label, cls = 'd') {
  const on = S.armed === act + ':' + v;
  return `<button class="b ${on ? 'armed' : cls}" data-act="${act}" data-v="${esc(v)}">${on ? 'مطمئنید؟ دوباره بزنید' : label}</button>`;
}

function propCard(p, v) {
  const u = S.user;
  const showing = v.kind === 'prop' && v.pid === p.id;
  return `<div class="card ${showing ? 'sel' : ''}">
    <div class="row"><b>${esc(p.title)}</b>${badge(p)}<span class="sp"></span>
      ${showing ? '<span class="badge">در حال نمایش</span>' : `<button class="b" data-act="show" data-v="p~${p.id}">نمایش</button>`}</div>
    <div class="muted">${esc(p.authorName)} · ${fmt(p.updated)} · ${p.ver ? 'نسخه‌ی ' + fa(p.ver) : 'بدون نسخه'}${p.ver ? ' · روی طرح اصلی نسخه‌ی ' + (p.baseVer || 0) : ''}</div>
    ${p.summary ? `<div style="margin-top:6px">${esc(p.summary)}</div>` : ''}
    ${p.status === 'rejected' && p.review?.reason ? `<div class="note">ردشده توسط ${esc(p.review.by)}: ${esc(p.review.reason)}</div>` : ''}
    ${p.status === 'approved' && p.review ? `<div class="muted">تأیید ${esc(p.review.by)} · ${fmt(p.review.at)} · طرح اصلی نسخه‌ی ${fa(p.review.mainVer)}</div>` : ''}
    <div class="row" style="margin-top:8px">
      ${canChange(u, p) ? `<button class="b" data-act="edit" data-v="${p.id}">${stale(p) ? 'به‌روزرسانی و ویرایش' : 'ویرایش با ایجنت'}</button>` : ''}
      ${canChange(u, p) && p.ver && !stale(p) && (p.status === 'draft' || p.status === 'rejected') ? `<button class="b p" data-act="submit" data-v="${p.id}">ارسال نسخه‌ی ${fa(p.ver)} برای تأیید</button>` : ''}
      ${canChange(u, p) && p.status === 'pending' ? `<button class="b" data-act="withdraw" data-v="${p.id}">پس گرفتن از تأیید</button>` : ''}
      ${u && (p.author === u.id || u.role === 'admin') ? confirmBtn('delete', p.id, 'حذف') : ''}
    </div>
    ${p.status === 'pending' && canApprove(u, p.route) ? reviewBox(p) : ''}</div>`;
}

function reviewBox(p) {
  return `<div class="card" style="background:#fffdf5">
    <div class="row"><b>تأیید نهایی</b><span class="muted">نسخه‌ی ${fa(p.submittedVer)} برای تأیید فرستاده شده</span></div>
    ${stale(p) ? '<div class="note">طرح اصلی بعد از ساخت این تغییر عوض شده؛ تا سازنده به‌روزرسانی‌اش نکند تأیید نمی‌شود.</div>' : ''}
    <div class="row" style="margin-top:6px">
      <button class="b" data-act="show" data-v="p~${p.id}~${p.submittedVer}">دیدن نسخه‌ی ارسال‌شده</button>
      ${stale(p) ? '' : `<button class="b ok" data-act="approve" data-v="${p.id}">تأیید و انتقال به طرح اصلی</button>`}</div>
    <label>دلیل رد (برای سازنده)</label><textarea data-f="reason_${p.id}" style="min-height:50px">${esc(S.form['reason_' + p.id])}</textarea>
    <div class="row" style="margin-top:6px"><button class="b d" data-act="reject" data-v="${p.id}">رد</button></div></div>`;
}

function pageTab() {
  if (!S.route) return '';
  const u = S.user;
  const v = view(S.route);
  const props = propsOf(S.route);
  const a = addedRoute(S.route);
  const mv = mainVer(S.route);
  if (S.edit && S.props[S.edit]) return editor({ id: S.edit, ...S.props[S.edit] });
  return `
    <div class="route">${esc(S.route)}</div>
    <p class="muted">${a ? 'روت جدید، ساخته‌شده از روی ' + esc(a.base) + ' · ' : ''}تأییدکننده: ${esc(approvers(S.route))}</p>
    <div class="card ${v.kind === 'main' && v.current ? 'sel' : ''}"><div class="row"><b>طرح اصلی</b><span class="badge">نسخه‌ی ${fa(mv)}</span><span class="sp"></span>
      ${v.kind === 'main' && v.current ? '<span class="badge">در حال نمایش</span>' : '<button class="b" data-act="show" data-v="">نمایش</button>'}</div>
      <div class="muted">${mv ? 'آخرین تأیید: «' + esc(S.main[rid(S.route)].title) + '» · ' + esc(S.main[rid(S.route)].by) + ' · ' + fmt(S.main[rid(S.route)].at) : 'همان کپی پورتال؛ هنوز تغییری تأیید نشده.'}</div>
      ${mv ? `<div class="row" style="margin-top:8px"><button class="b" data-act="history">${S.mainVersions?.route === S.route ? 'بستن تاریخچه' : 'تاریخچه‌ی طرح اصلی'}</button></div>` : ''}
      ${S.mainVersions?.route === S.route ? mainHistory() : ''}</div>
    <h3>تغییرها (${fa(props.length)})</h3>
    ${props.map(p => propCard(p, v)).join('') || '<p class="muted">هنوز تغییری برای این صفحه ثبت نشده.</p>'}
    ${canEdit(u, S.route) ? `<h3>تغییر جدید</h3><label>عنوان</label><input data-f="newTitle" value="${esc(S.form.newTitle)}" placeholder="مثلاً: افزودن فیلتر وضعیت">
      <div class="row" style="margin-top:8px"><button class="b p" data-act="create">ساخت تغییر</button></div>`
      : u ? '<p class="muted">این روت در دسترس شما نیست؛ فقط می‌توانید تغییرها را ببینید.</p>' : '<p class="muted">برای ثبت تغییر وارد شوید.</p>'}`;
}

function mainHistory() {
  const h = S.mainVersions;
  if (!h.list) return '<p class="muted">در حال بارگذاری…</p>';
  const mv = mainVer(S.route);
  const can = canApprove(S.user, S.route);
  return [{ ver: 0, note: 'کپی اصلی پورتال' }, ...h.list].sort((a, b) => b.ver - a.ver).map(x => `<div class="card"><div class="row"><b>نسخه‌ی ${fa(x.ver)}</b>
    <span class="muted">${x.at ? esc(x.by) + ' · ' + fmt(x.at) : ''}</span><span class="sp"></span>
    ${x.ver === mv ? '<span class="badge approved">فعلی</span>' : `<button class="b" data-act="show" data-v="${x.ver ? 'm~' + x.ver : 'base'}">نمایش</button>${can ? confirmBtn('restore', String(x.ver), 'برگرداندن', 'b') : ''}`}</div>
    <div class="muted" style="margin-top:4px">${esc(x.note)}</div></div>`).join('');
}

function editor(p) {
  const f = S.form;
  const busy = !!S.busy;
  const agent = !!S.sample && !!S.mcp;
  const old = stale(p);
  return `<div class="row"><button class="b" data-act="back">← بازگشت</button><span class="sp"></span>${badge(p)}<span class="badge">نسخه‌ی ${fa(p.ver || 0)}</span></div>
    <h3>${esc(p.title)}</h3><div class="route">${esc(p.route)}</div>
    ${p.summary ? `<div class="card"><b>آخرین تغییر</b><div style="margin-top:4px">${esc(p.summary)}</div></div>` : ''}
    ${p.notes ? `<div class="note">${esc(p.notes)}</div>` : ''}
    ${p.status === 'pending' ? '<div class="note">این تغییر منتظر تأیید است. اگر نسخه‌ی جدیدی بسازید، از صف تأیید خارج می‌شود و باید دوباره ارسالش کنید.</div>' : ''}
    ${!agent ? '<div class="err">ایجنت فقط وقتی پروتوتایپ داخل Claude باز است کار می‌کند.</div>' : ''}
    ${old ? `<div class="note">طرح اصلی این صفحه بعد از ساخت این تغییر عوض شده (الان نسخه‌ی ${fa(mainVer(p.route))}). ایجنت همین تغییر را روی طرح اصلی جدید دوباره می‌سازد و یک نسخه‌ی جدید ثبت می‌کند.</div>
      <div class="row"><button class="b p" data-act="rebase" ${busy || !agent ? 'disabled' : ''}>به‌روزرسانی روی طرح اصلی جدید</button></div>` : ''}
    ${p.ver && !old ? `<h3>اصلاح همین تغییر</h3>
      <textarea data-f="feedback" placeholder="مثلاً: دکمه را به سمت چپ ببر و متنش را «پرداخت» کن">${esc(f.feedback)}</textarea>
      <div class="row" style="margin-top:8px"><button class="b p" data-act="refine" ${busy || !agent ? 'disabled' : ''}>ساخت نسخه‌ی جدید با این اصلاح</button></div>` : ''}
    <h3>${p.ver ? 'ورودی‌های تغییر' : 'چه چیزی باید ساخته شود؟'}</h3>
    <label>توضیحات</label><textarea data-f="desc" placeholder="چه چیزی در این صفحه اضافه یا عوض شود">${esc(f.desc)}</textarea>
    <label>PRD (لینک گوگل داک یا متن)</label><textarea data-f="prd" style="min-height:60px">${esc(f.prd)}</textarea>
    <label>لینک فیگمای همان بخش</label><input class="ltr" data-f="figma" value="${esc(f.figma)}" placeholder="https://www.figma.com/design/...?node-id=12-34">
    <label>تصویر طراحی</label><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple data-f="files">
    <div class="files">${S.files.map((x, i) => `<span>${esc(x.name)} <a href="#" data-act="rmfile" data-v="${i}">×</a></span>`).join('')}</div>
    <div class="row" style="margin-top:10px">
      ${busy ? '<button class="b d" data-act="stop">توقف</button>' : `<button class="b p" data-act="run" ${agent ? '' : 'disabled'}>${p.ver ? 'ساخت نسخه‌ی جدید از ورودی‌ها' : 'اجرای ایجنت'}</button>`}
      ${p.ver ? `<button class="b" data-act="show" data-v="p~${p.id}">نمایش روی صفحه</button>` : ''}
      ${p.ver && !old && (p.status === 'draft' || p.status === 'rejected') ? `<button class="b" data-act="submit" data-v="${p.id}">ارسال نسخه‌ی ${fa(p.ver)} برای تأیید</button>` : ''}</div>
    ${S.log ? `<div class="log">${esc(S.log)}</div>` : ''}
    <h3>نسخه‌ها</h3>${versionsList(p)}`;
}

function versionsList(p) {
  if (!p.ver) return '<p class="muted">هنوز نسخه‌ای ساخته نشده.</p>';
  if (!S.versions || S.versions.pid !== p.id || S.versions.ver !== p.ver) {
    S.versions = { pid: p.id, ver: p.ver, list: null };
    store.list('ws_props/' + p.id + '/versions').then(l => { if (S.versions?.pid === p.id) { S.versions.list = l.sort((a, b) => b.ver - a.ver); ui(); } }).catch(() => {});
  }
  if (!S.versions.list) return '<p class="muted">در حال بارگذاری…</p>';
  return S.versions.list.map(v => `<div class="card"><div class="row"><b>نسخه‌ی ${fa(v.ver)}</b>
    ${(p.approvedVers || []).includes(v.ver) ? '<span class="badge approved">تأییدشده</span>' : ''}${p.status === 'pending' && p.submittedVer === v.ver ? '<span class="badge pending">ارسال‌شده</span>' : ''}
    <span class="muted">${esc(v.by)} · ${fmt(v.at)}</span><span class="sp"></span>
    <button class="b" data-act="show" data-v="p~${p.id}~${v.ver}">نمایش</button>
    ${v.ver !== p.ver ? `<button class="b" data-act="revert" data-v="${v.id}">برگرداندن</button>` : '<span class="badge">آخرین</span>'}</div>
    <div class="muted" style="margin-top:4px">${esc(v.note)}</div></div>`).join('');
}

function queueTab() {
  const list = queue();
  if (!list.length) return '<p class="muted">تغییری منتظر تأیید شما نیست.</p>';
  return list.map(p => `<div class="card">
    <div class="row"><b>${esc(p.title)}</b>${badge(p)}</div>
    <div class="route" style="margin-top:6px">${esc(p.route)}</div>
    <div class="muted" style="margin-top:4px">${esc(p.authorName)} · نسخه‌ی ${fa(p.submittedVer)} · ${fmt(p.updated)}</div>
    ${p.summary ? `<div style="margin-top:6px">${esc(p.summary)}</div>` : ''}
    <div class="row" style="margin-top:8px"><button class="b" data-act="goto" data-v="${esc(p.route)}@p~${p.id}~${p.submittedVer}">رفتن به صفحه و دیدن نسخه</button></div>
    ${reviewBox(p)}</div>`).join('');
}

function routesTab() {
  const u = S.user;
  const q = (S.q || '').trim();
  const people = [...new Map(Object.values(S.props).map(p => [p.author, p.authorName])).entries()];
  const mine = r => !S.who || propsOf(r.path).some(p => p.author === S.who);
  const list = allRoutes().filter(r => (!q || r.path.includes(q) || (r.title || '').includes(q)) && mine(r));
  return `<input data-f="q" value="${esc(S.q)}" placeholder="جستجوی روت">
    <label>تغییرهای</label><select data-f="who"><option value="">همه</option>${people.map(([id, name]) => `<option value="${esc(id)}" ${S.who === id ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select>
    ${list.map(r => { const ps = propsOf(r.path).filter(p => !S.who || p.author === S.who); const mv = mainVer(r.path); return `<div class="card"><div class="row">
      <a href="#${esc(r.path)}" class="route" style="flex:1;text-decoration:none;color:#1d1d27">${esc(r.path)}</a></div>
      <div class="row muted" style="margin-top:4px">${r.added ? '<span class="badge">روت جدید</span>' : ''}${mv ? `<span class="badge approved">طرح اصلی نسخه‌ی ${fa(mv)}</span>` : ''}
      <span>تأییدکننده: ${esc(approvers(r.path))}</span>${canEdit(u, r.path) ? '<span class="badge">دسترسی شما</span>' : ''}
      ${r.added && u && (r.owner === u.id || u.role === 'admin') && !propsOf(r.path).length ? `<span class="sp"></span>${confirmBtn('delroute', r.path, 'حذف روت')}` : ''}</div>
      ${ps.map(p => `<div class="row" style="margin-top:6px"><a href="#${esc(r.path)}@p~${p.id}" style="color:#2635d9;font-size:12px">${esc(p.title)}</a>${badge(p)}<span class="muted">${esc(p.authorName)} · نسخه‌ی ${fa(p.ver || 0)}</span></div>`).join('')}</div>`; }).join('')}
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
      ${u.hash ? confirmBtn('resetpw', id, 'بازنشانی رمز', 'b') : ''}
      ${id !== S.user.id ? confirmBtn('deluser', id, 'حذف کاربر') : ''}</div></div>`; }).join('') + `
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
    <li><b>ادمین کل:</b> هسته، کاربران و دسترسی‌ها؛ تغییر و تأیید نهایی روی همه‌ی صفحه‌ها.</li>
    <li><b>مدیر محصول:</b> تغییر و روت جدید روی روت‌های خودش؛ تأیید نهایی هر تغییری که روی صفحه‌های حوزه‌ی خودش ساخته شده.</li>
    <li><b>مدیر کل و پروداکت دیزاین:</b> تغییر روی همه‌ی صفحه‌ها؛ تأیید با صاحب همان حوزه است.</li>
    <li><b>مهمان:</b> بدون ورود، طرح اصلی، تاریخچه‌اش و همه‌ی تغییرها (تأییدشده یا نه) را می‌بیند و تغییری نمی‌دهد.</li></ol>
    <h3>مسیر هر تغییر</h3>
    <p class="muted">پیش‌نویس ← ارسال برای تأیید ← تأییدشده (روی طرح اصلی می‌آید) یا ردشده. هر اجرای ایجنت یک نسخه‌ی جدید می‌سازد؛ نسخه‌های قبلی همیشه دیدنی و برگرداندنی‌اند.</p>
    <div class="row"><button class="b" data-act="fontcheck">بررسی فونت</button></div>${S.fontcheck ? `<div class="log ltr">${esc(S.fontcheck)}</div>` : ''}`;
}

// ---------- actions ----------

function setHash(route, suffix) { location.hash = route + (suffix ? '@' + suffix : ''); }

const ACT = {
  // Reports how the Peyda faces load in this view (the viewer may block some font sources).
  async fontcheck() {
    const out = [location.origin + location.pathname];
    await Promise.all([...document.fonts].filter(f => /peyda/.test(f.family)).map(f => f.load().catch(e => { out.push('face ' + f.family + ' ' + f.weight + ' failed: ' + e); })));
    out.push([...document.fonts].filter(f => /peyda/.test(f.family)).map(f => f.family + ' ' + f.weight + ' ' + f.status).join(', '));
    const el = [...document.querySelectorAll('#root span, #root p, #root div')].find(e => e.childElementCount === 0 && e.textContent.trim().length > 3);
    if (el) out.push('text "' + el.textContent.trim().slice(0, 20) + '" font: ' + getComputedStyle(el).fontFamily);
    out.push('check peyda-fanum: ' + document.fonts.check('16px peyda-fanum', 'کاربر') + ' peyda: ' + document.fonts.check('16px peyda', 'کاربر'));
    S.fontcheck = out.join('\n');
  },
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
  show(v) { setHash(S.route, v); },
  goto(v) { S.open = false; location.hash = v; },
  history() {
    if (S.mainVersions?.route === S.route) { S.mainVersions = null; return; }
    const route = S.route;
    S.mainVersions = { route, list: null };
    store.list('ws_main/' + rid(route) + '/versions').then(l => { if (S.mainVersions?.route === route) { S.mainVersions.list = l; ui(); } }, fail);
  },
  async create() {
    const title = (S.form.newTitle || '').trim();
    if (!title) { S.error = 'عنوان تغییر را بنویسید.'; return; }
    if (!canEdit(S.user, S.route)) return;
    const id = store.id();
    await store.set('ws_props', id, { route: S.route, title, author: S.user.id, authorName: S.user.name, status: 'draft', created: Date.now(), updated: Date.now(), ver: 0, baseVer: mainVer(S.route) });
    S.form.newTitle = ''; ACT.edit(id);
  },
  edit(v) {
    const p = S.props[v];
    S.edit = v; S.log = ''; S.files = []; S.versions = null;
    Object.assign(S.form, { desc: p?.inputs?.desc || '', prd: p?.inputs?.prd || '', figma: p?.inputs?.figma || '', feedback: '' });
  },
  back() { S.edit = null; },
  run() { if (canChange(S.user, S.props[S.edit])) runAgent(S.edit); },
  refine() {
    const fb = (S.form.feedback || '').trim();
    if (!fb) { S.error = 'بنویسید چه اصلاحی لازم است.'; return; }
    if (canChange(S.user, S.props[S.edit])) runAgent(S.edit, fb, 'refine');
  },
  rebase() { if (canChange(S.user, S.props[S.edit])) runAgent(S.edit, null, 'rebase'); },
  stop() { S.busy?.abort(); },
  rmfile(v) { S.files.splice(+v, 1); },
  async revert(v) {
    const p = S.props[S.edit];
    if (!canChange(S.user, p)) return;
    const ver = S.versions.list.find(x => x.id === v);
    await saveVersion(S.edit, { ...p, d: ver.d, m: ver.m, mSame: ver.mSame, baseVer: ver.baseVer || 0, css: ver.css, summary: ver.summary }, 'برگرداندن نسخه‌ی ' + fa(ver.ver));
  },
  async submit(v) {
    const p = S.props[v];
    if (!canChange(S.user, p) || !p.ver || stale(p)) return;
    await store.update('ws_props', v, { status: 'pending', submittedVer: p.ver, review: null });
  },
  async withdraw(v) { if (canChange(S.user, S.props[v])) await store.update('ws_props', v, { status: 'draft', submittedVer: 0 }); },
  async approve(v) { await approve(v); },
  async reject(v) {
    const p = S.props[v];
    if (p.status !== 'pending' || !canApprove(S.user, p.route)) return;
    const reason = (S.form['reason_' + v] || '').trim();
    if (!reason) { S.error = 'دلیل رد را بنویسید تا سازنده بداند چه چیزی را اصلاح کند.'; return; }
    await store.update('ws_props', v, { status: 'rejected', submittedVer: 0, review: { by: S.user.name, at: Date.now(), reason } });
    delete S.form['reason_' + v];
  },
  // a past main design version becomes the next version, so nothing is lost
  async restore(v) {
    if (!canApprove(S.user, S.route)) return;
    const route = S.route;
    const from = +v;
    const src = await mainAtAsync(route, from);
    const ver = mainVer(route) + 1;
    const now = Date.now();
    const note = from ? 'برگرداندن طرح اصلی به نسخه‌ی ' + fa(from) : 'برگرداندن به کپی اصلی پورتال';
    await store.set('ws_main/' + rid(route) + '/versions', 'v' + ver, { ...src, ver, route, by: S.user.name, at: now, note, title: note });
    await store.set('ws_main', rid(route), { route, ver, title: note, by: S.user.name, at: now });
    S.mainVersions = null;
    setHash(route);
  },
  async delete(v) {
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
    if (e) await store.del('ws_routes', e[0]);
  },
  async saveuser(id) {
    const f = S.form['u_' + id] || {};
    const routes = (f.routes ?? (S.users[id].routes || []).join('\n')).split('\n').map(s => s.trim()).filter(Boolean);
    await store.update('ws_users', id, { role: f.role || S.users[id].role, routes });
    delete S.form['u_' + id];
  },
  async resetpw(id) { await store.update('ws_users', id, { hash: '', salt: '' }); },
  async deluser(id) { await store.del('ws_users', id); },
  async adduser() {
    const f = S.form;
    const email = (f.nuEmail || '').trim().toLowerCase();
    if (!f.nuName || !/^\S+@\S+\.\S+$/.test(email)) { S.error = 'نام و ایمیل درست لازم است.'; return; }
    if (Object.values(S.users).some(u => u.email === email)) { S.error = 'این ایمیل از قبل هست.'; return; }
    await store.set('ws_users', 'u-' + email.split('@')[0].replace(/[^\w-]/g, ''), { name: f.nuName.trim(), email, role: f.nuRole || 'pm', routes: [], hash: '', salt: '' });
    f.nuName = f.nuEmail = '';
  },
};
const CONFIRM = ['delete', 'delroute', 'resetpw', 'deluser', 'restore'];

shadow.addEventListener('click', async e => {
  const t = e.target.closest('[data-act]');
  if (!t) { S.armed = null; return; }
  e.preventDefault();
  const act = t.dataset.act;
  const key = act + ':' + (t.dataset.v ?? '');
  // editing actions re-check the role here; the interface only hides what a person cannot do
  const needsUser = !['fontcheck', 'open', 'close', 'tab', 'login-view', 'cancel-login', 'login', 'show', 'goto', 'history', 'back', 'rmfile', 'stop'].includes(act);
  if (needsUser && !S.user) { S.view = 'login'; ui(); return; }
  if (['saveuser', 'resetpw', 'deluser', 'adduser'].includes(act) && S.user.role !== 'admin') return;
  if (CONFIRM.includes(act) && S.armed !== key) { S.armed = key; ui(); return; }
  S.armed = null; S.error = '';
  try { await ACT[act](t.dataset.v); } catch (err) { S.error = errText(err); }
  ui();
});
shadow.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.f === 'files' || t.dataset.bar) return;
  if (t.dataset.f === 'q') { S.q = t.value; return; }
  if (t.dataset.f) S.form[t.dataset.f] = t.value;
  if (t.dataset.uf) (S.form['u_' + t.dataset.uf] = S.form['u_' + t.dataset.uf] || {})[t.dataset.k] = t.value;
});
shadow.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.bar === 'view') setHash(S.route, t.value);
  else if (t.dataset.bar === 'ver') { const v = view(S.route); setHash(S.route, 'p~' + v.pid + '~' + t.value); }
  else if (t.dataset.bar === 'hl') {
    S.hl = t.checked; document.body.classList.toggle('ws-hl', S.hl);
    try { localStorage.setItem('ws_hl', S.hl ? '1' : '0'); } catch (err) {}
  }
  else if (t.dataset.f === 'files') { S.files.push(...t.files); t.value = ''; ui(); }
  else if (t.dataset.f === 'email') { S.pending = false; setTimeout(ui, 0); }
  else if (t.dataset.f === 'who') { S.who = t.value; ui(); }
  else if (t.tagName === 'SELECT') { t.dispatchEvent(new Event('input', { bubbles: true })); }
});
shadow.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.closest?.('[data-f="pw"], [data-f="pw2"]')) { e.preventDefault(); shadow.querySelector('[data-act="login"]').click(); }
});
shadow.addEventListener('focusout', () => setTimeout(() => { if (S.pending && !/INPUT|TEXTAREA/.test(shadow.activeElement?.tagName || '')) ui(); }, 0));
// the search box filters as you type
shadow.addEventListener('input', e => { if (e.target.dataset.f === 'q') { const pos = e.target.selectionStart; S.pending = false; e.target.blur(); ui(); const i = shadow.querySelector('[data-f="q"]'); i.focus(); i.setSelectionRange(pos, pos); } });

init();
})();
