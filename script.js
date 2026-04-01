/* ================= SLIDER ================= */

const slidesContainer = document.querySelector(".slides");
const slides = document.querySelectorAll(".slide");

let startX = 0;
let currentIndex = 0;
const totalSlides = slides.length;

/* ================= SWIPE TOUCH ================= */

slidesContainer.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

slidesContainer.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (diff > 50) {
    // swipe vers la gauche → slide suivant
    currentIndex = Math.min(currentIndex + 1, totalSlides - 1);
  } 
  else if (diff < -50) {
    // swipe vers la droite → slide précédent
    currentIndex = Math.max(currentIndex - 1, 0);
  }

  updateSlide();
});

/* ================= UPDATE POSITION ================= */

function updateSlide() {
  slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
}

/* ================= RESET SI RESIZE ================= */

window.addEventListener("resize", () => {
  updateSlide();
});

/* ================= INIT ================= */

updateSlide();

/* ================= SERVICE WORKER ================= */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker actif"))
    .catch(err => console.log("Erreur SW :", err));
}
