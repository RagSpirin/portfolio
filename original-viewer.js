// 기획서·발표 원본 보기: data-original 링크를 누르면 사이트 안 창에서 드라이브·슬라이드 원본을 그대로 띄운다.
// 링크의 href는 새 창용 원본 주소로 남겨 두어, 새 탭 열기·스크립트 없는 환경에서도 원본으로 간다.
(() => {
  const dlg = document.createElement('dialog');
  dlg.className = 'ov-dialog';
  dlg.setAttribute('aria-labelledby', 'ov-title');
  dlg.innerHTML = '<div class="ov-bar"><h3 id="ov-title"></h3><a class="ov-open" target="_blank" rel="noopener">새 창에서 열기 ↗</a><button class="ov-close" type="button">닫기</button></div><iframe class="ov-frame" allow="fullscreen" allowfullscreen></iframe>';
  document.body.appendChild(dlg);
  const title = dlg.querySelector('#ov-title');
  const open = dlg.querySelector('.ov-open');
  const frame = dlg.querySelector('.ov-frame');
  let opener = null;

  const show = (a) => {
    opener = a;
    const name = a.dataset.title || a.textContent.replace('↗', '').trim();
    title.textContent = name;
    frame.title = name + ' 원본';
    open.href = a.href;
    frame.src = a.dataset.original;
    dlg.showModal();
    document.documentElement.classList.add('ov-lock');
  };
  const close = () => dlg.close();
  dlg.addEventListener('close', () => {
    frame.src = 'about:blank';
    document.documentElement.classList.remove('ov-lock');
    opener?.focus({ preventScroll: true });
  });
  dlg.querySelector('.ov-close').addEventListener('click', close);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-original]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    show(a);
  });

  // 기획의 출발: 발표 자료 탭 전환 (iframe 하나를 바꿔 끼움)
  for (const viewer of document.querySelectorAll('.deck-viewer')) {
    const tabs = [...viewer.querySelectorAll('[role="tab"]')];
    const iframe = viewer.querySelector('iframe');
    const link = viewer.querySelector('.deck-open');
    const select = (tab) => {
      for (const t of tabs) {
        const on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      }
      iframe.src = tab.dataset.src;
      iframe.title = tab.dataset.title + ' 원본';
      link.href = tab.dataset.href;
      link.textContent = tab.dataset.title + ' 새 창에서 열기 ↗';
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        next.focus(); select(next);
      });
    });
  }
})();
