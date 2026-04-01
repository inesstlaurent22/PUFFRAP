const slides = document.querySelector(".slides");
let index = 0;

let startX = 0;
let endX = 0;

const totalSlides = document.querySelectorAll(".slide").length;

// TOUCH START
slides.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});

// TOUCH END
slides.addEventListener("touchend", (e) => {
  endX = e.changedTouches[0].clientX;
  handleSwipe();
});

function handleSwipe() {
  if (startX - endX > 50) {
    nextSlide();
  } else if (endX - startX > 50) {
    prevSlide();
  }
}

function nextSlide() {
  index = (index + 1) % totalSlides;
  updateSlide();
}

function prevSlide() {
  index = (index - 1 + totalSlides) % totalSlides;
  updateSlide();
}

function updateSlide() {
  slides.style.transform = `translateX(-${index * 100}%)`;
}
