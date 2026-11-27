(() => {
  const viewer = document.querySelector('#note-view');
  const title = document.querySelector('#note-title');
  const count = document.querySelector('#note-count');
  const photo = viewer.querySelector('img');
  const viewport = viewer.querySelector('.note-scroll');
  const zoomButton = document.querySelector('#note-zoom');
  const prevButton = viewer.querySelector('.note-prev');
  const nextButton = viewer.querySelector('.note-next');
  const links = [...document.querySelectorAll('.note-gallery a')];
  let current = 0;

  function show(index) {
    current = index;
    const link = links[index];
    const caption = link.querySelector('span').textContent;
    title.textContent = caption;
    count.textContent = (index + 1) + ' / ' + links.length;
    photo.alt = caption + ' 수첩 사진';
    photo.src = link.href;
    prevButton.setAttribute('aria-disabled', String(index === 0));
    nextButton.setAttribute('aria-disabled', String(index === links.length - 1));
    viewport.scrollTo(0, 0);
    for (const near of [links[index - 1], links[index + 1]]) {
      if (near) new Image().src = near.href;
    }
  }
  function step(direction) {
    const target = current + direction;
    if (target >= 0 && target < links.length) show(target);
  }

  links.forEach((link, index) => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      viewer.classList.remove('is-zoomed');
      zoomButton.textContent = '원본 크기';
      show(index);
      viewer.showModal();
      viewport.scrollTo(0, 0);
    });
  });
  prevButton.addEventListener('click', () => step(-1));
  nextButton.addEventListener('click', () => step(1));

  // 키보드 ← →: 원본 크기로 보며 옆으로 스크롤할 때는 스크롤을 우선
  viewer.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    if (viewer.classList.contains('is-zoomed') && viewport.scrollWidth > viewport.clientWidth + 1) return;
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  });

  // 휴대폰: 화면에 맞춘 상태에서 옆으로 밀면 넘김
  let startX = null;
  let startY = 0;
  viewport.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || viewer.classList.contains('is-zoomed')) { startX = null; return; }
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, {passive: true});
  viewport.addEventListener('touchend', event => {
    if (startX === null) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    startX = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  }, {passive: true});

  zoomButton.addEventListener('click', () => {
    const zoomed = viewer.classList.toggle('is-zoomed');
    zoomButton.textContent = zoomed ? '화면에 맞춤' : '원본 크기';
    viewport.scrollTo(0, 0);
  });
  viewer.addEventListener('close', () => links[current]?.focus({preventScroll: true}));
})();
