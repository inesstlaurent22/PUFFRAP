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
