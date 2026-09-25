// Espace client BBK — Lot 1
// Serveur Express minimal : sert les pages statiques de /public.

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

// Fichiers statiques (index.html est servi automatiquement sur "/")
app.use(express.static(PUBLIC_DIR));

// URL propre pour la page de connexion : /login -> public/login.html
app.get("/login", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "login.html"));
});

// Page inconnue : renvoie vers l'accueil
app.use((req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Espace client BBK en ligne sur http://localhost:${PORT}`);
});
