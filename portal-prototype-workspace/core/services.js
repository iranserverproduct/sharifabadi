// Cloud server and block storage pages (core, admin-owned), in the new panel structure (rail + second sidebar).
//   /my/panel/cloud/server                         cloud server list (table, like AIaaS)
//   /my/panel/service/101/server[/...]             captured service pages + second sidebar instead of the page's tabs
//   /my/panel/cloud/block-storage                  block storage list (Figma "Block Storage - Table" 37300:152396)
//   /my/panel/cloud/block-storage/configure        purchase (Figma 31973:104783)
//   /my/panel/service/<id>/block-storage[/<s>]     service details (Figma 37570:73322, states 37570:73510); sections in the sidebar
// Block storage data is fake and kept in this browser (localStorage "bs_state").
(() => {
'use strict';
const PAGES = window.PAGES_DATA;
const { fa, money, esc, tag, btn, radio, checkbox, alert, crumbs, modal, toast, closeAll, ic } = window.AIUI;
const svg = d => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const I = {
  info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 8v.01',
  ticket: 'M4 7a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3a2 2 0 000-4zM10 5v14',
  invoice: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3',
  backup: 'M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3M18 3v4h-4M6 21v-4h4',
  os: 'M4 5h16v11H4zM8 20h8M12 16v4',
  addons: 'M12 5v14M5 12h14M4 4h6v6H4zM14 14h6v6h-6z',
  resize: 'M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6',
  guide: 'M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
};
const wrap = (route, html) => `<div class="nav-page ai sv" id="sv-root" data-route="${esc(route)}">${html}</div>`;
const LS = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};

// ---------- block storage ----------
const BS_LIST = '/my/panel/cloud/block-storage', BS_CFG = BS_LIST + '/configure';
const bsRoute = (id, k) => `/my/panel/service/${id}/block-storage${k && k !== 'overview' ? '/' + k : ''}`;
const PER_GB = 40000; // toman per GB per month (sample)
const PERIODS = [[1, 'یک ماهه', 0], [3, 'سه ماهه', 10], [6, 'شش ماهه', 15], [12, 'سالانه', 20]];
const BS_SECTIONS = [
  ['مدیریت سرویس', [['overview', 'اطلاعات کلی', 'info'], ['tickets', 'تیکت‌ها', 'ticket'], ['invoices', 'فاکتورهای مالی', 'invoice'], ['backups', 'مدیریت بکاپ', 'backup']]],
  ['عملیات', [['resize', 'افزایش حجم', 'resize'], ['guide', 'دستورالعمل نصب', 'guide']]],
];
const SEED = [
  { id: 124850, name: 'block-storage-542035', status: 'active', dc: 'فردوسی', size: 100, used: 25, server: 101, created: '۱۴۰۴/۰۴/۱۰', period: 1, next: '۱۴۰۵/۰۹/۱۰', auto: true, snaps: [] },
  { id: 124851, name: 'blockstorage-110', status: 'active', dc: 'دماوند', size: 50, used: 46, server: null, created: '۱۴۰۴/۰۳/۲۲', period: 1, next: '۱۴۰۵/۰۹/۲۲', auto: false, snaps: [] },
  { id: 124852, name: 'block-storage-778', status: 'processing', dc: 'فردوسی', size: 200, used: 31, server: 101, created: '۱۴۰۴/۰۴/۱۸', period: 3, next: '۱۴۰۵/۱۰/۱۸', auto: true, snaps: [] },
  { id: 124853, name: 'block-storage-clone-901', status: 'creating', dc: 'دماوند', size: 100, used: 0, server: null, created: '۱۴۰۴/۰۴/۲۵', period: 1, next: '۱۴۰۵/۰۹/۲۵', auto: false, snaps: [] },
];
const B = LS.get('bs_state', null) || { blocks: SEED };
const save = () => LS.set('bs_state', B);
const blk = id => B.blocks.find(b => b.id === +id);
const today = () => new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const later = months => { const d = new Date(); d.setMonth(d.getMonth() + months); return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); };
const bsTag = b => ({ active: tag('فعال', 'success'), processing: tag('در حال پردازش', 'warning'), creating: tag('در حال ایجاد', 'warning'), deleted: tag('حذف‌شده', 'gray') }[b.status]);
const gb = n => fa(n) + ' گیگابایت';
const attached = (b, cls = '') => b.server && srv(b.server) ? `<a class="sv-link ${cls}" href="#${srvRoute(b.server)}">سرور مجازی <span class="ltr">${esc(srv(b.server).name)}</span> ${svg(I.arrow).replace('width="20" height="20"', 'width="16" height="16" class="sv-flip"')}</a>` : '<span class="ai-muted">متصل نیست</span>';
let MENU = null;

function bsList() {
  if (!B.blocks.length) return null;
  const rows = B.blocks.map(b => `<tr data-sv="go" data-v="${bsRoute(b.id)}"><td><div class="ai-cell2"><b class="ltr">${esc(b.name)}</b><span>شماره سرویس: ${fa(b.id)}</span></div></td>
    <td>${bsTag(b)}</td><td>${b.dc}</td><td>${gb(b.size)}</td><td>${attached(b)}</td><td>${b.created}</td>
    <td class="sv-ops"><button type="button" class="ai-icon-btn" data-sv="menu" data-v="${b.id}" title="عملیات">${ic.dots}</button>${MENU === b.id ? opsMenu(b) : ''}</td></tr>`).join('');
  const n = B.blocks.filter(b => b.status === 'active').length;
  return wrap(BS_LIST, `${crumbs([['بلاک استوریج']])}
    <div class="nav-card"><h1 class="nav-card-title">بلاک استوریج</h1>
      <div class="ai-toolbar"><div class="nav-search"><span>جستجو کنید</span></div><button type="button" class="ai-icon-btn sv-filter" title="فیلتر">${svg('M4 5h16l-6 8v5l-4 2v-7z')}</button><span class="ai-sp"></span>
        ${btn('ایجاد بلاک استوریج جدید', 'go', 'primary', `data-v="${BS_CFG}"`)}</div>
      <div class="ai-tabs"><button class="on">همه‌ی بلاک استوریج‌ها ${tag(fa(n) + ' سرویس فعال', 'primary')}</button></div>
      <div class="ai-table-wrap sv-overflow"><table class="ai-table ai-rows"><thead><tr><th>نام بلاک استوریج</th><th>وضعیت</th><th>دیتاسنتر</th><th>حجم</th><th>متصل شده به</th><th>تاریخ ایجاد</th><th>عملیات</th></tr></thead><tbody>${rows}</tbody></table></div></div>`);
}
function opsMenu(b) {
  const it = (t, a, cls = '') => `<button type="button" class="sv-mi ${cls}" data-sv="${a}" data-v="${b.id}">${t}</button>`;
  return `<div class="sv-menu">${it('مشاهده‌ی جزئیات', 'open')}${it('افزایش حجم', 'resize')}${b.server ? it('قطع اتصال', 'detach') : it('اتصال به سرور', 'attach')}${it('همانندسازی', 'clone')}${it('دستورالعمل نصب', 'guide')}${it('حذف سرویس', 'delete', 'ai-danger')}</div>`;
}
const empty = PAGES[BS_LIST];
PAGES[BS_LIST] = { title: 'بلاک استوریج', d: { get html() { return bsList() || empty.d.html; }, body: '', legacy: false } };

// ---------- purchase ----------
let C = null;
const cfgDraft = () => C || (C = { name: 'blockstorage-' + Math.floor(100 + Math.random() * 900), target: 'srv-101', period: 1, size: null, custom: 60 });
const TARGETS = [['srv-101', 'فردوسی', 'NGP-large120-MHD'], ['srv-102', 'فردوسی', 'Flex6-SHRZ'], ['srv-105', 'دماوند', 'server-cloud-5647303'], ['dc-ferdowsi', 'فردوسی', 'بدون اتصال (بعداً متصل می‌کنم)'], ['dc-damavand', 'دماوند', 'بدون اتصال (بعداً متصل می‌کنم)']];
const sizeOf = c => c.size === 'custom' ? +c.custom || 0 : c.size;
function bsCfg() {
  const c = cfgDraft(), size = sizeOf(c), base = (size || 100) * PER_GB;
  const t = TARGETS.find(x => x[0] === c.target);
  const period = PERIODS.map(([m, label, d]) => `<div class="ai-rcard${c.period === m ? ' on' : ''}" data-sv="period" data-v="${m}"><div class="ai-rcard-t">${radio(c.period === m)}<b>${label}</b>${d ? tag(fa(d) + '٪ تخفیف', 'success') : ''}</div>
    <div class="sv-price">${d ? `<s>${money(base)}</s>` : ''}<span><b>${money(base * (1 - d / 100))}</b> تومان / به ازای هر ماه</span></div></div>`).join('');
  const sizeCard = (v, label) => `<div class="ai-rcard${c.size === v ? ' on' : ''}" data-sv="size" data-v="${v}"><div class="ai-rcard-t">${radio(c.size === v)}<b>${label}</b><span class="ai-sp"></span>${v !== 'custom' ? '<span class="sv-disk"></span>' : ''}</div>
    ${v === 'custom' ? `<div class="ai-counter"><button type="button" data-sv="custom" data-v="10">${ic.plus}</button><input data-sv-in="custom" inputmode="numeric" value="${fa(c.custom)} گیگابایت"><button type="button" data-sv="custom" data-v="-10">${ic.minus}</button></div>` : ''}
    <div class="sv-price"><span><b>${money((v === 'custom' ? c.custom : v) * PER_GB)}</b> تومان / به ازای هر ماه</span></div></div>`;
  return wrap(BS_CFG, `${crumbs([['بلاک استوریج', BS_LIST], ['خرید بلاک استوریج']])}
    <div class="ai-cfg"><div class="ai-cfg-main">
      <section class="ai-sec"><div class="ai-sec-head"><h2>پیکربندی</h2></div><div class="ai-row2">
        <label class="ai-field"><span>نام</span><input class="ai-input ltr" data-sv-in="name" value="${esc(c.name)}"></label>
        <label class="ai-field"><span>سرور انتخابی</span><select class="ai-input" data-sv-in="target">${TARGETS.map(([k, dc, n]) => `<option value="${k}" ${c.target === k ? 'selected' : ''}>${dc} · ${n}</option>`).join('')}</select></label></div>
        <small>بلاک استوریج فقط به سرورهای ابری همان دیتاسنتر وصل می‌شود.</small></section>
      <section class="ai-sec"><div class="ai-sec-head"><h2>دوره زمانی</h2></div><div class="ai-grid3 sv-grid4">${period}</div></section>
      <section class="ai-sec"><div class="ai-sec-head"><h2>حجم</h2></div><div class="ai-grid3">${sizeCard(50, '۵۰ گیگابایت')}${sizeCard(100, '۱۰۰ گیگابایت')}${sizeCard('custom', 'حجم دلخواه')}</div></section>
    </div><aside class="ai-sum" id="sv-sum">${bsSum(c, t)}</aside></div>`);
}
function bsSum(c, t) {
  const size = sizeOf(c), p = PERIODS.find(x => x[0] === c.period), full = size * PER_GB * p[0], total = full * (1 - p[2] / 100);
  const row = (label, html) => `<div class="ai-sum-row"><span class="ai-sum-l">${label}</span>${html}</div>`;
  return `<div class="ai-sum-box">${row('نام بلاک', `<b class="ltr">${esc(c.name)}</b>`)}${row('سرور', `<b>${t[1]} | <span class="ltr">${esc(t[2])}</span></b>`)}
    ${row('دوره زمانی', `<div class="ai-sum-line"><b>${p[1]}</b>${size ? `<small>${p[2] ? `<s>${money(full)}</s> ` : ''}${money(total)} تومان</small>` : ''}</div>`)}
    ${row('حجم', size ? `<b>${gb(size)}</b>` : '<span class="ai-sum-err">حجم بلاک را انتخاب کنید</span>')}</div>
    <div class="ai-sum-total"><div class="ai-sum-tl"><span class="ai-free">${ic.info} مجموع سود شما</span><b class="ai-free">${money(full - total)} تومان</b></div>
      <div class="ai-sum-tl"><span>جمع کل</span><b class="ai-total">${money(total)} تومان</b></div>
      <button type="button" class="ai-btn ai-btn-primary ai-btn-block" data-sv="buy" ${size ? '' : 'disabled'}>ثبت و ادامه</button></div>`;
}
PAGES[BS_CFG] = { title: 'خرید بلاک استوریج', d: { get html() { return bsCfg(); }, body: '', legacy: false } };

// ---------- service details ----------
function bsDetail(id, k) {
  const b = blk(id);
  if (!b) return wrap(bsRoute(id, k), `${crumbs([['بلاک استوریج', BS_LIST], ['یافت نشد']])}<div class="nav-card">${alert('warning', 'این بلاک استوریج وجود ندارد یا حذف شده است.', btn('بازگشت به لیست', 'go', 'tonal', `data-v="${BS_LIST}"`))}</div>`);
  const title = BS_SECTIONS.flatMap(g => g[1]).find(x => x[0] === k)?.[1] || 'اطلاعات کلی';
  const hero = `<div class="nav-card sv-hero"><div class="sv-hero-t">
      <a class="sv-back" href="#${BS_LIST}" title="بازگشت">${svg(I.arrow)}</a>
      <div class="sv-hero-n"><div class="sv-hero-l1"><h1 class="ltr">${esc(b.name)}</h1>${bsTag(b)}</div><span class="ai-muted">متصل به: ${b.server && srv(b.server) ? 'سرور مجازی <span class="ltr">' + esc(srv(b.server).name) + '</span>' : 'متصل نیست'}</span></div>
      <span class="ai-sp"></span>${sb('حذف سرویس', 'delete', 'text', b.id, 'ai-danger')}${sb('تمدید سرویس', 'renew', 'outline', b.id)}${sb('افزایش حجم', 'go', 'primary', bsRoute(b.id, 'resize'))}</div>
    <div class="sv-facts"><div>${svg(I.backup)}<b>سیکل سرویس:</b><span>${PERIODS.find(p => p[0] === b.period)[1]}</span></div><i></i>
      <div>${svg(I.invoice)}<b>تاریخ ثبت:</b><span>${b.created}</span></div><i></i><div>${svg(I.invoice)}<b>تاریخ تمدید بعدی:</b><span>${b.next}</span></div></div></div>`;
  return wrap(bsRoute(b.id, k), `${crumbs([['بلاک استوریج', BS_LIST], [b.name, bsRoute(b.id)], [title]])}${hero}${(BS[k] || BS.overview)(b)}`);
}
const sb = (t, a, kind, v, cls = '') => `<button type="button" class="ai-btn ai-btn-${kind} ${cls}" data-sv="${a}" data-v="${v}">${t}</button>`;
const tbl = (heads, rows) => `<div class="ai-table-wrap"><table class="ai-table"><thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
const BS = {
  overview(b) {
    const pct = b.size ? Math.round(b.used / b.size * 100) : 0, warn = pct >= 90;
    return `${warn ? alert('warning', `فضای باقی‌مانده‌ی بلاک استوریج شما رو به اتمام است (${fa(pct)}٪ استفاده‌شده). برای جلوگیری از اختلال در ذخیره‌سازی داده‌ها، هرچه سریع‌تر حجم بلاک استوریج را افزایش دهید.`, sb('افزایش حجم', 'go', 'tonal', bsRoute(b.id, 'resize'))) : ''}
      <div class="sv-row"><div class="nav-card sv-used"><h3 class="sv-h">فضای استفاده‌شده</h3><div class="sv-bar-l">${gb(b.used)}</div><div class="sv-bar${warn ? ' warn' : ''}"><i style="width:${Math.max(2, pct)}%"></i></div><div class="sv-bar-r">${gb(b.size)}</div></div>
        <div class="nav-card sv-quick"><h3 class="sv-h">دسترسی‌های مهم</h3><div class="sv-qa">${b.server ? sb('قطع اتصال', 'detach', 'text', b.id) : sb('اتصال به سرور', 'attach', 'text', b.id)}<i></i>${sb(ic.info + 'همانندسازی', 'clone', 'text', b.id)}<i></i>${sb('دستورالعمل‌های نصب', 'go', 'text', bsRoute(b.id, 'guide'))}</div></div></div>
      <div class="nav-card"><div class="sv-box"><h3 class="sv-h">اطلاعات کلی بلاک استوریج</h3><div class="sv-grid">
          <div><b>وضعیت بلاک استوریج:</b>${bsTag(b)}</div><div><b>نام بلاک استوریج:</b><span class="ltr">${esc(b.name)}</span><button type="button" class="ai-icon-btn" data-sv="rename" data-v="${b.id}" title="ویرایش نام">${svg(I.edit)}</button></div><div><b>دیتاسنتر:</b><span>${b.dc}</span></div>
          <div><b>تاریخ ایجاد:</b><span>${b.created}</span></div><div><b>حجم کل:</b><span>${gb(b.size)}</span></div><div><b>حجم استفاده‌شده:</b><span>${gb(b.used)}</span></div>
          <div><b>متصل به:</b>${attached(b)}</div></div></div>
        <div class="sv-box"><h3 class="sv-h">پیکربندی بلاک استوریج</h3><div class="ai-ck-row" data-sv="auto" data-v="${b.id}">${checkbox(b.auto)}<span>مونت خودکار (Auto-Mount Persistence)</span><span class="ai-muted" title="بعد از ری‌استارت سرور، دیسک خودکار دوباره مونت می‌شود.">${ic.info}</span></div></div></div>`;
  },
  tickets: b => ticketsCard('این سرویس'),
  invoices: b => invoicesCard([['۳۰۱۱۰۱', b.next, 'تمدید بلاک استوریج', money(b.size * PER_GB) + ' تومان', tag('پرداخت نشده', 'warning')], ['۳۰۱۰۸۷', b.created, 'خرید بلاک استوریج', money(b.size * PER_GB) + ' تومان', tag('پرداخت شده', 'success')]]),
  backups: b => snapsCard(b, 'از بلاک استوریج اسنپ‌شات بگیرید تا در صورت خطا، داده‌ها را به همان لحظه برگردانید.', b.used),
  resize(b) {
    const r = RS(b), add = r.to - b.size, months = b.period, price = add * PER_GB * months;
    const card = (v, label) => `<div class="ai-rcard${r.pick === v ? ' on' : ''}" data-sv="rs" data-v="${v}"><div class="ai-rcard-t">${radio(r.pick === v)}<b>${label}</b></div>
      ${v === 'custom' ? `<div class="ai-counter"><button type="button" data-sv="rsc" data-v="10">${ic.plus}</button><input data-sv-in="rsc" inputmode="numeric" value="${fa(r.custom)} گیگابایت"><button type="button" data-sv="rsc" data-v="-10">${ic.minus}</button></div>` : ''}
      <span class="ai-rcard-sub">حجم جدید: ${gb(v === 'custom' ? r.custom : b.size + v)}</span></div>`;
    return `<div class="nav-card"><h3 class="sv-h">افزایش حجم</h3><p class="ai-desc">حجم فعلی ${gb(b.size)} است. حجم بلاک استوریج فقط افزایش پیدا می‌کند و هزینه‌ی آن تا پایان دوره‌ی فعلی محاسبه می‌شود.</p>
      <div class="ai-grid3">${card(50, '۵۰ گیگابایت بیشتر')}${card(100, '۱۰۰ گیگابایت بیشتر')}${card('custom', 'حجم کل دلخواه')}</div>
      ${add > 0 ? `<div class="ai-dr-sum"><span>حجم جدید</span><b>${gb(r.to)}</b><span>هزینه تا پایان دوره (${fa(months)} ماه)</span><b>${money(price)} تومان</b></div>` : `<p class="ai-err">حجم جدید باید بیشتر از ${gb(b.size)} باشد.</p>`}
      ${alert('info', 'بعد از افزایش حجم، فایل‌سیستم را داخل سرور گسترش دهید. <a href="#' + bsRoute(b.id, 'guide') + '">دستورالعمل نصب</a>')}
      <div class="ai-sec-tools"><span class="ai-sp"></span>${add > 0 ? sb('ثبت و پرداخت', 'rspay', 'primary', b.id) : ''}</div></div>`;
  },
  guide(b) {
    const linux = `# دیسک جدید را پیدا کنید (مثلاً /dev/vdb)\nlsblk\n\n# فقط بار اول: ساخت فایل‌سیستم\nsudo mkfs.ext4 /dev/vdb\n\n# مونت کردن\nsudo mkdir -p /mnt/${b.name}\nsudo mount /dev/vdb /mnt/${b.name}\n\n# مونت خودکار بعد از ری‌استارت\necho "/dev/vdb /mnt/${b.name} ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab\n\n# بعد از افزایش حجم\nsudo resize2fs /dev/vdb`;
    return `<div class="nav-card"><h3 class="sv-h">دستورالعمل نصب</h3>
      <div class="ai-chips">${[['linux', 'لینوکس'], ['windows', 'ویندوز']].map(([k, t]) => `<button type="button" class="ai-chip${GUIDE === k ? ' on' : ''}" data-sv="guidetab" data-v="${k}">${t}</button>`).join('')}</div>
      ${GUIDE === 'linux' ? `<ol class="sv-steps"><li>بلاک استوریج را از «دسترسی‌های مهم» به سرور وصل کنید.</li><li>به سرور SSH بزنید و دستورهای زیر را اجرا کنید.</li></ol><pre class="ai-code ltr">${esc(linux)}</pre>`
        : `<ol class="sv-steps"><li>بلاک استوریج را به سرور وصل کنید و با Remote Desktop وارد شوید.</li><li>Disk Management را باز کنید (diskmgmt.msc).</li><li>دیسک جدید را Online و Initialize کنید (GPT).</li><li>روی فضای Unallocated، New Simple Volume بسازید و درایو را با NTFS فرمت کنید.</li><li>بعد از افزایش حجم، روی درایو Extend Volume را بزنید.</li></ol>`}</div>`;
  },
};
let GUIDE = 'linux';
const RSS = {};
const RS = b => RSS[b.id] || (RSS[b.id] = { pick: 50, custom: b.size + 60, get to() { return this.pick === 'custom' ? +this.custom : b.size + this.pick; } });

function registerBlock(id) { [['overview'], ...BS_SECTIONS.flatMap(g => g[1])].forEach(([k]) => { const r = bsRoute(id, k); PAGES[r] = { title: 'بلاک استوریج', d: { get html() { return bsDetail(id, k); }, body: '', legacy: false } }; }); }
B.blocks.forEach(b => registerBlock(b.id));

SIDE2.register(route => {
  const m = route.match(/^\/my\/panel\/service\/(\d+)\/block-storage(?:\/([\w-]+))?$/), b = m && blk(m[1]);
  if (!b) return null;
  const k = m[2] || 'overview';
  return {
    title: 'بلاک استوریج', icon: NAV.icon('block-storage', 24),
    current: { name: b.name, tag: bsTag(b) },
    services: B.blocks.map(x => ({ name: x.name, route: bsRoute(x.id, k), on: x.id === b.id })),
    newLabel: 'ایجاد بلاک استوریج جدید', newRoute: BS_CFG, allRoute: BS_LIST, allLabel: 'همه‌ی بلاک استوریج‌ها',
    groups: BS_SECTIONS.map(([t, items]) => ({ title: t, items: items.map(([kk, label, icn]) => ({ label, route: bsRoute(b.id, kk), on: kk === k, icon: svg(I[icn]) })) })),
  };
});

// ---------- cloud servers ----------
// The service pages are built here in the same layout as block storage; the captured server pages are replaced.
const SRV_LIST = '/my/panel/cloud/server';
const SRV_SEED = [
  { id: 101, name: 'NGP-large120-MHD', kind: 'سرور مجازی', host: 'demo-mashhad', ip: '185.10.20.31', ipv6: '2a05:ab80:300:10::20', ssh: 'root@185.10.20.31:22', dc: 'فردوسی', os: 'Ubuntu 24.04', cpu: 4, ram: 16, disk: 120,
    plan: 'NGP-large120', period: 'شش ماهه', created: '۱۴۰۵/۰۲/۰۱', due: '۱۴۰۵/۱۱/۱۹', status: 'active', traffic: { base: 1500, extra: 300, carried: 200, used: 640, prev: 1210 },
    backups: [{ name: 'before-upgrade', at: '۱۴۰۵/۰۸/۲۰ - ۰۹:۰۹', size: 120, os: 'Ubuntu 24.04', status: 'active' }], apps: [], addons: [], pass: 'Kd8!vR2qLm' },
  { id: 102, name: 'Flex6-SHRZ', kind: 'سرور مجازی', host: 'shop-backend', ip: '185.10.20.47', ipv6: '2a05:ab80:300:10::47', ssh: 'root@185.10.20.47:22', dc: 'فردوسی', os: 'Debian 12', cpu: 6, ram: 12, disk: 100,
    plan: 'Flex6', period: 'یک ماهه', created: '۱۴۰۵/۰۶/۱۲', due: '۱۴۰۵/۰۹/۱۲', status: 'active', traffic: { base: 800, extra: 200, carried: 0, used: 1000, prev: 760 },
    backups: [], apps: [{ name: 'n8n', domain: 'n8n.shop.ir', status: 'active' }], addons: [{ k: 'ip', at: '۱۴۰۵/۰۹/۱۲' }], pass: 'Pq4@zN7wTe' },
  { id: 105, name: 'server-cloud-5647303', kind: 'سرور مجازی', host: 'test-staging', ip: '45.10.115.18', ipv6: '2a05:ab80:300:12::18', ssh: 'Administrator@45.10.115.18:3389', dc: 'دماوند', os: 'Windows Server 2022', cpu: 2, ram: 4, disk: 60,
    plan: 'NGP-small60', period: 'یک ماهه', created: '۱۴۰۵/۰۷/۰۲', due: '۱۴۰۵/۰۹/۰۲', status: 'suspended', traffic: { base: 500, extra: 0, carried: 0, used: 120, prev: 340 },
    backups: [], apps: [], addons: [], pass: 'Wn3#hY6sBc' },
];
const SV = LS.get('srv_state2', null) || { servers: SRV_SEED };
const saveSrv = () => LS.set('srv_state2', SV);
const SERVERS = SV.servers;
const srv = id => SERVERS.find(s => s.id === +id);
const srvRoute = (id, k) => `/my/panel/service/${id}/server${k && k !== 'overview' ? '/' + k : ''}`;
const srvTag = s => ({ active: tag('فعال', 'success'), off: tag('خاموش', 'gray'), paused: tag('متوقف', 'warning'), suspended: tag('معلق', 'error'), rescue: tag('حالت Rescue', 'warning') }[s.status]);
const res = s => `${fa(s.cpu)} هسته · ${fa(s.ram)} گیگ رم · ${fa(s.disk)} گیگ`;
// sections shared by the server and block storage pages
const ticketsCard = what => `<div class="nav-card"><div class="ai-sec-tools"><h3 class="sv-h">تیکت‌های ${what}</h3>${sb('ثبت تیکت جدید', 'go', 'tonal', '/my/panel/support/new-ticket')}</div>
  ${tbl(['شماره', 'عنوان', 'دپارتمان', 'آخرین به‌روزرسانی', 'وضعیت'], [['۴۰۱۲۲۰', 'کندی خواندن و نوشتن روی دیسک', 'پشتیبانی فنی', '۱۴۰۴/۰۴/۱۸', tag('پاسخ داده شده', 'success')], ['۴۰۱۱۹۸', 'سؤال درباره‌ی تنظیمات سرویس', 'پشتیبانی فنی', '۱۴۰۴/۰۴/۱۲', tag('بسته شده', 'gray')]].map(r => `<tr data-sv="go" data-v="/my/panel/support/tickets/401101" class="sv-click">${r.map(c => `<td>${c}</td>`).join('')}</tr>`))}</div>`;
const invoicesCard = rows => `<div class="nav-card"><h3 class="sv-h">فاکتورهای این سرویس</h3>
  ${tbl(['شماره فاکتور', 'تاریخ صدور', 'شرح', 'مبلغ', 'وضعیت'], rows.map(r => `<tr data-sv="go" data-v="/my/panel/invoices/301101" class="sv-click">${r.map(c => `<td>${c}</td>`).join('')}</tr>`))}</div>`;
function snapsCard(x, desc, size) {
  const rows = x.snaps.map((s, i) => `<tr><td class="ltr">${esc(s.name)}</td><td>${s.at}</td><td>${gb(s.size)}</td><td>${s.status === 'ready' ? tag('آماده', 'success') : tag('در حال ایجاد', 'info')}</td>
    <td>${sb('بازگردانی', 'restore', 'text', i)}${sb('حذف', 'snapdel', 'text', i, 'ai-danger')}</td></tr>`);
  return `<div class="nav-card"><div class="ai-sec-tools"><p class="ai-desc">${desc} هزینه‌ی هر اسنپ‌شات به ازای حجم آن محاسبه می‌شود.</p>${sb(ic.plus + 'ایجاد اسنپ‌شات', 'snap', 'tonal', '')}</div>
    ${rows.length ? tbl(['نام', 'تاریخ', 'حجم', 'وضعیت', ''], rows) : `<div class="ai-empty-s">${NAV.icon('block-storage', 40)}<p>هنوز اسنپ‌شاتی ندارید.</p></div>`}</div>`;
}

// helpers for the cloud server pages (core/cloudserver.js)
window.SVC = { wrap, sb, tbl, svg, I, LS, ticketsCard, invoicesCard, B, blk, bsRoute, bsTag, gb, BS_CFG, cfgDraft, SV, SERVERS, srv, srvRoute, saveSrv, srvTag, res, today, refresh: () => refresh() };

// ---------- interactions ----------
function refresh() {
  const el = document.getElementById('sv-root');
  if (!el) return;
  const y = window.scrollY, r = el.dataset.route;
  el.outerHTML = PAGES[r].d.html;
  window.scrollTo(0, y);
  SIDE2.refresh();
}
const routeNow = () => document.getElementById('sv-root')?.dataset.route || '';
const curBlock = () => /block-storage/.test(routeNow()) ? blk((routeNow().match(/service\/(\d+)/) || [])[1]) : null;
const curSrv = () => /\/server/.test(routeNow()) ? srv((routeNow().match(/service\/(\d+)/) || [])[1]) : null;
const saveAll = () => { save(); saveSrv(); };
const num = v => +String(v).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[^\d]/g, '') || 0;
const serverOptions = b => SERVERS.filter(s => s.dc === b.dc);

document.addEventListener('click', e => {
  if (MENU && !e.target.closest('.sv-ops')) { MENU = null; refresh(); }
  const el = e.target.closest('[data-sv]');
  if (!el || !el.closest('.sv, .ai-mask')) return;
  const link = e.target.closest('a[href]');
  if (link && el.contains(link)) return;
  e.preventDefault(); e.stopPropagation();
  const a = el.dataset.sv, v = el.dataset.v, b = blk(v) || curBlock(), s = srv(v) || curSrv(), x = curBlock() || curSrv(), c = cfgDraft();
  const A = {
    go() { closeAll(); go(v); },
    toast() { toast(v); },
    menu() { MENU = MENU === +v ? null : +v; refresh(); },
    open() { go(bsRoute(+v)); },
    guide() { go(bsRoute(+v, 'guide')); },
    resize() { go(bsRoute(+v, 'resize')); },
    // purchase
    period() { c.period = +v; refresh(); },
    size() { if (e.target.closest('input, .ai-counter button')) return; c.size = v === 'custom' ? 'custom' : +v; refresh(); },
    custom() { c.size = 'custom'; c.custom = Math.min(2000, Math.max(10, c.custom + +v)); refresh(); },
    buy() {
      const size = sizeOf(c); if (!size) return;
      const p = PERIODS.find(x => x[0] === c.period), total = size * PER_GB * p[0] * (1 - p[2] / 100);
      modal('پیش‌فاکتور', `<div class="ai-inv"><div><span>شرح</span><span>مبلغ</span></div><div><span>بلاک استوریج <b class="ltr">${esc(c.name)}</b> · ${gb(size)} · ${p[1]}</span><b>${money(size * PER_GB * p[0])} تومان</b></div>
        ${p[2] ? `<div><span>تخفیف ${fa(p[2])}٪</span><b class="ai-free">−${money(size * PER_GB * p[0] - total)} تومان</b></div>` : ''}<div class="ai-inv-total"><span>مبلغ قابل پرداخت</span><b>${money(total)} تومان</b></div></div>`,
        sb('پرداخت فاکتور', 'pay', 'primary', '') + '<button type="button" class="ai-btn ai-btn-text" data-ai="close">انصراف</button>');
    },
    pay() {
      const size = sizeOf(c), t = TARGETS.find(x => x[0] === c.target), id = Math.max(...B.blocks.map(x => x.id), 124849) + 1;
      const nb = { id, name: c.name.trim() || 'blockstorage-' + id, status: 'creating', dc: t[1], size, used: 0, server: t[0].startsWith('srv-') ? +t[0].slice(4) : null, created: today(), period: c.period, next: later(c.period), auto: true, snaps: [] };
      B.blocks.push(nb); save(); registerBlock(id); C = null; closeAll(); go(bsRoute(id));
      toast('فاکتور پرداخت شد؛ بلاک استوریج در حال ایجاد است.');
      setTimeout(() => { nb.status = 'active'; save(); refresh(); }, 4000);
    },
    // details
    auto() { b.auto = !b.auto; save(); refresh(); },
    rename() { modal('ویرایش نام', `<label class="ai-field"><span>نام بلاک استوریج</span><input class="ai-input ltr" id="sv-name" value="${esc(b.name)}"></label>`, sb('ذخیره', 'rename-ok', 'primary', b.id) + '<button type="button" class="ai-btn ai-btn-text" data-ai="close">انصراف</button>'); },
    'rename-ok'() { const n = document.getElementById('sv-name').value.trim(); if (n.length > 2) { b.name = n; save(); closeAll(); refresh(); toast('نام ذخیره شد.'); } },
    detach() { modal('قطع اتصال', `<p class="ai-desc">بلاک استوریج <b class="ltr">${esc(b.name)}</b> از سرور جدا می‌شود. پیش از قطع اتصال، دیسک را داخل سرور unmount کنید تا داده‌ای از دست نرود.</p>`, sb('قطع اتصال', 'detach-ok', 'primary', b.id) + '<button type="button" class="ai-btn ai-btn-text" data-ai="close">انصراف</button>'); },
    'detach-ok'() { b.server = null; save(); closeAll(); MENU = null; refresh(); toast('اتصال قطع شد.'); },
    attach() {
      const opts = serverOptions(b);
      modal('اتصال به سرور', opts.length ? `<p class="ai-desc">سرور ابری را در دیتاسنتر ${b.dc} انتخاب کنید.</p><div class="ai-col">${opts.map(s => `<div class="ai-rcard on"><div class="ai-rcard-t">${radio(true)}<b class="ltr">${esc(s.name)}</b></div><span class="ai-rcard-sub">${s.spec}</span></div>`).join('')}</div>`
        : `<p class="ai-desc">سرور ابری فعالی در دیتاسنتر ${b.dc} ندارید. بلاک استوریج فقط به سرورهای همان دیتاسنتر وصل می‌شود.</p>`,
        (opts.length ? sb('اتصال', 'attach-ok', 'primary', b.id) : '') + '<button type="button" class="ai-btn ai-btn-text" data-ai="close">بستن</button>');
    },
    'attach-ok'() { b.server = serverOptions(b)[0].id; save(); closeAll(); MENU = null; refresh(); toast('بلاک استوریج به سرور وصل شد.'); },
    clone() { modal('همانندسازی', `<p class="ai-desc">یک بلاک استوریج جدید با همان داده‌ها و حجم (${gb(b.size)}) در دیتاسنتر ${b.dc} ساخته می‌شود و هزینه‌ی آن جدا محاسبه می‌شود.</p><label class="ai-field"><span>نام بلاک جدید</span><input class="ai-input ltr" id="sv-name" value="${esc(b.name)}-clone"></label>`, sb('ایجاد نسخه', 'clone-ok', 'primary', b.id) + '<button type="button" class="ai-btn ai-btn-text" data-ai="close">انصراف</button>'); },
    'clone-ok'() {
      const id = Math.max(...B.blocks.map(x => x.id)) + 1, nb = { ...b, id, name: document.getElementById('sv-name').value.trim() || b.name + '-clone', status: 'creating', server: null, created: today(), next: later(b.period), snaps: [] };
      B.blocks.push(nb); save(); registerBlock(id); closeAll(); MENU = null; refresh(); toast('نسخه‌ی جدید در حال ایجاد است.');
      setTimeout(() => { nb.status = 'active'; save(); refresh(); }, 4000);
    },
    renew() { modal('تمدید سرویس', `<p class="ai-desc">تاریخ تمدید بعدی: ${b.next}. با پرداخت فاکتور، سرویس برای یک دوره‌ی ${PERIODS.find(p => p[0] === b.period)[1]} دیگر تمدید می‌شود.</p><div class="ai-dr-sum"><span>مبلغ</span><b>${money(b.size * PER_GB * b.period)} تومان</b></div>`, sb('پرداخت و تمدید', 'renew-ok', 'primary', b.id) + '<button type="button" class="ai-btn ai-btn-text" data-ai="close">انصراف</button>'); },
    'renew-ok'() { closeAll(); toast('سرویس تمدید شد.'); },
    delete() { modal('حذف سرویس', `<p class="ai-desc">بلاک استوریج <b class="ltr">${esc(b.name)}</b> و همه‌ی داده‌های آن حذف می‌شود. این کار برگشت‌پذیر نیست.</p>`, sb('حذف سرویس', 'delete-ok', 'primary', b.id, 'ai-btn-danger') + '<button type="button" class="ai-btn ai-btn-text" data-ai="close">انصراف</button>'); },
    'delete-ok'() { B.blocks = B.blocks.filter(x => x.id !== b.id); save(); closeAll(); MENU = null; go(BS_LIST); refresh(); toast('سرویس حذف شد.'); },
    snap() { const n = { name: (x.host || x.name) + '-snap-' + (x.snaps.length + 1), at: today(), size: x.used ?? x.disk, status: 'creating' }; x.snaps.push(n); saveAll(); refresh(); setTimeout(() => { n.status = 'ready'; saveAll(); refresh(); }, 3000); },
    restore() { toast('بازگردانی از اسنپ‌شات شروع شد.'); },
    snapdel() { x.snaps.splice(+v, 1); saveAll(); refresh(); },
    rs() { if (e.target.closest('input, .ai-counter button')) return; RS(b).pick = v === 'custom' ? 'custom' : +v; refresh(); },
    rsc() { const r = RS(b); r.pick = 'custom'; r.custom = Math.min(2000, Math.max(b.size + 10, r.custom + +v)); refresh(); },
    rspay() { const r = RS(b), add = r.to - b.size; modal('پیش‌فاکتور افزایش حجم', `<div class="ai-dr-sum"><span>حجم فعلی</span><b>${gb(b.size)}</b><span>حجم جدید</span><b>${gb(r.to)}</b><span>مبلغ</span><b>${money(add * PER_GB * b.period)} تومان</b></div>`, sb('پرداخت فاکتور', 'rspay-ok', 'primary', b.id) + '<button type="button" class="ai-btn ai-btn-text" data-ai="close">انصراف</button>'); },
    'rspay-ok'() { b.size = RS(b).to; delete RSS[b.id]; save(); closeAll(); go(bsRoute(b.id)); toast('حجم بلاک استوریج به ' + gb(b.size) + ' افزایش یافت.'); },
    guidetab() { GUIDE = v; refresh(); },
  };
  A[a]?.();
}, true);
document.addEventListener('input', e => {
  const el = e.target.closest('.sv [data-sv-in]');
  if (!el) return;
  const k = el.dataset.svIn, c = cfgDraft();
  if (k === 'name') c.name = el.value;
  else if (k === 'custom') { c.size = 'custom'; c.custom = Math.min(2000, num(el.value)); }
  else if (k === 'rsc') { const b = curBlock(); if (b) { RS(b).pick = 'custom'; RS(b).custom = num(el.value); } return; }
  const sum = document.getElementById('sv-sum');
  if (sum) sum.innerHTML = bsSum(c, TARGETS.find(x => x[0] === c.target));
});
document.addEventListener('change', e => {
  const el = e.target.closest('.sv [data-sv-in]');
  if (!el) return;
  if (el.dataset.svIn === 'target') cfgDraft().target = el.value;
  refresh();
});
})();
