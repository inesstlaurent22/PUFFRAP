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

/* ================= LOAD ================= */

function loadArtist() {

  onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    if (user && user.uid === artistId) {
      isOwner = true;
    }

    const docSnap = await getDoc(doc(db, "Artists", artistId));

    if (!docSnap.exists()) {
      alert("Artiste introuvable");
      return;
    }

    const data = docSnap.data();

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

    Username: document.getElementById("username").value,

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
