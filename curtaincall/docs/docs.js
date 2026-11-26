(() => {
  const links = [...document.querySelectorAll('.doc-toc a')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map(a => [decodeURIComponent(a.hash.slice(1)), a]));
  const heads = [...document.querySelectorAll('.doc-body h2[id]')];
  const seen = new Set();
  const mark = () => {
    const top = heads.filter(h => h.getBoundingClientRect().top < 140).pop() || heads[0];
    links.forEach(a => a.classList.toggle('on', byId.get(top.id) === a));
  };
  const io = new IntersectionObserver(() => mark(), { rootMargin: '0px 0px -60% 0px' });
  heads.forEach(h => io.observe(h));
  addEventListener('scroll', mark, { passive: true });
  mark();
})();
