/* ================= SLIDER ================= */

const slidesContainer = document.querySelector(".slides");
const slides = document.querySelectorAll(".slide");

let index = 0;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let isDragging = false;

const totalSlides = slides.length;

/* ================= POSITION ================= */

function updateSlide() {
  const sliderWidth = document.querySelector(".slider").offsetWidth;
  currentTranslate = -index * sliderWidth;
  prevTranslate = currentTranslate;

  slidesContainer.style.transform = `translateX(${currentTranslate}px)`;
}

/* ================= TOUCH ================= */

slidesContainer.addEventListener("touchstart", touchStart);
slidesContainer.addEventListener("touchmove", touchMove);
slidesContainer.addEventListener("touchend", touchEnd);

/* ================= MOUSE (desktop) ================= */

slidesContainer.addEventListener("mousedown", touchStart);
slidesContainer.addEventListener("mousemove", touchMove);
slidesContainer.addEventListener("mouseup", touchEnd);
slidesContainer.addEventListener("mouseleave", touchEnd);

/* ================= EVENTS ================= */

function touchStart(e) {
  isDragging = true;
  startX = getPositionX(e);
}

function touchMove(e) {
  if (!isDragging) return;

  const currentX = getPositionX(e);
  const diff = currentX - startX;

  slidesContainer.style.transform =
    `translateX(${prevTranslate + diff}px)`;
}

function touchEnd(e) {
  if (!isDragging) return;
  isDragging = false;

  const endX = getPositionX(e);
  const diff = endX - startX;

  if (diff < -50) nextSlide();
  else if (diff > 50) prevSlide();
  else updateSlide();
}

/* ================= UTILS ================= */

function getPositionX(e) {
  return e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
}

/* ================= NAVIGATION ================= */

function nextSlide() {
  index = (index + 1) % totalSlides;
  updateSlide();
}

function prevSlide() {
  index = (index - 1 + totalSlides) % totalSlides;
  updateSlide();
}

/* ================= AUTOPLAY (optionnel) ================= */

let autoSlide = setInterval(() => {
  nextSlide();
}, 4000);

/* Stop autoplay quand l'utilisateur touche */
slidesContainer.addEventListener("touchstart", () => clearInterval(autoSlide));
slidesContainer.addEventListener("mousedown", () => clearInterval(autoSlide));

/* ================= INIT ================= */

window.addEventListener("resize", updateSlide);
updateSlide();


/* ================= SERVICE WORKER (PWA) ================= */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("SW actif"))
    .catch(err => console.log(err));
}
