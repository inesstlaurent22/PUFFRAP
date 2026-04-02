document.addEventListener("DOMContentLoaded", () => {

const track = document.querySelector(".services-track");
const cards = document.querySelectorAll(".service-card");

if(!track) return;

let isDown = false;
let startX;
let currentTranslate = 0;
let prevTranslate = 0;

/* ===== DRAG START ===== */
track.addEventListener("mousedown", (e) => {
  isDown = true;
  startX = e.clientX;
});

/* ===== DRAG END ===== */
window.addEventListener("mouseup", () => {
  isDown = false;
  prevTranslate = currentTranslate;
});

/* ===== DRAG MOVE ===== */
window.addEventListener("mousemove", (e) => {
  if(!isDown) return;

  const diff = e.clientX - startX;
  currentTranslate = prevTranslate + diff;

  /* LIMITES (empêche sortir du slider) */
  const maxTranslate = 0;
  const minTranslate = -(track.scrollWidth - window.innerWidth + 40);

  if(currentTranslate > maxTranslate) currentTranslate = maxTranslate;
  if(currentTranslate < minTranslate) currentTranslate = minTranslate;

  track.style.transform = `translateX(${currentTranslate}px)`;

  updateActiveCard();
});

/* ===== MOBILE ===== */
track.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

track.addEventListener("touchmove", (e) => {
  const diff = e.touches[0].clientX - startX;
  currentTranslate = prevTranslate + diff;

  const maxTranslate = 0;
  const minTranslate = -(track.scrollWidth - window.innerWidth + 40);

  if(currentTranslate > maxTranslate) currentTranslate = maxTranslate;
  if(currentTranslate < minTranslate) currentTranslate = minTranslate;

  track.style.transform = `translateX(${currentTranslate}px)`;

  updateActiveCard();
});

track.addEventListener("touchend", () => {
  prevTranslate = currentTranslate;
});

/* ===== ACTIVE CARD ===== */
function updateActiveCard(){

  const center = window.innerWidth / 2;

  cards.forEach(card => {

    const rect = card.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;

    const distance = Math.abs(center - cardCenter);

    if(distance < 80){
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }

  });
}

updateActiveCard();

});
