/* ================= CARTE ================= */

const map = L.map('map').setView([48.8566, 2.3522], 5); // Paris

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: ''
}).addTo(map);

/* ================= ARTISTES ================= */

const artistes = [
  {
    nom: "Punchologue",
    ville: "Paris",
    coords: [48.8566, 2.3522],
    insta: "https://instagram.com"
  },
  {
    nom: "Fumsecc",
    ville: "Lyon",
    coords: [45.7640, 4.8357],
    insta: "https://instagram.com"
  },
  {
    nom: "Scott",
    ville: "Marseille",
    coords: [43.2965, 5.3698],
    insta: "https://instagram.com"
  },
  {
    nom: "Mr Below",
    ville: "Lille",
    coords: [50.6292, 3.0573],
    insta: "https://instagram.com"
  }
];

/* ================= MARKERS ================= */

artistes.forEach(artiste => {

  const marker = L.marker(artiste.coords).addTo(map);

  marker.bindPopup(`
    <div style="text-align:center">
      <h3>${artiste.nom}</h3>
      <p>${artiste.ville}</p>
      <a href="${artiste.insta}" target="_blank">Instagram</a>
    </div>
  `);

});
