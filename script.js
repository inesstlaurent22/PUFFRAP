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

/* ================= PREVIEW IMAGE ================= */

const imageInput = document.getElementById("artistImage");

if (imageInput) {
  imageInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      document.getElementById("previewImage").src = URL.createObjectURL(file);
    }
  };
}

/* ================= DROPDOWN CLICK ================= */

const toggleBtn = document.getElementById("signupToggle");
const dropdown = document.getElementById("dropdownMenu");

toggleBtn.onclick = (e) => {
  e.stopPropagation(); // empêche fermeture immédiate
  dropdown.classList.toggle("active");
};

/* CLICK OUTSIDE = fermer */
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target) && e.target !== toggleBtn) {
    dropdown.classList.remove("active");
  }
});

/* CLICK DANS LE MENU = NE PAS FERMER */
dropdown.addEventListener("click", (e) => {
  e.stopPropagation();
});

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

    const addressInput = document.getElementById("artistAddress");

    const lat = parseFloat(addressInput.dataset.lat);
    const lng = parseFloat(addressInput.dataset.lng);

    /* 🔥 VALIDATION BASIQUE */
    if (!email || !password || !username) {
      throw new Error("Remplis tous les champs obligatoires");
    }

    if (!lat || !lng) {
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

if (artistImage) {
  artistImage.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
    
    const previewImage = document.getElementById("previewImage");
    if (previewImage) {
    previewImage.src = URL.createObjectURL(file);
}
    }
  };
}


/* ================= AUTOCOMPLETE ADRESSE ================= */

const addressInput = document.getElementById("artistAddress");
const suggestionsBox = document.getElementById("addressSuggestions");

if (addressInput && suggestionsBox) {

  addressInput.addEventListener("input", async () => {

    const query = addressInput.value;

    if (query.length < 3) {
      suggestionsBox.innerHTML = "";
      return;
    }

    try {

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&countrycodes=fr&format=json`
      );

      const data = await res.json();

      suggestionsBox.innerHTML = "";

      data.slice(0, 5).forEach(place => {

        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.innerText = place.display_name;

        div.onclick = () => {
          addressInput.value = place.display_name;

          addressInput.dataset.lat = place.lat;
          addressInput.dataset.lng = place.lon;

          suggestionsBox.innerHTML = "";
        };

        suggestionsBox.appendChild(div);

      });

    } catch (error) {
      console.error("Erreur autocomplete:", error);
    }

  });

}

/* ================= MAP ================= */
let map;
let markers = [];

function initMap() {

  /* 🔥 INIT MAP */
  map = L.map('map').setView([48.8566, 2.3522], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  /* 🔥 GEOLOCALISATION */
  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        /* CENTRER */
        map.setView([lat, lng], 13);

        /* MARKER USER */
        L.marker([lat, lng])
          .addTo(map)
          .bindPopup("📍 Vous êtes ici")
          .openPopup();

        /* 🔥 BONUS : cercle premium */
        L.circle([lat, lng], {
          radius: 500,
          color: "#00ff99",
          fillColor: "#00ff99",
          fillOpacity: 0.1
        }).addTo(map);

      },

      (error) => {

        console.warn("Erreur géolocalisation :", error);

        /* FALLBACK PARIS */
        map.setView([48.8566, 2.3522], 12);

      }

    );

  } else {

    console.warn("Géolocalisation non supportée");

    map.setView([48.8566, 2.3522], 12);

  }

  /* 🔥 LOAD ARTISTS */
  loadArtists();

}

/* ================= LOAD ALL ARTISTS ================= */
async function loadArtists() {

  try {

    /* 🔥 CLEAR OLD MARKERS */
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const snapshot = await getDocs(collection(db, "Artists"));

    snapshot.forEach(docSnap => {

      const artist = docSnap.data();

      /* 🔥 SÉCURITÉ */
      if (!artist.Location || !artist.Location.Lat || !artist.Location.Lng) return;

      const lat = parseFloat(artist.Location.Lat);
      const lng = parseFloat(artist.Location.Lng);

      /* 🔥 CRÉATION MARKER */
      const marker = L.marker([lat, lng]).addTo(map);

      marker.bindPopup(`
        <div style="text-align:center;">
          
          <img src="${artist.profileImage || 'https://via.placeholder.com/100'}"
          style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />

          <h3>${artist.Username || "Artiste"}</h3>

          <p>⭐ ${artist.Rating || 0}</p>

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
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

function displayArtists(artists) {

  clearMarkers();

  artists.forEach(artist => {

    /* 🔥 SÉCURITÉ */
    if (!artist.Location) return;

    const lat = artist.Location.Lat;
    const lng = artist.Location.Lng;

    const marker = L.marker([lat, lng]).addTo(map);

    marker.bindPopup(`
      <div style="text-align:center;">
        
        <img src="${artist.profileImage || 'https://via.placeholder.com/100'}"
        style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />

        <h3>${artist.Username || "Artiste"}</h3>

        <p>⭐ ${artist.Rating || 0}</p>

        <p>
          📍 ${
            artist.distance 
            ? artist.distance.toFixed(1) + " km"
            : "Distance inconnue"
          }
        </p>

        <button 
          onclick="window.location.href='profil.html?id=${artist.id}'"
          style="margin-top:10px;padding:8px 12px;background:#00ff99;border:none;border-radius:8px;color:black;font-weight:bold;">
          Voir profil
        </button>

      </div>
    `);

    markers.push(marker);

  });
}

/* ================= SEARCH ================= */

document.getElementById("searchBtn").onclick = async () => {

  const cp = document.getElementById("searchInput").value;

  if (!cp) return alert("Entre un code postal");

  const coords = await getCoordsFromPostalCode(cp);

  if (!coords) return alert("Code postal invalide");

  map.setView([coords.lat, coords.lng], 13);

  const artists = await filterArtists(coords.lat, coords.lng);

  displayArtists(artists);
};

/* ================= INIT ================= */

initMap();
