/* NAVIGATION */

function goToApp(){
  document.body.style.opacity = "0";

  setTimeout(() => {
    window.location.href = "application.html";
  }, 400);
}

function goToMagazine(){
  alert("Magazine bientôt disponible");
}

/* FADE IN */
window.addEventListener("load", () => {
  document.body.style.opacity = "1";
  document.body.style.transition = "opacity 0.6s ease";
});
