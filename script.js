/* ================= NAVIGATION ================= */

function goToapplication() {
  window.location.href = "application.html";
}

/* ================= SLIDER ================= */

const slider = document.querySelector(".slider");
const slidesContainer = document.querySelector(".slides");
const slides = document.querySelectorAll(".slide");

let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let index = 0;

const totalSlides = slides.length;

/* ================= TOUCH ================= */

slider.addEventListener("touchstart", startDrag);
slider.addEventListener("touchmove", drag);
slider.addEventListener("touchend", endDrag);

/* ================= START ================= */

function startDrag(e) {
  isDragging = true;
  startX = e.touches[0].clientX;
}

/* ================= MOVE ================= */

function drag(e) {
  if (!isDragging) return;

  const currentX = e.touches[0].clientX;
  const diff = currentX - startX;

  slidesContainer.style.transform =
    `translateX(${prevTranslate + diff}px)`;
}

/* ================= END ================= */

function endDrag(e) {
  if (!isDragging) return;
  isDragging = false;

  const endX = e.changedTouches[0].clientX;
  const diff = endX - startX;

  if (diff < -50) index = Math.min(index + 1, totalSlides - 1);
  if (diff > 50) index = Math.max(index - 1, 0);

  snap();
}

/* ================= SNAP ================= */

function snap() {
  const width = slider.offsetWidth;
  currentTranslate = -index * width;
  prevTranslate = currentTranslate;

  slidesContainer.style.transition = "transform 0.3s ease";
  slidesContainer.style.transform = `translateX(${currentTranslate}px)`;

  setTimeout(() => {
    slidesContainer.style.transition = "none";
  }, 300);
}

/* ================= INIT ================= */

window.addEventListener("resize", snap);
snap();

/* ================= SERVICE WORKER ================= */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("SW actif"))
    .catch(err => console.log(err));
}
