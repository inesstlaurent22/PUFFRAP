/* NAVIGATION */

function goToApp(){
  document.body.style.opacity = "0";

  setTimeout(() => {
    window.location.href = "application.html";
  }, 400);
}

function goToMagazine(){
  alert("Magazine bientôt disponible");
}

/* FADE IN */
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
  document.body.style.transition = "opacity 0.6s ease";
});

const slides = document.querySelector(".slides");
const allSlides = document.querySelectorAll(".slide");

let index = 0;
let startX = 0;
let isDown = false;

/* ===== TOUCH ===== */

slides.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

slides.addEventListener("touchend", (e) => {

  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if(diff > 50) index = Math.min(index + 1, allSlides.length - 1);
  if(diff < -50) index = Math.max(index - 1, 0);

  updateSlide();
});

/* ===== MOUSE DRAG ===== */

slides.addEventListener("mousedown", (e) => {
  isDown = true;
  startX = e.clientX;
});

slides.addEventListener("mouseup", (e) => {
  if(!isDown) return;

  const diff = startX - e.clientX;

  if(diff > 50) index = Math.min(index + 1, allSlides.length - 1);
  if(diff < -50) index = Math.max(index - 1, 0);

  updateSlide();
  isDown = false;
});

slides.addEventListener("mouseleave", () => {
  isDown = false;
});

/* ===== UPDATE ===== */

function updateSlide(){
  slides.style.transform = `translateX(-${index * 100}%)`;
}
