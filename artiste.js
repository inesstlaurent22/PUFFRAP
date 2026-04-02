/* ================= CALENDAR ================= */

const calendar = document.getElementById("calendar");

const days = [
  "Sun","Mon","Tue","Wed","Thu","Fri","Sat"
];

// header
days.forEach(d => {
  const el = document.createElement("div");
  el.textContent = d;
  el.style.fontWeight = "bold";
  calendar.appendChild(el);
});

// dates
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

/* SNAP SCROLL (effet iOS) */

const slider = document.querySelector(".services-slider");

let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener("mousedown", (e) => {
  isDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener("mouseleave", () => isDown = false);
slider.addEventListener("mouseup", () => isDown = false);

slider.addEventListener("mousemove", (e) => {
  if(!isDown) return;
  e.preventDefault();

  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 1.5;

  slider.scrollLeft = scrollLeft - walk;
});
