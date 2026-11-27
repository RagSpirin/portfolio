/* 기획에 영향을 준 게임: 주요 역량과 같은 카드 넘기기 (11/27 18:05 형락 님).
   글과 표지는 페이지 안 목록(ul.picks > li.pick)에서 읽는다. 작품을 바꿀 때는 그 목록만 고치면 카드와 큰 카드가 같이 바뀐다.
   li.pick 의 data-shot(커튼콜 화면 경로), data-shot-alt, data-shot-pos, data-shot-zoom 은 큰 카드의 화면 한 장. 없으면 화면 없이 글만. */
(() => {
  const D = window.CardDeck;
  if (!D) return;
  const { el, img, mark, shot } = D;
  /* 영화·책은 게임을 확인받은 뒤 이 목록에 더한다 */
  const BLOCKS = [{ sel: '.medium-games details.picks-block', kind: '기획에 영향을 준 게임' }];

  BLOCKS.forEach(({ sel, kind }) => {
    const block = document.querySelector(sel);
    const list = block && block.querySelector('ul.picks');
    if (!list || !list.children.length) return;
    const title = block.querySelector('.picks-head h4');
    const items = [...list.children].map(li => {
      const cover = li.querySelector('.pick-cover img');
      const link = li.querySelector('a.pick-top');
      const to = li.querySelector('.pick-to');
      const toIcon = to && to.querySelector('img');
      return {
        name: li.querySelector('h5').textContent.trim(),
        cover: cover && { src: cover.getAttribute('src'), w: +cover.getAttribute('width'), h: +cover.getAttribute('height') },
        href: link && link.getAttribute('href'),
        note: (li.querySelector('.pick-note') || {}).textContent || '',
        toLabel: to ? to.querySelector('span').textContent.trim() : '',
        toIcon: toIcon && toIcon.getAttribute('src'),
        toName: to ? to.querySelector('b').textContent.trim() : '',
        use: (li.querySelector('.pick-case') || {}).textContent || '',
        shot: li.dataset.shot && { src: li.dataset.shot, cap: li.dataset.shotAlt || '', pos: li.dataset.shotPos, zoom: li.dataset.shotZoom }
      };
    });
    const coverBox = (it, cls) => {
      const box = el('span', cls);
      if (it.cover) box.append(img(it.cover.src, it.cover.w, it.cover.h));
      return box;
    };
    const skill = (it, cls) => {
      const p = el('span', cls);
      if (it.toIcon) p.append(mark(it.toIcon));
      p.append(el('span', null, it.toName));
      return p;
    };

    D.make({
      items,
      kind: 'pick',
      label: kind, prevLabel: '이전 작품', nextLabel: '다음 작품',
      place(rail) {
        const sec = el('section', 'picks-block pick-deck');
        sec.setAttribute('aria-label', kind);
        const head = el('div', 'picks-head');
        head.append(el('h4', null, title ? title.textContent.trim() : kind));
        sec.append(head, rail);
        block.before(sec);
        block.classList.add('is-decked');
      },
      front(it, i, b) {
        const open = el('span', 'deck-plus'); open.setAttribute('aria-hidden', 'true');
        b.append(coverBox(it, 'pick-card-cover'), el('span', 'pick-card-name', it.name), skill(it, 'pick-card-skill'), open);
      },
      /* 큰 카드는 세로형: 표지(포스터)가 세로라 카드도 세로로 (11/27 18:30 형락 님) */
      big(it, i, big) {
        const art = el('div', 'pick-big-art');
        if (it.cover) art.append(img(it.cover.src, it.cover.w, it.cover.h));
        const body = el('div', 'pick-big-body');
        const head = el('header', 'pick-big-head');
        head.append(el('p', 'pick-big-kind', kind), el('h3', null, it.name));
        if (it.href) {
          const a = el('a', 'pick-big-out', '작품 정보 ↗'); a.href = it.href; a.target = '_blank'; a.rel = 'noopener';
          head.append(a);
        }
        if (it.toName) {
          const to = el('p', 'pick-big-to');
          to.append(el('span', 'pick-label', it.toLabel || '이어진 역량'), skill(it, 'pick-big-skill'));
          head.append(to);
        }
        const learn = el('section', 'pick-big-learn');
        learn.append(el('h4', 'pick-label', '배운 점'), el('p', 'pick-big-note', it.note.trim()));
        body.append(head, learn);
        if (it.use.trim() || it.shot) {
          const use = el('section', 'pick-big-use');
          const rowEl = el('div', 'pick-big-use-row' + (it.shot ? '' : ' is-text'));
          rowEl.append(el('p', 'pick-big-case', it.use.trim()));
          if (it.shot) rowEl.append(shot(it.shot));
          use.append(el('h4', 'pick-label', '기획에 반영'), rowEl);
          body.append(use);
        }
        big.append(art, body);
      }
    });
  });
})();
