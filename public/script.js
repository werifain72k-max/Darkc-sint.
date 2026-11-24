// ==========================================
// DARKC-SINT V3 — MAIN SCRIPT
// ==========================================

let matrixEnabled = true;
let matrixAnimation = null;
let matrixCanvas = null;
let matrixContext = null;
let matrixDrops = [];

// ---------- NOTIFICATIONS ----------

function notify(message) {
    const area = document.getElementById("notifications");
    if (!area) return;

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    area.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ---------- BOOT SCREEN ----------

function startBoot() {
    const lines = [
        "[SYSTEM] Initialisation de DARKC-SINT...",
        "[OK] Interface chargée",
        "[OK] Modules de sécurité prêts",
        "[OK] Terminal initialisé",
        "[OK] Connexion HTTPS sécurisée",
        "[SYSTEM] Démarrage terminé."
    ];

    const output = document.getElementById("boot-lines");
    const screen = document.getElementById("boot-screen");
    const main = document.getElementById("main-site");
    const progress = document.getElementById("progress-fill");
    const status = document.getElementById("boot-status");

    if (!output || !screen || !main) {
        if (main) main.style.display = "block";
        return;
    }

    let index = 0;

    function nextLine() {
        if (index < lines.length) {
            const line = document.createElement("div");
            line.textContent = lines[index];
            output.appendChild(line);

            index++;

            if (progress) {
                progress.style.width =
                    (index / lines.length * 100) + "%";
            }

            setTimeout(nextLine, 350);
        } else {
            if (status) status.textContent = "SYSTEM READY";

            setTimeout(() => {
                screen.style.display = "none";
                main.style.display = "block";
                loadNetworkInfo();
                startMatrix();
            }, 500);
        }
    }

    nextLine();
}

// ---------- MENU ----------

function toggleMenu() {
    const menu = document.getElementById("sidebar");
    if (menu) menu.classList.toggle("active");
}

function closeMenu() {
    const menu = document.getElementById("sidebar");
    if (menu) menu.classList.remove("active");
}

// ---------- NAVIGATION ----------

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link")
            .forEach(item => item.classList.remove("active"));

        link.classList.add("active");
        closeMenu();
    });
});

// ---------- TERMINAL ----------

function terminalPrint(message) {
    const output = document.getElementById("terminalOutput");
    if (!output) return;

    const line = document.createElement("div");
    line.textContent = message;
    output.appendChild(line);

    output.scrollTop = output.scrollHeight;
}

function runCommand() {
    const input = document.getElementById("terminalInput");
    if (!input) return;

    const command = input.value.trim().toLowerCase();

    if (!command) return;

    terminalPrint("root@darkc-sint:~$ " + command);

    switch (command) {
        case "help":
            terminalPrint("COMMANDES DISPONIBLES :");
            terminalPrint("help     - Afficher les commandes");
            terminalPrint("about    - Informations du projet");
            terminalPrint("status   - État des modules");
            terminalPrint("tools    - Liste des outils");
            terminalPrint("date     - Date actuelle");
            terminalPrint("privacy  - Informations confidentialité");
            terminalPrint("clear    - Effacer le terminal");
            break;

        case "about":
            terminalPrint("DARKC-SINT V3");
            terminalPrint("Interface éducative de cybersécurité.");
            break;

        case "status":
            terminalPrint("SYSTEM : ONLINE");
            terminalPrint("INTERFACE : ACTIVE");
            terminalPrint("MODULES : READY");
            break;

        case "tools":
            terminalPrint("PASSWORD GENERATOR");
            terminalPrint("PASSWORD CHECKER");
            terminalPrint("NETWORK MONITOR");
            terminalPrint("SHA-256 GENERATOR");
            terminalPrint("LOG VIEWER");
            break;

        case "date":
            terminalPrint(new Date().toLocaleString());
            break;

        case "privacy":
            terminalPrint("Aucune collecte d'adresse IP.");
            terminalPrint("Les informations réseau affichées");
            terminalPrint("restent limitées à ton navigateur.");
            break;

        case "clear":
            const output = document.getElementById("terminalOutput");
            if (output) output.innerHTML = "";
            break;

        default:
            terminalPrint("Commande inconnue. Tape help.");
    }

    input.value = "";
}

const terminalInput = document.getElementById("terminalInput");

if (terminalInput) {
    terminalInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            runCommand();
        }
    });
}

// ---------- PASSWORD GENERATOR ----------

function generatePassword() {
    const lengthInput = document.getElementById("passwordLength");
    const result = document.getElementById("password");

    if (!lengthInput || !result) return;

    const length = Math.max(
        8,
        Math.min(64, Number(lengthInput.value) || 16)
    );

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";

    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    let password = "";

    for (let i = 0; i < length; i++) {
        password += characters[
            randomValues[i] % characters.length
        ];
    }

    result.value = password;
    notify("Mot de passe généré.");
}

async function copyPassword() {
    const password = document.getElementById("password");
    const status = document.getElementById("copyStatus");

    if (!password || !password.value) {
        notify("Génère d'abord un mot de passe.");
        return;
    }

    try {
        await navigator.clipboard.writeText(password.value);

        if (status) status.textContent = "Copié !";
        notify("Mot de passe copié.");
    } catch {
        if (status) status.textContent = "Copie impossible.";
    }
}

// ---------- PASSWORD CHECKER ----------

function analyzePassword() {
    const input = document.getElementById("checkPassword");
    const result = document.getElementById("result");

    if (!input || !result) return;

    const password = input.value;

    if (!password) {
        result.textContent = "Entre un mot de passe.";
        return;
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let strength = "Faible";

    if (score >= 5) strength = "Fort";
    else if (score >= 3) strength = "Moyen";

    result.textContent = "Niveau estimé : " + strength;
}

// ---------- NETWORK MONITOR ----------

function loadNetworkInfo() {
    const browser = document.getElementById("browserInfo");
    const platform = document.getElementById("platformInfo");
    const language = document.getElementById("languageInfo");
    const screen = document.getElementById("screenInfo");

    if (browser) browser.textContent = navigator.userAgent;
    if (platform) platform.textContent =
        navigator.platform || "Non disponible";
    if (language) language.textContent = navigator.language;
    if (screen) screen.textContent =
        window.screen.width + " × " + window.screen.height;
}

// ---------- SHA-256 ----------

async function generateHash() {
    const input = document.getElementById("hashInput");
    const result = document.getElementById("hashResult");

    if (!input || !result) return;

    if (!input.value) {
        result.textContent = "Entre un texte à convertir.";
        return;
    }

    try {
        const data = new TextEncoder().encode(input.value);

        const hashBuffer = await crypto.subtle.digest(
            "SHA-256",
            data
        );

        const hashArray = Array.from(new Uint8Array(hashBuffer));

        const hashHex = hashArray
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");

        result.textContent = hashHex;
        notify("Hash SHA-256 généré.");
    } catch {
        result.textContent =
            "Erreur : SHA-256 indisponible dans ce navigateur.";
    }
}

// ---------- LOG VIEWER ----------

function addDemoLog() {
    const output = document.getElementById("logOutput");
    if (!output) return;

    const date = new Date().toLocaleTimeString();

    const messages = [
        "Module terminal initialisé",
        "Vérification locale terminée",
        "Générateur prêt",
        "Interface opérationnelle"
    ];

    const message =
        messages[Math.floor(Math.random() * messages.length)];

    const line = document.createElement("div");
    line.textContent = "[" + date + "] " + message;

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function clearLogs() {
    const output = document.getElementById("logOutput");
    if (output) output.textContent = "";

    notify("Logs locaux effacés.");
}

// ---------- MATRIX EFFECT ----------

function startMatrix() {
    matrixCanvas = document.getElementById("matrix");

    if (!matrixCanvas) return;

    matrixContext = matrixCanvas.getContext("2d");

    function resizeMatrix() {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;

        const columns = Math.floor(matrixCanvas.width / 16);

        matrixDrops = Array(columns).fill(1);
    }

    resizeMatrix();

    window.addEventListener("resize", resizeMatrix);

    function draw() {
        if (!matrixEnabled) {
            matrixContext.clearRect(
                0,
                0,
                matrixCanvas.width,
                matrixCanvas.height
            );

            matrixAnimation = requestAnimationFrame(draw);
            return;
        }

        matrixContext.fillStyle = "rgba(0, 0, 0, 0.08)";
        matrixContext.fillRect(
            0,
            0,
            matrixCanvas.width,
            matrixCanvas.height
        );

        matrixContext.fillStyle = "#ff2020";
        matrixContext.font = "14px monospace";

        for (let i = 0; i < matrixDrops.length; i++) {
            const character = Math.random() > 0.5 ? "1" : "0";

            matrixContext.fillText(
                character,
                i * 16,
                matrixDrops[i] * 16
            );

            if (
                matrixDrops[i] * 16 > matrixCanvas.height &&
                Math.random() > 0.98
            ) {
                matrixDrops[i] = 0;
            }

            matrixDrops[i]++;
        }

        matrixAnimation = requestAnimationFrame(draw);
    }

    if (matrixAnimation) {
        cancelAnimationFrame(matrixAnimation);
    }

    draw();
}

// ---------- SETTINGS ----------

function toggleMatrix() {
    const checkbox = document.getElementById("matrixToggle");

    matrixEnabled = checkbox ? checkbox.checked : !matrixEnabled;

    if (matrixCanvas) {
        matrixCanvas.style.display =
            matrixEnabled ? "block" : "none";
    }

    const status = document.getElementById("settingsStatus");

    if (status) {
        status.textContent = matrixEnabled
            ? "Effet Matrix activé."
            : "Effet Matrix désactivé.";
    }

    notify(matrixEnabled ? "Matrix activé." : "Matrix désactivé.");
}

// ---------- START ----------

document.addEventListener("DOMContentLoaded", () => {
    startBoot();
});
