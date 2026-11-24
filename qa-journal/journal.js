(() => {
  const viewer = document.querySelector('#note-view');
  const title = document.querySelector('#note-title');
  const photo = viewer.querySelector('img');
  const viewport = viewer.querySelector('.note-scroll');
  const zoomButton = document.querySelector('#note-zoom');
  let opener;

  for (const link of document.querySelectorAll('.note-gallery a')) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      const caption = link.querySelector('span').textContent;
      title.textContent = caption;
      photo.alt = caption + ' 수첩 사진';
      photo.src = link.href;
      viewer.classList.remove('is-zoomed');
      zoomButton.textContent = '원본 크기';
      viewer.showModal();
      viewport.scrollTo(0, 0);
    });
  }
  zoomButton.addEventListener('click', () => {
    const zoomed = viewer.classList.toggle('is-zoomed');
    zoomButton.textContent = zoomed ? '화면에 맞춤' : '원본 크기';
    viewport.scrollTo(0, 0);
  });
  viewer.addEventListener('close', () => opener?.focus({preventScroll: true}));
})();
