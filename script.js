/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ================= SLIDER ================= */

  const slides = document.querySelector(".slides");
  const allSlides = document.querySelectorAll(".slide");

  if (slides && allSlides.length > 0) {

    let startX = 0;
    let index = 0;
    const total = allSlides.length;

    slides.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });

    slides.addEventListener("touchend", e => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (diff > 50) index = Math.min(index + 1, total - 1);
      if (diff < -50) index = Math.max(index - 1, 0);

      updateSlide();
    });

    function updateSlide() {
      slides.style.transform = `translateX(-${index * 100}%)`;

      // Pause toutes les vidéos
      allSlides.forEach(slide => {
        if (slide.tagName === "VIDEO") {
          slide.pause();
        }
      });

      // Lance la vidéo active
      const active = allSlides[index];
      if (active.tagName === "VIDEO") {
        active.play();
      }
    }
  }


  /* ================= CERCLE ================= */

  const circle = document.getElementById("circle");

  let rotation = 0;

  function rotateCircle() {
    rotation += 180;
    circle.style.transform = `rotate(${rotation}deg)`;
  }

  /* rendre accessible globalement */
  window.openApp = function () {
    rotateCircle();

    setTimeout(() => {
      window.location.href = "application.html";
    }, 600);
  };

  window.openSorties = function () {
    rotateCircle();

    setTimeout(() => {
      alert("Page Sorties à venir");
    }, 600);
  };

});
