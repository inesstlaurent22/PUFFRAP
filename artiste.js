import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

const params = new URLSearchParams(window.location.search);
const artistId = params.get("id");

let currentUser;
let isOwner = false;

function toggleMode() {

  if (isOwner) {
    document.querySelectorAll(".edit-only").forEach(el => {
      el.style.display = "block";
    });
  } else {
    document.querySelectorAll(".client-only").forEach(el => {
      el.style.display = "block";
    });

    /* désactive inputs */
    document.querySelectorAll("input").forEach(i => i.disabled = true);
  }

}
/* ================= LOAD ================= */

function loadArtist() {

  onAuthStateChanged(auth, async (user) => {

    try {

      /* 🔥 CHECK ID */
      if (!artistId) {
        alert("Aucun artiste spécifié");
        window.location.href = "index.html";
        return;
      }

      currentUser = user || null;

      /* 🔥 RESET OWNER */
      isOwner = false;

      if (user && user.uid === artistId) {
        isOwner = true;
      }

      /* 🔥 GET DATA */
      const docRef = doc(db, "Artists", artistId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("Artiste introuvable");
        window.location.href = "index.html";
        return;
      }

      const data = docSnap.data();

      /* 🔥 DISPLAY */
      document.getElementById("artistName").value = data.ArtistName || "";
      document.getElementById("artistFirstName").value = data.FirstName || "";
      document.getElementById("artistLastName").value = data.LastName || "";
      document.getElementById("profileImage").src = data.profileImage || "";

      document.getElementById("artistFirstName").value = data.FirstName || "";
      document.getElementById("artistLastName").value = data.LastName || "";
      document.getElementById("artistAddress").value = data.Location?.Address || "";

      /* 🔥 MODE */
      toggleMode();

      /* 🔥 LOAD DATA */
      loadServices();
      loadCreations();

    } catch (error) {

      console.error("Erreur loadArtist:", error);
      alert("Erreur lors du chargement du profil");

    }

  });

}

    /* ================= DISPLAY ================= */

    document.getElementById("username").value = data.Username || "";
    document.getElementById("profileImage").src = data.profileImage || "";

    document.getElementById("artistFirstName").value = data.FirstName || "";
    document.getElementById("artistLastName").value = data.LastName || "";
    document.getElementById("artistAddress").value = data.Location?.Address || "";

    /* ================= MODE CLIENT ================= */

    if (!isOwner) {
      document.querySelectorAll("input").forEach(i => i.disabled = true);
      document.getElementById("saveProfile").style.display = "none";
    }

    loadServices();
    loadCreations();

  });

}

/* ================= SERVICES ================= */

async function loadServices() {

  const container = document.getElementById("servicesList");
  container.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "Artists", artistId, "Services")
  );

  snapshot.forEach(docSnap => {

    const s = docSnap.data();

    const div = document.createElement("div");

    div.innerHTML = `
      <div>${s.Title}</div>
      <div>${s.Price}€</div>
      <div>${s.Description || ""}</div>
    `;

    container.appendChild(div);

  });

}

/* ================= CREATIONS ================= */

async function loadCreations() {

  const container = document.getElementById("creationsList");
  container.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "Artists", artistId, "Creations")
  );

  snapshot.forEach(docSnap => {

    const c = docSnap.data();

    const fullName = `${data.FirstName} ${data.LastName}`;
    const stageName = data.ArtistName;

    const div = document.createElement("div");

    div.innerHTML = `
      <p>${c.Title || ""}</p>

      ${
        c.Type === "mp3"
        ? `<audio controls src="${c.FileURL}"></audio>`
        : ""
      }

      ${
        c.Type === "mp4" || c.Type === "mov"
        ? `<video controls src="${c.FileURL}" width="100%"></video>`
        : ""
      }
    `;

    container.appendChild(div);

  });

}

/* ================= SAVE (OWNER ONLY) ================= */

document.getElementById("saveProfile").onclick = async () => {

  if (!isOwner) return;

  await setDoc(doc(db, "Artists", artistId), {

  ArtistName: document.getElementById("artistName").value,
  FirstName: document.getElementById("artistFirstName").value,
  LastName: document.getElementById("artistLastName").value,

  Location: {
    Address: document.getElementById("artistAddress").value
  }

}, { merge: true });

  alert("Profil mis à jour 🔥");

};

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", loadArtist);
