// Public, read-only view of the prototype: each route shows its approved main design, exported
// from the workspace into main.js; routes without one show the captured portal page.
(() => {
'use strict';
const DESIGNS = window.MAIN_DESIGNS || {};
const ROUTES = window.MAIN_ROUTES || [];

// The exported html was written by editors: keep it free of scripts and handlers before showing it publicly.
function clean(html) {
  const t = document.createElement('template');
  t.innerHTML = html;
  t.content.querySelectorAll('script, iframe, object, embed, base, link, meta').forEach(e => e.remove());
  t.content.querySelectorAll('*').forEach(e => [...e.attributes].forEach(a => {
    if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) e.removeAttribute(a.name);
  }));
  const d = document.createElement('div');
  d.appendChild(t.content);
  return d.innerHTML;
}
// Peyda only, and nothing loaded from elsewhere.
function cleanCss(css) {
  return String(css || '')
    .replace(/@import[^;]*;?/gi, '')
    .replace(/@font-face\s*{[^}]*}/gi, '')
    .replace(/url\([^)]*\)/gi, 'none')
    .replace(/font-family\s*:\s*[^;}]*/gi, m => /peyda/i.test(m) ? m : 'font-family: peyda')
    .replace(/<\/?style[^>]*>/gi, '');
}

let css = '';
window.WS = {
  route: path => ROUTES.find(r => r.path === path) || null,
  transform(route, which, html) {
    const m = DESIGNS[route];
    css = m ? m.css : '';
    return m ? clean(m[which] ?? m.d) : html;
  },
  rendered() {
    let st = document.getElementById('ws-css');
    if (!st) { st = document.createElement('style'); st.id = 'ws-css'; document.head.appendChild(st); }
    st.textContent = cleanCss(css);
  },
};
})();
