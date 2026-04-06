const preview = document.getElementById("profilePreview");
const inputFile = document.getElementById("profileImage");
const uploadBtn = document.getElementById("uploadBtn");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
const productsList = document.getElementById("productsList");

let mediaFiles = [];

/* PHOTO */
uploadBtn.onclick = () => inputFile.click();

inputFile.onchange = () => {
  const file = inputFile.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    preview.src = reader.result;
    localStorage.setItem("photo", reader.result);
  };

  reader.readAsDataURL(file);
};

/* MEDIA */
mediaInput.onchange = () => {
  const files = Array.from(mediaInput.files);

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

/* PRODUITS */
document.getElementById("addProduct").onclick = () => {
  const div = document.createElement("div");
  div.className = "product";

  div.innerHTML = `
    <input placeholder="Nom produit">
    <input type="number" placeholder="Prix">
  `;

  productsList.appendChild(div);
};

/* SAVE */
document.getElementById("saveProfile").onclick = () => {

  /* ===== FIRESTORE SAVE PRODUITS ===== */
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

document.getElementById("saveProfile").onclick = async () => {

  /* ===== RECUP PRODUITS ===== */
  const products = [];

  document.querySelectorAll(".product").forEach(p => {
    const inputs = p.querySelectorAll("input");

    const name = inputs[0].value.trim();
    const price = parseFloat(inputs[1].value);

    if(name && !isNaN(price)){
      products.push({ name, price });
    }
  });

  /* ===== LOCAL STORAGE (tu gardes) ===== */
  const data = {
    nom: nom.value,
    prenom: prenom.value,
    email: email.value,
    metier: metier.value,
    instagram: instagram.value,
    portfolio: portfolio.value,
    tiktok: tiktok.value,
    products
  };

  localStorage.setItem("profile", JSON.stringify(data));

  /* ===== FIRESTORE (IMPORTANT) ===== */
  const user = auth.currentUser;

  if(user){
    try{
      await updateDoc(doc(db, "artists", user.uid), {
        services: products
      });
    } catch(e){
      console.error("Erreur update Firestore:", e);
    }
  }

  alert("Profil enregistré");
};

  /* ===== RECUP PRODUITS ===== */
  const products = [];

  document.querySelectorAll(".product").forEach(p => {
    const inputs = p.querySelectorAll("input");

    const name = inputs[0].value.trim();
    const price = parseFloat(inputs[1].value);

    if(name && !isNaN(price)){
      products.push({ name, price });
    }
  });

  /* ===== DATA ===== */
  const data = {
    nom: nom.value,
    prenom: prenom.value,
    email: email.value,
    metier: metier.value,
    instagram: instagram.value,
    portfolio: portfolio.value,
    tiktok: tiktok.value,
    products // ✅ AJOUT ICI
  };

  localStorage.setItem("profile", JSON.stringify(data));

  alert("Profil enregistré");
};

/* LOAD */
window.onload = () => {

  let data = null;

  /* ===== SAFE PARSE ===== */
  try {
    data = JSON.parse(localStorage.getItem("profile"));
  } catch(e){
    console.error("Erreur parsing localStorage:", e);
  }

  /* ===== INPUTS ===== */
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

  /* ===== PHOTO ===== */
  const photo = localStorage.getItem("photo");
  if (photo && preview) {
    preview.src = photo;
  }

  /* ===== PRODUITS ===== */
  const productsList = document.getElementById("productsList");

  if (data && data.products && productsList) {

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

/* LOGOUT */
document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "application.html";
};
