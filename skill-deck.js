/* 주요 역량: 앞면 다섯 장을 가로로 두고, 누르면 페이지 이동 없이 크게 열려 사례를 보여 준다.
   큰 카드 양옆에 이전·다음 카드가 비스듬히 보이고 좌우로 넘긴다.
   글·그림·사례는 원래 카드에서 그대로 가져온다. 스크립트가 없으면 원래 카드 목록이 그대로 보인다. */
(() => {
  const sec = document.getElementById('capabilities');
  const list = sec && sec.querySelector('ul.skill-cards');
  if (!list || typeof HTMLDialogElement === 'undefined') return;
  const html = document.documentElement;
  const motion = () => html.dataset.cpMotion !== 'off';
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  /* 앞면 그림: 한눈에 그 역량이 읽히는 한 장 (11/27 17:47 형락 님 "겉 이미지도 개선") */
  const ART = {
    'skill-level': { src: 'curtaincall/assets/escape-final-concept.webp', pos: '30% 50%' },
    'skill-rule': { src: 'curtaincall/assets/m3-tightrope-duet.webp' },
    'skill-listen': { ask: '다음에 할 일을 알 수 있었다', pies: [['assets/first-test-pie.webp', '첫 테스트', '1/12명'], ['assets/last-test-pie.webp', '마지막 테스트', '7/10명']] },
    'skill-lead': { src: 'student-council/weekly-meeting.webp?v=face-edit-3', pos: '58% 50%' },
    'skill-reference': { src: 'assets/hagia-sophia.webp' }
  };
  /* 큰 카드 그림: 사례 줄마다 근거 한 장. 그림의 번호 = 아래 사례 번호. 피드백 수용은 원래 그림(구글 폼 응답)을 그대로 쓴다. */
  const PROOF = {
    'skill-level': [
      { n: '1', src: 'curtaincall/assets/escape-sightline.png', w: 1040, h: 620, pos: '51% 57%', zoom: 2.1, cap: '안내 문구 대신 벽 틈 너머의 밝은 발판으로 이끄는 탈출 구간' },
      { n: '2', src: 'curtaincall/assets/m3-escape-cannon-wire-swing.webp', w: 1600, h: 900, cap: '공연에서 익힌 인간 대포를 탈출 구간에서 다시 쓰는 장면' },
      { n: '3', src: 'pinball/wave-three.webp', w: 1280, h: 720, cap: '앞 판의 장치에 태엽 대포와 장난감 북을 더한 핀볼 세 번째 판' }
    ],
    'skill-rule': [
      { n: '1', src: 'curtaincall/assets/m1-rope.webp', w: 1575, h: 881, cap: '단색 캐릭터로 먼저 시험한 첫 테스트 빌드의 외줄타기' },
      { n: '2', src: 'curtaincall/assets/m3-cannon-catch.webp', w: 1600, h: 900, cap: '날아오는 동료를 트램펄린으로 받아 내는 인간 대포' },
      { n: '3', src: 'curtaincall/assets/m3-rope.webp', w: 2560, h: 1440, cap: '세 차례 테스트를 거친 최종 빌드의 외줄타기' }
    ],
    'skill-lead': [
      { n: '1', src: 'assets/lead-schedule.webp', w: 1400, h: 351, cap: 'Jira로 관리한 팀장 담당 작업 47건의 일정', wide: true, doc: true },
      { n: '3', src: 'student-council/orientation-group.jpg?v=privacy-2', w: 1200, h: 900, cap: '신입생 행사 무대의 단체 사진' }
    ],
    'skill-reference': [
      { n: '2', src: 'assets/brutalist-interior.webp', w: 720, h: 769, cap: '여러 층의 콘크리트 통로가 트인 공간을 둘러싼 브루탈리즘 건축' },
      { n: '3', src: 'assets/hagia-sophia.webp', w: 512, h: 341, cap: '거대한 돔 아래로 빛이 쏟아지는 아야 소피아 내부' },
      { n: '2·3', src: 'curtaincall/assets/m3-route.webp', w: 2560, h: 1440, cap: '육중한 콘크리트 공장으로 만든 탈출 구간' }
    ]
  };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const img = (src, w, h) => {
    const im = el('img'); im.src = src; im.alt = ''; im.loading = 'lazy'; im.draggable = false;
    if (w) { im.width = w; im.height = h; }
    return im;
  };
  const mark = src => {
    const s = el('span', 'practice-mark deck-mark'); s.setAttribute('aria-hidden', 'true');
    s.append(img(src, 24, 24));
    return s;
  };

  const items = [...list.children].map((li, i) => {
    const card = li.querySelector('.skill-card');
    return {
      id: li.id,
      no: String(i + 1).padStart(2, '0'),
      icon: card.querySelector('.practice-mark img').getAttribute('src'),
      name: card.querySelector('h4').textContent.trim(),
      line: card.querySelector('.skill-line').textContent.trim(),
      figure: card.querySelector('figure'),
      cases: card.querySelector('.skill-cases')
    };
  });
  const N = items.length;
  const TOTAL = String(N).padStart(2, '0');

  /* ---------- 앞면 ---------- */
  const row = el('ul', 'deck-row');
  const fronts = items.map((it, i) => {
    const li = el('li');
    const b = el('button', 'deck-card'); b.type = 'button'; b.setAttribute('aria-haspopup', 'dialog');
    const top = el('span', 'deck-top');
    const art = el('span', 'deck-art');
    const a = ART[it.id] || {};
    if (a.pies) {
      art.classList.add('deck-art-pies');
      if (a.ask) art.append(el('small', 'deck-pie-ask', a.ask));
      a.pies.forEach(([src, label, num]) => { const p = el('span', 'deck-pie'); p.append(img(src, 264, 264), el('b', null, num), el('small', null, label)); art.append(p); });
    } else if (a.src) {
      const im = img(a.src); if (a.pos) im.style.objectPosition = a.pos; art.append(im);
    }
    const open = el('span', 'deck-plus'); open.setAttribute('aria-hidden', 'true');
    /* 번호 옆에 제목, 사진과 설명 사이 가운데에 아이콘, 그 아래 설명 (11/27 17:15·17:25 형락 님) */
    top.append(el('b', 'deck-no', it.no), el('span', 'deck-name', it.name));
    const sign = mark(it.icon); sign.classList.add('deck-sign');
    b.append(top, art, sign, el('span', 'deck-line', it.line), open);
    b.addEventListener('click', () => openDeck(i));
    b.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || !motion()) return;
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      b.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
      b.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
    });
    b.addEventListener('pointerleave', () => { b.style.removeProperty('--rx'); b.style.removeProperty('--ry'); });
    li.append(b); row.append(li);
    return b;
  });
  /* 화면이 좁아 다섯 장이 한 줄에 안 들어가면 스크롤바 대신 좌우 화살표로 넘긴다 */
  const rail = el('div', 'deck-rail');
  const back = el('button', 'deck-shift deck-shift-prev'); back.type = 'button'; back.setAttribute('aria-label', '앞 카드 보기');
  const fwd = el('button', 'deck-shift deck-shift-next'); fwd.type = 'button'; fwd.setAttribute('aria-label', '뒤 카드 보기');
  rail.append(row, back, fwd);
  list.before(rail);
  sec.classList.add('deck-on');
  const step = () => (row.firstElementChild ? row.firstElementChild.offsetWidth : 240) + (parseFloat(getComputedStyle(row).columnGap) || 14);
  const shiftBy = dir => row.scrollBy({ left: dir * step(), behavior: motion() ? 'smooth' : 'auto' });
  back.addEventListener('click', () => shiftBy(-1));
  fwd.addEventListener('click', () => shiftBy(1));
  const edges = () => {
    const max = row.scrollWidth - row.clientWidth;
    back.hidden = !(max > 2 && row.scrollLeft > 2);
    fwd.hidden = !(max > 2 && row.scrollLeft < max - 2);
  };
  row.addEventListener('scroll', edges, { passive: true });
  addEventListener('resize', edges);
  if ('ResizeObserver' in window) new ResizeObserver(edges).observe(row);
  edges();

  /* 처음 보일 때 다섯 장을 차례로 내려놓는다 */
  if (motion() && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      if (!es.some(e => e.isIntersecting)) return;
      io.disconnect();
      [...row.children].forEach((li, i) => li.animate(
        [{ opacity: 0, transform: 'translateY(40px) rotate(-4deg) scale(.96)' }, { opacity: 1, transform: 'none' }],
        { duration: 640, delay: i * 90, easing: EASE, fill: 'backwards' }));
    }, { threshold: .2 });
    io.observe(row);
  }

  /* ---------- 크게 열린 카드 ---------- */
  const dlg = el('dialog', 'deck-dialog'); dlg.setAttribute('aria-label', '주요 역량');
  const bar = el('div', 'deck-bar');
  const count = el('p', 'deck-count'); count.setAttribute('aria-live', 'polite');
  const closeBtn = el('button', 'deck-close', '닫기'); closeBtn.type = 'button';
  bar.append(count, closeBtn);
  const stage = el('div', 'deck-stage');
  const prev = el('button', 'deck-nav deck-prev'); prev.type = 'button'; prev.setAttribute('aria-label', '이전 역량');
  const next = el('button', 'deck-nav deck-next'); next.type = 'button'; next.setAttribute('aria-label', '다음 역량');

  let cur = 0, opened = false, dragged = false, loaded = false;

  const slots = items.map((it, i) => {
    const slot = el('div', 'deck-slot');
    const big = el('article', 'deck-big');
    const head = el('header', 'deck-big-head');
    const h = el('h3', null, it.name); h.id = 'deck-title-' + (i + 1);
    big.setAttribute('aria-labelledby', h.id);
    head.append(el('b', 'deck-no', it.no), mark(it.icon), h, el('p', 'deck-big-line', it.line));
    const body = el('div', 'deck-big-body');
    const proof = PROOF[it.id];
    if (proof) {
      const grid = el('div', 'deck-proof');
      proof.forEach(p => {
        const f = el('figure', 'deck-proof-item' + (p.wide ? ' is-wide' : ''));
        const a = el('a', 'deck-proof-pic' + (p.doc ? ' is-doc' : '')); a.href = p.src; a.draggable = false;
        const im = img(p.src, p.w, p.h); im.alt = p.cap;
        if (p.pos) { im.style.objectPosition = p.pos; im.style.transformOrigin = p.pos; }
        if (p.zoom) im.style.setProperty('--z', p.zoom);
        a.append(im, el('b', 'deck-proof-no', p.n));
        f.append(a, el('figcaption', null, p.cap));
        grid.append(f);
      });
      body.append(grid);
    } else if (it.figure) {
      const f = it.figure.cloneNode(true);
      f.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
      f.querySelectorAll('a').forEach(n => { n.draggable = false; });
      const pics = f.querySelectorAll('img');
      pics.forEach(im => {
        im.draggable = false;
        const w = +im.getAttribute('width'), hh = +im.getAttribute('height');
        if (w && hh) { im.style.aspectRatio = w + ' / ' + hh; im.style.setProperty('--ar', (w / hh).toFixed(3)); }
      });
      if (pics.length === 1 && +pics[0].getAttribute('height') > +pics[0].getAttribute('width')) big.classList.add('is-portrait');
      body.append(f);
    }
    if (it.cases) body.append(it.cases.cloneNode(true));
    big.append(head, body);
    slot.append(big);
    /* 옆에 보이는 카드를 누르면 그 카드로 넘긴다 */
    slot.addEventListener('click', e => {
      const p = +slot.dataset.pos;
      if (p === 0) return;
      e.preventDefault(); e.stopPropagation();
      if (!dragged) go(cur + p);
    }, true);
    stage.append(slot);
    return slot;
  });
  /* 그림 크게 보기: 큰 카드 위에 한 장을 화면 가득 띄운다. 아무 데나 누르거나 Esc로 닫는다. */
  const peek = el('div', 'deck-peek'); peek.hidden = true; peek.tabIndex = -1;
  const peekImg = el('img'); peekImg.draggable = false;
  peek.append(peekImg);
  dlg.append(bar, stage, prev, next, peek);
  document.body.append(dlg);
  function openPeek(src, alt) {
    peekImg.src = src; peekImg.alt = alt || '';
    peek.hidden = false; peek.focus({ preventScroll: true });
    if (motion()) peek.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
  }
  function closePeek() {
    if (peek.hidden) return;
    peek.hidden = true;
    const z = slots[cur].querySelector('a.deck-proof-pic, a.skill-zoom');
    (z || dlg).focus({ preventScroll: true });
  }

  const posOf = k => ((k - cur) % N + N + 2) % N - 2;
  function layout() {
    slots.forEach((s, k) => {
      const p = posOf(k), on = p === 0;
      s.dataset.pos = p;
      s.setAttribute('aria-hidden', String(!on));
      s.querySelectorAll('a, button').forEach(n => { if (on) n.removeAttribute('tabindex'); else n.setAttribute('tabindex', '-1'); });
    });
    fronts.forEach((f, k) => f.classList.toggle('is-lifted', opened && k === cur));
    count.replaceChildren(el('b', null, items[cur].no), ' / ' + TOTAL);
  }
  function go(n) {
    peek.hidden = true;
    cur = ((n % N) + N) % N;
    slots[cur].firstElementChild.scrollTop = 0;
    layout();
  }

  function flip(front, big) {
    const a = front.getBoundingClientRect(), b = big.getBoundingClientRect();
    return {
      s: a.width / b.width,
      x: a.left + a.width / 2 - (b.left + b.width / 2),
      y: a.top + a.height / 2 - (b.top + b.height / 2)
    };
  }

  /* 홈은 화면 폭에 맞춰 body 전체를 확대·축소한다(claude-polish.js). 큰 카드는 그 배율을 되돌려 화면 크기 그대로 보이게 한다. */
  function unzoom() {
    const z = parseFloat(getComputedStyle(document.body).zoom) || 1;
    dlg.style.zoom = Math.abs(z - 1) < .01 ? '' : String(1 / z);
  }
  addEventListener('resize', () => { if (opened) unzoom(); });

  function openDeck(i) {
    if (opened) return;
    cur = i; opened = true;
    if (!loaded) { stage.querySelectorAll('img').forEach(im => { im.loading = 'eager'; }); loaded = true; }
    layout();
    unzoom();
    html.classList.add('deck-lock');
    dlg.showModal();
    if (!motion()) return;
    const big = slots[i].firstElementChild;
    const t = flip(fronts[i], big);
    big.animate([
      { transform: `translate(${t.x}px, ${t.y}px) scale(${t.s}) rotateY(-16deg)`, opacity: .25 },
      { transform: 'none', opacity: 1 }
    ], { duration: 600, easing: EASE });
    slots.forEach((s, k) => {
      if (k === i) return;
      s.firstElementChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, delay: 220, easing: 'ease-out', fill: 'backwards' });
    });
    [bar, prev, next].forEach(n => n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: 240, fill: 'backwards' }));
    try { dlg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, pseudoElement: '::backdrop' }); } catch (e) { /* 지원하지 않으면 그대로 */ }
  }

  function closeDeck() {
    if (!opened) return;
    opened = false;
    const front = fronts[cur];
    /* 휴대폰처럼 앞면이 가로로 넘쳐 있으면, 돌아갈 카드가 보이게 줄을 옮겨 둔다 */
    const rr = row.getBoundingClientRect(), fr = front.getBoundingClientRect();
    if (fr.left < rr.left || fr.right > rr.right) row.scrollLeft += fr.left - rr.left - 16;
    if (!motion()) { dlg.close(); return; }
    const big = slots[cur].firstElementChild;
    const t = flip(front, big);
    const out = { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' };
    const anim = big.animate([
      { transform: 'none', opacity: 1 },
      { transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`, opacity: 0 }
    ], out);
    slots.forEach((s, k) => { if (k !== cur) s.firstElementChild.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: 'forwards' }); });
    [bar, prev, next].forEach(n => n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }));
    try { dlg.animate([{ opacity: 1 }, { opacity: 0 }], { ...out, pseudoElement: '::backdrop' }); } catch (e) { /* 지원하지 않으면 그대로 */ }
    anim.onfinish = () => dlg.close();
  }

  dlg.addEventListener('close', () => {
    opened = false;
    peek.hidden = true;
    html.classList.remove('deck-lock');
    dlg.getAnimations({ subtree: true }).forEach(a => a.cancel());
    fronts.forEach(f => f.classList.remove('is-lifted'));
    fronts[cur].focus({ preventScroll: true });
  });
  dlg.addEventListener('cancel', e => { e.preventDefault(); if (!peek.hidden) closePeek(); else closeDeck(); });
  closeBtn.addEventListener('click', closeDeck);
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  dlg.addEventListener('keydown', e => {
    if (!peek.hidden) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
  });
  dlg.addEventListener('click', e => {
    if (dragged) { e.preventDefault(); e.stopPropagation(); return; }
    if (!peek.hidden) { closePeek(); return; }
    /* 그림을 누르면 크게 본다 */
    const z = e.target.closest('a.deck-proof-pic, a.skill-zoom');
    if (z) {
      e.preventDefault();
      const im = z.querySelector('img');
      openPeek(z.getAttribute('href'), im ? im.alt : '');
      return;
    }
    if (e.target === stage || e.target === dlg) closeDeck();
  });

  /* 끌어서 넘기기: 마우스로 끌기, 휴대폰은 좌우로 밀기 */
  let down = false, drag = false, sx = 0, sy = 0, dx = 0, pid = null;
  stage.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    down = true; drag = false; sx = e.clientX; sy = e.clientY; dx = 0; pid = e.pointerId;
  });
  stage.addEventListener('pointermove', e => {
    if (!down || e.pointerId !== pid) return;
    const mx = e.clientX - sx, my = e.clientY - sy;
    if (!drag) {
      if (Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(my) * 1.2) {
        drag = true;
        try { stage.setPointerCapture(pid); } catch (err) { /* 무시 */ }
        stage.classList.add('is-drag');
        const sel = window.getSelection && window.getSelection(); if (sel) sel.removeAllRanges();
      } else if (Math.abs(my) > 14) down = false;
      return;
    }
    dx = mx;
    stage.style.setProperty('--drag', dx + 'px');
  });
  const end = e => {
    if (!down || e.pointerId !== pid) return;
    down = false;
    if (!drag) return;
    drag = false; dragged = true;
    setTimeout(() => { dragged = false; }, 60);
    stage.classList.remove('is-drag');
    stage.style.setProperty('--drag', '0px');
    if (dx < -60) go(cur + 1);
    else if (dx > 60) go(cur - 1);
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
})();
