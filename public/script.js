
// =====================================
// DARKC-SINT V2 - MAIN SCRIPT
// =====================================

// BOOT TERMINAL

const bootMessages = [
  "[OK] DARKC-SINT environment loaded",
  "[OK] Initializing interface...",
  "[OK] Loading security modules...",
  "[OK] Dashboard components ready",
  "[OK] Terminal initialized",
  "[OK] Security tools loaded",
  "[OK] Privacy module active",
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

    const progress = Math.round(
      ((i + 1) / bootMessages.length) * 100
    );

    fill.style.width = progress + "%";
    status.textContent = "LOADING... " + progress + "%";

    await new Promise(resolve => setTimeout(resolve, 450));
  }

  status.textContent = "ACCESS GRANTED";

  await new Promise(resolve => setTimeout(resolve, 600));

  document.getElementById("boot-screen").style.display = "none";
  document.getElementById("main-site").hidden = false;

  loadNetworkInfo();
}

startBoot();


// =====================================
// SIDEBAR
// =====================================

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("open");
}

function closeMenu() {
  document.getElementById("sidebar").classList.remove("open");
}


// =====================================
// EDUCATIONAL TERMINAL
// =====================================

function runCommand() {
  const input = document.getElementById("terminalInput");
  const output = document.getElementById("terminalOutput");

  const command = input.value.trim().toLowerCase();

  const commands = {
    help:
      "Available commands: help, about, status, tools, clear, date",

    about:
      "DARKC-SINT V2 - Educational defensive cybersecurity dashboard.",

    status:
      "SYSTEM: ONLINE | MODE: DEFENSIVE | INTERFACE: ACTIVE",

    tools:
      "Available modules: password, analyzer, network",

    date:
      "Local date: " + new Date().toLocaleString(),

    clear:
      ""
  };

  if (command === "clear") {
    output.textContent = "";
  } else {
    output.textContent =
      commands[command] || "Unknown command. Type help.";
  }

  input.value = "";
}

document.getElementById("terminalInput")?.addEventListener(
  "keydown",
  function(event) {
    if (event.key === "Enter") {
      runCommand();
    }
  }
);


// =====================================
// PASSWORD GENERATOR
// =====================================

function generatePassword() {
  const lengthInput = document.getElementById("passwordLength");

  let length = Number(lengthInput.value);

  if (!Number.isInteger(length) || length < 8 || length > 64) {
    length = 20;
    lengthInput.value = 20;
  }

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }

  document.getElementById("password").textContent = password;
  document.getElementById("copyStatus").textContent = "";
}

async function copyPassword() {
  const password = document.getElementById("password").textContent;
  const status = document.getElementById("copyStatus");

  if (!password || password === "No password generated") {
    status.textContent = "Generate a password first.";
    return;
  }

  try {
    await navigator.clipboard.writeText(password);
    status.textContent = "Password copied.";
  } catch {
    status.textContent = "Copy unavailable in this browser.";
  }
}


// =====================================
// PASSWORD ANALYZER
// =====================================

function analyzePassword() {
  const value = document.getElementById("checkPassword").value;
  const result = document.getElementById("result");

  if (!value) {
    result.textContent = "Enter a test password first.";
    return;
  }

  let score = 0;

  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = [
    "Very weak",
    "Weak",
    "Medium",
    "Good",
    "Strong",
    "Very strong"
  ];

  result.textContent = "Estimated strength: " + levels[score];
}


// =====================================
// LOCAL BROWSER INFORMATION
// =====================================

function loadNetworkInfo() {
  document.getElementById("browserInfo").textContent =
    navigator.userAgent;

  document.getElementById("platformInfo").textContent =
    navigator.platform || "Not available";

  document.getElementById("languageInfo").textContent =
    navigator.language;

  document.getElementById("screenInfo").textContent =
    window.screen.width + " x " + window.screen.height;
}
