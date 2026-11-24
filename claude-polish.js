// Claude polish layer — loaded last on every page. Content and order stay exactly as the Codex HTML.
// Everything here only adjusts style and adds motion. "모션 끄기" (bottom right) turns the motion off.
(() => {
  const html = document.documentElement;
  const isHome = !!document.querySelector('body.folio .circus-hero');
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  let off = false;
  try { off = localStorage.getItem('cp-motion') === 'off'; } catch {}
  html.dataset.cpMotion = off ? 'off' : 'on';

  /* ---------- a. motion toggle ---------- */
  const tg = document.createElement('button');
  tg.type = 'button'; tg.className = 'cp-toggle';
  tg.textContent = off ? '모션 켜기' : '모션 끄기';
  tg.addEventListener('click', () => { try { localStorage.setItem('cp-motion', off ? 'on' : 'off'); } catch {} location.reload(); });
  document.body.appendChild(tg);

  /* ---------- c. type weights: 550→500, 620/650→600, 730/760→700 (computed, before zoom) ---------- */
  const W = {450: 500, 550: 500, 620: 600, 650: 600, 730: 700, 760: 700, 900: 700};
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg') || ['SCRIPT', 'STYLE', 'VIDEO', 'IMG', 'SOURCE', 'CANVAS'].includes(el.tagName)) continue;
    const w = Math.round(parseFloat(getComputedStyle(el).fontWeight));
    if (W[w]) el.style.fontWeight = W[w];
  }

  /* ---------- c. sizes 1px apart → the more common one; near-identical grey text colours → the most used one ---------- */
  (() => {
    const els = [...document.querySelectorAll('main *, header *, footer *')].filter(el => !el.closest('svg') && el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim()));
    const cs = new Map(els.map(el => [el, getComputedStyle(el)]));
    const sizeCount = {}; for (const c of cs.values()) { const k = Math.round(parseFloat(c.fontSize) * 10) / 10; sizeCount[k] = (sizeCount[k] || 0) + 1; }
    const sizes = Object.keys(sizeCount).map(Number);
    const sizeMap = {};
    for (const a of sizes) { const near = sizes.filter(b => b !== a && Math.abs(b - a) <= 1.01 && sizeCount[b] > sizeCount[a]).sort((x, y) => sizeCount[y] - sizeCount[x])[0]; if (near && a < 40) sizeMap[a] = near; }
    const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
    const grey = ([r, g, b, a = 1]) => a === 1 && Math.max(r, g, b) - Math.min(r, g, b) < 28 && (r + g + b) / 3 < 150;
    const colCount = {}; for (const c of cs.values()) { const v = rgb(c.color); if (grey(v)) colCount[c.color] = (colCount[c.color] || 0) + 1; }
    const cols = Object.keys(colCount);
    const dist = (a, b) => { const x = rgb(a), y = rgb(b); return Math.max(Math.abs(x[0] - y[0]), Math.abs(x[1] - y[1]), Math.abs(x[2] - y[2])); };
    const colMap = {};
    for (const a of cols) { const near = cols.filter(b => b !== a && dist(a, b) <= 10 && colCount[b] > colCount[a]).sort((x, y) => colCount[y] - colCount[x])[0]; if (near) colMap[a] = near; }
    for (const [el, c] of cs) {
      const k = Math.round(parseFloat(c.fontSize) * 10) / 10;
      // size merge measured but not applied: it pushed the skills grid down ~260px at 1920 (reverted)
      if (colMap[c.color]) el.style.color = colMap[c.color];
    }
    html.dataset.cpMerged = Object.keys(colMap).length + ' colours';
  })();

  /* ---------- b. large screens: same proportions as 1920 (zoom, capped at 1.4) ---------- */
  const fit = () => {
    const z = Math.min(1.4, Math.max(1, innerWidth / 1920));
    document.body.style.zoom = z === 1 ? '' : String(z);
  };
  fit(); addEventListener('resize', fit);

  /* ---------- d. videos play muted while visible ---------- */
  const films = [...document.querySelectorAll('main video')];
  films.forEach(v => {
    v.muted = true; v.playsInline = true; v.loop = true;
    if (off) return;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !document.hidden) v.play().catch(() => {}); else v.pause();
    }, { threshold: .4 }).observe(v);
  });

  /* ---------- d. home: click an image or video to view it large (Esc / outside click closes) ---------- */
  if (isHome) {
    const box = document.createElement('div');
    box.className = 'cp-view'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.hidden = true;
    document.body.appendChild(box);
    const close = () => { box.hidden = true; box.innerHTML = ''; html.classList.remove('cp-lock'); };
    const open = node => {
      box.innerHTML = ''; box.appendChild(node); box.hidden = false; html.classList.add('cp-lock');
      if (node.tagName === 'VIDEO') node.play().catch(() => {});
    };
    box.addEventListener('click', e => { if (e.target === box) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) close(); });
    document.querySelectorAll('main .resume-project figure img, main .steam-scene img').forEach(img => {
      img.classList.add('cp-zoomable');
      img.addEventListener('click', () => { const c = new Image(); c.src = img.currentSrc || img.src; c.alt = img.alt; open(c); });
    });
    films.forEach(v => {
      v.classList.add('cp-zoomable');
      v.addEventListener('click', e => {
        const r = v.getBoundingClientRect();
        if (e.clientY > r.bottom - r.height * .16) return;   // leave the native control bar alone
        e.preventDefault(); e.stopPropagation();
        const c = document.createElement('video');
        c.src = v.currentSrc || v.querySelector('source')?.src; c.muted = true; c.loop = true; c.controls = true; c.playsInline = true;
        c.currentTime = v.currentTime; open(c);
      }, true);
    });
  }

  /* ---------- g. clip tabs: 0.25s cross-fade ---------- */
  document.querySelectorAll('[data-film]').forEach(btn => btn.addEventListener('click', () => {
    if (off) return;
    document.querySelector('#scene-gameplay')?.animate([{ opacity: .15 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
  }));
  document.querySelectorAll('[data-mile]').forEach(btn => btn.addEventListener('click', () => {
    if (off) return;
    document.getElementById(btn.getAttribute('aria-controls'))?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease-out' });
  }));

  if (off) return;
  html.classList.add('cp-on');

  /* ---------- e. entry: first screen once (≤1.2s), sections once on scroll ---------- */
  const rise = (el, delay, dist = 16, dur = 500) => el.animate(
    [{ opacity: 0, transform: `translateY(${dist}px)` }, { opacity: 1, transform: 'none' }],
    { duration: dur, delay, easing: EASE, fill: 'backwards' });
  const first = isHome
    ? [document.querySelector('.hero-heading > p:first-child'), document.querySelector('.hero-heading h1'),
       ...document.querySelectorAll('.intro-copy > p'), ...document.querySelectorAll('.profile-badges > li'),
       document.querySelector('.profile-portrait'), ...document.querySelectorAll('.circus-hero > dl, .circus-hero > address, .circus-hero > div:not(.hero-heading)')]
    : [...(document.querySelector('main > section')?.children || [])];
  first.filter(Boolean).forEach((el, i) => rise(el, Math.min(700, i * 55)));

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    [...e.target.children].slice(0, 12).forEach((c, i) => rise(c, i * 60));
  }), { threshold: .08, rootMargin: '0px 0px -8% 0px' });
  const firstSection = document.querySelector('main > section');
  document.querySelectorAll('main .section-top, main .frame > dl, main .practice-grid, main .archive-head, main .record-spread, main .work-title, main .resume-project, main .chapter > .heading, main .chapter > .sequence')
    .forEach(s => { if (!firstSection?.contains(s) || !s.closest('.circus-hero')) io.observe(s); });

  /* ---------- f. count-up on big numbers; the text ends exactly as written ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const node = [...e.target.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.nodeValue));
    if (!node) return;
    const final = node.nodeValue, digits = final.replace(/[^\d]/g, ''), end = Number(digits);
    if (!end) return;
    const t0 = performance.now();
    const fmt = v => {
      const s = String(v); let out = '', k = s.length - 1;
      for (let i = final.length - 1; i >= 0; i--) {
        const ch = final[i];
        if (/\d/.test(ch)) out = (k >= 0 ? s[k--] : '') + out;
        else if (ch === ',') out = (k >= 0 ? ',' : '') + out;
        else out = ch + out;
      }
      return out;
    };
    const step = now => {
      const p = Math.min(1, (now - t0) / 900);
      node.nodeValue = p < 1 ? fmt(Math.round(end * (1 - Math.pow(1 - p, 3)))) : final;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  document.querySelectorAll('.record-total, .cinema-stats dd, .play-archive strong, .chase-findings dd').forEach(n => cio.observe(n));
  const bar = document.querySelector('.cinema-distribution');
  if (bar) new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return; o.disconnect();
    [...bar.children].forEach((c, i) => { c.style.transformOrigin = 'left'; c.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: 900, delay: i * 120, easing: EASE, fill: 'backwards' }); });
  }, { threshold: .6 }).observe(bar);
})();
