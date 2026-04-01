function signup(){

  const nom = document.getElementById("nom")?.value.trim();
  const prenom = document.getElementById("prenom")?.value.trim();
  const email = document.getElementById("email")?.value.trim().toLowerCase();
  const password = document.getElementById("password")?.value.trim();

  /* ================= VALIDATION ================= */

  if(!nom || !prenom || !email || !password){
    alert("Remplis tous les champs");
    return;
  }

  // vérif email simple
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(email)){
    alert("Email invalide");
    return;
  }

  // mot de passe minimum
  if(password.length < 6){
    alert("Mot de passe trop court (6 caractères minimum)");
    return;
  }

  /* ================= EXISTANT ================= */

  const existing = JSON.parse(localStorage.getItem("client"));

  if(existing && existing.email === email){
    alert("Un compte existe déjà avec cet email");
    return;
  }

  /* ================= CRÉATION ================= */

  const client = {
    nom,
    prenom,
    email,
    password,
    favoris: [],
    reservations: [],
    createdAt: new Date().toISOString()
  };

  localStorage.setItem("client", JSON.stringify(client));

  /* ================= SUCCESS ================= */

  alert("Compte créé avec succès");

  // petite transition fluide
  document.body.style.opacity = "0";

  setTimeout(()=>{
    window.location.href = "client.html";
  }, 400);
}
