const regionOptions = document.querySelector(".region-buttons");
const regionButtons = [...regionOptions.querySelectorAll("button")];

function showRouteSection(selectedButton) {
  for (const button of regionButtons) {
    const selected = button === selectedButton;
    button.setAttribute("aria-pressed", String(selected));
    document.getElementById(button.getAttribute("aria-controls")).hidden = !selected;
  }
}

for (const button of regionButtons) {
  button.addEventListener("click", () => showRouteSection(button));
}
showRouteSection(regionOptions.querySelector('[aria-pressed="true"]'));
regionOptions.hidden = false;
