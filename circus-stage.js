(() => {
  const root = 'curtaincall/assets/';
  const gamePanel = document.querySelector('#gameplay-panel');
  const gameFilm = gamePanel.querySelector('video');
  const filmButtons = [...gamePanel.querySelectorAll('[data-film]')];
  const filmSource = gameFilm.querySelector('source');
  const filmCaption = document.querySelector('#gameplay-caption');
  for (const button of filmButtons) {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') !== 'true') {
        for (const option of filmButtons) {
          option.setAttribute('aria-pressed', String(option === button));
        }
        const {film, poster = film, caption} = button.dataset;
        gameFilm.poster = root + poster + '.webp';
        gameFilm.setAttribute('aria-label', '최종 플레이테스트 ' + button.textContent + ' 영상');
        filmCaption.textContent = caption;
        filmSource.src = root + film + '.mp4';
        gameFilm.load();
      }
      gameFilm.play().catch(() => {
        // Native controls remain available when playback needs another gesture.
      });
    });
  }
  new IntersectionObserver(([entry])=>{
    if (!entry.isIntersecting) gameFilm.pause();
  }).observe(gamePanel);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)gameFilm.pause();});
})();

const arrivals=new IntersectionObserver(entries=>{
  for (const entry of entries) {
    if(entry.isIntersecting){entry.target.classList.add('scene-arrival');arrivals.unobserve(entry.target);}
  }
},{threshold:.15});
document.querySelectorAll('.work-title,.origin,.cv dl>div').forEach(item=>arrivals.observe(item));
