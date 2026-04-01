function signup(){

  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(!nom || !prenom || !email || !password){
    alert("Remplis tous les champs");
    return;
  }

  const client = {
    nom,
    prenom,
    email,
    password,
    favoris: [],
    reservations: []
  };

  localStorage.setItem("client", JSON.stringify(client));

  alert("Compte créé !");
  window.location.href = "client.html";
}
