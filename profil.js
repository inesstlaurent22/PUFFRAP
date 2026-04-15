import {
  getAuth,
  updateEmail,
  updatePassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

const params = new URLSearchParams(window.location.search);
const artistIdFromURL = params.get("id");

let currentUser;

/* ================= LOAD PROFILE ================= */

function loadProfile() {

  onAuthStateChanged(auth, async (user) => {

    let artistId;

    /* 🔥 SI ON VIENT DE LA MAP */
    if (artistIdFromURL) {
      artistId = artistIdFromURL;
    } 
    /* 🔥 SINON → PROFIL USER */
    else if (user) {
      artistId = user.uid;
      currentUser = user;
    } 
    else {
      alert("Non connecté");
      window.location.href = "index.html";
      return;
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
    document.getElementById("artistEmail").value = data.Email || "";
    document.getElementById("artistAddress").value = data.Location?.Address || "";

    document.getElementById("artistInstagram").value = data.Socials?.Instagram || "";
    document.getElementById("artistTiktok").value = data.Socials?.TikTok || "";
    document.getElementById("artistPortfolio").value = data.Socials?.Portfolio || "";

    /* ================= SKILLS ================= */

    document.querySelectorAll(".skill").forEach(skill => {
      skill.classList.toggle(
        "active",
        data.Skills?.includes(skill.innerText)
      );
    });

    /* ================= LOAD DATA ================= */

    loadServices(artistId);
    loadCreations(artistId);

    /* 🔥 MODE VISITEUR */
    if (artistIdFromURL) {

      /* 🔒 désactive édition */
      document.querySelectorAll("input").forEach(i => i.disabled = true);

      document.getElementById("addService").style.display = "none";
      document.getElementById("addCreation").style.display = "none";
      document.getElementById("saveProfile").style.display = "none";
    }

  });
}

/* ================= LOAD SERVICES ================= */

async function loadServices(artistId) {

  const container = document.getElementById("servicesList");
  container.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "Artists", artistId, "Services")
  );

  snapshot.forEach(docSnap => {

    const s = docSnap.data();
    const id = docSnap.id;

    const div = createServiceCard(s, id);

    /* 🔒 MODE VISITEUR */
    if (artistIdFromURL) {
      div.querySelectorAll("input").forEach(i => i.disabled = true);
      div.querySelector(".delete-service")?.remove();
    }

    container.appendChild(div);

  });
}

/* ================= CREATE SERVICE CARD ================= */
function createServiceCard(s = {}, id = "") {

  const div = document.createElement("div");
  div.className = "service-card";
  div.dataset.id = id;

  div.innerHTML = `
    <input class="title" value="${s.Title || ""}" placeholder="Titre"/>
    <input class="price" value="${s.Price || ""}" placeholder="Prix"/>
    <input class="desc" value="${s.Description || ""}" placeholder="Description"/>

    <button class="delete-service">Supprimer</button>
  `;

  div.querySelector(".delete-service").onclick = async () => {
    if (id) {
      await deleteDoc(doc(db, "Artists", currentUser.uid, "Services", id));
    }
    div.remove();
  };

  return div;
}

/* ================= LOAD CREATIONS ================= */

async function loadCreations(artistId) {

  const container = document.getElementById("creationsList");
  container.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "Artists", artistId, "Creations")
  );

  snapshot.forEach(docSnap => {

    const c = docSnap.data();

    const div = document.createElement("div");
    div.className = "service-card";

    div.innerHTML = `
      <p>${c.Title || "Création"}</p>
      ${c.Type === "mp3" ? `<audio controls src="${c.FileURL}"></audio>` : ""}
      ${c.Type === "mp4" || c.Type === "mov" ? `<video controls src="${c.FileURL}" width="100%"></video>` : ""}
    `;

    container.appendChild(div);

  });
}

/* ================= ADD SERVICE ================= */
function addService() {
  const container = document.getElementById("servicesList");
  container.appendChild(createServiceCard());
}

/* ================= ADD CREATION ================= */
async function addCreation() {

  const file = document.getElementById("creationFile").files[0];
  const title = document.getElementById("creationTitle").value;

  if (!file) return alert("Ajoute un fichier");

  const type = file.type.includes("audio") ? "mp3" : "mp4";

  const storageRef = ref(storage, `artists/${currentUser.uid}/creations/${Date.now()}`);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await addDoc(collection(db, "Artists", currentUser.uid, "Creations"), {
    Title: title,
    FileURL: url,
    Type: type,
    CreatedAt: new Date(),
    IsActive: true
  });

  loadCreations();
}

/* ================= SAVE PROFILE ================= */
async function saveProfile() {

  const file = document.getElementById("uploadImage").files[0];
  let imageUrl = document.getElementById("profileImage").src;

  if (file) {
    const storageRef = ref(storage, `artists/${currentUser.uid}/profile.jpg`);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
  }

  await setDoc(doc(db, "Artists", currentUser.uid), {
    Username: document.getElementById("username").value,
    profileImage: imageUrl,
    FirstName: document.getElementById("artistFirstName").value,
    LastName: document.getElementById("artistLastName").value,
    Email: currentUser.email,
    Location: {
      Address: document.getElementById("artistAddress").value
    }
  }, { merge: true });

  /* 🔥 SAVE SERVICES */
  const services = document.querySelectorAll(".service-card");

  for (const s of services) {

    const id = s.dataset.id;

    const title = s.querySelector(".title").value;
    const price = parseFloat(s.querySelector(".price").value);
    const desc = s.querySelector(".desc").value;

    if (!title || isNaN(price)) continue;

    if (id) {
      await setDoc(doc(db, "Artists", currentUser.uid, "Services", id), {
        Title: title,
        Price: price,
        Description: desc
      }, { merge: true });
    } else {
      const newDoc = await addDoc(collection(db, "Artists", currentUser.uid, "Services"), {
        Title: title,
        Price: price,
        Description: desc,
        CreatedAt: new Date()
      });
      s.dataset.id = newDoc.id;
    }
  }

  alert("Profil mis à jour 🔥");
}

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", () => {

  loadProfile();

  document.getElementById("addService").onclick = addService;
  document.getElementById("addCreation").onclick = addCreation;
  document.getElementById("saveProfile").onclick = saveProfile;

  document.getElementById("backBtn").onclick = () => {
    window.location.href = "index.html";
  };

});
