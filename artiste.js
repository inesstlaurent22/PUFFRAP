/* ================= CALENDAR ================= */

const calendar = document.getElementById("calendar");

const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

days.forEach(d=>{
  const el = document.createElement("div");
  el.innerText = d;
  el.style.fontWeight = "bold";
  calendar.appendChild(el);
});

for(let i=1;i<=31;i++){
  const d = document.createElement("div");
  d.innerText = i;

  if(i%7===0 || i%7===6){
    d.style.color = "red";
  }

  calendar.appendChild(d);
}

/* ================= SLIDER DRAG FIX ================= */

const slider = document.querySelector(".slider"); // ⚠️ important
const track = document.querySelector(".slider-track");

let isDown = false;
let startX;
let scrollLeft;
let velocity = 0;
let momentum;

/* MOUSE */

slider.addEventListener("mousedown", (e) => {
  isDown = true;
  startX = e.pageX;
  scrollLeft = slider.scrollLeft;
  slider.style.cursor = "grabbing";
});

slider.addEventListener("mouseleave", () => isDown = false);

slider.addEventListener("mouseup", () => {
  isDown = false;
  slider.style.cursor = "grab";
  momentumScroll();
});

slider.addEventListener("mousemove", (e) => {
  if (!isDown) return;

  const x = e.pageX;
  const walk = (x - startX);

  velocity = walk;
  slider.scrollLeft = scrollLeft - walk;
});

/* TOUCH (mobile) */

slider.addEventListener("touchstart", (e) => {
  startX = e.touches[0].pageX;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener("touchmove", (e) => {
  const x = e.touches[0].pageX;
  const walk = (x - startX);

  velocity = walk;
  slider.scrollLeft = scrollLeft - walk;
});

slider.addEventListener("touchend", () => {
  momentumScroll();
});

/* INERTIE */

function momentumScroll() {
  cancelAnimationFrame(momentum);

  momentum = requestAnimationFrame(function step() {
    slider.scrollLeft -= velocity;
    velocity *= 0.95;

    if (Math.abs(velocity) > 0.5) {
      momentum = requestAnimationFrame(step);
    }
  });
}
