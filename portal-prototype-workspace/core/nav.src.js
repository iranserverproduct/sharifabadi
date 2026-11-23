// Core navigation (admin-owned): the top app bar and right navigation rail of the Portal Figma frame
// "Sidebar IA [03]" (1qrZx6L5Ug2eniRA8epD2U, node 39989:134583). On desktop it replaces the captured
// horizontal header on every page. Each product group opens its own route, which shows that group's
// empty service list. Icons and the empty-state illustration are filled in by build_core.py.
(() => {
'use strict';
const ICONS = /*ICONS*/;
const EMPTY_ILL = /*EMPTY_ILL*/;
const MOBILE = matchMedia('(max-width: 991px)');

const icon = (name, size = 24, cls = '') => {
  const i = ICONS[name];
  return `<svg class="nav-ic ${cls}" width="${size}" height="${size}" viewBox="${i.vb}" fill="none" aria-hidden="true">${i.body}</svg>`;
};
const fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

// Cloud products live inside the rail, as one distinct group (no second sidebar).
const CLOUD = [
  { route: '/my/panel/cloud/server', label: 'سرور ابری', icon: 'cloud-server', buy: 'خرید سرور ابری',
    desc: 'سرور ابری به شما امکان می‌دهد در چند دقیقه سرور خود را با منابع دلخواه راه‌اندازی کنید و هر زمان که نیاز داشتید منابع آن را تغییر دهید.' },
  { route: '/my/panel/cloud/block-storage', label: 'بلاک استوریج', icon: 'block-storage', buy: 'خرید بلاک استوریج',
    desc: 'بلاک استوریج به شما امکان می‌دهد فضای ذخیره‌سازی سرور ابری خود را مستقل از سرور افزایش دهید و هر زمان که نیاز داشتید آن را جدا یا متصل کنید.' },
  { route: '/my/panel/cloud/object-storage', label: 'آبجکت استوریج', icon: 'object-storage', buy: 'خرید آبجکت استوریج',
    desc: 'آبجکت استوریج به شما امکان می‌دهد فایل‌ها و داده‌های خود را با هزینه کمتر و دسترسی همیشگی در فضایی امن و مقیاس‌پذیر نگهداری کنید.' },
  { route: '/my/panel/cloud/gpu-server', label: 'سرور ابری گرافیکی', icon: 'gpu-server', buy: 'خرید سرور ابری گرافیکی',
    desc: 'سرور ابری گرافیکی به شما امکان می‌دهد سروری با پردازنده‌ی گرافیکی اختصاصی برای آموزش مدل‌های هوش مصنوعی و رندر داشته باشید.' },
  { route: '/my/panel/cloud/gpu-platform', label: 'پلتفرم گرافیکی', icon: 'gpu-platform', buy: 'خرید پردازش گرافیکی',
    desc: 'پلتفرم پردازش گرافیکی به شما امکان می‌دهد پردازش‌های سنگین مانند هوش مصنوعی و رندر را بدون خرید سخت‌افزار گران‌قیمت اجرا کنید.' },
  { route: '/my/panel/cloud/apps', label: 'برنامه‌های آماده', icon: 'apps', buy: 'خرید برنامه‌ی آماده',
    desc: 'برنامه‌های آماده به شما امکان می‌دهند ابزارهایی مانند n8n را بدون درگیری با نصب و نگهداری، آماده و در چند دقیقه راه‌اندازی کنید.' },
];
// Other product groups, in the Figma order.
const GROUPS = [
  { route: '/my/panel/hosts', label: 'هاست', icon: 'host', buy: 'خرید هاست',
    desc: 'هاست به شما امکان می‌دهد وب‌سایت خود را با کنترل پنل آماده، ایمیل و پشتیبان‌گیری خودکار روی سرورهای پرسرعت راه‌اندازی کنید.' },
  { route: '/my/panel/dedicated', label: 'سرور اختصاصی', icon: 'server', buy: 'خرید سرور اختصاصی',
    desc: 'سرور اختصاصی به شما امکان می‌دهد تمام منابع یک سرور فیزیکی را فقط در اختیار سرویس‌های خود داشته باشید.' },
  { route: '/my/panel/ssl', label: 'SSL', icon: 'ssl', buy: 'خرید گواهی SSL',
    desc: 'گواهی SSL به شما امکان می‌دهد ارتباط کاربران با سایت خود را رمزگذاری کنید و اعتماد آنها و رتبه‌ی سایت در گوگل را بالا ببرید.' },
  { route: '/my/panel/cdn', label: 'CDN', icon: 'cdn', buy: 'خرید CDN',
    desc: 'CDN به شما امکان می‌دهد محتوای سایت خود را سریع‌تر به کاربران برسانید و در عین حال از سایت در برابر حملات محافظت کنید.' },
];

// A product group page: breadcrumb, the white card and the group's empty service list.
function productPage(p) {
  const th = (cls, label, sort) => `<div class="ws-th ${cls}"><p dir="auto">${label}</p>${sort ? icon('chevron-down', 18, 'ws-th-icon') : ''}</div>`;
  return `<div class="nav-page"><div class="nav-crumbs"><a href="#/my/panel">نمای کلی</a>${icon('chevron-down', 16, 'nav-crumb-sep')}<span>${p.label}</span></div>
    <div class="nav-card"><h1 class="nav-card-title">${p.label}</h1>
      <div class="nav-toolbar"><div class="nav-search"><span>جستجو در نام سرویس</span></div></div>
      <div class="ws-ct"><div class="ws-ct-head">${th('ws-th-name', 'نام سرویس')}${th('ws-th-period', 'دوره', 1)}${th('ws-th-date', 'تاریخ سررسید', 1)}${th('ws-th-status', 'وضعیت')}${th('ws-th-ops', 'عملیات')}</div>
        <div class="ws-empty">${EMPTY_ILL}<div class="ws-empty-content"><p class="ws-empty-title" dir="auto">شما تابحال از این سرویس استفاده نکرده‌اید</p>
          <p class="ws-empty-desc" dir="auto">${p.desc}</p><button type="button" class="ws-empty-btn"><span dir="auto">${p.buy}</span></button></div></div></div>
    </div></div>`;
}
// Product group routes are ordinary prototype routes, so the workspace can propose changes on them too.
[...CLOUD, ...GROUPS].forEach(p => {
  window.PAGES_DATA[p.route] = { title: p.label, d: { html: productPage(p), body: '', legacy: false } };
});

const RAIL_TOP = [
  { route: '/my/panel', label: 'داشبورد', icon: 'dashboard', match: r => r === '/my/panel' },
  'cloud',
  { route: '/my/panel/domains', label: 'دامنه', icon: 'domain', match: r => /^\/my\/panel\/domains?(\/|$)/.test(r) || /domain/.test(r) },
  ...GROUPS.map(g => ({ ...g, match: r => r === g.route || (g.icon === 'host' && /^\/my\/panel\/service\/[^/]+\/host/.test(r)) })),
];
const RAIL_BOTTOM = [
  { route: '/my/panel/invoices', label: 'مالی', icon: 'wallet', match: r => /^\/my\/panel\/invoices|accounting|refund/.test(r) },
  { route: '/my/panel/support/tickets', label: 'پشتیبانی', icon: 'headphone', match: r => /^\/my\/panel\/support/.test(r) },
];
const cloudMatch = (p, r) => r === p.route || (p.icon === 'cloud-server' && /^\/my\/panel\/service\/[^/]+\/server/.test(r));

let cloudOpen = true;
try { cloudOpen = localStorage.getItem('nav_cloud') !== '0'; } catch (e) {}

function item(it, route) {
  const on = it.match(route);
  return `<a class="nav-item${on ? ' on' : ''}" href="#${it.route}">${icon(it.icon)}<span>${it.label}</span></a>`;
}
function cloudGroup(route) {
  const active = CLOUD.some(p => cloudMatch(p, route));
  const open = cloudOpen || active;
  return `<div class="nav-cloud${open ? ' open' : ''}${active ? ' on' : ''}">
    <button type="button" class="nav-cloud-head" data-nav="cloud">${icon('cloud')}<span>محصولات ابری</span>${icon('chevron-down', 14, 'nav-cloud-chev')}</button>
    <div class="nav-cloud-list">${CLOUD.map(p => `<a class="nav-sub${cloudMatch(p, route) ? ' on' : ''}" href="#${p.route}">${icon(p.icon, 20)}<span>${p.label}</span></a>`).join('')}</div></div>`;
}
function rail(route) {
  return `<div class="nav-rail-col">
    <div class="nav-group">${RAIL_TOP.map(it => it === 'cloud' ? cloudGroup(route) : item(it, route)).join('')}</div>
    <div class="nav-spacer"></div>
    <div class="nav-group">${RAIL_BOTTOM.map(it => item(it, route)).join('')}</div>
    <div class="nav-divider"></div>
    <div class="nav-new"><button type="button" class="nav-new-btn" data-nav="new" title="خرید جدید">${icon('plus', 20)}</button></div></div>`;
}
const DIV = '<span class="nav-vdiv"></span>';
function topBar() {
  return `<a class="nav-logo" href="#/my/panel">${icon('logo', 96)}</a>
    <div class="nav-actions">
      <div class="nav-phone">${icon('phone')}<span class="nav-phone-code">${fa('051')}</span><span class="nav-phone-num">${fa('31776')}</span></div>${DIV}
      <div class="nav-icons"><button type="button" class="nav-bell" data-nav="bell" title="اعلان‌ها">${icon('bell', 36)}</button>
        <button type="button" class="nav-iconbtn" data-nav="cart" title="سبد خرید">${icon('basket', 20)}</button></div>${DIV}
      <button type="button" class="nav-account" data-nav="account"><span class="nav-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="#95969d" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6z"/></svg></span>
        <span class="nav-name">کاربر نمونه</span><span class="nav-id">(${fa('45120')})</span>${icon('chevron-down', 12, 'nav-acc-chev')}</button>
    </div>`;
}

let bar, side, legacyView = false;
function ensure() {
  if (!bar) {
    bar = document.createElement('div'); bar.className = 'nav-bar'; bar.innerHTML = topBar();
    side = document.createElement('nav'); side.className = 'nav-rail';
    document.body.prepend(bar, side);
    bar.addEventListener('click', onClick); side.addEventListener('click', onClick);
  }
  if (!bar.isConnected) document.body.prepend(bar, side);
}

// Header popups captured from the portal (notifications 0, account 2, new purchase 3); cart opens its page.
const POP = { bell: '0', account: '2', new: '3' };
function onClick(e) {
  const b = e.target.closest('[data-nav]');
  if (!b) return;
  const k = b.dataset.nav;
  if (k === 'cloud') {
    cloudOpen = !b.parentElement.classList.contains('open');
    b.parentElement.classList.toggle('open', cloudOpen);
    try { localStorage.setItem('nav_cloud', cloudOpen ? '1' : '0'); } catch (err) {}
    return;
  }
  if (k === 'cart') { go('/cart.php?a=view&systpl=is-theme'); return; }
  e.stopPropagation();
  const open = document.querySelector('[data-popup="nav-' + k + '"]');
  closePopups();
  if (open) return;
  // old-portal pages do not load the new portal styles the popups need
  if (legacyView) { if (k === 'account') go('/clientarea.php?action=details&systpl=is-theme'); return; }
  const html = POPUPS.d?.[POP[k]];
  if (!html) return;
  const pop = append(document.body, html);
  pop.dataset.popup = 'nav-' + k;
  const r = b.getBoundingClientRect();
  Object.assign(pop.style, { position: 'fixed', insetInlineEnd: 'auto', insetInlineStart: 'auto', zIndex: 1001 },
    k === 'new' ? { right: '104px', left: 'auto', top: 'auto', bottom: '16px' } : { left: r.left + 'px', right: 'auto', top: (r.bottom + 8) + 'px' });
  pop.addEventListener('click', ev => ev.stopPropagation());
  pop.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', closePopups));
}

window.NAV = {
  // Called by the shell after each render: swap the captured header for the bar and rail (desktop only).
  apply(route, legacy) {
    const root = document.getElementById('root');
    if (MOBILE.matches) {
      bar?.remove(); side?.remove();
      document.body.classList.remove('nav-on');
      return;
    }
    ensure();
    legacyView = !!legacy;
    root.querySelectorAll('header.app_header, #is-header').forEach(h => { h.style.display = 'none'; });
    const notice = root.querySelector('#app .pb-4 > .bg-neutral-100');
    if (notice) notice.style.display = 'none';
    side.innerHTML = rail(route);
    document.body.classList.add('nav-on');
  },
};
})();
