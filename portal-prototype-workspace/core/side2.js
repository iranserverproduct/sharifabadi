// Second sidebar (core, admin-owned): the full-height service sidebar beside the rail, shown on a service's detail pages.
// Pattern: Portal "host service" sidebar. Top: product title and a collapse button; a dropdown to switch between the
// user's services of that product (and to buy a new one); then the service's actions in groups, each a route of its own.
// Products register a provider: route => config | null. NAV.apply calls SIDE2.apply(route) after every render.
(() => {
'use strict';
const MOBILE = matchMedia('(max-width: 991px)');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const providers = [];
let min = false, open = false, el = null, btn = null, last = '';
try { min = localStorage.getItem('side2_min') === '1'; } catch (e) {}

const chev = (cls = '') => `<svg class="s2-chev ${cls}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
const plus = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';

// config: { title, icon(html), current: { name, tag(html) }, services: [{ name, route, on, icon }], newLabel, newRoute, allRoute,
//           groups: [{ title, tag(html), attrs, items: [{ label, route, on, icon(html) }] }], cls, attrs, bodyCls }
function html(c) {
  const list = c.services.map(s => `<a class="s2-opt${s.on ? ' on' : ''}" href="#${s.route}">${s.icon || c.icon || ''}<span class="s2-n">${esc(s.name)}</span>${s.on ? '<i class="s2-dot"></i>' : ''}</a>`).join('');
  const groups = c.groups.map(g => `<div class="s2-g" ${g.attrs || ''}>${g.title ? `<div class="s2-gh"><span>${g.title}</span>${g.tag || ''}</div>` : ''}${g.items.map(i =>
    `<a class="s2-i${i.on ? ' on' : ''}" href="#${i.route}">${i.icon || ''}<span>${i.label}</span></a>`).join('')}</div>`).join('');
  return `<div class="s2-head"><b>${c.title}</b><button type="button" class="s2-iconbtn" data-s2="min" title="بستن منوی سرویس">${chev('s2-rot-r')}</button></div>
    <div class="s2-pj${open ? ' open' : ''}"><button type="button" class="s2-pj-btn" data-s2="pick">${c.icon || ''}<span class="s2-pj-txt"><span class="s2-n">${esc(c.current.name)}</span>${c.current.tag || ''}</span>${chev('s2-pj-chev')}</button>
      <div class="s2-pj-list">${list}${c.newRoute ? `<a class="s2-opt s2-new" href="#${c.newRoute}">${plus}<span>${c.newLabel}</span></a>` : ''}${c.allRoute ? `<a class="s2-all" href="#${c.allRoute}">${c.allLabel || 'همه‌ی سرویس‌ها'}</a>` : ''}</div></div>
    <nav class="s2-nav">${groups}</nav>`;
}

function apply(route) {
  if (route !== last) open = false;
  last = route;
  const c = providers.map(p => p(route)).find(Boolean);
  document.body.classList.remove('s2-on', 's2-min');
  (c?.bodyCls || '').split(' ').filter(Boolean).forEach(k => document.body.classList.add(k));
  if (!c) { el?.remove(); btn?.remove(); return; }
  if (!el) {
    el = document.createElement('aside'); el.addEventListener('click', onClick);
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 's2-open'; btn.title = 'باز کردن منوی سرویس';
    btn.innerHTML = chev('s2-rot-l'); btn.addEventListener('click', () => setMin(false));
  }
  el.className = 's2 ' + (c.cls || '');
  [...el.attributes].filter(a => a.name.startsWith('data-')).forEach(a => el.removeAttribute(a.name));
  Object.entries(c.attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
  el.innerHTML = html(c);
  if (MOBILE.matches) {
    // the rail is hidden on mobile: the sidebar becomes a card at the top of the page
    const host = document.querySelector('#root .nav-page') || document.getElementById('root');
    host.prepend(el); btn.remove();
  } else {
    document.body.append(el, btn);
  }
  document.body.classList.add('s2-on');
  document.body.classList.toggle('s2-min', min && !MOBILE.matches);
}
function setMin(v) {
  min = v;
  try { localStorage.setItem('side2_min', v ? '1' : '0'); } catch (e) {}
  document.body.classList.toggle('s2-min', v);
}
function onClick(e) {
  const b = e.target.closest('[data-s2]');
  if (e.target.closest('a')) { open = false; return; }
  if (!b) return;
  if (b.dataset.s2 === 'min') setMin(true);
  if (b.dataset.s2 === 'pick') { open = !open; b.parentElement.classList.toggle('open', open); }
}
document.addEventListener('click', e => {
  if (open && !e.target.closest('.s2-pj')) { open = false; document.querySelector('.s2-pj')?.classList.remove('open'); }
});

window.SIDE2 = { register: p => providers.push(p), apply, refresh: () => last && apply(last) };
})();
