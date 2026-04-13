import {
  getAuth,
  updateEmail,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc
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

let currentUser;

/* ================= LOAD PROFILE ================= */
async function loadProfile() {

  currentUser = auth.currentUser;

  if (!currentUser) return alert("Non connecté");

  const docRef = doc(db, "Artists", currentUser.uid);
  const docSnap = await getDoc(docRef);

  const data = docSnap.data();

  document.getElementById("username").value = data.Username;
  document.getElementById("profileImage").src = data.profileImage;

  loadServices();
}

/* ================= LOAD SERVICES ================= */
async function loadServices() {

  const container = document.getElementById("servicesList");
  container.innerHTML = "";

  const snapshot = await getDocs(
    collection(db, "Artists", currentUser.uid, "Services")
  );

  snapshot.forEach(docSnap => {

    const s = docSnap.data();

    const div = document.createElement("div");
    div.className = "service-card";

    div.innerHTML = `
      <input class="title" value="${s.Title}" placeholder="Titre"/>
      <input class="price" value="${s.Price}" placeholder="Prix"/>
      <input class="desc" value="${s.Description || ""}" placeholder="Description"/>

      <input class="mp3" value="${s.mp3 || ""}" placeholder="Lien MP3"/>
      <input class="mp4" value="${s.mp4 || ""}" placeholder="Lien MP4"/>
      <input class="mov" value="${s.mov || ""}" placeholder="Lien MOV"/>
    `;

    container.appendChild(div);

  });

}

/* ================= ADD SERVICE ================= */
document.getElementById("addService").onclick = () => {

  const container = document.getElementById("servicesList");

  const div = document.createElement("div");
  div.className = "service-card";

  div.innerHTML = `
    <input class="title" placeholder="Titre"/>
    <input class="price" placeholder="Prix"/>
    <input class="desc" placeholder="Description"/>
    <input class="mp3" placeholder="Lien MP3"/>
    <input class="mp4" placeholder="Lien MP4"/>
    <input class="mov" placeholder="Lien MOV"/>
  `;

  container.appendChild(div);
};

/* ================= SAVE PROFILE ================= */
document.getElementById("saveProfile").onclick = async () => {

  const username = document.getElementById("username").value;

  /* 🔥 IMAGE */
  const file = document.getElementById("uploadImage").files[0];
  let imageUrl = "";

  if (file) {
    const storageRef = ref(storage, `artists/${currentUser.uid}/profile.jpg`);
    await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(storageRef);
  }

  /* 🔥 UPDATE ARTIST */
  await setDoc(doc(db, "Artists", currentUser.uid), {
    Username: username,
    profileImage: imageUrl
  }, { merge: true });

  /* 🔥 SAVE SERVICES */
  const services = document.querySelectorAll(".service-card");

  for (const s of services) {

    const title = s.querySelector(".title").value;
    const price = parseFloat(s.querySelector(".price").value);

    const desc = s.querySelector(".desc").value;
    const mp3 = s.querySelector(".mp3").value;
    const mp4 = s.querySelector(".mp4").value;
    const mov = s.querySelector(".mov").value;

    await addDoc(collection(db, "Artists", currentUser.uid, "Services"), {
      Title: title,
      Price: price,
      Description: desc,
      mp3,
      mp4,
      mov,
      IsActive: true,
      CreatedAt: new Date()
    });

  }

  alert("Profil mis à jour 🔥");
};

/* ================= CHANGE EMAIL ================= */
document.getElementById("changeEmail").onclick = async () => {
  const newEmail = prompt("Nouveau email");

  if (!newEmail) return;

  await updateEmail(auth.currentUser, newEmail);

  alert("Email mis à jour");
};

/* ================= CHANGE PASSWORD ================= */
document.getElementById("changePassword").onclick = async () => {
  const newPassword = prompt("Nouveau mot de passe");

  if (!newPassword) return;

  await updatePassword(auth.currentUser, newPassword);

  alert("Mot de passe mis à jour");
};

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", loadProfile);
