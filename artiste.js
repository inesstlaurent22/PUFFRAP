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

document.querySelector(".back").addEventListener("click", () => {
  history.back();
});

/* ================= MAP ARTISTE ================= */

// coordonnées artiste (ex: Rennes)
const artistCoords = [48.1173, -1.6778];

const map = L.map('artistMap', {
  zoomControl: false,
  attributionControl: false
}).setView(artistCoords, 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// marker custom (plus stylé)
const icon = L.divIcon({
  className: "custom-marker",
  html: `<div style="
    width:20px;
    height:20px;
    background:#7ed957;
    border-radius:50%;
    box-shadow:0 0 20px #7ed957;
  "></div>`
});

L.marker(artistCoords, {icon}).addTo(map);

/* ================= SLIDER DRAG PREMIUM ================= */

const slider = document.querySelector(".slider");

let isDown = false;
let startX;
let scrollLeft;
let velocity = 0;
let raf;

/* MOUSE DOWN */
slider.addEventListener("mousedown", (e) => {
  isDown = true;
  startX = e.pageX;
  scrollLeft = slider.scrollLeft;
  slider.style.cursor = "grabbing";
});

/* MOUSE UP */
slider.addEventListener("mouseup", () => {
  isDown = false;
  slider.style.cursor = "grab";
  startMomentum();
});

slider.addEventListener("mouseleave", () => isDown = false);

/* DRAG */
slider.addEventListener("mousemove", (e) => {
  if (!isDown) return;

  const dx = e.pageX - startX;

  velocity = dx; /* garde vitesse */
  slider.scrollLeft = scrollLeft - dx;
});

/* TOUCH */
slider.addEventListener("touchstart", (e) => {
  startX = e.touches[0].pageX;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener("touchmove", (e) => {
  const dx = e.touches[0].pageX - startX;

  velocity = dx;
  slider.scrollLeft = scrollLeft - dx;
});

slider.addEventListener("touchend", () => {
  startMomentum();
});

/* ================= INERTIE STYLE iOS ================= */

function startMomentum(){
  cancelAnimationFrame(raf);

  function momentum(){
    slider.scrollLeft -= velocity;
    velocity *= 0.92; /* 🔥 douceur */

    if(Math.abs(velocity) > 0.3){
      raf = requestAnimationFrame(momentum);
    }
  }

  momentum();
}
