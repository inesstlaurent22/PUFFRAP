/* ================= FIREBASE ================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  setDoc,
  doc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

import { fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ================= CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyA4IF_NqUVXXQxMWz3F1SM32NN5vLUpRoI",
  authDomain: "puffrap-46658.firebaseapp.com",
  projectId: "puffrap-46658",
  storageBucket: "puffrap-46658.appspot.com",
  messagingSenderId: "217849878785",
  appId: "1:217849878785:web:e4e7d90ae3b77a19e76300"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ================= MODALS ================= */

document.getElementById("loginBtn").onclick = () => {
  document.getElementById("loginModal").style.display = "flex";
};

document.getElementById("signupClient").onclick = () => {
  document.getElementById("signupClientModal").style.display = "flex";
};

document.getElementById("signupArtist").onclick = () => {
  document.getElementById("signupArtistModal").style.display = "flex";
};

window.onclick = (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
};


/* ================= DROPDOWN CLICK ================= */

const toggleBtn = document.getElementById("signupToggle");
const dropdown = document.getElementById("dropdownMenu");

if (toggleBtn && dropdown) {

  toggleBtn.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  };

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== toggleBtn) {
      dropdown.classList.remove("active");
    }
  });

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

}

/* ================= LOGIN ================= */

document.getElementById("loginSubmit").onclick = async () => {
  try {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    await signInWithEmailAndPassword(auth, email, password);

    alert("Connexion réussie 🔥");
    location.reload();

  } catch (error) {
    alert(error.message);
  }
};

/* ================= SIGNUP CLIENT ================= */

document.getElementById("createClient").onclick = async () => {
  try {

    const email = document.getElementById("clientEmail").value;
    const password = document.getElementById("clientPassword").value;
    const name = document.getElementById("clientUsername").value;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "Users", user.uid), {
      Mail: email,
      Name: name,
      Role: "client",
      CreatedAt: new Date()
    });

    alert("Client créé ✅");
    location.reload();

  } catch (error) {
    alert(error.message);
  }
};

/* ================= VALIDATION URL ================= */

function isValidURL(url) {
  return url.startsWith("https://");
}

/* ================= GEOLOCALISATION (CODE POSTAL → GPS) ================= */

async function getCoordinatesFromPostal(postal) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${postal}&country=France&format=json`);
  const data = await res.json();

  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  } else {
    throw new Error("Code postal invalide");
  }
}

/* ================= SIGNUP ARTIST ================= */
document.getElementById("createArtist").onclick = async () => {
  try {

    const email = document.getElementById("artistEmail").value.trim();
    const password = document.getElementById("artistPassword").value.trim();
    const username = document.getElementById("artistUsername").value.trim();

    const instagram = document.getElementById("artistInstagram").value.trim();
    const tiktok = document.getElementById("artistTiktok").value.trim();
    const portfolio = document.getElementById("artistPortfolio").value.trim();

    const file = document.getElementById("artistImage").files[0];

    const lat = parseFloat(document.getElementById("artistAddress").dataset.lat);
    const lng = parseFloat(document.getElementById("artistAddress").dataset.lng);

    /* 🔥 VALIDATION BASIQUE */
    if (!email || !password || !username) {
      throw new Error("Remplis tous les champs obligatoires");
    }

    if (isNaN(lat) || isNaN(lng)) {
  throw new Error("Choisis une adresse dans les suggestions");
}

    /* 🔥 VALIDATION URL */
    if (instagram && !instagram.startsWith("https://")) throw new Error("Instagram invalide");
    if (tiktok && !tiktok.startsWith("https://")) throw new Error("TikTok invalide");
    if (portfolio && !portfolio.startsWith("https://")) throw new Error("Portfolio invalide");

    /* 🔥 SKILLS */
    const skills = getSelectedSkills();

    /* 🔥 CHECK EMAIL EXISTANT */
    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (methods.length > 0) {

      try {
        await signInWithEmailAndPassword(auth, email, password);

        alert("Connexion automatique 🔥");
        location.reload();
        return;

      } catch {
        throw new Error("Mot de passe incorrect ❌");
      }
    }

    /* 🔥 CREATE USER */
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    /* 🔥 UPLOAD IMAGE */
    let imageUrl = "";

    if (file) {
      const storageRef = ref(storage, `artists/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    /* 🔥 FIRESTORE USERS */
    await setDoc(doc(db, "Users", user.uid), {
      Mail: email,
      Name: username,
      Role: "artist",
      CreatedAt: new Date()
    });

    /* 🔥 FIRESTORE ARTIST */
    await setDoc(doc(db, "Artists", user.uid), {
      UserID: user.uid,
      Username: username,
      Email: email,
      profileImage: imageUrl,
      Skills: skills,

      Location: {
        Lat: lat,
        Lng: lng
      },

      Socials: {
        Instagram: instagram,
        TikTok: tiktok,
        Portfolio: portfolio
      },

      Rating: 0,
      isAvailable: true,
      reviewCount: 0,
      CreatedAt: new Date()
    });

    /* 🔥 AJOUT MARKER */
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup("Ton profil")
      .openPopup();

    map.setView([lat, lng], 13);

    alert("Artiste créé 🔥");

  } catch (error) {
    alert(error.message);
  }
};

/* ================= SKILLS CLICK ================= */

const skills = document.querySelectorAll(".skill");

skills.forEach(skill => {
  skill.addEventListener("click", () => {
    skill.classList.toggle("active");
  });
});

/* ================= GET SKILLS ================= */

function getSelectedSkills() {
  return Array.from(document.querySelectorAll(".skill.active"))
    .map(s => s.innerText);
}

/* ================= PHOTO PREVIEW ================= */
const artistImage = document.getElementById("artistImage");
const previewImage = document.getElementById("previewImage");

if (artistImage && previewImage) {

  artistImage.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (!file) return;

    /* 🔥 PREVIEW IMAGE */
    const imageURL = URL.createObjectURL(file);
    previewImage.src = imageURL;

    /* 🔥 CLEAN MEMORY (IMPORTANT) */
    previewImage.onload = () => {
      URL.revokeObjectURL(imageURL);
    };

  });

}

/* ================= AUTOCOMPLETE ADRESSE ================= */
const addressInput = document.getElementById("artistAddress");
const suggestionsBox = document.getElementById("addressSuggestions");

let debounceTimeout;

if (addressInput && suggestionsBox) {

  addressInput.addEventListener("input", () => {

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(async () => {

      const query = addressInput.value.trim();

      if (query.length < 3) {
        suggestionsBox.innerHTML = "";
        return;
      }

      try {

        /* 🔥 LOADING UX */
        suggestionsBox.innerHTML = "<div class='suggestion-item'>Recherche...</div>";

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=fr&format=json`,
          {
            headers: {
              "Accept": "application/json"
            }
          }
        );

        const data = await res.json();

        suggestionsBox.innerHTML = "";

        if (data.length === 0) {
          suggestionsBox.innerHTML = "<div class='suggestion-item'>Aucun résultat</div>";
          return;
        }

        data.slice(0, 5).forEach(place => {

          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.innerText = place.display_name;

          div.addEventListener("click", () => {

            addressInput.value = place.display_name;

            addressInput.dataset.lat = place.lat;
            addressInput.dataset.lng = place.lon;

            suggestionsBox.innerHTML = "";

          });

          suggestionsBox.appendChild(div);

        });

      } catch (error) {
        console.error("Erreur autocomplete:", error);
        suggestionsBox.innerHTML = "<div class='suggestion-item'>Erreur de recherche</div>";
      }

    }, 300); // 🔥 debounce 300ms

  });

  /* 🔥 CLIQUE EN DEHORS → FERME */
  document.addEventListener("click", (e) => {
    if (!addressInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.innerHTML = "";
    }
  });

}

/* ================= MAP ================= */
let map;
let markers = [];
let userMarker;
let userCircle;

function initMap() {

  /* 🔥 EVITE DOUBLE INIT */
  if (map) {
    map.remove();
    map = null;
  }

  /* 🔥 INIT MAP */
  map = L.map('map', {
    zoomControl: false // option premium
  }).setView([48.8566, 2.3522], 12);

  /* 🔥 MAP BLANCHE PREMIUM */
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap & CartoDB'
}).addTo(map);

  /* 🔥 GEOLOCALISATION */
  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        /* 🔥 CENTRER MAP */
        map.setView([lat, lng], 13);

        /* 🔥 CLEAN ancien marker */
        if (userMarker) map.removeLayer(userMarker);
        if (userCircle) map.removeLayer(userCircle);

        /* 🔥 ICON USER PREMIUM */
        const userIcon = L.divIcon({
          html: `
            <div style="
              width:20px;
              height:20px;
              background:#00ff99;
              border-radius:50%;
              box-shadow:0 0 15px #00ff99;
              border:3px solid black;
            "></div>
          `,
          className: ""
        });

        /* 🔥 MARKER USER */
        userMarker = L.marker([lat, lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("📍 Vous êtes ici")
          .openPopup();

        /* 🔥 CERCLE PREMIUM */
        userCircle = L.circle([lat, lng], {
          radius: 500,
          color: "#00ff99",
          fillColor: "#00ff99",
          fillOpacity: 0.08,
          weight: 2
        }).addTo(map);

        /* 🔥 LOAD ARTISTS APRÈS GEO */
        loadArtists();

      },

      (error) => {

        console.warn("Erreur géolocalisation :", error);

        /* 🔥 FALLBACK PARIS */
        map.setView([48.8566, 2.3522], 12);

        loadArtists();

      },

      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }

    );

  } else {

    console.warn("Géolocalisation non supportée");

    map.setView([48.8566, 2.3522], 12);

    loadArtists();

  }

}

/* ================= LOAD ALL ARTISTS ================= */
async function loadArtists() {

  try {

    /* 🔥 CLEAR OLD MARKERS */
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const snapshot = await getDocs(collection(db, "Artists"));

    /* 🔥 ICON GOLD PREMIUM */
    const artistIcon = L.divIcon({
      html: `
        <div style="
          width:18px;
          height:18px;
          background:#D4AF37;
          border-radius:50%;
          box-shadow:0 0 12px #D4AF37;
          border:2px solid black;
        "></div>
      `,
      className: ""
    });

    snapshot.forEach(docSnap => {

      const artist = docSnap.data();
      const id = docSnap.id;

      /* 🔥 SÉCURITÉ DATA */
      if (!artist.Location || !artist.Location.Lat || !artist.Location.Lng) return;

      const lat = parseFloat(artist.Location.Lat);
      const lng = parseFloat(artist.Location.Lng);

      if (isNaN(lat) || isNaN(lng)) return;

      /* 🔥 MARKER PREMIUM */
      const marker = L.marker([lat, lng], { icon: artistIcon }).addTo(map);

      /* 🔥 POPUP PREMIUM */
      marker.bindPopup(`
        <div style="text-align:center;">
          
          <img src="${artist.profileImage || 'https://via.placeholder.com/100'}"
          style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />

          <h3 style="margin:5px 0;">${artist.Username || "Artiste"}</h3>

          <p style="color:#D4AF37;">⭐ ${artist.Rating || 0}</p>

          <button 
            onclick="window.location.href='profil.html?id=${id}'"
            style="
              margin-top:8px;
              padding:6px 10px;
              background:#00ff99;
              border:none;
              border-radius:6px;
              font-weight:bold;
              cursor:pointer;
            ">
            Voir profil
          </button>

        </div>
      `);

      markers.push(marker);

    });

  } catch (error) {
    console.error("Erreur loadArtists:", error);
  }

}

/* ================= GEO CODE ================= */

async function getCoordsFromPostalCode(cp) {

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=France&format=json`
  );

  const data = await response.json();

  if (data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}

/* ================= DISTANCE ================= */

function getDistance(lat1, lon1, lat2, lon2) {

  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ================= FILTER ================= */
async function filterArtists(userLat, userLng) {

  const snapshot = await getDocs(collection(db, "Artists"));

  let artists = [];

  snapshot.forEach(docSnap => {

    const artist = docSnap.data();

    /* 🔥 CHECK DATA FIRESTORE */
    if (!artist.Location || !artist.Location.Lat || !artist.Location.Lng) return;

    const lat = parseFloat(artist.Location.Lat);
    const lng = parseFloat(artist.Location.Lng);

    const distance = getDistance(
      userLat,
      userLng,
      lat,
      lng
    );

    artists.push({
      id: docSnap.id,
      ...artist,
      distance
    });

  });

  /* 🔥 TRI PAR DISTANCE (AIRBNB STYLE) */
  artists.sort((a, b) => a.distance - b.distance);

  return artists;
}

/* ================= DISPLAY ================= */
function clearMarkers() {
  if (!map) return;

  markers.forEach(m => {
    if (m) map.removeLayer(m);
  });

  markers = [];
}

function displayArtists(artists) {

  clearMarkers();

  /* 🔥 ICON GOLD PREMIUM */
  const artistIcon = L.divIcon({
    html: `
      <div style="
        width:18px;
        height:18px;
        background:#D4AF37;
        border-radius:50%;
        box-shadow:0 0 12px #D4AF37;
        border:2px solid black;
      "></div>
    `,
    className: ""
  });

  artists.forEach(artist => {

    /* 🔥 SÉCURITÉ DATA */
    if (!artist.Location || !artist.Location.Lat || !artist.Location.Lng) return;

    const lat = parseFloat(artist.Location.Lat);
    const lng = parseFloat(artist.Location.Lng);

    if (isNaN(lat) || isNaN(lng)) return;

    /* 🔥 MARKER PREMIUM */
    const marker = L.marker([lat, lng], { icon: artistIcon }).addTo(map);

    /* 🔥 POPUP PREMIUM */
    marker.bindPopup(`
      <div style="text-align:center;">
        
        <img src="${artist.profileImage || 'https://via.placeholder.com/100'}"
        style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />

        <h3 style="margin:5px 0;">${artist.Username || "Artiste"}</h3>

        <p style="color:#D4AF37;">⭐ ${artist.Rating || 0}</p>

        <p style="font-size:12px;">
          📍 ${
            artist.distance 
            ? artist.distance.toFixed(1) + " km"
            : "Distance inconnue"
          }
        </p>

        <button 
          onclick="window.location.href='profil.html?id=${artist.id}'"
          style="
            margin-top:8px;
            padding:6px 10px;
            background:#00ff99;
            border:none;
            border-radius:6px;
            font-weight:bold;
            cursor:pointer;
          ">
          Voir profil
        </button>

      </div>
    `);

    markers.push(marker);

  });
}

/* ================= SEARCH ================= */
const searchBtn = document.getElementById("searchBtn");

if (searchBtn) {
  searchBtn.onclick = async () => {

    const cp = document.getElementById("searchInput").value;

    if (!cp) return alert("Entre un code postal");

    const coords = await getCoordsFromPostalCode(cp);

    if (!coords) return alert("Code postal invalide");

    map.setView([coords.lat, coords.lng], 13);

    const artists = await filterArtists(coords.lat, coords.lng);

    displayArtists(artists);
  };
}

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {
  initMap();
});
