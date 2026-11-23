// Cloud server pages (core, admin-owned), from the Portal Figma page "Service Management" (1qrZx6L5Ug2eniRA8epD2U, 13115:24402):
// service details 24271:57123 / 20204:29327, backups 17259:11819, change OS 17742:12915, add-ons 19522:29423 (+ traffic 20449:48041),
// ready apps 19794:23747, cloud disk 19867:37784, resources CloudServer-Up-Down 22884:73390, renewal 14928:6232, states (rescue,
// traffic over, unpaid) and the action modals (reboot, pause, rescue, power off, password, delete). The Figma pages use the old
// header and tabs; here the tabs are the second sidebar's actions (core/side2.js) and the page uses the new panel layout.
//   /my/panel/cloud/server                       list
//   /my/panel/service/<id>/server[/<section>]   details
(() => {
'use strict';
const PAGES = window.PAGES_DATA;
const { fa, money, esc, tag, radio, checkbox, toggle, alert, crumbs, modal, toast, closeAll, ic } = window.AIUI;
const { wrap, tbl, svg, I, ticketsCard, invoicesCard, B, bsRoute, gb, BS_CFG, cfgDraft, SERVERS, srv, srvRoute, saveSrv, srvTag, res } = window.SVC;
const LIST = '/my/panel/cloud/server';
const P = {
  ...I, apps: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM16.5 13v7M13 16.5h7', disk: 'M4 6c0-1.1 3.6-2 8-2s8 .9 8 2v12c0 1.1-3.6 2-8 2s-8-.9-8-2zM4 6c0 1.1 3.6 2 8 2s8-.9 8-2M4 12c0 1.1 3.6 2 8 2s8-.9 8-2',
  renew: 'M20 11a8 8 0 10-2.3 5.7M20 4v7h-7', eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  restore: 'M7 18a5 5 0 01-.6-10A6 6 0 0118 9a4 4 0 01-.5 9M12 12v8M9 15l3-3 3 3', search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4', refresh: 'M4 12a8 8 0 0114-5.3M20 4v4h-4M20 12a8 8 0 01-14 5.3M4 20v-4h4',
};
const cs = (t, a, kind, v = '', cls = '', extra = '') => `<button type="button" class="ai-btn ai-btn-${kind} ${cls}" data-cs="${a}" data-v="${esc(v)}" ${extra}>${t}</button>`;
const cancel = '<button type="button" class="ai-btn ai-btn-text" data-ai="close">انصراف</button>';
const divider = (title, extra = '') => `<div class="cs-div"><h3 class="sv-h">${title}</h3><i></i>${extra}</div>`;
const SECTIONS = [
  ['مدیریت سرویس', [['overview', 'اطلاعات کلی', 'info'], ['tickets', 'تیکت‌ها', 'ticket'], ['invoices', 'فاکتورهای مالی', 'invoice']]],
  ['سرور', [['backups', 'مدیریت بکاپ', 'backup'], ['change-os', 'تغییر سیستم عامل', 'os'], ['resources', 'تغییر منابع', 'resize'], ['renew', 'تمدید سرویس', 'renew']]],
  ['خدمات جانبی', [['addons', 'افزونه‌های دلخواه', 'addons'], ['apps', 'برنامه‌های آماده', 'apps'], ['disks', 'دیسک ابری', 'disk']]],
];
const OS_LOGO = { Windows: '#0078d4', Ubuntu: '#e95420', Debian: '#d70a53', Centos: '#9c27b0', Oracle: '#c74634', Freebsd: '#ab2b28', Fedora: '#294172', AlmaLinux: '#0f4266' };
const osLogo = name => { const k = Object.keys(OS_LOGO).find(o => name.toLowerCase().startsWith(o.toLowerCase())) || 'Ubuntu'; return `<span class="cs-os" style="--c:${OS_LOGO[k]}">${k[0]}</span>`; };
const OSES = [['Windows', ['Server 2022', 'Server 2019']], ['Oracle', ['9.0', '8.9']], ['Freebsd', ['14.1', '13.3']], ['Debian', ['12', '11']], ['Centos', ['Stream 9']], ['Ubuntu', ['24.04', '22.04', '20.04']], ['Fedora', ['40', '39']], ['AlmaLinux', ['9.4', '8.10']]];
const PLAN_CATS = [['adv', 'پردازش پیشرفته'], ['ded', 'پردازنده اختصاصی'], ['ssd', 'ذخیره‌سازی پرسرعت'], ['cpu', 'پردازنده محور'], ['ram', 'حافظه محور'], ['gen', 'کاربری عمومی'], ['traffic', 'ترافیک بالا']];
const PLANS = [ // name, category, cpu, ram, disk, traffic, monthly price
  ['NGP-small60', 'gen', 2, 4, 60, 500, 1450000], ['Flex6', 'gen', 6, 12, 100, 1000, 3900000], ['Flex8-SHRZ', 'gen', 8, 16, 120, 1500, 5200000],
  ['NGP-large120', 'adv', 4, 16, 120, 2000, 4600000], ['NGP-xlarge240', 'adv', 8, 32, 240, 3000, 8900000], ['NHT.medium20.TBZ', 'cpu', 8, 8, 80, 1000, 4100000],
  ['MEM-32', 'ram', 4, 32, 120, 1500, 6200000], ['DED-8', 'ded', 8, 32, 240, 3000, 11800000], ['NVMe-200', 'ssd', 4, 16, 200, 2000, 5600000], ['TRF-10', 'traffic', 4, 8, 100, 10000, 5900000],
];
const ADDON_CATS = [['security', 'امنیت'], ['support', 'خدمات و پشتیبانی'], ['panel', 'کنترل پنل'], ['traffic', 'ترافیک مازاد'], ['storage', 'منابع و فضای ذخیره سازی']];
const ADDONS = [ // key, category, title, description, price, period, suggested
  ['av', 'security', 'آنتی‌ویروس سرور ابری', 'اسکن روزانه‌ی فایل‌ها و هشدار بدافزار.', 400000, 'ماهانه', true], ['fw', 'security', 'فایروال پیشرفته', 'قوانین ورودی و خروجی شبکه را از پنل مدیریت کنید.', 600000, 'ماهانه'],
  ['ddos', 'security', 'محافظت DDoS', 'فیلتر ترافیک حمله پیش از رسیدن به سرور.', 1500000, 'ماهانه'], ['manage', 'support', 'مدیریت سرور', 'به‌روزرسانی، پایش و رفع مشکل سرور توسط تیم ایران‌سرور.', 2500000, 'ماهانه', true],
  ['setup', 'support', 'نصب و کانفیگ اولیه', 'نصب وب‌سرور، دیتابیس و تنظیمات امنیتی پایه.', 1200000, 'یک‌بار پرداخت'], ['da', 'panel', 'کنترل پنل DirectAdmin', 'مدیریت سایت، ایمیل و دیتابیس با رابط گرافیکی.', 1200000, 'ماهانه'],
  ['cpanel', 'panel', 'کنترل پنل cPanel', 'کنترل پنل محبوب برای میزبانی چند سایت.', 2900000, 'ماهانه'], ['aapanel', 'panel', 'کنترل پنل aaPanel', 'کنترل پنل سبک و متن‌باز.', 0, 'رایگان'],
  ['tb1', 'traffic', 'یک ترابایت ترافیک مازاد', 'ترافیک مازاد دریافتی اول ماه میلادی ریست می‌شود.', 899000, 'یک‌بار پرداخت'], ['tb2', 'traffic', 'دو ترابایت ترافیک مازاد', 'ترافیک مازاد دریافتی اول ماه میلادی ریست می‌شود.', 1629900, 'یک‌بار پرداخت'],
  ['s3-1', 'storage', 'فضای پشتیبان ۱ ترابایت - S3', '۵ ترابایت ترافیک', 1534000, 'ماهانه'], ['s3-2', 'storage', 'فضای پشتیبان ۲ ترابایت - S3', '۱۰ ترابایت ترافیک', 3034000, 'ماهانه'], ['ip', 'storage', 'آی‌پی اضافه', 'یک آدرس IPv4 دیگر برای همین سرور.', 350000, 'ماهانه', true],
];
const APP_CATS = [['cms', 'سیستم مدیریت محتوا'], ['db', 'مدیریت پایگاه داده'], ['monitor', 'نظارت و تحلیل'], ['auto', 'اتوماسیون و Low-Code'], ['team', 'همکاری و ارتباط تیمی'], ['biz', 'کسب‌وکار و بهره‌وری'], ['edu', 'آموزش و یادگیری']];
const APPS = [ // name, category, description, price (0 = free setup), color
  ['WordPress', 'cms', 'محبوب‌ترین سیستم مدیریت محتوا برای سایت و فروشگاه.', 0, '#21759b'], ['Nextcloud', 'team', 'فضای ابری اشتراکی برای فایل، تقویم و تماس‌ها.', 7990000, '#0082c9'],
  ['n8n', 'auto', 'اتوماسیون گردش کار با اتصال به صدها سرویس.', 7990000, '#ea4b71'], ['Metabase', 'monitor', 'داشبورد و گزارش از دیتابیس‌ها بدون کدنویسی.', 0, '#509ee3'],
  ['Matomo', 'monitor', 'تحلیل بازدید سایت با حفظ حریم خصوصی.', 0, '#3152a0'], ['Odoo', 'biz', 'نرم‌افزار یکپارچه‌ی فروش، انبار و حسابداری.', 7990000, '#714b67'],
  ['Moodle', 'edu', 'سامانه‌ی آموزش آنلاین و مدیریت دوره.', 7990000, '#f98012'], ['Code server', 'team', 'VS Code در مرورگر روی همین سرور.', 7990000, '#007acc'],
  ['Jira', 'team', 'مدیریت پروژه و پیگیری کارهای تیم.', 7990000, '#0052cc'], ['Confluence', 'team', 'پایگاه دانش و مستندات تیم.', 7990000, '#172b4d'],
  ['phpMyAdmin', 'db', 'مدیریت دیتابیس MySQL از مرورگر.', 0, '#6c78af'], ['AaPanel', 'db', 'کنترل پنل سبک برای وب‌سرور و دیتابیس.', 7990000, '#20a53a'],
];
const DISK_PLANS = [['Storage-50', 50], ['Storage-100', 100], ['Storage-250', 250], ['Storage-500', 500], ['Storage-1000', 1000]];
const PERIODS = [[1, 'یک ماهه', 0], [3, 'سه ماهه', 0], [6, 'شش ماهه', 5], [12, 'یک ساله', 10]];
const price = s => (PLANS.find(p => p[0] === s.plan) || PLANS[3])[6];
const trafficTotal = t => t.base + t.extra + t.carried;
const U = { addonCat: 'all', addonTab: 'active', addonSel: [], appCat: 'all', backupTab: 'mine', plan: null, planCat: 'all', renew: 1, os: null, osVer: {}, menu: null };

// ---------- list ----------
function list() {
  const rows = SERVERS.map(s => `<tr data-cs="go" data-v="${srvRoute(s.id)}"><td><div class="ai-cell2"><b class="ltr">${esc(s.name)}</b><span>شماره سرویس: ${fa(s.id)}</span></div></td>
    <td>${srvTag(s)}</td><td>${s.dc}</td><td>${res(s)}</td><td class="ltr sv-ip">${s.ip}</td><td>${s.due}</td>
    <td class="sv-ops"><button type="button" class="ai-icon-btn" data-cs="menu" data-v="${s.id}" title="عملیات">${ic.dots}</button>${U.menu === s.id ? menu(s) : ''}</td></tr>`).join('');
  return wrap(LIST, `${crumbs([['سرور ابری']])}<div class="nav-card cs"><h1 class="nav-card-title">سرور ابری</h1>
    <div class="ai-toolbar"><div class="nav-search"><span>جستجو کنید</span></div><button type="button" class="ai-icon-btn sv-filter" title="فیلتر">${svg('M4 5h16l-6 8v5l-4 2v-7z')}</button><span class="ai-sp"></span>
      ${cs('خرید سرور ابری', 'toast', 'primary', 'خرید سرور ابری از مسیر فعلی سبد خرید انجام می‌شود (خارج از این پروتوتایپ).')}</div>
    <div class="ai-tabs"><button class="on">همه‌ی سرورها ${tag(fa(SERVERS.filter(s => s.status === 'active').length) + ' سرویس فعال', 'primary')}</button></div>
    <div class="ai-table-wrap sv-overflow"><table class="ai-table ai-rows"><thead><tr><th>نام سرور</th><th>وضعیت</th><th>دیتاسنتر</th><th>منابع</th><th>آدرس IP</th><th>تاریخ سررسید</th><th>عملیات</th></tr></thead><tbody>${rows}</tbody></table></div></div>`);
}
function menu(s) {
  const it = (t, a, v, cls = '') => `<button type="button" class="sv-mi ${cls}" data-cs="${a}" data-v="${v}">${t}</button>`;
  return `<div class="sv-menu">${it('مشاهده‌ی جزئیات', 'go', srvRoute(s.id))}${it('ارتقا سرویس', 'go', srvRoute(s.id, 'resources'))}${it('تمدید سرویس', 'go', srvRoute(s.id, 'renew'))}${it('کنسول VNC', 'vnc', s.id)}${it('Soft Reboot', 'soft', s.id)}${it('حذف سرویس', 'delete', s.id, 'ai-danger')}</div>`;
}
PAGES[LIST] = { title: 'سرور ابری', d: { get html() { return list(); }, body: '', legacy: false } };

// ---------- details ----------
function page(id, k) {
  const s = srv(id);
  if (!s) return wrap(srvRoute(id, k), `${crumbs([['سرور ابری', LIST], ['یافت نشد']])}<div class="nav-card">${alert('warning', 'این سرور وجود ندارد یا حذف شده است.')}</div>`);
  const title = SECTIONS.flatMap(g => g[1]).find(x => x[0] === k)?.[1] || 'اطلاعات کلی';
  const hero = `<div class="nav-card sv-hero"><div class="sv-hero-t"><a class="sv-back" href="#${LIST}" title="بازگشت">${svg(P.arrow)}</a>
      <div class="sv-hero-n"><div class="sv-hero-l1"><h1>${s.kind} <span class="ltr">${esc(s.name)}</span></h1>${srvTag(s)}</div><span class="ai-muted">IP : <span class="ltr">${s.ip}</span></span></div>
      <span class="ai-sp"></span>${cs('حذف سرویس', 'delete', 'text', s.id, 'ai-danger')}${cs('تمدید سرویس', 'go', 'outline', srvRoute(s.id, 'renew'))}${cs('ارتقا سرویس', 'go', 'primary', srvRoute(s.id, 'resources'))}</div>
    <div class="sv-facts"><div>${svg(P.backup)}<b>دوره:</b><span>${s.period}</span></div><i></i><div>${svg(P.invoice)}<b>تاریخ ثبت:</b><span>${s.created}</span></div><i></i><div>${svg(P.invoice)}<b>تاریخ سررسید:</b><span>${s.due}</span></div></div></div>`;
  return wrap(srvRoute(s.id, k), `${crumbs([['سرور ابری', LIST], [s.name, srvRoute(s.id)], [title]])}<div class="cs">${hero}${states(s)}${quick(s)}<div class="nav-card cs-main"><h2 class="sv-h cs-title">${title}</h2>${(SEC[k] || SEC.overview)(s)}</div></div>`);
}
function states(s) {
  const out = [], t = s.traffic, restoring = s.backups.find(b => b.status === 'restoring');
  if (s.status === 'suspended') out.push(alert('error', 'سرویس شما به دلیل عدم پرداخت فاکتور تمدید معلق شده است. با پرداخت فاکتور، سرور دوباره روشن می‌شود.', cs('پرداخت فاکتور', 'go', 'text', srvRoute(s.id, 'renew'))));
  if (t.used >= trafficTotal(t)) out.push(alert('error', 'سرویس شما به دلیل اتمام ترافیک سرور مسدود شده است. لطفا نسبت به خرید ترافیک مازاد و یا ارتقا پلن خود اقدام کنید.', cs('خرید ترافیک', 'traffic', 'text', s.id)));
  if (s.status === 'rescue') out.push(alert('warning', 'حالت rescue برای سرویس شما فعال می‌باشد.', cs('غیرفعال کردن', 'unrescue', 'text', s.id)));
  if (s.status === 'paused') out.push(alert('warning', 'سرور در حالت توقف موقت (Pause) است و وضعیت آن در حافظه نگه‌داری می‌شود.', cs('ادامه‌ی کار (Resume)', 'resume', 'text', s.id)));
  if (s.status === 'off') out.push(alert('info', 'سرور خاموش است.', cs('روشن کردن', 'poweron', 'text', s.id)));
  if (restoring) out.push(alert('warning', `سرور در حال بازگردانی بکاپ <b class="ltr">${esc(restoring.name)}</b> است.`));
  return out.join('');
}
function quick(s) {
  const off = s.status === 'suspended';
  const items = [['کنسول VNC', 'vnc'], [s.status === 'paused' ? 'ادامه‌ی کار' : 'متوقف کردن', s.status === 'paused' ? 'resume' : 'pause'], [s.status === 'rescue' ? 'حالت Unrescue' : 'حالت Rescue', s.status === 'rescue' ? 'unrescue' : 'rescue'],
    [s.status === 'off' ? 'روشن کردن' : 'خاموش کردن', s.status === 'off' ? 'poweron' : 'poweroff'], ['Hard Reboot', 'hard'], ['Soft Reboot', 'soft'], ['تغییر رمز عبور', 'passwd']];
  return `<div class="nav-card"><h3 class="sv-h">دسترسی‌های مهم</h3><div class="sv-qa cs-qa">${items.map(([t, a]) => cs(t, a, 'text', s.id, '', off ? 'disabled' : '')).join('<i></i>')}</div></div>`;
}
function gauge(pct) {
  const p = Math.min(100, pct), len = Math.PI * 54;
  return `<div class="cs-gauge"><svg width="150" height="86" viewBox="0 0 150 86"><path d="M21 80a54 54 0 01108 0" fill="none" stroke="#e4e5e7" stroke-width="12" stroke-linecap="round"/>
    <path d="M21 80a54 54 0 01108 0" fill="none" stroke="${p >= 90 ? '#b01111' : '#1e7b22'}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${len * p / 100} ${len}"/></svg>
    <b>${fa(p)}٪</b><div class="cs-legend"><span><i class="g"></i>مصرف شده</span><span><i></i>کل ترافیک مجاز</span></div></div>`;
}
const pill = (label, value, dot = true) => `<span class="cs-pill-i">${dot ? '<i></i>' : ''}${label}: <b class="ltr">${value}</b></span>`;
const field = (label, value) => `<div><b>${label}:</b>${value}</div>`;
const SEC = {
  overview(s) {
    const t = s.traffic, total = trafficTotal(t), disks = B.blocks.filter(b => b.server === s.id);
    return `<div class="sv-box"><h3 class="sv-h">اطلاعات سرور</h3><div class="sv-grid">
        ${field('وضعیت سرور', srvTag(s))}${field('نام سرور', `<span class="ltr">${esc(s.host)}</span><button type="button" class="ai-icon-btn" data-cs="rename" data-v="${s.id}" title="ویرایش نام">${svg(P.edit)}</button>`)}${field('سیستم عامل', `${osLogo(s.os)}<span class="ltr">${esc(s.os)}</span>`)}
        ${field('پردازنده', `<span>${fa(s.cpu)} هسته</span>`)}${field('رم', `<span>${fa(s.ram)} گیگابایت</span>`)}${field('فضای داخلی', `<span>${fa(s.disk)} گیگابایت</span>`)}${field('دیتاسنتر', `<span>${s.dc}</span>`)}</div></div>
      <div class="sv-box"><h3 class="sv-h">اطلاعات دسترسی</h3><div class="sv-grid">${field('آدرس IPv4', `<span class="ltr">${s.ip}</span>`)}${field('آدرس IPv6', `<span class="ltr">${s.ipv6}</span>`)}
        ${field('دسترسی SSH', `<span class="ltr">${esc(s.ssh)}</span><button type="button" class="ai-icon-btn" data-ai="copy" data-v="${esc(s.ssh)}" title="کپی">${ic.copy}</button>`)}</div></div>
      ${divider(`ترافیک سرویس <span class="ai-muted" title="ترافیک مازاد و منتقل‌شده به ترافیک اولیه اضافه می‌شود.">${ic.info}</span>`, cs('خرید ترافیک', 'traffic', 'outline', s.id))}
      <div class="cs-traffic">${gauge(Math.round(t.used / total * 100))}<div class="cs-pills">
        <div class="cs-pill">${pill('کل ترافیک مجاز', fa(total) + ' GB')}<i class="cs-vr"></i>${pill('ترافیک اولیه', fa(t.base) + ' GB')}<span class="cs-plus">+</span>${pill('ترافیک مازاد', fa(t.extra) + ' GB', false)}<span class="cs-plus">+</span>${pill('منتقل شده از دوره قبل', fa(t.carried) + ' GB', false)}</div>
        <div class="cs-pill-row"><div class="cs-pill">${pill('ترافیک باقی مانده', fa(Math.max(0, total - t.used)) + ' GB')}${svg(P.refresh)}</div><div class="cs-pill">${pill('ترافیک مصرف شده در دوره قبل', fa(t.prev) + ' GB')}</div></div></div></div>
      ${divider('فضای پشتیبان')}
      <div class="ai-sec-tools"><h3 class="sv-h">لیست دیسک‌های متصل</h3>${cs('مدیریت دیسک‌ها', 'go', 'outline', srvRoute(s.id, 'disks'))}</div>
      ${disks.length ? tbl(['شماره سرویس', 'نام سرویس', 'حجم استفاده شده', 'حجم کل', 'عملیات'], disks.map(b => `<tr><td>${fa(b.id)}</td><td class="ltr">${esc(b.name)}</td><td>${fa(b.used)} GB</td><td>${fa(b.size)} GB</td>
        <td><a class="ai-icon-btn" href="#${bsRoute(b.id)}" title="مشاهده">${svg(P.eye)}</a></td></tr>`)) : `<div class="ai-empty-s">${NAV.icon('block-storage', 40)}<p>دیسک ابری به این سرور متصل نیست.</p></div>`}`;
  },
  tickets: () => ticketsCard('این سرویس').replace(/^<div class="nav-card">|<\/div>$/g, ''),
  invoices: s => invoicesCard([['۳۰۱۱۰۲', s.due, 'تمدید سرور ابری', money(price(s)) + ' تومان', s.status === 'suspended' ? tag('سررسید گذشته', 'error') : tag('پرداخت نشده', 'warning')], ['۳۰۱۰۴۴', s.created, 'خرید سرور ابری', money(price(s)) + ' تومان', tag('پرداخت شده', 'success')]]).replace(/^<div class="nav-card"><h3 class="sv-h">[^<]*<\/h3>|<\/div>$/g, ''),
  backups(s) {
    const mine = s.backups, dcAll = SERVERS.filter(x => x.dc === s.dc).flatMap(x => x.backups.map(b => ({ ...b, host: x.host }))), full = mine.length >= 2;
    const card = (b, i, own) => `<div class="cs-bk"><div class="cs-bk-h">${svg(P.backup)}<b class="ltr">${esc(b.name)}</b><span class="ai-sp"></span><small>${b.at}</small></div>
      <div class="cs-bk-m"><span class="ltr">${esc(b.host || s.host)}</span><i></i><span>${fa(b.size)} GB</span><i></i>${osLogo(b.os)}<span class="ltr">${esc(b.os)}</span></div>
      <div class="cs-bk-f">${{ active: tag('فعال', 'success'), creating: tag('در حال ساخت', 'warning'), restoring: tag('در حال بازگردانی', 'warning'), error: tag('خطا', 'error') }[b.status]}<span class="ai-sp"></span>
        ${own ? `<button type="button" class="ai-icon-btn" data-cs="restore" data-v="${i}" title="بازگردانی" ${b.status !== 'active' ? 'disabled' : ''}>${svg(P.restore)}</button><button type="button" class="ai-icon-btn ai-danger" data-cs="bkdel" data-v="${i}" title="حذف">${svg(P.trash)}</button>` : ''}</div></div>`;
    const shown = U.backupTab === 'mine' ? mine.map((b, i) => card(b, i, true)) : dcAll.map((b, i) => card(b, i, false));
    return `${alert('info', 'شما می‌توانید از سرویس خود حداکثر دو بکاپ تهیه کنید.<br>برای سرورهای ویندوزی نیاز هست قبل از بکاپ‌گیری، سرور خود را pause کنید.')}
      <label class="ai-field"><span>نام بکاپ</span><div class="ai-inline"><input class="ai-input ltr" data-cs-in="bkname" placeholder="before-update" ${full ? 'disabled' : ''}>${cs('ایجاد بکاپ', 'backup', 'tonal', s.id, '', full ? 'disabled' : '')}</div>
        <small>${full ? 'به سقف دو بکاپ رسیده‌اید؛ برای بکاپ جدید یکی از بکاپ‌ها را حذف کنید.' : 'نام بکاپ می‌تواند شامل حروف فارسی، انگلیسی و خط تیره باشد.'}</small></label>
      <div class="ai-tabs"><button class="${U.backupTab === 'mine' ? 'on' : ''}" data-cs="bktab" data-v="mine">بکاپ‌های سرویس ${tag(fa(mine.length) + ' بکاپ فعال', 'gray')}</button><button class="${U.backupTab === 'dc' ? 'on' : ''}" data-cs="bktab" data-v="dc">بکاپ‌های دیتاسنتر ${s.dc} ${tag(fa(dcAll.length) + ' بکاپ فعال', 'gray')}</button></div>
      ${shown.length ? `<div class="cs-grid3">${shown.join('')}</div>` : `<div class="ai-empty-s">${NAV.icon('cloud-server', 40)}<p>هنوز بکاپی ندارید.</p></div>`}`;
  },
  'change-os'(s) {
    const pick = U.os;
    return `<div class="sv-box cs-cur">سیستم عامل فعلی شما: ${osLogo(s.os)}<b class="ltr">${esc(s.os)}</b></div>
      ${divider('سیستم عامل‌های مناسب با سرویس شما')}
      <div class="cs-grid4">${OSES.map(([n, vs]) => `<div class="ai-rcard${pick === n ? ' on' : ''}" data-cs="os" data-v="${n}"><div class="ai-rcard-t">${radio(pick === n)}<b class="ltr">${n}</b><span class="ai-sp"></span>${osLogo(n)}</div>
        <select class="ai-input" data-cs-in="osver" data-os="${n}"><option value="">انتخاب نسخه</option>${vs.map(v => `<option ${U.osVer[n] === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>`).join('')}</div>
      <div class="ai-sec-tools"><span class="ai-sp"></span>${cs('تغییر سیستم عامل', 'osgo', 'primary', s.id, '', pick && U.osVer[pick] ? '' : 'disabled')}</div>`;
  },
  resources(s) {
    const pick = U.plan, cur = PLANS.find(p => p[0] === s.plan) || PLANS[3], np = PLANS.find(p => p[0] === pick);
    const rows = PLANS.filter(p => U.planCat === 'all' || p[1] === U.planCat).map(p => {
      const isCur = p[0] === s.plan, dis = isCur || p[4] < s.disk;
      return `<tr class="${pick === p[0] ? 'sel' : ''} ${dis ? 'cs-dis' : ''}" ${dis ? '' : `data-cs="plan" data-v="${p[0]}"`}><td class="ai-td-ck">${radio(pick === p[0])}</td><td><span class="ltr">${p[0]}</span> ${isCur ? tag('سرویس فعلی شما', 'primary') : ''}</td>
        <td>${fa(p[2])} هسته</td><td>${fa(p[3])} گیگابایت</td><td>${fa(p[4])} گیگابایت (شبکه‌ای)</td><td>${fa(p[5])} گیگابایت</td><td>${money(p[6])} <small>تومان</small></td></tr>`;
    });
    const diff = np ? Math.max(0, np[6] - cur[6]) : 0;
    return `<p class="ai-desc">منابع مورد نظر خود را انتخاب کنید. پلن‌هایی که فضای داخلی آن‌ها از فضای فعلی کمتر است قابل انتخاب نیستند.</p>
      <div class="sv-box cs-cur"><b>اطلاعات سرور ابری درحال استفاده:</b><span>پردازنده: ${fa(s.cpu)} هسته</span><i></i><span>رم: ${fa(s.ram)} گیگابایت</span><i></i><span>فضای داخلی: ${fa(s.disk)} گیگابایت</span><i></i><span>ترافیک: ${fa(s.traffic.base)} گیگابایت</span></div>
      <div class="ai-chips">${[['all', 'همه'], ...PLAN_CATS].map(([k, t]) => `<button type="button" class="ai-chip${U.planCat === k ? ' on' : ''}" data-cs="plancat" data-v="${k}">${t}</button>`).join('')}</div>
      ${tbl(['', 'نام منابع', 'پردازنده', 'رم', 'فضا', 'ترافیک', 'قیمت ماهانه'], rows).replace('class="ai-table"', 'class="ai-table ai-pick"')}
      <div class="cs-costbar"><span>${ic.info} هزینه ارتقا تا پایان دوره</span><b>${money(diff)} تومان</b></div>
      <div class="ai-sec-tools"><span class="ai-sp"></span>${cs('بروزرسانی منابع', 'resgo', 'primary', s.id, '', np ? '' : 'disabled')}</div>`;
  },
  renew(s) {
    const base = price(s), act = s.addons.map(a => ADDONS.find(x => x[0] === a.k)).filter(Boolean);
    return `<p class="ai-desc">سرویس خود را با سیکل مورد نظرتان تمدید کنید.</p>${divider('انتخاب مدت اعتبار')}
      <div class="cs-grid4">${PERIODS.map(([m, t, d]) => `<div class="ai-rcard${U.renew === m ? ' on' : ''}" data-cs="renewp" data-v="${m}"><div class="ai-rcard-t">${radio(U.renew === m)}<b>${t}</b><span class="ai-sp"></span>${d ? tag(money(base * m * d / 100) + ' تومان تخفیف', 'success') : ''}</div>
        <span class="ai-rcard-sub">${money(base * m * (1 - d / 100))} تومان</span></div>`).join('')}</div>
      ${divider('افزونه‌های سرویس شما')}
      ${act.length ? `<div class="cs-grid4">${act.map(a => `<div class="ai-plug on"><div class="ai-plug-t"><b>${a[2]}</b>${checkbox(true)}</div><p>${a[3]}</p><div class="ai-plug-p"><b>${money(a[4])}</b> <small>تومان / ${a[5]}</small></div></div>`).join('')}</div>` : '<p class="ai-desc">افزونه‌ی فعالی ندارید.</p>'}
      <div class="ai-sec-tools"><span class="ai-sp"></span>${cs('ثبت سفارش', 'renewgo', 'primary', s.id)}</div>`;
  },
  addons(s) {
    const act = s.addons.map(a => ({ a, d: ADDONS.find(x => x[0] === a.k) })).filter(x => x.d);
    const shown = ADDONS.filter(a => U.addonCat === 'all' || a[1] === U.addonCat), sel = U.addonSel.map(k => ADDONS.find(a => a[0] === k));
    const cards = cat => shown.filter(a => a[1] === cat).map(a => { const on = U.addonSel.includes(a[0]), has = s.addons.some(x => x.k === a[0]);
      return `<div class="ai-plug${on ? ' on' : ''}${has ? ' cs-dis' : ''}" ${has ? '' : `data-cs="addon" data-v="${a[0]}"`}><div class="ai-plug-t"><b>${a[2]}</b>${has ? tag('فعال', 'success') : checkbox(on)}</div><p>${a[3]}</p>
        <div class="cs-plug-f">${a[6] ? tag('پیشنهادی', 'success') : ''}<span class="ai-sp"></span>${a[4] ? `<b>${money(a[4])}</b> <small>تومان / ${a[5]}</small>` : '<b>رایگان</b>'}</div></div>`; }).join('');
    return `<h3 class="sv-h">لیست افزونه‌های شما</h3>
      <div class="ai-tabs"><button class="${U.addonTab === 'active' ? 'on' : ''}" data-cs="addontab" data-v="active">افزونه‌های فعال</button><button class="${U.addonTab === 'archive' ? 'on' : ''}" data-cs="addontab" data-v="archive">آرشیو افزونه‌ها (قابل تمدید)</button></div>
      ${U.addonTab === 'active' && act.length ? tbl(['نام افزونه', 'قیمت', 'تاریخ تمدید', 'وضعیت', 'عملیات'], act.map(({ a, d }) => `<tr><td>${d[2]}</td><td>${money(d[4])} تومان</td><td>${a.at}</td><td>${tag('فعال', 'success')}</td><td>${cs('لغو افزونه', 'addonoff', 'text', a.k, 'ai-danger')}</td></tr>`))
        : `<div class="ai-empty-s">${NAV.icon('apps', 40)}<b>${U.addonTab === 'active' ? 'درحال حاضر افزونه فعالی ندارید' : 'افزونه‌ی منقضی‌شده‌ای ندارید'}</b><p>شما می‌توانید از افزونه‌های ارائه شده، مواردی که احتیاج دارید را برای مدیریت راحت‌تر فعال نمایید.</p></div>`}
      ${divider('دسته بندی افزونه‌ها')}
      <div class="ai-sec-tools"><div class="ai-chips">${[['all', 'همه'], ...ADDON_CATS].map(([k, t]) => `<button type="button" class="ai-chip${U.addonCat === k ? ' on' : ''}" data-cs="addoncat" data-v="${k}">${t}</button>`).join('')}</div><span class="ai-sp"></span><div class="nav-search cs-search">${svg(P.search)}<span>جستجو کنید</span></div></div>
      ${ADDON_CATS.filter(([k]) => shown.some(a => a[1] === k)).map(([k, t]) => `<div class="cs-cat"><h4>${t}</h4><div class="cs-grid4">${cards(k)}</div></div>`).join('')}
      ${sel.length ? `<div class="cs-bar"><b>${fa(sel.length)} افزونه انتخاب شده</b><span>جمع: <b>${money(sel.reduce((x, a) => x + a[4], 0))} تومان</b></span><span class="ai-sp"></span>${cs('انصراف', 'addonclear', 'text')}${cs('ثبت سفارش', 'addongo', 'primary', s.id)}</div>` : ''}`;
  },
  apps(s) {
    const shown = APPS.filter(a => U.appCat === 'all' || a[1] === U.appCat);
    return `<h3 class="sv-h">لیست برنامه‌های آماده نصب شده</h3>
      ${s.apps.length ? tbl(['نام برنامه', 'دامنه', 'وضعیت', 'عملیات'], s.apps.map((a, i) => `<tr><td>${a.name}</td><td class="ltr">${esc(a.domain)}</td><td>${a.status === 'active' ? tag('فعال', 'success') : tag('در حال نصب', 'info')}</td>
        <td><a class="ai-btn ai-btn-text" href="https://${esc(a.domain)}" target="_blank" rel="noopener">ورود</a>${cs('حذف', 'appdel', 'text', i, 'ai-danger')}</td></tr>`))
        : `<div class="ai-empty-s">${NAV.icon('apps', 40)}<b>درحال حاضر برنامه آماده فعالی ندارید</b><p>شما می‌توانید از برنامه‌های آماده‌ی ارائه شده، مواردی که احتیاج دارید را برای مدیریت راحت‌تر فعال نمایید.</p></div>`}
      ${divider('برنامه‌های آماده')}
      <div class="ai-sec-tools"><div class="ai-chips">${[['all', 'همه'], ...APP_CATS].map(([k, t]) => `<button type="button" class="ai-chip${U.appCat === k ? ' on' : ''}" data-cs="appcat" data-v="${k}">${t}</button>`).join('')}</div><span class="ai-sp"></span><div class="nav-search cs-search">${svg(P.search)}<span>جستجو کنید</span></div></div>
      <div class="cs-grid4">${shown.map(a => { const has = s.apps.some(x => x.name === a[0]); return `<div class="ai-plug${has ? ' cs-dis' : ''}" ${has ? '' : `data-cs="app" data-v="${a[0]}"`}>
        <div class="ai-plug-t"><span class="cs-app" style="--c:${a[4]}">${a[0][0]}</span><b class="ltr">${a[0]}</b><span class="ai-sp"></span>${has ? tag('نصب شده', 'success') : checkbox(false)}</div><p>${a[2]}</p>
        <div class="cs-plug-f">${tag(APP_CATS.find(c => c[0] === a[1])[1], 'gray')}<span class="ai-sp"></span>${a[3] ? `<b>${money(a[3])}</b> <small>تومان</small>` : '<b>نصب و راه‌اندازی رایگان</b>'}</div></div>`; }).join('')}</div>`;
  },
  disks(s) {
    const disks = B.blocks.filter(b => b.dc === s.dc);
    const st = b => b.server === s.id ? tag('متصل', 'success') : b.status !== 'active' ? tag('درحال اتصال', 'warning') : b.server ? tag('متصل به سرور دیگر', 'gray') : tag('غیرمتصل', 'error');
    return `<h3 class="sv-h">لیست دیسک‌های ابری خریداری شده</h3>${alert('info', `در اینجا فقط دیسک‌های خریداری شده مربوط به همین سرور، بر اساس دیتاسنتر آن (${s.dc}) نمایش داده می‌شوند.`)}
      ${disks.length ? tbl(['شماره سرویس', 'نام سرویس', 'حجم کل', 'تاریخ انقضا سرویس', 'وضعیت اتصال', 'متصل/غیرمتصل'], disks.map(b => { const can = b.status === 'active' && (!b.server || b.server === s.id);
        return `<tr><td><a class="sv-link" href="#${bsRoute(b.id)}">${fa(b.id)}</a></td><td class="ltr">${esc(b.name)}</td><td>${fa(b.size)} GB</td><td>${b.next}</td><td>${st(b)}</td>
          <td><span ${can ? `data-cs="attach" data-v="${b.id}"` : 'class="cs-dis"'}>${toggle(b.server === s.id)}</span></td></tr>`; }))
        : `<div class="ai-empty-s">${NAV.icon('block-storage', 40)}<p>در دیتاسنتر ${s.dc} دیسک ابری ندارید.</p></div>`}
      ${divider('پلن‌های دیسک ابری')}<p class="ai-desc">با انتخاب یکی از پلن‌های دیسک ابری زیر، فضای ذخیره‌سازی خود را تأمین کنید.</p>
      <div class="cs-grid4">${DISK_PLANS.map(([n, g], i) => `<div class="ai-plug cs-disk"><div class="ai-plug-t">${NAV.icon('block-storage', 20)}<b class="ltr">${n}</b><span class="ai-sp"></span>${i === 1 || i === 2 ? tag('پیشنهادی', 'success') : ''}</div>
        <p>${fa(g)} گیگابایت فضای ذخیره سازی<br>قابلیت استفاده در زیرساخت ابری</p><div class="sv-price"><s>${money(g * 40000)}</s><span><b>${money(g * 40000 * .8)}</b> تومان / به ازای هر ماه در خرید سالانه</span></div>
        ${cs('ثبت سفارش', 'diskbuy', 'tonal', g, 'ai-btn-block')}</div>`).join('')}</div>`;
  },
};
function register(id) { SECTIONS.flatMap(g => g[1]).forEach(([k]) => { const r = srvRoute(id, k); PAGES[r] = { title: 'سرور ابری', d: { get html() { return page(id, k); }, body: '', legacy: false } }; }); }
SERVERS.forEach(s => register(s.id));

SIDE2.register(route => {
  const m = route.match(/^\/my\/panel\/service\/(\d+)\/server(?:\/([\w-]+))?$/), s = m && srv(m[1]);
  if (!s) return null;
  const k = m[2] || 'overview';
  return {
    title: 'سرور ابری', icon: NAV.icon('cloud-server', 24), current: { name: s.name, tag: srvTag(s) },
    services: SERVERS.map(x => ({ name: x.name, route: srvRoute(x.id, k), on: x.id === s.id })), allRoute: LIST, allLabel: 'همه‌ی سرورها',
    groups: SECTIONS.map(([t, items]) => ({ title: t, items: items.map(([kk, label, icn]) => ({ label, route: srvRoute(s.id, kk), on: kk === k, icon: svg(P[icn]) })) })),
  };
});

// ---------- modals ----------
// Destructive actions ask the user to type a word (Figma "Modal-Reboot", "Modal-Pause", "Modal-rescue", "Modal-ShutDown", "Modal-Delete Service").
function confirmModal(title, tone, warn, question, word, act, v) {
  modal(title, `${alert(tone, warn)}<p class="cs-q">${question}</p><label class="ai-field"><span class="cs-word">برای تایید نهایی، لطفا عبارت <b class="ltr">${word}</b> را در فیلد زیر وارد کنید.</span>
    <input class="ai-input ltr" data-cs-in="confirm" data-need="${word}" autocomplete="off"></label>`, cs('تایید', act, 'primary', v, '', 'disabled id="cs-ok"') + cancel);
}
const MODALS = {
  hard: s => confirmModal('راه‌اندازی مجدد سرور (Hard Reboot)', 'warning', 'این عملیات مانند قطع و وصل برق است و ممکن است داده‌های ذخیره‌نشده از بین برود؛ سرور چند دقیقه در دسترس نخواهد بود.', 'شما در حال انجام عملیات راه اندازی مجدد (Hard Reboot) هستید. آیا برای ادامه آماده اید؟', 'REBOOT', 'do-reboot', s.id),
  soft: s => confirmModal('راه‌اندازی مجدد سرور (Reboot)', 'warning', 'این عملیات باعث توقف لحظه‌ای سرویس‌های در حال اجرا و قطع دسترسی به سرور برای چند دقیقه خواهد شد.', 'شما در حال انجام عملیات راه اندازی مجدد (Reboot) هستید. آیا برای ادامه آماده اید؟', 'REBOOT', 'do-reboot', s.id),
  pause: s => confirmModal('توقف موقت سرور (Pause)', 'error', 'این عملیات وضعیت فعلی سرور را در حافظه (RAM) ذخیره کرده و آن را به حالت تعلیق در می‌آورد. در این حالت، سرور از دسترس خارج می‌شود اما می‌توانید به سرعت آن را به همین وضعیت بازگردانید.', 'شما در حال توقف موقت سرور خود می باشید. آیا برای ادامه آماده‌اید؟', 'PAUSE', 'do-status', 'paused'),
  rescue: s => confirmModal('ورود به حالت نجات (Rescue Mode)', 'error', 'این حالت برای عیب‌یابی و انتقال اطلاعات هنگام بوت نشدن سرور است. با رمز فعلی وارد شوید و پس از اتمام کار، حتماً سرور را به حالت عادی برگردانید.', 'شما در حال راه‌اندازی سرور در حالت Rescue هستید. این یک محیط ویژه برای تعمیرات است و تمام سرویس‌های فعلی متوقف خواهند شد. آیا از انجام این عملیات اطمینان دارید؟', 'RESCUE', 'do-status', 'rescue'),
  poweroff: s => confirmModal('خاموش کردن کامل سرور (Power Off)', 'warning', 'با تایید این عملیات، تمام سرویس‌های فعال متوقف شده و سرور تا زمان روشن کردن مجدد توسط شما، از دسترس خارج خواهد بود.', 'شما در حال خاموش کردن کامل سرور خود می باشید. آیا برای ادامه آماده‌اید؟', 'POWER OFF', 'do-status', 'off'),
};

// ---------- interactions ----------
const cur = () => srv(((document.getElementById('sv-root')?.dataset.route || '').match(/service\/(\d+)\/server/) || [])[1]);
const refresh = () => window.SVC.refresh();
document.addEventListener('click', e => {
  if (U.menu && !e.target.closest('.sv-ops')) { U.menu = null; refresh(); }
  const el = e.target.closest('[data-cs]');
  if (!el || !el.closest('.cs, .ai-mask, #sv-root') || el.disabled) return;
  e.preventDefault(); e.stopPropagation();
  const a = el.dataset.cs, v = el.dataset.v, s = srv(v) || cur();
  const done = msg => { saveSrv(); closeAll(); refresh(); SIDE2.refresh(); if (msg) toast(msg); };
  const A = {
    go() { closeAll(); go(v); },
    toast() { toast(v); },
    menu() { U.menu = U.menu === +v ? null : +v; refresh(); },
    vnc() { U.menu = null; refresh(); toast('کنسول VNC سرور ' + s.name + ' در پنجره‌ی جدید باز می‌شود (نمونه).'); },
    hard() { MODALS.hard(s); }, soft() { U.menu = null; MODALS.soft(s); }, pause() { MODALS.pause(s); }, rescue() { MODALS.rescue(s); }, poweroff() { MODALS.poweroff(s); },
    'do-reboot'() { done('سرور در حال راه‌اندازی مجدد است.'); },
    'do-status'() { cur().status = v; done({ paused: 'سرور متوقف شد.', rescue: 'سرور در حالت Rescue راه‌اندازی شد؛ رمز ورود ایمیل شد.', off: 'سرور خاموش شد.' }[v]); },
    resume() { s.status = 'active'; done('سرور از حالت توقف خارج شد.'); },
    unrescue() { s.status = 'active'; done('سرور به حالت عادی برگشت.'); },
    poweron() { s.status = 'active'; done('سرور روشن شد.'); },
    passwd() {
      modal('رمز عبور', `<div class="sv-box"><h3 class="sv-h">رمز سرویس</h3><div class="sv-grid"><div><b>نام کاربری:</b><span class="ltr">${/^Admin/.test(s.ssh) ? 'Administrator' : 'root'}</span></div>
        <div><b>رمز عبور:</b><span class="ltr">${esc(s.pass)}</span><button type="button" class="ai-icon-btn" data-ai="copy" data-v="${esc(s.pass)}">${ic.copy}</button></div></div></div>
        <h3 class="sv-h">تغییر رمز سرویس</h3><label class="ai-field"><span>رمز عبور جدید</span><input class="ai-input ltr" type="password" id="cs-p1"></label><label class="ai-field"><span>تکرار رمز عبور</span><input class="ai-input ltr" type="password" id="cs-p2"></label><p class="ai-err" id="cs-perr"></p>`,
        cs('ذخیره و اعمال تغییرات', 'passok', 'primary', s.id) + cancel);
    },
    passok() { const p1 = document.getElementById('cs-p1').value, p2 = document.getElementById('cs-p2').value, er = document.getElementById('cs-perr');
      if (p1.length < 8) { er.textContent = 'رمز عبور باید دست‌کم ۸ کاراکتر باشد.'; return; } if (p1 !== p2) { er.textContent = 'رمز عبور و تکرار آن یکسان نیست.'; return; }
      s.pass = p1; done('رمز عبور تغییر کرد؛ سرور یک بار ری‌استارت می‌شود.'); },
    rename() { modal('ویرایش نام سرور', `<label class="ai-field"><span>نام سرور</span><input class="ai-input ltr" id="cs-name" value="${esc(s.host)}"><small>فقط حروف انگلیسی، عدد و خط تیره.</small></label>`, cs('ذخیره', 'renameok', 'primary', s.id) + cancel); },
    renameok() { const n = document.getElementById('cs-name').value.trim(); if (/^[\w-]{3,}$/.test(n)) { s.host = n; done('نام سرور ذخیره شد.'); } },
    delete() { U.menu = null;
      const reasons = ['این سرور را برای تست ساخته بودم و دیگر نیازی به آن ندارم.', 'سرویس دچار مشکل شده بود و میخواهم بعد از حذف مجددا سرور جدید فعال کنم.', 'از کیفیت سرور رضایت نداشتم و میخواهم در دیتاسنتر دیگری سرور بسازم.', 'از کیفیت سرور رضایت نداشتم و میخواهم از ایران سرور مهاجرت کنم.', 'هزینه سرور بالا بود و نمیخواهم تا این مقدار هزینه کنم.', 'دلایل دیگر'];
      modal('حذف سرویس', `<b>دلیل شما برای حذف سرور ابری <span class="ai-danger">*</span></b><small class="ai-muted">لطفا دلیل حذف سرور خود را با ما در میان بگذارید.</small>
        <div class="ai-col">${reasons.map((r, i) => `<label class="ai-ck-row"><input type="checkbox" data-cs-in="reason">${r}</label>`).join('')}</div><hr class="cs-hr">
        <p class="cs-q">شما در حال حذف سرویس خود می باشید. آیا اطمینان دارید؟</p><label class="ai-field"><span class="cs-word">برای تایید نهایی، لطفا عبارت <b class="ltr">DELETE</b> را در فیلد زیر وارد کنید.</span><input class="ai-input ltr" data-cs-in="confirm" data-need="DELETE" data-reason="1"></label>`,
        cs('تایید', 'deleteok', 'primary', s.id, '', 'disabled id="cs-ok"') + cancel); },
    deleteok() { const i = SERVERS.indexOf(s); SERVERS.splice(i, 1); B.blocks.forEach(b => { if (b.server === s.id) b.server = null; }); saveSrv(); closeAll(); go(LIST); refresh(); toast('سرویس حذف شد.'); },
    // backups
    bktab() { U.backupTab = v; refresh(); },
    backup() { if (s.backups.length >= 2) return; const n = (document.querySelector('[data-cs-in="bkname"]')?.value || '').trim() || 'backup-' + (s.backups.length + 1);
      const b = { name: n, at: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()).replace('،', ' -'), size: s.disk, os: s.os, status: 'creating' };
      s.backups.push(b); done('ساخت بکاپ شروع شد.'); setTimeout(() => { b.status = 'active'; saveSrv(); refresh(); }, 3500); },
    restore() { const b = cur().backups[+v]; modal('بازگردانی بکاپ', `${alert('warning', 'با بازگردانی، همه‌ی داده‌های فعلی سرور با داده‌های این بکاپ جایگزین می‌شود.')}<p class="cs-q">بکاپ <b class="ltr">${esc(b.name)}</b> بازگردانی شود؟</p>`, cs('بازگردانی', 'restoreok', 'primary', v) + cancel); },
    restoreok() { const sv = cur(), b = sv.backups[+v]; b.status = 'restoring'; done('بازگردانی بکاپ شروع شد.'); setTimeout(() => { b.status = 'active'; saveSrv(); refresh(); toast('بازگردانی بکاپ تمام شد.'); }, 5000); },
    bkdel() { const sv = cur(); modal('حذف بکاپ', `<p class="cs-q">بکاپ <b class="ltr">${esc(sv.backups[+v].name)}</b> حذف شود؟ این کار برگشت‌پذیر نیست.</p>`, cs('حذف', 'bkdelok', 'primary', v, 'ai-btn-danger') + cancel); },
    bkdelok() { cur().backups.splice(+v, 1); done('بکاپ حذف شد.'); },
    // OS
    os() { if (e.target.closest('select')) return; U.os = v; refresh(); },
    osgo() { const n = U.os + ' ' + U.osVer[U.os]; confirmModal('تغییر سیستم عامل', 'error', 'با تغییر سیستم عامل، همه‌ی داده‌های دیسک اصلی سرور پاک می‌شود. پیش از ادامه از سرور بکاپ بگیرید.', `سیستم عامل <b class="ltr">${esc(n)}</b> روی سرور نصب شود؟`, 'REINSTALL', 'osok', n); },
    osok() { cur().os = v; U.os = null; done('نصب سیستم عامل شروع شد؛ چند دقیقه طول می‌کشد.'); },
    // resources
    plancat() { U.planCat = v; refresh(); },
    plan() { U.plan = v; refresh(); },
    resgo() { const p = PLANS.find(x => x[0] === U.plan), c = PLANS.find(x => x[0] === s.plan) || PLANS[3];
      modal('فاکتور تغییر منابع', `<div class="ai-inv"><div><span>شرح</span><span>مبلغ</span></div><div><span>تغییر منابع از <b class="ltr">${s.plan}</b> به <b class="ltr">${p[0]}</b></span><b>${money(Math.max(0, p[6] - c[6]))} تومان</b></div>
        <div><span>منابع جدید</span><span>${fa(p[2])} هسته · ${fa(p[3])} گیگ رم · ${fa(p[4])} گیگ</span></div><div class="ai-inv-total"><span>مبلغ قابل پرداخت</span><b>${money(Math.max(0, p[6] - c[6]))} تومان</b></div></div>
        <label class="ai-field"><span>کد تخفیف</span><div class="ai-inline"><input class="ai-input ltr" placeholder="کد تخفیف دارید؟">${cs('اعمال', 'toast', 'tonal', 'کد تخفیف معتبر نیست (نمونه).')}</div></label>`, cs('پرداخت از کیف پول', 'resok', 'primary', s.id) + cancel); },
    resok() { const p = PLANS.find(x => x[0] === U.plan); Object.assign(s, { plan: p[0], cpu: p[2], ram: p[3], disk: p[4] }); s.traffic.base = p[5]; U.plan = null; done('منابع سرور به‌روز شد؛ سرور یک بار ری‌استارت می‌شود.'); go(srvRoute(s.id)); },
    // renew
    renewp() { U.renew = +v; refresh(); },
    renewgo() { const p = PERIODS.find(x => x[0] === U.renew), total = price(s) * p[0] * (1 - p[2] / 100) + s.addons.reduce((x, a) => x + (ADDONS.find(d => d[0] === a.k)?.[4] || 0) * p[0], 0);
      modal('ثبت سفارش تمدید', `<div class="ai-dr-sum"><span>مدت</span><b>${p[1]}</b><span>مبلغ قابل پرداخت</span><b>${money(total)} تومان</b></div>`, cs('پرداخت فاکتور', 'renewok', 'primary', s.id) + cancel); },
    renewok() { if (s.status === 'suspended') s.status = 'active'; s.period = PERIODS.find(x => x[0] === U.renew)[1]; done('سرویس تمدید شد.'); go(srvRoute(s.id)); },
    // add-ons
    traffic() { U.addonCat = 'traffic'; U.addonTab = 'active'; go(srvRoute(s.id, 'addons')); refresh(); },
    addontab() { U.addonTab = v; refresh(); },
    addoncat() { U.addonCat = v; refresh(); },
    addon() { U.addonSel = U.addonSel.includes(v) ? U.addonSel.filter(x => x !== v) : [...U.addonSel, v]; refresh(); },
    addonclear() { U.addonSel = []; refresh(); },
    addongo() { const sel = U.addonSel.map(k => ADDONS.find(a => a[0] === k)), total = sel.reduce((x, a) => x + a[4], 0);
      modal('ثبت سفارش افزونه', `<div class="ai-inv"><div><span>افزونه</span><span>مبلغ</span></div>${sel.map(a => `<div><span>${a[2]}</span><b>${a[4] ? money(a[4]) + ' تومان' : 'رایگان'}</b></div>`).join('')}<div class="ai-inv-total"><span>مبلغ قابل پرداخت</span><b>${money(total)} تومان</b></div></div>`, cs('پرداخت فاکتور', 'addonok', 'primary', s.id) + cancel); },
    addonok() { U.addonSel.forEach(k => { s.addons.push({ k, at: s.due }); if (k === 'tb1') s.traffic.extra += 1000; if (k === 'tb2') s.traffic.extra += 2000; }); U.addonSel = []; U.addonTab = 'active'; done('افزونه‌ها فعال شدند.'); },
    addonoff() { s.addons = s.addons.filter(x => x.k !== v); done('افزونه در پایان دوره لغو می‌شود.'); },
    // apps
    appcat() { U.appCat = v; refresh(); },
    app() { const a = APPS.find(x => x[0] === v); modal('نصب ' + a[0], `<p class="ai-desc">${a[2]}</p><label class="ai-field"><span>دامنه یا زیردامنه</span><input class="ai-input ltr" id="cs-dom" placeholder="app.example.com"><small>رکورد A دامنه را به IP سرور (<span class="ltr">${s.ip}</span>) اشاره دهید.</small></label>
        <div class="ai-dr-sum"><span>هزینه</span><b>${a[3] ? money(a[3]) + ' تومان' : 'نصب و راه‌اندازی رایگان'}</b></div>`, cs('نصب برنامه', 'appok', 'primary', v) + cancel); },
    appok() { const d = document.getElementById('cs-dom').value.trim() || 'app.example.com', sv = cur(), x = { name: v, domain: d, status: 'installing' }; sv.apps.push(x); done('نصب ' + v + ' شروع شد.'); setTimeout(() => { x.status = 'active'; saveSrv(); refresh(); }, 4000); },
    appdel() { const sv = cur(); sv.apps.splice(+v, 1); done('برنامه حذف شد.'); },
    // cloud disks
    attach() { const b = B.blocks.find(x => x.id === +v), sv = cur(); b.server = b.server === sv.id ? null : sv.id; LS.set('bs_state', B); done(b.server ? 'دیسک به سرور وصل شد.' : 'اتصال دیسک قطع شد.'); },
    diskbuy() { const c = cfgDraft(), sv = cur(); c.size = +v; c.target = 'srv-' + sv.id; closeAll(); go(BS_CFG); },
  };
  A[a]?.();
}, true);
const LS = window.SVC.LS;
document.addEventListener('input', e => {
  const el = e.target.closest('[data-cs-in]');
  if (!el) return;
  if (el.dataset.csIn === 'confirm' || el.dataset.csIn === 'reason') {
    const inp = document.querySelector('[data-cs-in="confirm"]'), ok = document.getElementById('cs-ok');
    const needReason = inp?.dataset.reason, hasReason = [...document.querySelectorAll('[data-cs-in="reason"]')].some(c => c.checked);
    if (ok && inp) ok.disabled = inp.value.trim().toUpperCase() !== inp.dataset.need || (needReason && !hasReason);
  }
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-cs-in="osver"]');
  if (el) { U.osVer[el.dataset.os] = el.value; U.os = el.dataset.os; refresh(); }
  if (e.target.closest('[data-cs-in="reason"]')) document.querySelector('[data-cs-in="confirm"]')?.dispatchEvent(new Event('input', { bubbles: true }));
});
})();
