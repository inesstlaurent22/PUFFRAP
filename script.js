/* ================= NAV ================= */

function goToapplication(){
  const app = document.querySelector(".app");

  if(app){
    app.style.transition = "transform 0.6s ease, opacity 0.6s ease";
    app.style.transform = "scale(1.1)";
    app.style.opacity = "0";
  }

  setTimeout(() => {
    window.location.href = "application.html";
  }, 500);
}

/* ================= SLIDER ================= */

document.addEventListener("DOMContentLoaded", () => {

  const slides = document.querySelector(".slides");
  const slideElements = document.querySelectorAll(".slide");

  if(slides && slideElements.length > 0){

    let startX = 0;
    let index = 0;
    const total = slideElements.length;

    slides.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });

    slides.addEventListener("touchend", e => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if(diff > 50) index = Math.min(index + 1, total - 1);
      if(diff < -50) index = Math.max(index - 1, 0);

      slides.style.transform = `translateX(-${index * 100}%)`;
    });
  }

  /* ================= CERCLE ================= */

  const circle = document.querySelector(".circle");

  if(circle){

    let rotate = 0;
    let startXCircle = 0;

    circle.addEventListener("touchstart", (e) => {
      startXCircle = e.touches[0].clientX;
    });

    circle.addEventListener("touchmove", (e) => {
      let currentX = e.touches[0].clientX;
      let diff = currentX - startXCircle;

      rotate += diff * 0.3;

      circle.style.transform = `
        rotate(${rotate}deg)
        rotateX(10deg)
        rotateY(10deg)
      `;

      startXCircle = currentX;
    });
  }

});
