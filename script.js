/* NAV */
function goToApp(){
  window.location.href = "application.html";
}

function goToMagazine(){
  alert("Magazine bientôt disponible");
}

/* ================= SLIDER ================= */

const slides = document.querySelector(".slides");
const allSlides = document.querySelectorAll(".slide");

let index = 0;
let startX = 0;

/* TOUCH */
slides.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

slides.addEventListener("touchend", e => {
  const diff = startX - e.changedTouches[0].clientX;

  if(diff > 50) index = Math.min(index + 1, allSlides.length - 1);
  if(diff < -50) index = Math.max(index - 1, 0);

  update();
});

/* MOUSE */
let isDown = false;

slides.addEventListener("mousedown", e => {
  isDown = true;
  startX = e.clientX;
});

slides.addEventListener("mouseup", e => {
  if(!isDown) return;

  const diff = startX - e.clientX;

  if(diff > 50) index = Math.min(index + 1, allSlides.length - 1);
  if(diff < -50) index = Math.max(index - 1, 0);

  update();
  isDown = false;
});

function update(){
  slides.style.transform = `translateX(-${index * 100}%)`;
}
