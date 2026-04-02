document.addEventListener("DOMContentLoaded", () => {

/* ================= CALENDAR ================= */

const calendar = document.getElementById("calendar");

if(calendar){

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // HEADER
  days.forEach(d => {
    const el = document.createElement("div");
    el.textContent = d;
    el.style.fontWeight = "bold";
    calendar.appendChild(el);
  });

  // DATES
  for(let i = 1; i <= 31; i++){
    const day = document.createElement("div");
    day.classList.add("day");
    day.textContent = i;

    // week-end en rouge
    if(i % 7 === 0 || i % 7 === 6){
      day.classList.add("red");
    }

    calendar.appendChild(day);
  }

}
const track = document.querySelector(".services-track");
const cards = document.querySelectorAll(".service-card");

let isDown = false;
let startX;
let current = 0;
let velocity = 0;
let lastX = 0;
let animation;

/* ===== START ===== */
track.addEventListener("mousedown", startDrag);
track.addEventListener("touchstart", startDrag);

function startDrag(e){
  isDown = true;
  cancelAnimationFrame(animation);

  startX = getX(e);
  lastX = startX;
}

/* ===== MOVE ===== */
window.addEventListener("mousemove", moveDrag);
window.addEventListener("touchmove", moveDrag);

function moveDrag(e){
  if(!isDown) return;

  const x = getX(e);
  const diff = x - lastX;

  velocity = diff; // vitesse
  current += diff;

  applyBounds();

  track.style.transform = `translateX(${current}px)`;

  lastX = x;

  updateActiveCard();
}

/* ===== END ===== */
window.addEventListener("mouseup", endDrag);
window.addEventListener("touchend", endDrag);

function endDrag(){
  isDown = false;
  inertia();
}

/* ===== INERTIA ===== */
function inertia(){

  velocity *= 0.95; // friction

  current += velocity;

  applyBounds();

  track.style.transform = `translateX(${current}px)`;

  updateActiveCard();

  if(Math.abs(velocity) > 0.5){
    animation = requestAnimationFrame(inertia);
  }
}

/* ===== UTILS ===== */
function getX(e){
  return e.touches ? e.touches[0].clientX : e.clientX;
}

/* LIMITES */
function applyBounds(){

  const max = 0;
  const min = -(track.scrollWidth - window.innerWidth + 40);

  if(current > max){
    current = max;
    velocity = 0;
  }

  if(current < min){
    current = min;
    velocity = 0;
  }
}

/* ===== ACTIVE CARD ===== */
function updateActiveCard(){

  const center = window.innerWidth / 2;

  cards.forEach(card => {

    const rect = card.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;

    const distance = Math.abs(center - cardCenter);

    if(distance < 90){
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }

  });
}
