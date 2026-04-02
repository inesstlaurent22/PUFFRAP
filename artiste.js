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


/* ================= SLIDER PREMIUM ================= */

const slider = document.querySelector(".services-slider");
const cards = document.querySelectorAll(".service-card");

if(slider){

  let isDown = false;
  let startX;
  let scrollLeft;

  /* ===== MOUSE ===== */
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

  /* ===== TOUCH (mobile) ===== */
  let startTouchX = 0;

  slider.addEventListener("touchstart", (e) => {
    startTouchX = e.touches[0].clientX;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("touchmove", (e) => {
    const x = e.touches[0].clientX;
    const walk = (x - startTouchX) * 1.5;

    slider.scrollLeft = scrollLeft - walk;
  });

  /* ===== CARTE ACTIVE (effet premium) ===== */
  function updateActiveCard(){

    const center = slider.scrollLeft + slider.offsetWidth / 2;

    cards.forEach(card => {

      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);

      if(distance < 100){
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }

    });
  }

  slider.addEventListener("scroll", () => {
    requestAnimationFrame(updateActiveCard);
  });

  updateActiveCard();

}

});
