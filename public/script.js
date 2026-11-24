
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

function runCommand() {
  const input = document.getElementById("terminalInput");
  const output = document.getElementById("terminalOutput");
  const command = input.value.trim().toLowerCase();

  const commands = {
    help: "Commandes : help, about, status, clear",
    about: "DARKC-SINT - Dashboard éducatif de cybersécurité.",
    status: "Système : ONLINE | Mode : Défensif",
    clear: ""
  };

  if (command === "clear") {
    output.textContent = "Terminal cleared.";
  } else {
    output.textContent = commands[command] || "Commande inconnue. Tape help.";
  }

  input.value = "";
}
