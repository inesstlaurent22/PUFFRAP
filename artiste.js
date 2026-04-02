/* ================= DATA ================= */

const artistes = [
  {
    id:1,
    nom:"Léo Martin",
    image:"images/artiste1.jpg",
    services:["Mixage","Mastering","Freestyle"]
  },
  {
    id:2,
    nom:"Sarah K",
    image:"images/artiste2.jpg",
    services:["Chant","Cover"]
  },
  {
    id:3,
    nom:"DJ Nox",
    image:"images/artiste3.jpg",
    services:["DJ Set","Soirée"]
  }
];

/* ================= GET ID ================= */

const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

const artiste = artistes.find(a => a.id === id);

/* ================= LOAD ================= */

document.getElementById("artistImg").src = artiste.image;
document.getElementById("artistName").textContent = artiste.nom;

/* SERVICES */
const servicesDiv = document.getElementById("services");
artiste.services.forEach(s => {
  const span = document.createElement("span");
  span.textContent = s;
  servicesDiv.appendChild(span);
});

/* ================= NOTES ================= */

function getRatings(id){
  return JSON.parse(localStorage.getItem("ratings_"+id)) || [];
}

function getAverage(id){
  const r = getRatings(id);
  if(!r.length) return "0.0";
  return (r.reduce((a,b)=>a+b)/r.length).toFixed(1);
}

document.getElementById("rating").textContent = getAverage(id);

/* ================= COMMENTS ================= */

function getComments(id){
  return JSON.parse(localStorage.getItem("comments_"+id)) || [];
}

const commentsDiv = document.getElementById("comments");

getComments(id).forEach(c => {
  const div = document.createElement("div");
  div.innerHTML = `<b>${c.pseudo}</b>: ${c.text}`;
  commentsDiv.appendChild(div);
});

/* ================= RESERVATION ================= */

function book(){

  const date = document.getElementById("date").value;

  if(!date){
    alert("Choisis une date");
    return;
  }

  let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

  reservations.push({
    artisteId: id,
    date: date
  });

  localStorage.setItem("reservations", JSON.stringify(reservations));

  alert("Réservation enregistrée !");
}
