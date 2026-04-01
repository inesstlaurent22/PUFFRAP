/* ================= NAVIGATION ================= */

function goToapplication() {
  window.location.href = "application.html";
}

/* ================= SLIDER ================= */

const slider = document.querySelector(".slider");
const slidesContainer = document.querySelector(".slides");
const slides = document.querySelectorAll(".slide");

let startX = 0;
let index = 0;
const totalSlides = slides.length;

/* ================= SWIPE ================= */

slider.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

slider.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (diff > 50) {
    // swipe gauche → suivant
    index = Math.min(index + 1, totalSlides - 1);
  }

  if (diff < -50) {
    // swipe droite → précédent
    index = Math.max(index - 1, 0);
  }

  updateSlide();
});

/* ================= UPDATE ================= */

function updateSlide() {
  slidesContainer.style.transform = `translateX(-${index * 100}%)`;
}

/* INIT */
updateSlide();
