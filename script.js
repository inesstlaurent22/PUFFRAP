/* ================= SLIDER ================= */

const slides = document.querySelector(".slides");
const allSlides = document.querySelectorAll(".slide");

let startX = 0;
let index = 0;
const total = allSlides.length;

slides.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

slides.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if(diff > 50) index = Math.min(index + 1, total - 1);
  if(diff < -50) index = Math.max(index - 1, 0);

  updateSlide();
});

/* UPDATE SLIDE + VIDEO */
function updateSlide(){
  slides.style.transform = `translateX(-${index * 100}%)`;

  // gérer lecture vidéo
  allSlides.forEach(slide => {
    if(slide.tagName === "VIDEO"){
      slide.pause();
    }
  });

  const active = allSlides[index];
  if(active.tagName === "VIDEO"){
    active.play();
  }
}

/* ================= CERCLE ================= */

const circle = document.getElementById("circle");

function rotateCircle(){
  circle.style.transform += " rotate(180deg)";
}

/* NAV + ANIMATION */

function openApp(){
  rotateCircle();

  setTimeout(()=>{
    window.location.href = "application.html";
  }, 600);
}

function openSorties(){
  rotateCircle();

  setTimeout(()=>{
    alert("Page Sorties à venir");
  }, 600);
}
