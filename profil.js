import {
  getAuth,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

/* ================= INIT ================= */

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

let currentUser;

/* ================= LOAD PROFILE ================= */

function loadProfile() {

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      alert("Non connecté");
      window.location.href = "index.html";
      return;
    }

    currentUser = user;

    try {

      const docSnap = await getDoc(doc(db, "Artists", user.uid));

      if (!docSnap.exists()) return;

      const data = docSnap.data();

      /* 🔥 DISPLAY */

      document.getElementById("username").value = data.Username || "";
      document.getElementById("profileImage").src = data.profileImage || "";

      document.getElementById("artistFirstName").value = data.FirstName || "";
      document.getElementById("artistLastName").value = data.LastName || "";
      document.getElementById("artistEmail").value = data.Email || "";
      document.getElementById("artistAddress").value = data.Location?.Address || "";

    } catch (error) {
      console.error("Erreur loadProfile:", error);
    }

  });

}

/* ================= SAVE PROFILE ================= */

async function saveProfile() {

  if (!currentUser) return alert("Utilisateur non connecté");

  try {

    const file = document.getElementById("uploadImage").files[0];
    let imageUrl = document.getElementById("profileImage").src;

    /* 🔥 IMAGE */
    if (file) {
      const storageRef = ref(storage, `artists/${currentUser.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    /* 🔥 UPDATE FIRESTORE */
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

    alert("Profil mis à jour 🔥");

  } catch (error) {
    console.error("Erreur saveProfile:", error);
    alert("Erreur lors de la sauvegarde");
  }

}

/* ================= CHANGE EMAIL ================= */

document.getElementById("changeEmail").onclick = async () => {

  const newEmail = prompt("Nouveau email");
  const password = prompt("Confirme ton mot de passe");

  if (!newEmail || !password) return;

  try {

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      password
    );

    await reauthenticateWithCredential(currentUser, credential);

    await updateEmail(currentUser, newEmail);

    /* 🔥 UPDATE FIRESTORE */
    await setDoc(doc(db, "Artists", currentUser.uid), {
      Email: newEmail
    }, { merge: true });

    alert("Email mis à jour ✅");

  } catch (error) {
    console.error("Erreur changement email:", error);
    alert(error.message);
  }

};

/* ================= CHANGE PASSWORD ================= */

document.getElementById("changePassword").onclick = async () => {

  const newPassword = prompt("Nouveau mot de passe");
  const password = prompt("Confirme ton mot de passe actuel");

  if (!newPassword || !password) return;

  try {

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      password
    );

    await reauthenticateWithCredential(currentUser, credential);

    await updatePassword(currentUser, newPassword);

    alert("Mot de passe mis à jour ✅");

  } catch (error) {
    console.error("Erreur changement password:", error);
    alert(error.message);
  }

};

/* ================= NAVIGATION ================= */

document.getElementById("backBtn").onclick = () => {
  window.location.href = "index.html";
};

/* ================= INIT ================= */

window.addEventListener("DOMContentLoaded", () => {

  loadProfile();

  const saveBtn = document.getElementById("saveProfile");

  if (saveBtn) {
    saveBtn.onclick = saveProfile;
  }

});
