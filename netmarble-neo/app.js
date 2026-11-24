const video = document.querySelector("#cover-video");
const play = document.querySelector("#play");
play.hidden = !video.canPlayType("video/mp4");
play.addEventListener("click", async () => {
  if (!video.paused) { video.pause(); return; }
  try { await video.play(); } catch { video.controls = true; play.hidden = true; }
});
video.addEventListener("play", () => { play.textContent = "일시정지"; });
video.addEventListener("pause", () => { play.textContent = "클립 재생"; });
new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) video.pause(); }).observe(video);
const slider = document.querySelector(".compare input");
const presets = [...document.querySelectorAll("[data-split]")];
function updateComparison() {
  slider.parentElement.style.setProperty("--split", slider.value + "%");
  slider.setAttribute("aria-valuetext", "M1 " + slider.value + "%, M2 " + (100 - slider.value) + "%");
  presets.forEach(button => button.setAttribute("aria-pressed", button.dataset.split === slider.value));
}
presets.forEach(button => button.addEventListener("click", () => { slider.value = button.dataset.split; updateComparison(); }));
slider.addEventListener("input", updateComparison);
updateComparison();

const lightbox = document.querySelector("#lightbox");
const fullImage = lightbox.querySelector("img");
const caption = document.querySelector("#light-title");
document.querySelectorAll("[data-expand]").forEach(link => link.addEventListener("click", event => {
  if (!lightbox.showModal || event.ctrlKey || event.metaKey || event.shiftKey) return;
  event.preventDefault();
  const image = link.querySelector("img");
  caption.textContent = image.alt;
  fullImage.src = link.href;
  fullImage.alt = image.alt;
  document.querySelector("#original").href = link.href;
  lightbox.showModal();
}));
document.querySelector("#close-light").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", event => {
  const rect = lightbox.getBoundingClientRect();
  if (event.target === lightbox && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) lightbox.close();
});

const mileButtons = [...document.querySelectorAll('[data-mile]')];
mileButtons.forEach(button => button.addEventListener('click', () => {
  for (const option of mileButtons) {
    const selected = option === button;
    option.setAttribute('aria-pressed', String(selected));
    document.getElementById(option.getAttribute('aria-controls')).hidden = !selected;
  }
}));
