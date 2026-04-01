/* ================= CARTE DARK ================= */

const map = L.map('map').setView([48.8566, 2.3522], 5);

L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_dark/{z}/{x}/{y}{r}.png', {
  attribution: ''
}).addTo(map);

/* ================= ARTISTES ================= */

const artistes = [
  { id:1, nom:"Punchologue", coords:[48.8566,2.3522], insta:"#"},
  { id:2, nom:"Fumsecc", coords:[45.7640,4.8357], insta:"#"},
  { id:3, nom:"Scott", coords:[43.2965,5.3698], insta:"#"},
  { id:4, nom:"Mr Below", coords:[50.6292,3.0573], insta:"#"}
];

/* ================= FAVORIS ================= */

let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

function toggleFavori(id){
  if(favoris.includes(id)){
    favoris = favoris.filter(f => f !== id);
  } else {
    favoris.push(id);
  }
  localStorage.setItem("favoris", JSON.stringify(favoris));
  location.reload();
}

/* rendre la fonction accessible au HTML */
window.toggleFavori = toggleFavori;

/* ================= MARKERS ================= */

artistes.forEach(artiste => {

  const isFav = favoris.includes(artiste.id);

  const marker = L.marker(artiste.coords).addTo(map);

  marker.bindPopup(`
    <div>
      <h3>${artiste.nom}</h3>
      <a href="${artiste.insta}" target="_blank">Instagram</a><br><br>
      <span class="favorite" onclick="toggleFavori(${artiste.id})">
        ${isFav ? "❤️" : "🤍"}
      </span>
    </div>
  `);
});

/* ================= GEOLOCALISATION ================= */

function locateUser(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(position => {

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      map.setView([lat, lon], 10);

      L.marker([lat, lon]).addTo(map)
        .bindPopup("📍 Vous êtes ici")
        .openPopup();

    });
  }
}

document.getElementById("locateBtn").addEventListener("click", locateUser);

/* AUTO */
locateUser();
