
// ANIMATION DE DÉMARRAGE
const bootMessages = [
  "[OK] DARKC-SINT environment loaded",
  "[OK] Initializing interface...",
  "[OK] Loading security modules...",
  "[OK] Checking dashboard components...",
  "[OK] Terminal interface ready",
  "[OK] All visual modules loaded",
  "ACCESS GRANTED"
];

async function startBoot() {
  const lines = document.getElementById("boot-lines");
  const fill = document.getElementById("progress-fill");
  const status = document.getElementById("boot-status");

  if (!lines || !fill || !status) return;

  for (let i = 0; i < bootMessages.length; i++) {
    const line = document.createElement("p");
    line.textContent = "> " + bootMessages[i];
    lines.appendChild(line);

    const progress = Math.round(((i + 1) / bootMessages.length) * 100);
    fill.style.width = progress + "%";
    status.textContent = "LOADING... " + progress + "%";

    await new Promise(resolve => setTimeout(resolve, 550));
  }

  status.textContent = "ACCESS GRANTED";

  await new Promise(resolve => setTimeout(resolve, 700));

  document.getElementById("boot-screen").style.display = "none";
  document.getElementById("main-site").hidden = false;
}

// GÉNÉRATEUR DE MOT DE PASSE
function generatePassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  const array = new Uint32Array(20);
  crypto.getRandomValues(array);

  let password = "";
  for (let i = 0; i < array.length; i++) {
    password += chars[array[i] % chars.length];
  }

  document.getElementById("password").textContent = password;
}

// ANALYSEUR
function analyzePassword() {
  const value = document.getElementById("checkPassword").value;
  let score = 0;

  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = ["Très faible", "Faible", "Moyen", "Bon", "Fort", "Très fort"];

  document.getElementById("result").textContent =
    "Niveau estimé : " + levels[score];
}

// TERMINAL VISUEL
function runCommand() {
  const input = document.getElementById("terminalInput");
  const output = document.getElementById("terminalOutput");
  const command = input.value.trim().toLowerCase();

  const commands = {
    help: "Commandes : help, about, status, clear",
    about: "DARKC-SINT - Dashboard éducatif de cybersécurité.",
    status: "Interface : ONLINE | Mode : Défensif",
    clear: "Terminal cleared."
  };

  output.textContent = commands[command] || "Commande inconnue. Tape help.";
  input.value = "";
}

startBoot();
