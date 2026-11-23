// AIaaS (core, admin-owned): the product's pages in the portal prototype, built from the AIaaS PRD v0.2.0
// and the Portal Figma configuration frame "Config C1" (1qrZx6L5Ug2eniRA8epD2U, node 39872:42574).
//   /my/panel/cloud/aiaas                     project list (empty state until the first project)
//   /my/panel/cloud/aiaas/configure           configuration page (name, models, initial wallet charge; later phases)
//   /my/panel/service/<id>/aiaas[/<section>]  service details: action sidebar + one section per action
// Every part is labelled with its PRD phase (1–4); the phase switch on each page shows the product up to a phase.
// State (projects, wallet) is fake and kept in this browser only. Service 901 always exists as a demo route.
(() => {
'use strict';
const PAGES = window.PAGES_DATA;
const fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const money = n => fa(Math.round(n).toLocaleString('en-US')).replace(/,/g, '٬');
const num = n => n >= 1e6 ? fa((n / 1e6).toFixed(n >= 1e7 ? 0 : 1)) + ' میلیون' : n >= 1e3 ? fa(Math.round(n / 1e3)) + ' هزار' : fa(n);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const date = t => new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t));
const time = t => new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(t));
const DAY = 864e5;

const LIST = '/my/panel/cloud/aiaas', CFG = LIST + '/configure', DEMO = 901;
const API = 'https://ai.iranserver.com/v1';
const svcRoute = (id, k) => `/my/panel/service/${id}/aiaas${k && k !== 'overview' ? '/' + k : ''}`;
const PH = ['', 'فاز ۱', 'فاز ۲', 'فاز ۳', 'فاز ۴'];

// ---------- catalog (sample prices, toman per 1M tokens: external = list price + 10% fee, Ahura = fixed toman) ----------
const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', maker: 'OpenAI', kind: 'ext', use: ['text', 'code'], ctx: '128K', pin: 275000, pout: 1100000 },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', maker: 'OpenAI', kind: 'ext', use: ['text'], ctx: '128K', pin: 16500, pout: 66000 },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', maker: 'Anthropic', kind: 'ext', use: ['text', 'code'], ctx: '200K', pin: 330000, pout: 1650000 },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', maker: 'Google', kind: 'ext', use: ['text'], ctx: '1M', pin: 33000, pout: 275000 },
  { id: 'deepseek-v3', name: 'DeepSeek-V3', maker: 'DeepSeek', kind: 'ext', use: ['text', 'code'], ctx: '64K', pin: 29700, pout: 121000 },
  { id: 'text-embedding-3-small', name: 'text-embedding-3-small', maker: 'OpenAI', kind: 'ext', use: ['embed'], ctx: '8K', pin: 2200, pout: 0 },
  { id: 'qwen2.5-32b', name: 'Qwen2.5-32B', maker: 'اهورا (داخل ایران)', kind: 'ir', use: ['text', 'code'], ctx: '32K', pin: 12000, pout: 36000 },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', maker: 'اهورا (داخل ایران)', kind: 'ir', use: ['text'], ctx: '128K', pin: 20000, pout: 60000 },
  { id: 'bge-m3', name: 'bge-m3', maker: 'اهورا (داخل ایران)', kind: 'ir', use: ['embed'], ctx: '8K', pin: 1500, pout: 0 },
];
const M = Object.fromEntries(MODELS.map(m => [m.id, m]));
const USE = { text: 'متن و گفت‌وگو', code: 'کدنویسی', embed: 'Embedding' };
const FILTERS = [['all', 'همه‌ی مدل‌ها'], ['ext', 'مدل‌های خارجی'], ['ir', 'مدل‌های داخل ایران (اهورا)'], ['code', 'کدنویسی'], ['embed', 'Embedding']];
const CHARGES = [500000, 1000000, 3000000];
const MIN_CHARGE = 300000;
const GUARDS = [
  { k: 'pii', t: 'تشخیص اطلاعات شخصی (PII)', d: 'شماره‌ی تلفن، کد ملی، ایمیل و شماره‌ی کارت را پیش از ارسال به مدل پیدا و پنهان می‌کند.', price: 52000 },
  { k: 'jailbreak', t: 'جلوگیری از Jailbreak و Prompt Injection', d: 'درخواست‌هایی را که می‌خواهند قوانین دستیار را دور بزنند مسدود می‌کند.', price: 175000 },
  { k: 'moderation', t: 'فیلتر محتوای نامناسب', d: 'پرسش و پاسخ را از نظر محتوای نامناسب بررسی و در صورت نیاز مسدود می‌کند.', price: 140000 },
  { k: 'topics', t: 'موضوع‌های ممنوع (قانون ساده)', d: 'فهرست کلمه‌ها و موضوع‌هایی که دستیار نباید درباره‌ی آن‌ها پاسخ دهد؛ رایگان.', price: 0 },
];
const DB_PLANS = [
  { k: 'pg-s', t: 'PostgreSQL + pgvector · ۲ هسته / ۴ گیگ', price: 2050000 },
  { k: 'pg-m', t: 'PostgreSQL + pgvector · ۴ هسته / ۸ گیگ', price: 4550000 },
  { k: 'pg-l', t: 'PostgreSQL + pgvector · ۸ هسته / ۱۶ گیگ', price: 10050000 },
];
const BUCKETS = ['support-docs', 'product-faq', 'contracts-2025'];
const ROLES = { admin: 'مدیر پروژه', dev: 'توسعه‌دهنده', viewer: 'فقط مشاهده' };

// ---------- state ----------
const LS = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
const S = Object.assign({ wallet: 0, services: [], phase: 4, warn: 200000, block: 20000, tx: [] }, LS.get('aiaas_state', {}));
const save = () => LS.set('aiaas_state', S);

function rand(seed) { let s = seed % 2147483647 || 1; return () => (s = s * 16807 % 2147483647) / 2147483647; }
const key40 = () => [...crypto.getRandomValues(new Uint8Array(20))].map(b => b.toString(16).padStart(2, '0')).join('');

function newService(o) {
  return {
    id: o.id, name: o.name, models: o.models, created: o.created || Date.now(), status: 'active',
    keys: [{ id: 'k1', name: 'کلید اصلی', prefix: 'sk-ais-' + key40().slice(0, 6), created: o.created || Date.now(), last: null, status: 'active', cap: 0 }],
    kb: o.kb || [], datasets: [], members: [{ email: 'user@example.com', name: 'کاربر نمونه', role: 'admin' }],
    cap: o.cap || 0, capAction: 'stop', guards: o.guards || {}, topics: '', db: o.db || null, rate: 60,
  };
}
// the demo project shown on service 901 until a real project takes that id
function demo() {
  const s = newService({ id: DEMO, name: 'support-bot', models: ['gpt-4o-mini', 'qwen2.5-32b', 'bge-m3'], created: Date.now() - 24 * DAY });
  s.keys.push({ id: 'k2', name: 'اپ موبایل', prefix: 'sk-ais-9f3a1c', created: Date.now() - 10 * DAY, last: Date.now() - 3600e3, status: 'active', cap: 500000 });
  s.keys[0].last = Date.now() - 120e3;
  s.demo = true;
  return s;
}
const svc = id => S.services.find(s => s.id === +id) || (+id === DEMO ? (svc.demo ||= demo()) : null);

// usage per day and model for the last 30 days (fake, stable per project)
function usage(s) {
  const r = rand(s.id * 97), out = [];
  const start = Math.max(s.created, Date.now() - 29 * DAY);
  for (let t = start; t <= Date.now(); t += DAY) {
    s.models.forEach((id, i) => {
      const m = M[id], f = (0.4 + r()) * (i === 0 ? 1 : 0.5);
      const tin = Math.round((m.use.includes('embed') ? 900000 : 420000) * f), tout = m.pout ? Math.round(tin * (0.25 + r() * 0.2)) : 0;
      out.push({ t, model: id, tin, tout, cin: tin * m.pin / 1e6, cout: tout * m.pout / 1e6, req: Math.round(tin / 1400) });
    });
  }
  return out;
}
const sum = (a, k) => a.reduce((x, y) => x + y[k], 0);

// ---------- small components (Uikit-V3) ----------
const ic = {
  check: '<svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1e7b22"/><path d="M7.5 12.2l3 3 6-6.2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0013.5 4h-7A2.5 2.5 0 004 6.5v7A2.5 2.5 0 006.5 16H8"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01" stroke-linecap="round"/></svg>',
  close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  dots: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>',
  warn: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l9.5 17h-19L12 3z" stroke-linejoin="round"/><path d="M12 10v4.5M12 17.5v.01" stroke-linecap="round"/></svg>',
};
const SIDE_IC = {
  overview: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  models: 'M8 8h8v8H8zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3M5 5h14v14H5z',
  keys: 'M14.5 9.5a4.5 4.5 0 11-1.3-3.2M14.5 9.5L21 16v3h-3v-2h-2v-2h-1.5',
  usage: 'M4 20V10M10 20V4M16 20v-7M21 20H3',
  billing: 'M3 7.5A2.5 2.5 0 015.5 5H18a2 2 0 012 2v1H5.5M3 7.5V17a2 2 0 002 2h15v-4M3 7.5V8h17M20 11h-4a2 2 0 000 4h4z',
  logs: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  docs: 'M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14',
  knowledge: 'M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5zM4 20.5A2.5 2.5 0 016.5 23H20v-5',
  datasets: 'M3 5h18v14H3zM3 10h18M3 15h18M9 5v14',
  limits: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0M18 9h4M20 7v4',
  guardrails: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  database: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
};
const sideIcon = k => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${SIDE_IC[k]}"/></svg>`;

const tag = (t, c = 'gray', cls = '') => `<span class="ai-tag ai-tag-${c} ${cls}">${t}</span>`;
const ph = n => tag(PH[n], n === 1 ? 'primary' : n === 2 ? 'info' : n === 3 ? 'docs' : 'secondary', 'ai-ph-tag');
const btn = (t, act, kind = 'primary', extra = '') => `<button type="button" class="ai-btn ai-btn-${kind}" data-ai="${act}" ${extra}>${t}</button>`;
const status = s => s === 'active' ? tag('فعال', 'success') : s === 'suspended' ? tag('معلق', 'error') : s === 'revoked' ? tag('باطل‌شده', 'gray') : s === 'indexing' ? tag('در حال ایندکس', 'info') : s === 'ready' ? tag('آماده', 'success') : tag(esc(s));
const radio = on => `<span class="ai-radio${on ? ' on' : ''}"></span>`;
const checkbox = on => `<span class="ai-check${on ? ' on' : ''}"></span>`;
const toggle = on => `<span class="ai-switch${on ? ' on' : ''}"></span>`;
const alert = (type, html, action = '') => `<div class="ai-alert ai-alert-${type}">${type === 'info' ? ic.info : ic.warn}<div class="ai-alert-txt">${html}</div>${action}</div>`;
const crumbs = items => `<div class="nav-crumbs"><a href="#/my/panel">نمای کلی</a>${items.map(([t, r]) => `${NAV.icon('chevron-down', 16, 'nav-crumb-sep')}${r ? `<a href="#${r}">${t}</a>` : `<span>${t}</span>`}`).join('')}</div>`;
const phaseSwitch = () => `<div class="ai-phases"><span>نمایش محصول تا</span>${[1, 2, 3, 4].map(n => `<button type="button" class="${S.phase === n ? 'on' : ''}" data-ai="phase" data-v="${n}">${PH[n]}</button>`).join('')}</div>`;
const head = (title, items) => `<div class="ai-top">${crumbs(items)}${phaseSwitch()}</div>`;
const wrap = (route, html) => `<div class="nav-page ai" id="ai-root" data-route="${esc(route)}" data-show="${S.phase}">${html}</div>`;

function walletAlert() {
  if (S.wallet <= S.block && S.services.length) return alert('error', `موجودی کیف پول شما <b>${money(S.wallet)} تومان</b> است و به آستانه‌ی مسدودسازی رسیده؛ درخواست‌های پروژه‌ها تا شارژ دوباره متوقف شده‌اند.`, btn('شارژ کیف پول', 'drawer', 'primary', 'data-v="charge"'));
  if (S.wallet < S.warn && S.services.length) return alert('warning', `موجودی کیف پول شما به <b>${money(S.wallet)} تومان</b> رسیده است. اگر موجودی به ${money(S.block)} تومان برسد، درخواست‌های پروژه‌ها متوقف می‌شود.`, btn('شارژ کیف پول', 'drawer', 'tonal', 'data-v="charge"'));
  return '';
}

// ---------- list ----------
function listPage() {
  const p = NAV.product(LIST);
  if (!S.services.length) return wrap(LIST, `${head('AIaaS', [['AIaaS']])}<div class="ai-empty-host">${NAV.productPage(p).replace(/^<div class="nav-page">[\s\S]*?<\/div>\s*(<div class="nav-card">)/, '$1').replace(/<\/div>$/, '')}</div>`);
  const rows = S.services.map(s => {
    const u = usage(s).filter(x => x.t > Date.now() - 30 * DAY), cost = sum(u, 'cin') + sum(u, 'cout');
    return `<tr data-ai="open" data-v="${s.id}"><td><div class="ai-cell2"><b>${esc(s.name)}</b><span>شناسه ${fa(s.id)}</span></div></td>
      <td><div class="ai-cell2"><b>${fa(s.models.length)} مدل</b><span>${s.models.map(id => M[id].name).join('، ')}</span></div></td>
      <td>${money(cost)} <small>تومان</small></td><td>${date(s.created)}</td><td>${status(S.wallet <= S.block ? 'suspended' : s.status)}</td>
      <td><button type="button" class="ai-btn ai-btn-text" data-ai="open" data-v="${s.id}">جزئیات</button></td></tr>`;
  }).join('');
  return wrap(LIST, `${head('AIaaS', [['AIaaS']])}${walletAlert()}
    <div class="nav-card"><div class="ai-card-head"><h1 class="nav-card-title">AIaaS</h1>${ph(1)}</div>
      <div class="ai-toolbar"><div class="nav-search"><span>جستجو در نام پروژه</span></div><span class="ai-sp"></span>
        <div class="ai-wallet-chip">موجودی کیف پول: <b>${money(S.wallet)} تومان</b></div>${btn(ic.plus + 'ساخت پروژه‌ی جدید', 'go', 'primary', `data-v="${CFG}"`)}</div>
      <div class="ai-tabs"><button class="on">همه‌ی پروژه‌ها ${tag(fa(S.services.length) + ' پروژه', 'primary')}</button></div>
      <div class="ai-table-wrap"><table class="ai-table ai-rows"><thead><tr><th>نام پروژه</th><th>مدل‌ها</th><th>مصرف ۳۰ روز اخیر</th><th>تاریخ ساخت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>`);
}

// ---------- configuration ----------
let D = null;
function draft() {
  if (!D) D = { name: 'ai-project-' + Math.floor(10000 + Math.random() * 89999), models: [], filter: 'all', charge: 1000000, custom: 1000000, kb: null, bucket: BUCKETS[0], files: [], emb: 'bge-m3', dataset: false, cap: '', guards: {}, db: null, tried: false };
  return D;
}
function estimate(amount, ids) {
  const ms = (ids.length ? ids : ['gpt-4o-mini']).map(id => M[id]).filter(m => m.pout || m.use.includes('embed'));
  const avg = ms.reduce((a, m) => a + (m.pin * 0.75 + m.pout * 0.25), 0) / ms.length;
  return amount / avg * 1e6;
}
function section(n, title, phase, done, body, extra = '') {
  return `<section class="ai-sec" data-ph="${phase}"><div class="ai-sec-head">${done ? ic.check : `<span class="ai-step">${fa(n)}</span>`}<h2>${title}</h2>${ph(phase)}<span class="ai-sp"></span>${extra}</div>${body}</section>`;
}
function cfgPage() {
  const d = draft(), amount = d.charge === 'custom' ? +d.custom || 0 : d.charge;
  const shown = MODELS.filter(m => d.filter === 'all' || m.kind === d.filter || m.use.includes(d.filter));
  const modelRows = shown.map(m => {
    const on = d.models.includes(m.id);
    return `<tr class="${on ? 'sel' : ''}" data-ai="model" data-v="${m.id}"><td class="ai-td-ck">${checkbox(on)}</td>
      <td><div class="ai-cell2"><b class="ltr">${m.name}</b><span>${esc(m.maker)}</span></div></td>
      <td>${m.kind === 'ir' ? tag('داخل ایران', 'success') : tag('خارجی', 'gray')}</td><td>${m.use.map(u => USE[u]).join('، ')}</td><td class="ltr">${m.ctx}</td>
      <td><b>${money(m.pin)}</b> <small>تومان</small></td><td>${m.pout ? `<b>${money(m.pout)}</b> <small>تومان</small>` : '<small>—</small>'}</td></tr>`;
  }).join('');
  const chargeCard = (v, label) => {
    const on = d.charge === v, a = v === 'custom' ? +d.custom || 0 : v;
    return `<div class="ai-rcard${on ? ' on' : ''}" data-ai="charge" data-v="${v}"><div class="ai-rcard-t">${radio(on)}<b>${label}</b></div>
      ${v === 'custom' ? `<div class="ai-counter"><button type="button" data-ai="custom" data-v="${100000}">${ic.plus}</button><input data-ai-in="custom" inputmode="numeric" value="${money(d.custom)}"><button type="button" data-ai="custom" data-v="${-100000}">${ic.minus}</button></div>` : ''}
      <span class="ai-rcard-sub">حدود ${num(estimate(a, d.models))} توکن با مدل‌های انتخاب‌شده</span></div>`;
  };
  const nameOk = d.name.trim().length > 2, modelsOk = d.models.length > 0, chargeOk = amount >= MIN_CHARGE;
  const sections = [
    section(1, 'نام پروژه', 1, nameOk, `<label class="ai-field"><span>نام پروژه</span><input class="ai-input ltr" data-ai-in="name" value="${esc(d.name)}" placeholder="my-ai-project"><small>نام را بعداً هم می‌توانید از تنظیمات پروژه تغییر دهید.</small></label>`),
    section(2, 'انتخاب مدل‌ها', 1, modelsOk, `<div class="ai-chips">${FILTERS.map(([k, t]) => `<button type="button" class="ai-chip${d.filter === k ? ' on' : ''}" data-ai="filter" data-v="${k}">${t}</button>`).join('')}</div>
      <div class="ai-table-wrap"><table class="ai-table ai-pick"><thead><tr><th></th><th>نام مدل</th><th>محل اجرا</th><th>کاربرد</th><th>Context</th><th>قیمت ورودی (هر ۱ میلیون توکن)</th><th>قیمت خروجی (هر ۱ میلیون توکن)</th></tr></thead><tbody>${modelRows}</tbody></table></div>
      ${alert('info', 'قیمت مدل‌های خارجی برابر قیمت رسمی ارائه‌دهنده به‌اضافه‌ی ۱۰٪ کارمزد است. مدل‌های اجراشده در ایران (اهورا) قیمت تومانی ثابت دارند. همه‌ی مدل‌ها با یک کلید و API سازگار با OpenAI فراخوانی می‌شوند. <small>(قیمت‌ها نمونه است)</small>')}`,
      tag(fa(d.models.length) + ' مدل انتخاب شده', 'primary')),
    section(3, 'شارژ اولیه‌ی کیف پول', 1, chargeOk, `<div class="ai-paytabs"><span>دوره‌ای</span><span class="on">به ازای مصرف (Pay as you go)</span></div>
      <div class="ai-grid3">${CHARGES.map(v => chargeCard(v, money(v) + ' تومان')).join('')}${chargeCard('custom', 'مبلغ دلخواه')}</div>
      ${!chargeOk && d.charge === 'custom' ? `<p class="ai-err">کمترین مبلغ شارژ ${money(MIN_CHARGE)} تومان است.</p>` : ''}
      ${alert('warning', 'ساخت پروژه رایگان است و فقط مصرف توکن هزینه دارد. مصرف هر دقیقه از کیف پول شما کسر می‌شود؛ پیش از تمام شدن موجودی با پیامک، ایمیل و بله خبرتان می‌کنیم و در آستانه‌ی مسدودسازی درخواست‌ها تا شارژ دوباره متوقف می‌شود.')}`),
    section(4, 'پایگاه دانش و دیتاست (RAG)', 2, !!d.kb, `<p class="ai-desc">مدل پاسخ را از اسناد خود شما می‌دهد. اسناد روی آبجکت استوریج ایران‌سرور می‌مانند، تکه‌تکه و embedding می‌شوند و هنگام هر درخواست، بخش‌های مرتبط به مدل داده می‌شود. اختیاری است و بعداً هم از جزئیات سرویس قابل افزودن است.</p>
      <div class="ai-grid3">${[['s3', 'اتصال باکت آبجکت استوریج', 'باکت موجود را انتخاب کنید؛ تغییر فایل‌ها خودکار همگام می‌شود.'], ['upload', 'بارگذاری فایل', 'PDF، Word، Excel و CSV تا ۵۰ مگابایت.'], [null, 'فعلاً نه', 'پروژه بدون پایگاه دانش ساخته می‌شود.']].map(([k, t, s]) => `<div class="ai-rcard${d.kb === k ? ' on' : ''}" data-ai="kb" data-v="${k}"><div class="ai-rcard-t">${radio(d.kb === k)}<b>${t}</b></div><span class="ai-rcard-sub">${s}</span></div>`).join('')}</div>
      ${d.kb === 's3' ? `<label class="ai-field"><span>باکت</span><select class="ai-input" data-ai-in="bucket">${BUCKETS.map(b => `<option ${d.bucket === b ? 'selected' : ''}>${b}</option>`).join('')}</select></label>` : ''}
      ${d.kb === 'upload' ? `<div class="ai-upload" data-ai="upload">${ic.plus}<span>برای انتخاب فایل کلیک کنید</span><small>${d.files.length ? d.files.map(esc).join('، ') : 'هنوز فایلی انتخاب نشده'}</small></div>` : ''}
      ${d.kb ? `<div class="ai-row2"><label class="ai-field"><span>مدل embedding</span><select class="ai-input" data-ai-in="emb"><option value="bge-m3" ${d.emb === 'bge-m3' ? 'selected' : ''}>bge-m3 (اهورا، داخل ایران) · ${money(1500)} تومان</option><option value="text-embedding-3-small" ${d.emb !== 'bge-m3' ? 'selected' : ''}>text-embedding-3-small (OpenAI) · ${money(2200)} تومان</option></select></label>
        <div class="ai-ck-row" data-ai="dataset">${checkbox(d.dataset)}<span>یک دیتاست پرسش و پاسخ هم از همین اسناد بساز (برای RAG و در آینده ارزیابی و fine-tuning)</span></div></div>` : ''}`),
    section(5, 'نقش‌ها و سقف خرج', 2, !!d.cap, `<p class="ai-desc">سقف خرج ماهانه‌ی پروژه را تعیین کنید تا هزینه از آن رد نشود. سقف هر کلید و نقش اعضای حساب را بعداً از جزئیات سرویس تنظیم می‌کنید.</p>
      <div class="ai-row2"><label class="ai-field"><span>سقف خرج ماهانه‌ی پروژه (تومان)</span><input class="ai-input" data-ai-in="cap" inputmode="numeric" value="${d.cap ? money(d.cap) : ''}" placeholder="بدون سقف"></label>
      <label class="ai-field"><span>بعد از رسیدن به سقف</span><select class="ai-input"><option>درخواست‌ها متوقف شوند</option><option>فقط هشدار داده شود</option></select></label></div>`),
    section(6, 'گاردریل', 3, Object.values(d.guards).some(Boolean), `<div class="ai-grid3">${GUARDS.map(g => `<div class="ai-plug${d.guards[g.k] ? ' on' : ''}" data-ai="guard" data-v="${g.k}"><div class="ai-plug-t"><b>${g.t}</b>${checkbox(d.guards[g.k])}</div><p>${g.d}</p><div class="ai-plug-p">${g.price ? `<b>${money(g.price)}</b> <small>تومان / هر ۱ میلیون توکن بررسی‌شده</small>` : '<b>رایگان</b>'}</div></div>`).join('')}</div>`),
    section(7, 'دیتابیس پایگاه دانش (DBaaS)', 4, !!d.db, `<p class="ai-desc">پایگاه دانش علاوه بر آبجکت استوریج روی دیتابیس مدیریت‌شده‌ی خود شما (PostgreSQL با pgvector) نگه‌داری می‌شود.</p>
      <div class="ai-grid3">${DB_PLANS.map(p => `<div class="ai-rcard${d.db === p.k ? ' on' : ''}" data-ai="db" data-v="${p.k}"><div class="ai-rcard-t">${radio(d.db === p.k)}<b>${p.t}</b></div><span class="ai-rcard-sub"><b>${money(p.price)}</b> تومان / ماهانه</span></div>`).join('')}
      <div class="ai-rcard${!d.db ? ' on' : ''}" data-ai="db" data-v=""><div class="ai-rcard-t">${radio(!d.db)}<b>بدون دیتابیس</b></div><span class="ai-rcard-sub">فقط آبجکت استوریج</span></div></div>`),
  ];
  return wrap(CFG, `${head('', [['AIaaS', LIST], ['ساخت پروژه‌ی AI']])}<div class="ai-cfg"><div class="ai-cfg-main">${sections.join('')}</div><aside class="ai-sum" id="ai-sum">${summary()}</aside></div>`);
}
function summary() {
  const d = draft(), amount = d.charge === 'custom' ? +d.custom || 0 : d.charge;
  const row = (label, phase, html) => `<div class="ai-sum-row" data-ph="${phase}"><span class="ai-sum-l">${label}</span>${html}</div>`;
  const err = t => `<span class="ai-sum-err">${t}</span>`;
  const guards = GUARDS.filter(g => d.guards[g.k]);
  const db = DB_PLANS.find(p => p.k === d.db);
  return `<div class="ai-sum-box">
    ${row('نام پروژه', 1, d.name.trim().length > 2 ? `<b class="ltr">${esc(d.name)}</b>` : err('نام پروژه وارد نشده است'))}
    ${row('مدل پرداخت', 1, '<b>به ازای مصرف</b><small>هزینه‌ی هر توکن از کیف پول</small>')}
    ${row('مدل‌ها', 1, d.models.length ? d.models.map(id => `<div class="ai-sum-line"><b class="ltr">${M[id].name}</b><small>${money(M[id].pin)} / ${M[id].pout ? money(M[id].pout) : '—'}</small></div>`).join('') + '<small>قیمت ورودی / خروجی هر ۱ میلیون توکن (تومان)</small>' : err('مدلی انتخاب نشده است'))}
    ${row('شارژ اولیه‌ی کیف پول', 1, amount >= MIN_CHARGE ? `<div class="ai-sum-line"><b>${money(amount)} تومان</b><small>حدود ${num(estimate(amount, d.models))} توکن</small></div>` : err('حداقل ' + money(MIN_CHARGE) + ' تومان'))}
    ${row('پایگاه دانش', 2, d.kb ? `<b>${d.kb === 's3' ? 'باکت ' + esc(d.bucket) : 'بارگذاری فایل (' + fa(d.files.length) + ')'}</b><small>embedding: ${d.emb}${d.dataset ? ' · با دیتاست' : ''}</small>` : '<small>ندارد</small>')}
    ${row('سقف خرج ماهانه', 2, d.cap ? `<b>${money(d.cap)} تومان</b>` : '<small>بدون سقف</small>')}
    ${row('گاردریل', 3, guards.length ? guards.map(g => `<div class="ai-sum-line"><b>${g.t}</b><small>${g.price ? money(g.price) + ' / ۱M' : 'رایگان'}</small></div>`).join('') : '<small>ندارد</small>')}
    ${row('دیتابیس', 4, db ? `<div class="ai-sum-line"><b>${db.t}</b><small>${money(db.price)} ماهانه</small></div>` : '<small>ندارد</small>')}
  </div>
  <div class="ai-sum-total"><div class="ai-sum-tl"><span class="ai-free">${ic.info} هزینه‌ی ساخت پروژه</span><b class="ai-free">رایگان</b></div>
    <div class="ai-sum-tl"><span>مبلغ قابل پرداخت</span><b class="ai-total">${money(amount + (db ? db.price : 0))} تومان</b></div>
    <small class="ai-sum-note">شارژ کیف پول ${money(amount)} تومان${db ? ` + ماه اول دیتابیس ${money(db.price)} تومان (تمدید ماهانه مثل سرویس DBaaS)` : ''}</small>
    <button type="button" class="ai-btn ai-btn-primary ai-btn-block" data-ai="submit">ثبت و ادامه</button></div>`;
}

// ---------- service details ----------
const SECTIONS = [
  { k: 'overview', t: 'نمای کلی', ph: 1 }, { k: 'models', t: 'مدل‌ها', ph: 1 }, { k: 'keys', t: 'کلیدهای AI', ph: 1 },
  { k: 'usage', t: 'مصرف و هزینه', ph: 1 }, { k: 'billing', t: 'کیف پول و فاکتورها', ph: 1 }, { k: 'logs', t: 'لاگ درخواست‌ها', ph: 1 },
  { k: 'docs', t: 'راهنمای اتصال', ph: 1 },
  { k: 'knowledge', t: 'پایگاه دانش', ph: 2 }, { k: 'datasets', t: 'دیتاست‌ها', ph: 2 }, { k: 'limits', t: 'نقش‌ها و سقف خرج', ph: 2 },
  { k: 'guardrails', t: 'گاردریل', ph: 3 }, { k: 'database', t: 'دیتابیس (DBaaS)', ph: 4 },
  { k: 'settings', t: 'تنظیمات پروژه', ph: 1 },
];
const GROUPS = [[1, 'پایه', ['overview', 'models', 'keys', 'usage', 'billing', 'logs', 'docs']], [2, 'دانش و کنترل', ['knowledge', 'datasets', 'limits']], [3, 'امنیت محتوا', ['guardrails']], [4, 'داده روی دیتابیس', ['database']], [1, 'عمومی', ['settings']]];

function detailPage(id, k) {
  const s = svc(id);
  if (!s) return wrap(svcRoute(id, k), `${head('', [['AIaaS', LIST], ['پروژه یافت نشد']])}<div class="nav-card">${alert('warning', 'این پروژه وجود ندارد یا حذف شده است.', btn('بازگشت به لیست', 'go', 'tonal', `data-v="${LIST}"`))}</div>`);
  const sec = SECTIONS.find(x => x.k === k) || SECTIONS[0];
  const st = S.wallet <= S.block && !s.demo ? 'suspended' : s.status;
  const side = sidePanel(s, sec.k, st);
  const top = `<div class="nav-card ai-hero"><div class="ai-hero-t"><div><h1 class="ai-hero-name ltr">${esc(s.name)}</h1><span class="ai-muted">شناسه‌ی پروژه ${fa(s.id)}${s.demo ? ' · پروژه‌ی نمونه' : ''}</span></div>${status(st)}</div>
    <div class="ai-hero-info">
      <div><span>آدرس API</span><b class="ltr">${API}</b><button type="button" class="ai-icon-btn" data-ai="copy" data-v="${API}" title="کپی">${ic.copy}</button></div>
      <div><span>مدل پرداخت</span><b>به ازای مصرف · کسر از کیف پول</b></div>
      <div><span>تاریخ ساخت</span><b>${date(s.created)}</b></div>
      <div><span>موجودی کیف پول</span><b>${money(S.wallet)} تومان</b></div></div>
    <div class="ai-hero-btns">${btn('شارژ کیف پول', 'drawer', 'primary', 'data-v="charge"')}${btn('ساخت کلید AI', 'drawer', 'outline', 'data-v="key"')}${btn('افزودن مدل', 'drawer', 'outline', 'data-v="model"')}${btn('ساخت پروژه‌ی جدید', 'go', 'outline', `data-v="${CFG}"`)}</div></div>`;
  return wrap(svcRoute(s.id, sec.k), `${side}${head('', [['AIaaS', LIST], [s.name, svcRoute(s.id)], [sec.t]])}${walletAlert()}${top}
    <div class="ai-main"><div class="nav-card"><div class="ai-card-head"><h2 class="nav-card-title">${sec.t}</h2>${ph(sec.ph)}</div>${SEC[sec.k](s)}</div></div>`);
}

// Second sidebar (service details only): full height beside the rail, like the host service's sidebar.
// Top: product title and collapse button, then a dropdown to switch between the user's projects; then the actions by group and phase.
let PICK = false;
const projects = () => S.services.some(x => x.id === DEMO) ? S.services : [svc(DEMO), ...S.services];
function sidePanel(s, k, st) {
  const groups = GROUPS.map(([p, t, ks]) => `<div class="ai-side-g" data-ph="${p}"><div class="ai-side-h"><span>${t}</span>${ph(p)}</div>${ks.map(x => {
    const it = SECTIONS.find(y => y.k === x);
    return `<a class="ai-side-i${x === k ? ' on' : ''}" href="#${svcRoute(s.id, x)}">${sideIcon(x)}<span>${it.t}</span></a>`;
  }).join('')}</div>`).join('');
  const list = projects().map(x => `<button type="button" class="ai-pj-opt${x.id === s.id ? ' on' : ''}" data-ai="pick" data-v="${x.id}">${NAV.icon('ai', 20)}<span class="ai-pj-n ltr">${esc(x.name)}</span>${x.id === s.id ? '<i class="ai-pj-ck"></i>' : ''}</button>`).join('');
  return `<aside class="ai-side2">
    <div class="ai-side2-head"><b>AIaaS</b><button type="button" class="ai-icon-btn ai-side2-col" data-ai="side2" title="بستن">${NAV.icon('chevron-down', 18)}</button></div>
    <div class="ai-pj${PICK ? ' open' : ''}"><button type="button" class="ai-pj-btn" data-ai="pj">${NAV.icon('ai', 24)}<span class="ai-pj-txt"><span class="ai-pj-n ltr">${esc(s.name)}</span>${status(st)}</span>${NAV.icon('chevron-down', 16, 'ai-pj-chev')}</button>
      <div class="ai-pj-list">${list}<button type="button" class="ai-pj-opt ai-pj-new" data-ai="go" data-v="${CFG}">${ic.plus}<span>ساخت پروژه‌ی جدید</span></button><a class="ai-pj-all" href="#${LIST}">همه‌ی پروژه‌ها</a></div></div>
    <nav class="ai-side2-nav">${groups}</nav></aside>
    <button type="button" class="ai-side2-open" data-ai="side2" title="باز کردن منوی سرویس">${NAV.icon('chevron-down', 18)}</button>`;
}

const tbl = (heads, rows, empty) => rows.length ? `<div class="ai-table-wrap"><table class="ai-table"><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`
  : `<div class="ai-empty-s">${NAV.icon('ai', 40)}<p>${empty}</p></div>`;
const kpi = (label, value, sub = '') => `<div class="ai-kpi"><span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
function bars(u) {
  const days = {};
  u.forEach(x => { const d = Math.floor(x.t / DAY); days[d] = (days[d] || 0) + x.cin + x.cout; });
  const v = Object.entries(days).slice(-14), max = Math.max(...v.map(([, c]) => c), 1);
  return `<div class="ai-bars">${v.map(([d, c]) => `<div class="ai-bar" title="${date(+d * DAY)} · ${money(c)} تومان"><i style="height:${Math.max(4, c / max * 100)}%"></i><span>${fa(new Intl.DateTimeFormat('en-US-u-ca-persian', { day: 'numeric' }).format(new Date(+d * DAY)))}</span></div>`).join('')}</div>`;
}
const snippet = (s, lang) => {
  const key = (s.keys.find(k => k.status === 'active') || s.keys[0]).prefix + '…';
  const model = s.models.find(id => !M[id].use.includes('embed')) || s.models[0];
  if (lang === 'python') return `from openai import OpenAI\n\nclient = OpenAI(base_url="${API}", api_key="${key}")\nr = client.chat.completions.create(\n    model="${model}",\n    messages=[{"role": "user", "content": "سلام"}],\n)\nprint(r.choices[0].message.content)`;
  if (lang === 'node') return `import OpenAI from "openai";\n\nconst client = new OpenAI({ baseURL: "${API}", apiKey: "${key}" });\nconst r = await client.chat.completions.create({\n  model: "${model}",\n  messages: [{ role: "user", content: "سلام" }],\n});\nconsole.log(r.choices[0].message.content);`;
  return `curl ${API}/chat/completions \\\n  -H "Authorization: Bearer ${key}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model": "${model}", "messages": [{"role": "user", "content": "سلام"}]}'`;
};
let LANG = 'curl', RANGE = 30;

const SEC = {
  overview(s) {
    const u = usage(s), m30 = u.filter(x => x.t > Date.now() - 30 * DAY), today = u.filter(x => x.t > Date.now() - DAY);
    const c30 = sum(m30, 'cin') + sum(m30, 'cout'), daily = c30 / Math.max(1, Math.min(30, (Date.now() - s.created) / DAY));
    return `<div class="ai-kpis">${kpi('هزینه‌ی امروز', money(sum(today, 'cin') + sum(today, 'cout')) + ' تومان')}${kpi('هزینه‌ی ۳۰ روز اخیر', money(c30) + ' تومان')}
      ${kpi('توکن ورودی / خروجی (۳۰ روز)', num(sum(m30, 'tin')) + ' / ' + num(sum(m30, 'tout')))}${kpi('موجودی کیف پول', money(S.wallet) + ' تومان', daily ? 'کافی برای حدود ' + fa(Math.max(0, Math.floor(S.wallet / daily))) + ' روز با مصرف فعلی' : '')}</div>
      <div class="ai-sub"><h3>هزینه‌ی روزانه (۱۴ روز اخیر)</h3>${bars(u)}</div>
      <div class="ai-sub"><h3>مدل‌های این پروژه</h3><div class="ai-pills">${s.models.map(id => `<span class="ai-pill"><b class="ltr">${M[id].name}</b>${M[id].kind === 'ir' ? tag('داخل ایران', 'success') : tag('خارجی', 'gray')}</span>`).join('')}</div></div>
      <div class="ai-sub"><h3>شروع سریع</h3><p class="ai-desc">کد فعلی‌تان با هر SDK سازگار با OpenAI کار می‌کند؛ فقط آدرس پایه، کلید و نام مدل را عوض کنید.</p><pre class="ai-code ltr">${esc(snippet(s, 'curl'))}</pre></div>`;
  },
  models(s) {
    const u = usage(s).filter(x => x.t > Date.now() - 30 * DAY);
    return `<div class="ai-sec-tools"><p class="ai-desc">فقط مدل‌هایی که اینجا فعال‌اند با کلیدهای این پروژه قابل فراخوانی‌اند. درخواست به مدل دیگر با خطای «مدل غیرمجاز» رد می‌شود.</p>${btn(ic.plus + 'افزودن مدل', 'drawer', 'tonal', 'data-v="model"')}</div>
      ${tbl(['نام مدل', 'محل اجرا', 'قیمت ورودی / خروجی (هر ۱M توکن)', 'مصرف ۳۰ روز', 'وضعیت', ''], s.models.map(id => {
        const m = M[id], mu = u.filter(x => x.model === id);
        return `<tr><td><div class="ai-cell2"><b class="ltr">${m.name}</b><span>${esc(m.maker)} · ${m.ctx}</span></div></td><td>${m.kind === 'ir' ? tag('داخل ایران', 'success') : tag('خارجی', 'gray')}</td>
          <td>${money(m.pin)} / ${m.pout ? money(m.pout) : '—'} <small>تومان</small></td><td>${money(sum(mu, 'cin') + sum(mu, 'cout'))} <small>تومان</small></td><td>${status('active')}</td>
          <td>${s.models.length > 1 ? `<button type="button" class="ai-btn ai-btn-text ai-danger" data-ai="model-del" data-v="${id}">حذف از پروژه</button>` : ''}</td></tr>`;
      }), '')}`;
  },
  keys(s) {
    return `<div class="ai-sec-tools"><p class="ai-desc">کلید AI فقط به مدل‌های همین پروژه دسترسی دارد و برای مدیریت سرویس‌ها کار نمی‌کند (برای آن از <a href="#/index.php?m=is_security&action=apitokens">توکن API حساب</a> استفاده کنید).</p>${btn(ic.plus + 'ساخت کلید AI', 'drawer', 'tonal', 'data-v="key"')}</div>
      ${tbl(['نام کلید', 'کلید', 'تاریخ ساخت', 'آخرین استفاده', 'سقف ماهانه', 'وضعیت', ''], s.keys.map(k => `<tr><td><b>${esc(k.name)}</b></td><td class="ltr"><code>${k.prefix}••••••••</code></td><td>${date(k.created)}</td>
        <td>${k.last ? time(k.last) + ' · ' + date(k.last) : '<small>هنوز استفاده نشده</small>'}</td><td data-ph="2">${k.cap ? money(k.cap) + ' تومان' : '<small>بدون سقف</small>'}</td><td>${status(k.status)}</td>
        <td>${k.status === 'active' ? `<button type="button" class="ai-btn ai-btn-text" data-ai="key-reissue" data-v="${k.id}">صدور دوباره</button><button type="button" class="ai-btn ai-btn-text ai-danger" data-ai="key-revoke" data-v="${k.id}">باطل کردن</button>` : ''}</td></tr>`), 'هنوز کلیدی ندارید.')}
      ${alert('info', 'کلید فقط یک بار، هنگام ساخت، کامل نمایش داده می‌شود. آن را در جای امن نگه دارید و در کد سمت کاربر (مرورگر یا اپ) قرار ندهید.')}`;
  },
  usage(s) {
    const u = usage(s).filter(x => x.t > Date.now() - RANGE * DAY);
    const rows = s.models.map(id => { const mu = u.filter(x => x.model === id); return { id, tin: sum(mu, 'tin'), tout: sum(mu, 'tout'), cin: sum(mu, 'cin'), cout: sum(mu, 'cout'), req: sum(mu, 'req') }; });
    return `<div class="ai-sec-tools"><div class="ai-chips">${[[1, 'امروز'], [7, '۷ روز اخیر'], [30, '۳۰ روز اخیر']].map(([v, t]) => `<button type="button" class="ai-chip${RANGE === v ? ' on' : ''}" data-ai="range" data-v="${v}">${t}</button>`).join('')}</div>${btn('خروجی Excel', 'toast', 'outline', 'data-v="فایل گزارش مصرف آماده‌ی دانلود شد (نمونه)."')}</div>
      ${tbl(['مدل', 'تعداد درخواست', 'توکن ورودی', 'توکن خروجی', 'هزینه‌ی ورودی', 'هزینه‌ی خروجی', 'جمع'], rows.map(r => `<tr><td><b class="ltr">${M[r.id].name}</b></td><td>${money(r.req)}</td><td>${money(r.tin)}</td><td>${M[r.id].pout ? money(r.tout) : '—'}</td>
        <td>${money(r.cin)}</td><td>${M[r.id].pout ? money(r.cout) : '—'}</td><td><b>${money(r.cin + r.cout)}</b> <small>تومان</small></td></tr>`).concat(`<tr class="ai-tfoot"><td><b>جمع کل</b></td><td>${money(sum(rows, 'req'))}</td><td>${money(sum(rows, 'tin'))}</td><td>${money(sum(rows, 'tout'))}</td><td>${money(sum(rows, 'cin'))}</td><td>${money(sum(rows, 'cout'))}</td><td><b>${money(sum(rows, 'cin') + sum(rows, 'cout'))}</b> <small>تومان</small></td></tr>`), '')}
      <p class="ai-desc"><small>هزینه = (توکن ورودی × قیمت ورودی + توکن خروجی × قیمت خروجی) ÷ ۱٬۰۰۰٬۰۰۰. مصرف هر دقیقه از سرویس دریافت و به ریال از کیف پول کسر می‌شود.</small></p>`;
  },
  billing(s) {
    const u = usage(s), months = {};
    u.forEach(x => { const m = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric', month: 'long' }).format(new Date(x.t)); months[m] = (months[m] || 0) + x.cin + x.cout; });
    const tx = S.tx.slice().reverse().slice(0, 8);
    return `<div class="ai-kpis">${kpi('موجودی کیف پول', money(S.wallet) + ' تومان')}${kpi('آستانه‌ی هشدار', money(S.warn) + ' تومان', 'پیامک، ایمیل و بله')}${kpi('آستانه‌ی مسدودسازی', money(S.block) + ' تومان', 'درخواست‌ها متوقف می‌شود')}</div>
      <div class="ai-sec-tools"><span class="ai-sp"></span>${btn('تنظیم هشدارها', 'drawer', 'outline', 'data-v="alerts"')}${btn('شبیه‌سازی کسر مصرف یک روز (نمونه)', 'simulate', 'text')}${btn('شارژ کیف پول', 'drawer', 'primary', 'data-v="charge"')}</div>
      <div class="ai-sub"><h3>تراکنش‌های کیف پول</h3>${tbl(['زمان', 'شرح', 'مبلغ', 'موجودی بعد'], tx.map(t => `<tr><td>${date(t.t)} · ${time(t.t)}</td><td>${esc(t.d)}</td><td class="${t.a < 0 ? 'ai-neg' : 'ai-pos'}">${t.a < 0 ? '−' : '+'}${money(Math.abs(t.a))} تومان</td><td>${money(t.b)} تومان</td></tr>`), 'تراکنشی ثبت نشده است.')}</div>
      <div class="ai-sub"><h3>فاکتورهای رسمی ماهانه</h3><p class="ai-desc">کسر از کیف پول هر دقیقه انجام می‌شود، ولی فاکتور رسمی مصرف هر پروژه ماهانه صادر می‌شود؛ هنگام حذف پروژه هم یک فاکتور پایانی صادر می‌شود.</p>
        ${tbl(['دوره', 'شرح', 'مبلغ', 'وضعیت'], Object.entries(months).reverse().map(([m, c], i) => `<tr><td>${m}</td><td>مصرف پروژه‌ی <span class="ltr">${esc(s.name)}</span></td><td>${money(c)} تومان</td><td>${i === 0 ? tag('در حال محاسبه', 'warning') : tag('صادر شده', 'success')}</td></tr>`), '')}</div>`;
  },
  logs(s) {
    const r = rand(s.id * 13), rows = [];
    for (let i = 0; i < 12; i++) {
      const id = s.models[Math.floor(r() * s.models.length)], m = M[id], tin = Math.round(200 + r() * 3000), tout = m.pout ? Math.round(50 + r() * 900) : 0, ok = r() > 0.08;
      rows.push(`<tr><td>${time(Date.now() - i * 97e3 - r() * 60e3)}</td><td class="ltr">${m.name}</td><td>${esc(s.keys[Math.floor(r() * s.keys.length)].name)}</td><td>${money(tin)}</td><td>${tout ? money(tout) : '—'}</td>
        <td>${money((tin * m.pin + tout * m.pout) / 1e6)} <small>تومان</small></td><td>${fa(Math.round(300 + r() * 2200))} ms</td><td>${ok ? tag('۲۰۰', 'success') : tag('۴۲۹', 'error')}</td></tr>`);
    }
    return `${alert('info', 'برای هر درخواست متادیتا (زمان، مدل، کلید، توکن، هزینه، وضعیت) همیشه ذخیره می‌شود. متن درخواست و پاسخ رمزنگاری‌شده و با دسترسی محدود نگه‌داری می‌شود و اینجا نمایش داده نمی‌شود. نحوه‌ی استفاده از این داده در فازهای بعد تعیین می‌شود.')}
      ${tbl(['زمان', 'مدل', 'کلید', 'توکن ورودی', 'توکن خروجی', 'هزینه', 'زمان پاسخ', 'وضعیت'], rows, '')}`;
  },
  docs(s) {
    return `<p class="ai-desc">«سازگار با OpenAI» یعنی همان قالب API و SDKهای OpenAI برای همه‌ی مدل‌های این پروژه (GPT، Claude، Gemini، DeepSeek و مدل‌های اهورا) کار می‌کند و فقط نام مدل را عوض می‌کنید.</p>
      <div class="ai-hero-info"><div><span>آدرس پایه</span><b class="ltr">${API}</b><button type="button" class="ai-icon-btn" data-ai="copy" data-v="${API}">${ic.copy}</button></div><div><span>نام مدل‌ها</span><b class="ltr">${s.models.join(', ')}</b></div></div>
      <div class="ai-chips">${[['curl', 'cURL'], ['python', 'Python'], ['node', 'Node.js']].map(([k, t]) => `<button type="button" class="ai-chip${LANG === k ? ' on' : ''}" data-ai="lang" data-v="${k}">${t}</button>`).join('')}</div>
      <pre class="ai-code ltr">${esc(snippet(s, LANG))}</pre>
      <div class="ai-sub"><h3>Endpointها</h3>${tbl(['مسیر', 'کاربرد'], [['/v1/chat/completions', 'گفت‌وگو و تولید متن (با streaming)'], ['/v1/embeddings', 'تبدیل متن به بردار برای جستجو و RAG'], ['/v1/models', 'فهرست مدل‌های فعال پروژه']].map(([p, t]) => `<tr><td class="ltr"><code>${p}</code></td><td>${t}</td></tr>`), '')}</div>`;
  },
  knowledge(s) {
    return `<div class="ai-sec-tools"><p class="ai-desc">مدل پاسخ را از اسناد خود شما می‌دهد. منبع‌ها روی آبجکت استوریج ایران‌سرور هستند و با هر تغییر دوباره ایندکس می‌شوند.</p>${btn(ic.plus + 'افزودن منبع', 'drawer', 'tonal', 'data-v="kb"')}</div>
      ${tbl(['منبع', 'نوع', 'مدل embedding', 'تعداد تکه‌ها', 'آخرین همگام‌سازی', 'وضعیت', ''], s.kb.map((k, i) => `<tr><td><b class="ltr">${esc(k.name)}</b></td><td>${k.type === 's3' ? 'باکت آبجکت استوریج' : 'فایل بارگذاری‌شده'}</td><td class="ltr">${k.emb}</td><td>${k.status === 'ready' ? money(k.chunks) : '—'}</td><td>${date(k.t)}</td><td>${status(k.status)}</td>
        <td><button type="button" class="ai-btn ai-btn-text ai-danger" data-ai="kb-del" data-v="${i}">حذف</button></td></tr>`), 'هنوز منبعی به پایگاه دانش این پروژه وصل نشده است.')}
      <div class="ai-sub"><h3>نحوه‌ی استفاده در درخواست</h3><pre class="ai-code ltr">${esc(`{"model": "${s.models[0]}", "messages": [...], "knowledge_base": "kb-${s.id}"}`)}</pre></div>
      ${s.db ? alert('info', `ایندکس این پایگاه دانش روی دیتابیس <b class="ltr">${esc(s.db.name)}</b> نگه‌داری می‌شود (فاز ۴).`) : ''}`;
  },
  datasets(s) {
    const ds = s.datasets;
    return `<div class="ai-sec-tools"><p class="ai-desc">دیتاست مجموعه‌ی پرسش و پاسخ تأییدشده (سؤال، جواب درست، منبع و برچسب) است. یک بار ساخته می‌شود و برای RAG، و در آینده برای ارزیابی و fine-tuning، به کار می‌رود.</p>${btn(ic.plus + 'ساخت دیتاست', 'drawer', 'tonal', 'data-v="ds"')}</div>
      ${tbl(['نام', 'منبع', 'رکوردها', 'تأییدشده', 'سهم ارزیابی', 'کاربرد', 'وضعیت'], ds.map(d => `<tr><td><b>${esc(d.name)}</b></td><td>${esc(d.src)}</td><td>${money(d.n)}</td><td>${money(d.ok)}</td><td>${fa(d.eval)}٪</td><td>${tag('RAG', 'primary')} ${tag('ارزیابی', 'gray')}</td><td>${d.ok < d.n ? tag('در انتظار بازبینی', 'warning') : status('ready')}</td></tr>`), 'هنوز دیتاستی نساخته‌اید.')}
      ${ds.length ? `<div class="ai-sub"><h3>بازبینی رکوردها · ${esc(ds[0].name)}</h3>${tbl(['سؤال', 'جواب', 'منبع', ''], [['چطور دامنه‌ی خودم را به سرویس وصل کنم؟', 'یک رکورد CNAME به آدرس سرویس بسازید و…', 'راهنما، بخش ۷.۲'], ['کیف پول چطور شارژ می‌شود؟', 'از صفحه‌ی جزئیات سرویس، «شارژ کیف پول»…', 'پرسش‌های رایج'], ['چرا درخواستم خطای ۴۲۹ می‌دهد؟', 'تعداد درخواست از سقف دقیقه‌ای بیشتر شده…', 'تیکت ۴۰۱۱۰۱']].map(([q, a, src], i) => `<tr><td>${q}</td><td>${a}</td><td>${src}</td><td>${i ? `<button type="button" class="ai-btn ai-btn-text" data-ai="toast" data-v="رکورد تأیید شد.">تأیید</button><button type="button" class="ai-btn ai-btn-text ai-danger" data-ai="toast" data-v="رکورد رد شد.">رد</button>` : tag('تأییدشده', 'success')}</td></tr>`), '')}</div>` : ''}`;
  },
  limits(s) {
    const u = usage(s).filter(x => x.t > Date.now() - 30 * DAY), c = sum(u, 'cin') + sum(u, 'cout');
    return `<div class="ai-kpis">${kpi('سقف خرج ماهانه‌ی پروژه', s.cap ? money(s.cap) + ' تومان' : 'بدون سقف', s.cap ? 'مصرف این ماه: ' + fa(Math.min(100, Math.round(c / s.cap * 100))) + '٪' : '')}${kpi('بعد از رسیدن به سقف', s.capAction === 'stop' ? 'توقف درخواست‌ها' : 'فقط هشدار')}${kpi('Rate limit', fa(s.rate) + ' درخواست در دقیقه', 'برای هر کلید')}</div>
      ${s.cap ? `<div class="ai-progress"><i style="width:${Math.min(100, c / s.cap * 100)}%"></i></div>` : ''}
      <div class="ai-sec-tools"><span class="ai-sp"></span>${btn('تنظیم سقف خرج', 'drawer', 'tonal', 'data-v="cap"')}</div>
      <div class="ai-sub"><h3>سقف هر کلید</h3>${tbl(['کلید', 'سقف ماهانه', ''], s.keys.filter(k => k.status === 'active').map(k => `<tr><td><b>${esc(k.name)}</b> <code class="ltr">${k.prefix}…</code></td><td>${k.cap ? money(k.cap) + ' تومان' : '<small>بدون سقف</small>'}</td><td><button type="button" class="ai-btn ai-btn-text" data-ai="drawer" data-v="cap">ویرایش</button></td></tr>`), '')}</div>
      <div class="ai-sub"><div class="ai-sec-tools"><h3>اعضا و نقش‌ها</h3>${btn(ic.plus + 'افزودن عضو', 'drawer', 'outline', 'data-v="member"')}</div>
        ${tbl(['عضو', 'نقش', 'دسترسی'], s.members.map(m => `<tr><td><div class="ai-cell2"><b>${esc(m.name)}</b><span class="ltr">${esc(m.email)}</span></div></td><td>${tag(ROLES[m.role], m.role === 'admin' ? 'primary' : 'gray')}</td>
          <td><small>${m.role === 'admin' ? 'همه‌چیز، از جمله کلیدها، سقف خرج و حذف پروژه' : m.role === 'dev' ? 'ساخت و باطل کردن کلید، مشاهده‌ی مصرف و لاگ' : 'فقط مشاهده‌ی مصرف و گزارش‌ها'}</small></td></tr>`), '')}
        <p class="ai-desc"><small>دسترسی اعضا به حساب با نقش‌های WHMCS کنترل می‌شود؛ نقش‌های اینجا محدودیت هر عضو روی همین پروژه است.</small></p></div>`;
  },
  guardrails(s) {
    return `<p class="ai-desc">گاردریل درخواست را پیش از رسیدن به مدل، و پاسخ را پیش از رسیدن به کاربر بررسی می‌کند و اگر با یک قانون منطبق باشد مسدودش می‌کند.</p>
      <div class="ai-grid2">${GUARDS.map(g => { const on = !!s.guards[g.k]; return `<div class="ai-plug${on ? ' on' : ''}"><div class="ai-plug-t"><b>${g.t}</b><span data-ai="guard-svc" data-v="${g.k}">${toggle(on)}</span></div><p>${g.d}</p>
        ${on ? `<div class="ai-row2"><label class="ai-field"><span>بررسی روی</span><select class="ai-input"><option>درخواست و پاسخ</option><option>فقط درخواست</option><option>فقط پاسخ</option></select></label><div class="ai-kpi"><span>مسدودشده (۳۰ روز)</span><b>${fa(g.k.length * 7)}</b></div></div>` : ''}
        ${g.k === 'topics' && on ? `<label class="ai-field"><span>موضوع‌های ممنوع (هر خط یکی)</span><textarea class="ai-input" rows="3" data-ai-in="topics">${esc(s.topics)}</textarea></label>` : ''}
        <div class="ai-plug-p">${g.price ? `<b>${money(g.price)}</b> <small>تومان / هر ۱ میلیون توکن بررسی‌شده</small>` : '<b>رایگان</b>'}</div></div>`; }).join('')}</div>`;
  },
  database(s) {
    if (s.db) return `<div class="ai-kpis">${kpi('دیتابیس', '<span class="ltr">' + esc(s.db.name) + '</span>')}${kpi('پلن', esc(s.db.plan))}${kpi('وضعیت', status('active'))}</div>
      ${alert('info', 'ایندکس پایگاه دانش این پروژه روی این دیتابیس نگه‌داری می‌شود. هزینه‌ی دیتابیس در فاکتور ماهانه‌ی DBaaS می‌آید.')}
      <div class="ai-sec-tools"><span class="ai-sp"></span>${btn('مدیریت دیتابیس', 'toast', 'outline', 'data-v="به صفحه‌ی سرویس DBaaS می‌رود (خارج از این پروتوتایپ)."')}${btn('قطع اتصال', 'db-off', 'text', 'class="ai-danger"')}</div>`;
    return `<p class="ai-desc">پایگاه دانش را روی دیتابیس مدیریت‌شده‌ی خودتان (PostgreSQL با pgvector) نگه دارید تا داده‌ی ایندکس هم متعلق به خودتان بماند.</p>
      <div class="ai-empty-s">${NAV.icon('ai', 40)}<p>هنوز دیتابیسی به این پروژه وصل نشده است.</p>${btn('اتصال یا ساخت دیتابیس', 'drawer', 'primary', 'data-v="db"')}</div>`;
  },
  settings(s) {
    return `<label class="ai-field"><span>نام پروژه</span><div class="ai-inline"><input class="ai-input ltr" data-ai-in="rename" value="${esc(s.name)}">${btn('ذخیره', 'rename', 'tonal')}</div></label>
      <div class="ai-sub"><h3>اطلاع‌رسانی</h3><div class="ai-ck-row">${checkbox(true)}<span>هشدار موجودی و توقف سرویس با پیامک</span></div><div class="ai-ck-row">${checkbox(true)}<span>با ایمیل</span></div><div class="ai-ck-row">${checkbox(true)}<span>با اپلیکیشن بله</span></div></div>
      <div class="ai-sub ai-danger-box"><h3>حذف پروژه</h3><p class="ai-desc">با حذف پروژه همه‌ی کلیدهای آن باطل می‌شود و فاکتور پایانی مصرف همین ماه صادر می‌شود. این کار برگشت‌پذیر نیست.</p>${btn('حذف پروژه', 'modal', 'outline', 'data-v="delete" class="ai-danger"')}</div>`;
  },
};

// ---------- drawers and modals ----------
let DR = {};
function drawerHtml(kind, s) {
  const amounts = [500000, 1000000, 3000000, 5000000];
  const foot = (main, label) => `<div class="ai-dr-foot">${btn(label, main, 'primary')}${btn('انصراف', 'close', 'text')}</div>`;
  switch (kind) {
    case 'charge': return ['شارژ کیف پول', `<p class="ai-desc">مبلغ را انتخاب کنید. بعد از پرداخت فاکتور، موجودی کیف پول بلافاصله افزایش می‌یابد.</p>
      <div class="ai-col">${amounts.map(a => `<div class="ai-rcard${DR.amount === a ? ' on' : ''}" data-ai="dr-amount" data-v="${a}"><div class="ai-rcard-t">${radio(DR.amount === a)}<b>${money(a)} تومان</b></div><span class="ai-rcard-sub">حدود ${num(estimate(a, s ? s.models : []))} توکن با مدل‌های این پروژه</span></div>`).join('')}</div>
      <div class="ai-dr-sum"><span>موجودی فعلی</span><b>${money(S.wallet)} تومان</b><span>موجودی بعد از پرداخت</span><b>${money(S.wallet + (DR.amount || 0))} تومان</b></div>`, foot('pay', 'پرداخت فاکتور')];
    case 'key': return DR.created ? ['کلید ساخته شد', `${alert('warning', 'این کلید فقط همین یک بار نمایش داده می‌شود. همین حالا آن را کپی و در جای امن ذخیره کنید.')}
      <div class="ai-keybox ltr"><code>${DR.created}</code><button type="button" class="ai-icon-btn" data-ai="copy" data-v="${DR.created}">${ic.copy}</button></div>`, `<div class="ai-dr-foot">${btn('کپی کردم', 'close', 'primary')}</div>`]
      : ['ساخت کلید AI', `<label class="ai-field"><span>نام کلید</span><input class="ai-input" data-ai-in="dr-name" value="${esc(DR.name || '')}" placeholder="مثلاً سرور تولید"><small>این کلید فقط به مدل‌های پروژه‌ی <b class="ltr">${esc(s.name)}</b> دسترسی دارد.</small></label>
        <label class="ai-field" data-ph="2"><span>سقف خرج ماهانه‌ی این کلید (تومان) ${ph(2)}</span><input class="ai-input" data-ai-in="dr-cap" inputmode="numeric" placeholder="بدون سقف"></label>`, foot('key-create', 'ساخت کلید')];
    case 'model': {
      const rest = MODELS.filter(m => !s.models.includes(m.id));
      return ['افزودن مدل به پروژه', rest.length ? `<div class="ai-col">${rest.map(m => `<div class="ai-rcard${(DR.models || []).includes(m.id) ? ' on' : ''}" data-ai="dr-model" data-v="${m.id}"><div class="ai-rcard-t">${checkbox((DR.models || []).includes(m.id))}<b class="ltr">${m.name}</b>${m.kind === 'ir' ? tag('داخل ایران', 'success') : tag('خارجی', 'gray')}</div><span class="ai-rcard-sub">${esc(m.maker)} · ورودی ${money(m.pin)} / خروجی ${m.pout ? money(m.pout) : '—'} تومان در هر ۱M توکن</span></div>`).join('')}</div>` : '<p class="ai-desc">همه‌ی مدل‌ها به این پروژه اضافه شده‌اند.</p>', foot('model-add', 'افزودن')];
    }
    case 'kb': return ['افزودن منبع به پایگاه دانش', `<div class="ai-col">${[['s3', 'اتصال باکت آبجکت استوریج'], ['upload', 'بارگذاری فایل']].map(([k, t]) => `<div class="ai-rcard${DR.kb === k ? ' on' : ''}" data-ai="dr-kb" data-v="${k}"><div class="ai-rcard-t">${radio(DR.kb === k)}<b>${t}</b></div></div>`).join('')}</div>
      ${DR.kb === 's3' ? `<label class="ai-field"><span>باکت</span><select class="ai-input" data-ai-in="dr-bucket">${BUCKETS.map(b => `<option>${b}</option>`).join('')}</select><small>تغییر فایل‌های باکت خودکار همگام می‌شود.</small></label>` : ''}
      ${DR.kb === 'upload' ? `<div class="ai-upload" data-ai="dr-upload">${ic.plus}<span>برای انتخاب فایل کلیک کنید</span><small>${DR.file ? esc(DR.file) : 'PDF، Word، Excel و CSV تا ۵۰ مگابایت'}</small></div>` : ''}
      <label class="ai-field"><span>مدل embedding</span><select class="ai-input" data-ai-in="dr-emb"><option value="bge-m3">bge-m3 (اهورا، داخل ایران)</option><option value="text-embedding-3-small">text-embedding-3-small (OpenAI)</option></select></label>`, foot('kb-add', 'افزودن و ایندکس')];
    case 'ds': return ['ساخت دیتاست', `<label class="ai-field"><span>نام دیتاست</span><input class="ai-input" data-ai-in="dr-name" value="${esc(DR.name || '')}" placeholder="مثلاً پرسش‌های پشتیبانی"></label>
      <div class="ai-col">${[['file', 'از فایل CSV یا Excel', 'ستون‌ها: سؤال، جواب، منبع، برچسب'], ['kb', 'از اسناد پایگاه دانش', 'جفت‌های پرسش و پاسخ پیشنهادی ساخته می‌شود و شما تأیید می‌کنید'], ['logs', 'از لاگ درخواست‌های همین پروژه', 'نیازمند تصمیم درباره‌ی استفاده از داده‌ی ذخیره‌شده']].map(([k, t, d]) => `<div class="ai-rcard${DR.src === k ? ' on' : ''}" data-ai="dr-src" data-v="${k}"><div class="ai-rcard-t">${radio(DR.src === k)}<b>${t}</b></div><span class="ai-rcard-sub">${d}</span></div>`).join('')}</div>
      <label class="ai-field"><span>سهم رکوردهای کنارگذاشته برای ارزیابی</span><select class="ai-input" data-ai-in="dr-eval"><option value="10">۱۰٪</option><option value="15">۱۵٪</option><option value="20">۲۰٪</option></select></label>`, foot('ds-add', 'ساخت دیتاست')];
    case 'cap': return ['سقف خرج', `<label class="ai-field"><span>سقف خرج ماهانه‌ی پروژه (تومان)</span><input class="ai-input" data-ai-in="dr-cap" inputmode="numeric" value="${s.cap ? money(s.cap) : ''}" placeholder="بدون سقف"></label>
      <label class="ai-field"><span>بعد از رسیدن به سقف</span><select class="ai-input" data-ai-in="dr-action"><option value="stop" ${s.capAction === 'stop' ? 'selected' : ''}>درخواست‌ها متوقف شوند</option><option value="warn" ${s.capAction === 'warn' ? 'selected' : ''}>فقط هشدار داده شود</option></select></label>
      ${s.keys.filter(k => k.status === 'active').map(k => `<label class="ai-field"><span>سقف ماهانه‌ی کلید «${esc(k.name)}»</span><input class="ai-input" data-ai-in="dr-kcap-${k.id}" inputmode="numeric" value="${k.cap ? money(k.cap) : ''}" placeholder="بدون سقف"></label>`).join('')}
      <small class="ai-muted">هنگام رسیدن به ۸۰٪ و ۱۰۰٪ سقف با پیامک، ایمیل و بله خبرتان می‌کنیم.</small>`, foot('cap-save', 'ذخیره')];
    case 'member': return ['افزودن عضو', `<label class="ai-field"><span>ایمیل عضو حساب</span><input class="ai-input ltr" data-ai-in="dr-email" placeholder="name@company.com"><small>عضو باید پیش‌تر به حساب کاربری شما در ایران‌سرور اضافه شده باشد.</small></label>
      <label class="ai-field"><span>نقش در این پروژه</span><select class="ai-input" data-ai-in="dr-role">${Object.entries(ROLES).map(([k, t]) => `<option value="${k}" ${k === 'dev' ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`, foot('member-add', 'افزودن')];
    case 'db': return ['اتصال یا ساخت دیتابیس', `<div class="ai-col"><div class="ai-rcard${DR.db === 'existing' ? ' on' : ''}" data-ai="dr-db" data-v="existing"><div class="ai-rcard-t">${radio(DR.db === 'existing')}<b>دیتابیس موجود: <span class="ltr">pg-main-01</span></b></div><span class="ai-rcard-sub">PostgreSQL ۱۶ · pgvector فعال است</span></div>
      ${DB_PLANS.map(p => `<div class="ai-rcard${DR.db === p.k ? ' on' : ''}" data-ai="dr-db" data-v="${p.k}"><div class="ai-rcard-t">${radio(DR.db === p.k)}<b>ساخت دیتابیس جدید · ${p.t}</b></div><span class="ai-rcard-sub"><b>${money(p.price)}</b> تومان / ماهانه</span></div>`).join('')}</div>`, foot('db-add', 'اتصال')];
    case 'alerts': return ['تنظیم هشدار موجودی', `<label class="ai-field"><span>هشدار وقتی موجودی کمتر از (تومان)</span><input class="ai-input" data-ai-in="dr-warn" inputmode="numeric" value="${money(S.warn)}"></label>
      <label class="ai-field"><span>آستانه‌ی مسدودسازی (تومان)</span><input class="ai-input" value="${money(S.block)}" disabled><small>آستانه‌ی مسدودسازی را ایران‌سرور تعیین می‌کند تا کیف پول زیاد منفی نشود.</small></label>`, foot('alerts-save', 'ذخیره')];
  }
  return ['', '', ''];
}
function openDrawer(kind, s) {
  closeAll();
  DR = { kind, sid: s?.id, amount: 1000000, kb: 's3', src: 'file', db: 'existing', models: [] };
  renderDrawer();
}
function renderDrawer() {
  const s = DR.sid ? svc(DR.sid) : null, [title, body, foot] = drawerHtml(DR.kind, s);
  let m = document.getElementById('ai-drawer');
  const html = `<aside class="ai-drawer ai" data-show="${S.phase}"><div class="ai-dr-head"><h3>${title}</h3><button type="button" class="ai-icon-btn" data-ai="close">${ic.close}</button></div><div class="ai-dr-body">${body}</div>${foot}</aside>`;
  if (!m) { m = document.createElement('div'); m.id = 'ai-drawer'; m.className = 'ai-mask ai'; document.body.appendChild(m); }
  m.innerHTML = html;
}
function modal(title, body, foot) {
  closeAll();
  const m = document.createElement('div'); m.id = 'ai-modal'; m.className = 'ai-mask ai ai-mask-c';
  m.innerHTML = `<div class="ai-modal"><div class="ai-dr-head"><h3>${title}</h3><button type="button" class="ai-icon-btn" data-ai="close">${ic.close}</button></div><div class="ai-dr-body">${body}</div><div class="ai-dr-foot">${foot}</div></div>`;
  document.body.appendChild(m);
}
function closeAll() { document.getElementById('ai-drawer')?.remove(); document.getElementById('ai-modal')?.remove(); }
function toast(t, type = 'success') {
  document.getElementById('ai-toast')?.remove();
  const el = document.createElement('div'); el.id = 'ai-toast'; el.className = 'ai-toast ai-toast-' + type; el.innerHTML = `${type === 'success' ? ic.check : ic.warn}<span>${t}</span>`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 3800);
}
function tx(d, a) { S.wallet += a; S.tx.push({ t: Date.now(), d, a, b: S.wallet }); }

// ---------- page registration ----------
function pageFor(route) {
  if (route === LIST) return listPage();
  if (route === CFG) return cfgPage();
  const m = route.match(/^\/my\/panel\/service\/(\d+)\/aiaas(?:\/([\w-]+))?$/);
  return m ? detailPage(+m[1], m[2] || 'overview') : '';
}
function register(route, title, side) {
  PAGES[route] = { title, d: { get html() { return pageFor(route); }, get body() { return side ? 'ai-side2-on' + (S.side2min ? ' ai-side2-min' : '') : ''; }, legacy: false } };
}
function registerService(id) { SECTIONS.forEach(x => register(svcRoute(id, x.k), 'AIaaS · ' + x.t, true)); }
register(LIST, 'AIaaS');
register(CFG, 'ساخت پروژه‌ی AI');
registerService(DEMO);
S.services.forEach(s => registerService(s.id));

function refresh() {
  const el = document.getElementById('ai-root');
  if (!el) return;
  const y = window.scrollY;
  el.outerHTML = pageFor(el.dataset.route);
  window.scrollTo(0, y);
}
const routeNow = () => document.getElementById('ai-root')?.dataset.route || '';
const sidNow = () => +(routeNow().match(/service\/(\d+)/) || [])[1] || DR.sid;
const parseNum = v => +String(v).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[^\d]/g, '') || 0;

// ---------- interactions (delegated) ----------
document.addEventListener('click', e => {
  const el = e.target.closest('.ai [data-ai]');
  if (!el) { if (e.target.classList?.contains('ai-mask')) closeAll(); if (PICK && !e.target.closest('.ai-pj')) { PICK = false; document.querySelector('.ai-pj')?.classList.remove('open'); } return; }
  e.preventDefault();
  const a = el.dataset.ai, v = el.dataset.v, d = draft(), s = svc(sidNow());
  const A = {
    pj() { PICK = !PICK; el.closest('.ai-pj').classList.toggle('open', PICK); },
    pick() { PICK = false; const k = (routeNow().match(/\/aiaas\/([\w-]+)$/) || [])[1]; go(svcRoute(+v, k)); },
    side2() { S.side2min = !S.side2min; save(); document.body.classList.toggle('ai-side2-min', S.side2min); },
    phase() { S.phase = +v; save(); refresh(); if (document.getElementById('ai-drawer')) renderDrawer(); },
    go() { closeAll(); go(v); },
    open() { go(svcRoute(+v)); },
    copy() { navigator.clipboard?.writeText(v).catch(() => {}); toast('کپی شد.'); },
    toast() { toast(v); },
    close() { closeAll(); },
    // configuration
    filter() { d.filter = v; refresh(); },
    model() { d.models = d.models.includes(v) ? d.models.filter(x => x !== v) : [...d.models, v]; refresh(); },
    charge() { if (e.target.closest('input, .ai-counter button')) return; d.charge = v === 'custom' ? 'custom' : +v; refresh(); },
    custom() { d.charge = 'custom'; d.custom = Math.max(0, (+d.custom || 0) + +v); refresh(); },
    kb() { d.kb = v || null; refresh(); },
    upload() { d.files = [...d.files, ['راهنمای-محصول.pdf', 'پرسش‌های-رایج.docx', 'تعرفه‌ها.xlsx'][d.files.length % 3]]; refresh(); },
    dataset() { d.dataset = !d.dataset; refresh(); },
    guard() { d.guards[v] = !d.guards[v]; refresh(); },
    db() { d.db = v || null; refresh(); },
    submit() {
      d.tried = true;
      const amount = d.charge === 'custom' ? +d.custom || 0 : d.charge;
      if (d.name.trim().length < 3 || !d.models.length || amount < MIN_CHARGE) { toast('موارد قرمز در خلاصه‌ی سفارش را کامل کنید.', 'error'); return; }
      const db = DB_PLANS.find(p => p.k === d.db);
      modal('پیش‌فاکتور', `<div class="ai-inv"><div><span>شرح</span><span>مبلغ</span></div>
        <div><span>ساخت پروژه‌ی AIaaS «<b class="ltr">${esc(d.name)}</b>»</span><b>رایگان</b></div>
        <div><span>شارژ کیف پول (پرداخت به ازای مصرف)</span><b>${money(amount)} تومان</b></div>
        ${db ? `<div><span>دیتابیس ${db.t} · ماه اول</span><b>${money(db.price)} تومان</b></div>` : ''}
        <div class="ai-inv-total"><span>مبلغ قابل پرداخت</span><b>${money(amount + (db ? db.price : 0))} تومان</b></div></div>
        <p class="ai-desc">سفارش از مسیر سبد خرید فعلی ثبت می‌شود و با پرداخت فاکتور، کیف پول شارژ و پروژه فعال می‌شود.</p>`,
        `${btn('پرداخت فاکتور', 'pay-order', 'primary')}${btn('انصراف', 'close', 'text')}`);
    },
    'pay-order'() {
      const amount = d.charge === 'custom' ? +d.custom || 0 : d.charge;
      const id = S.services.some(x => x.id === DEMO) ? Math.max(...S.services.map(x => x.id)) + 1 : (S.services.length ? Math.max(...S.services.map(x => x.id)) + 1 : DEMO);
      const sv = newService({ id, name: d.name.trim(), models: d.models.slice(), cap: d.cap || 0, guards: { ...d.guards },
        kb: d.kb ? [{ name: d.kb === 's3' ? d.bucket : (d.files[0] || 'فایل‌ها'), type: d.kb, emb: d.emb, chunks: 1840, status: 'indexing', t: Date.now() }] : [],
        db: d.db ? { name: 'pg-ai-' + id, plan: DB_PLANS.find(p => p.k === d.db).t } : null });
      if (d.dataset) sv.datasets.push({ name: 'پرسش و پاسخ از پایگاه دانش', src: 'اسناد پایگاه دانش', n: 120, ok: 0, eval: 10 });
      S.services.push(sv); tx('شارژ کیف پول · فاکتور پروژه‌ی ' + sv.name, amount); save(); registerService(id);
      const key = 'sk-ais-' + key40(); sv.keys[0].prefix = key.slice(0, 13); save();
      D = null;
      modal('پرداخت موفق', `<div class="ai-success">${ic.check}<b>پروژه‌ی «<span class="ltr">${esc(sv.name)}</span>» فعال شد</b><span>کیف پول شما ${money(amount)} تومان شارژ شد.</span></div>
        ${alert('warning', 'کلید AI این پروژه فقط همین یک بار کامل نمایش داده می‌شود.')}<div class="ai-keybox ltr"><code>${key}</code><button type="button" class="ai-icon-btn" data-ai="copy" data-v="${key}">${ic.copy}</button></div>
        <p class="ai-desc">آدرس API و تنظیمات پروژه با ایمیل، پیامک و اپلیکیشن بله هم برایتان ارسال شد.</p>`,
        `${btn('مشاهده‌ی پروژه', 'go', 'primary', `data-v="${svcRoute(id)}"`)}${btn('لیست پروژه‌ها', 'go', 'text', `data-v="${LIST}"`)}`);
      if (sv.kb.length) setTimeout(() => { sv.kb.forEach(k => { k.status = 'ready'; }); save(); refresh(); }, 4000);
    },
    // details
    drawer() { openDrawer(v, s); },
    range() { RANGE = +v; refresh(); },
    lang() { LANG = v; refresh(); },
    'model-del'() { s.models = s.models.filter(x => x !== v); save(); refresh(); toast('مدل از پروژه حذف شد؛ درخواست به آن رد می‌شود.'); },
    'key-revoke'() {
      modal('باطل کردن کلید', `<p class="ai-desc">با باطل کردن این کلید، همه‌ی درخواست‌هایی که با آن ارسال می‌شوند رد می‌شوند. آیا مطمئن هستید؟</p>`, `${btn('باطل کردن', 'key-revoke-ok', 'primary', `data-v="${v}" class="ai-btn-danger"`)}${btn('انصراف', 'close', 'text')}`);
    },
    'key-revoke-ok'() { const k = s.keys.find(x => x.id === v); k.status = 'revoked'; save(); closeAll(); refresh(); toast('کلید باطل شد.'); },
    'key-reissue'() {
      const k = s.keys.find(x => x.id === v); k.status = 'revoked';
      const key = 'sk-ais-' + key40(); s.keys.push({ id: 'k' + Date.now(), name: k.name, prefix: key.slice(0, 13), created: Date.now(), last: null, status: 'active', cap: k.cap });
      save(); refresh(); openDrawer('key', s); DR.created = key; renderDrawer();
    },
    simulate() {
      const c = Math.min(S.wallet + 15000, 180000);
      tx('کسر مصرف (نمونه) · پروژه‌ی ' + s.name, -c); save(); refresh();
      if (S.wallet <= S.block) toast('موجودی به آستانه‌ی مسدودسازی رسید؛ درخواست‌ها متوقف شد. پیامک، ایمیل و بله ارسال شد.', 'error');
      else if (S.wallet < S.warn) toast('هشدار موجودی با پیامک، ایمیل و بله ارسال شد.', 'warning');
    },
    'guard-svc'() { s.guards[v] = !s.guards[v]; save(); refresh(); },
    'kb-del'() { s.kb.splice(+v, 1); save(); refresh(); },
    'db-off'() { s.db = null; save(); refresh(); toast('اتصال دیتابیس قطع شد.'); },
    rename() { const n = (DR.rename ?? s.name).trim(); if (n.length > 2) { s.name = n; save(); refresh(); toast('نام پروژه ذخیره شد.'); } },
    modal() {
      if (v === 'delete') modal('حذف پروژه', `<p class="ai-desc">پروژه‌ی «<b class="ltr">${esc(s.name)}</b>» حذف و همه‌ی کلیدهای آن باطل می‌شود. فاکتور پایانی مصرف این ماه صادر می‌شود. این کار برگشت‌پذیر نیست.</p>`, `${btn('حذف پروژه', 'delete-ok', 'primary', 'class="ai-btn-danger"')}${btn('انصراف', 'close', 'text')}`);
    },
    'delete-ok'() { S.services = S.services.filter(x => x.id !== s.id); if (s.demo) svc.demo = null; save(); closeAll(); go(LIST); toast('پروژه حذف شد و فاکتور پایانی صادر شد.'); },
    // drawer actions
    'dr-amount'() { DR.amount = +v; renderDrawer(); },
    'dr-model'() { DR.models = DR.models.includes(v) ? DR.models.filter(x => x !== v) : [...DR.models, v]; renderDrawer(); },
    'dr-kb'() { DR.kb = v; renderDrawer(); },
    'dr-upload'() { DR.file = 'راهنمای-محصول.pdf'; renderDrawer(); },
    'dr-src'() { DR.src = v; renderDrawer(); },
    'dr-db'() { DR.db = v; renderDrawer(); },
    pay() { tx('شارژ کیف پول · فاکتور پرداخت‌شده', DR.amount); save(); closeAll(); refresh(); toast('فاکتور پرداخت شد و کیف پول ' + money(DR.amount) + ' تومان شارژ شد.'); },
    'key-create'() {
      const key = 'sk-ais-' + key40();
      s.keys.push({ id: 'k' + Date.now(), name: (DR.name || 'کلید جدید').trim(), prefix: key.slice(0, 13), created: Date.now(), last: null, status: 'active', cap: parseNum(DR.cap || 0) });
      save(); refresh(); DR.created = key; renderDrawer();
    },
    'model-add'() { if (!DR.models.length) return; s.models.push(...DR.models); save(); closeAll(); refresh(); toast(fa(DR.models.length) + ' مدل به پروژه اضافه شد.'); },
    'kb-add'() {
      const k = { name: DR.kb === 's3' ? (DR.bucket || BUCKETS[0]) : (DR.file || 'فایل'), type: DR.kb, emb: DR.emb || 'bge-m3', chunks: 960, status: 'indexing', t: Date.now() };
      s.kb.push(k); save(); closeAll(); refresh(); toast('منبع اضافه شد و ایندکس شروع شد.');
      setTimeout(() => { k.status = 'ready'; save(); refresh(); }, 3500);
    },
    'ds-add'() { s.datasets.push({ name: (DR.name || 'دیتاست جدید').trim(), src: { file: 'فایل CSV', kb: 'اسناد پایگاه دانش', logs: 'لاگ درخواست‌ها' }[DR.src], n: 240, ok: 0, eval: +(DR.eval || 10) }); save(); closeAll(); refresh(); },
    'cap-save'() {
      if ('cap' in DR) s.cap = parseNum(DR.cap); if (DR.action) s.capAction = DR.action;
      s.keys.forEach(k => { if ('kcap-' + k.id in DR) k.cap = parseNum(DR['kcap-' + k.id]); });
      save(); closeAll(); refresh(); toast('سقف خرج ذخیره شد.');
    },
    'member-add'() { const em = (DR.email || '').trim(); if (!em.includes('@')) return; s.members.push({ email: em, name: em.split('@')[0], role: DR.role || 'dev' }); save(); closeAll(); refresh(); },
    'db-add'() { const p = DB_PLANS.find(x => x.k === DR.db); s.db = { name: p ? 'pg-ai-' + s.id : 'pg-main-01', plan: p ? p.t : 'PostgreSQL ۱۶ · موجود' }; save(); closeAll(); refresh(); toast('دیتابیس به پایگاه دانش وصل شد.'); },
    'alerts-save'() { if (DR.warn) S.warn = parseNum(DR.warn); save(); closeAll(); refresh(); toast('هشدار موجودی ذخیره شد.'); },
  };
  A[a]?.();
});
// text fields update state without re-rendering the field being typed in
document.addEventListener('input', e => {
  const el = e.target.closest('.ai [data-ai-in]');
  if (!el) return;
  const k = el.dataset.aiIn, d = draft();
  if (k.startsWith('dr-')) { DR[k.slice(3)] = el.value; return; }
  if (k === 'rename') { DR.rename = el.value; return; }
  if (k === 'topics') { const s = svc(sidNow()); if (s) { s.topics = el.value; save(); } return; }
  if (k === 'custom') { d.custom = parseNum(el.value); d.charge = 'custom'; }
  else if (k === 'cap') d.cap = parseNum(el.value);
  else d[k] = el.value;
  const sum = document.getElementById('ai-sum');
  if (sum) sum.innerHTML = summary();
  if (k === 'custom' || k === 'bucket' || k === 'emb') { if (e.type === 'input' && el.tagName === 'SELECT') refresh(); }
});
document.addEventListener('change', e => {
  const el = e.target.closest('.ai select[data-ai-in]');
  if (el && !el.dataset.aiIn.startsWith('dr-')) refresh();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
window.addEventListener('hashchange', () => { closeAll(); PICK = false; });
})();
