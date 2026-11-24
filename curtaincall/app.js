const video = document.querySelector("#cover-video");
const play = document.querySelector("#play");
play.hidden = !video.canPlayType("video/mp4");
play.addEventListener("click", async () => {
  if (!video.paused) { video.pause(); return; }
  try { await video.play(); } catch { video.controls = true; play.hidden = true; }
});
video.addEventListener("play", () => { play.textContent = "일시정지"; });
video.addEventListener("pause", () => { play.textContent = "클립 재생"; });
const gameplayVideos = document.querySelectorAll("main video");
const pauseOffscreen = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) entry.target.pause();
  }
});
for (const film of gameplayVideos) {
  pauseOffscreen.observe(film);
  film.addEventListener("play", () => {
    for (const other of gameplayVideos) {
      if (other !== film && !other.paused) other.pause();
    }
  });
}
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
const original = document.querySelector("#original");
const zoom = document.querySelector("#capture-zoom");
const imagePane = lightbox.querySelector(".light-image");

function setCaptureZoom(enlarged) {
  lightbox.classList.toggle("capture-enlarged", enlarged);
  zoom.setAttribute("aria-pressed", String(enlarged));
  zoom.textContent = enlarged ? "화면에 맞추기" : "글자 확대";
  imagePane.scrollTo(0, 0);
}

document.querySelectorAll("[data-expand]").forEach(link => link.addEventListener("click", event => {
  if (!lightbox.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const isCapture = link.classList.contains("doc-link");
  const title = isCapture ? link.textContent.trim() : link.querySelector("img").alt;
  caption.textContent = title;
  fullImage.src = link.href;
  fullImage.alt = link.dataset.description || title;
  original.href = link.href;
  original.hidden = isCapture;
  zoom.hidden = !isCapture;
  lightbox.classList.toggle("capture-view", isCapture);
  setCaptureZoom(false);
  lightbox.showModal();
}));
zoom.addEventListener("click", () => setCaptureZoom(!lightbox.classList.contains("capture-enlarged")));
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
