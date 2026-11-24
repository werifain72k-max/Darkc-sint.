
require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.disable("x-powered-by");

app.use(express.json({ limit: "10kb" }));

app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"]
}));

// Vérification du fonctionnement du serveur
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "DARKC-SINT"
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`DARKC-SINT running at http://localhost:${PORT}`);
});
