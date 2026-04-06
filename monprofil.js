/* ================= IMPORTS FIREBASE (EN HAUT OBLIGATOIRE) ================= */

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

/* ================= ELEMENTS ================= */

const preview = document.getElementById("profilePreview");
const inputFile = document.getElementById("profileImage");
const uploadBtn = document.getElementById("uploadBtn");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
const productsList = document.getElementById("productsList");

let mediaFiles = [];

/* ================= PHOTO ================= */

uploadBtn.onclick = () => inputFile?.click();

inputFile.onchange = () => {
  const file = inputFile.files?.[0];
  if(!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    if(preview) preview.src = reader.result;
    localStorage.setItem("photo", reader.result);
  };

  reader.readAsDataURL(file);
};

/* ================= MEDIA ================= */

mediaInput.onchange = () => {
  const files = Array.from(mediaInput.files || []);

  if (mediaFiles.length + files.length > 5) {
    alert("Max 5 fichiers");
    return;
  }

  files.forEach(file => {
    mediaFiles.push(file);

    const url = URL.createObjectURL(file);

    if (file.type.includes("video")) {
      const video = document.createElement("video");
      video.src = url;
      video.controls = true;
      mediaPreview.appendChild(video);
    }

    if (file.type.includes("audio")) {
      const audio = document.createElement("audio");
      audio.src = url;
      audio.controls = true;
      mediaPreview.appendChild(audio);
    }
  });
};

/* ================= PRODUITS ================= */

document.getElementById("addProduct").onclick = () => {
  const div = document.createElement("div");
  div.className = "product";

  div.innerHTML = `
    <input placeholder="Nom produit">
    <input type="number" placeholder="Prix">
  `;

  productsList.appendChild(div);

  // focus UX
  setTimeout(() => div.querySelector("input")?.focus(), 50);
};

/* ================= SAVE ================= */

document.getElementById("saveProfile").onclick = async () => {

  /* ===== INPUTS ===== */
  const nom = document.getElementById("nom")?.value || "";
  const prenom = document.getElementById("prenom")?.value || "";
  const email = document.getElementById("email")?.value || "";
  const metier = document.getElementById("metier")?.value || "";
  const instagram = document.getElementById("instagram")?.value || "";
  const portfolio = document.getElementById("portfolio")?.value || "";
  const tiktok = document.getElementById("tiktok")?.value || "";

  /* ===== RECUP PRODUITS ===== */
  const products = [];

  document.querySelectorAll(".product").forEach(p => {
    const inputs = p.querySelectorAll("input");

    const name = inputs[0]?.value.trim();
    const price = parseFloat(inputs[1]?.value);

    if(name && !isNaN(price)){
      products.push({ name, price });
    }
  });

  /* ===== LOCAL STORAGE ===== */
  const data = {
    nom,
    prenom,
    email,
    metier,
    instagram,
    portfolio,
    tiktok,
    products
  };

  localStorage.setItem("profile", JSON.stringify(data));

  /* ===== FIRESTORE ===== */
/* ===== FIRESTORE SAVE COMPLET ===== */
const user = auth.currentUser;

if(user){
  try{

    await updateDoc(doc(db, "artists", user.uid), {

      /* IDENTITÉ */
      nom,
      prenom,
      email,

      /* PROFIL */
      produits: metier, // 🔥 correspond à ton badge actuel
      metier,           // (optionnel si tu veux garder les deux)

      /* LIENS */
      instagram,
      portfolio,
      tiktok,

      /* SERVICES */
      services: products,

      /* TIMESTAMP */
      updatedAt: Date.now()

    });

  } catch(e){
    console.error("Erreur Firestore:", e);
  }
}

/* ================= LOAD ================= */

window.onload = () => {

  let data = null;

  try {
    data = JSON.parse(localStorage.getItem("profile"));
  } catch(e){
    console.error("Erreur parsing localStorage:", e);
  }

  const nomInput = document.getElementById("nom");
  const prenomInput = document.getElementById("prenom");
  const emailInput = document.getElementById("email");
  const metierInput = document.getElementById("metier");
  const instagramInput = document.getElementById("instagram");
  const portfolioInput = document.getElementById("portfolio");
  const tiktokInput = document.getElementById("tiktok");

  if (data) {
    if(nomInput) nomInput.value = data.nom || "";
    if(prenomInput) prenomInput.value = data.prenom || "";
    if(emailInput) emailInput.value = data.email || "";
    if(metierInput) metierInput.value = data.metier || "";
    if(instagramInput) instagramInput.value = data.instagram || "";
    if(portfolioInput) portfolioInput.value = data.portfolio || "";
    if(tiktokInput) tiktokInput.value = data.tiktok || "";
  }

  /* PHOTO */
  const photo = localStorage.getItem("photo");
  if (photo && preview) preview.src = photo;

  /* PRODUITS */
  if (data?.products && productsList) {
    data.products.forEach(p => {
      const div = document.createElement("div");
      div.className = "product";

      div.innerHTML = `
        <input value="${p.name || ""}" placeholder="Nom produit">
        <input type="number" value="${p.price || ""}" placeholder="Prix">
      `;

      productsList.appendChild(div);
    });
  }
};

/* ================= LOGOUT ================= */

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "application.html";
};
