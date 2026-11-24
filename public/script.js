
/* ==========================================
   DARKC-SINT — MAIN SCRIPT
   Version complète
========================================== */

/* ---------- CONFIGURATION ---------- */

const CONFIG = {
    bootSpeed: 450,
    matrixDuration: 2000,
    matrixColor: "#ff2020"
};

let matrixAnimation = null;
let matrixTimer = null;

/* ---------- DÉMARRAGE ---------- */

function startBoot() {
    const output = document.getElementById("boot-lines");
    const progress = document.getElementById("progress-fill");
    const status = document.getElementById("boot-status");

    if (!output || !progress || !status) {
        console.error("DARKC-SINT: Boot elements missing");
        return;
    }

    output.innerHTML = "";
    progress.style.width = "0%";
    status.textContent = "LOADING... 0%";

    const messages = [
        "[SYSTEM] DARKC-SINT INITIALIZATION",
        "[OK] Checking interface...",
        "[OK] Loading core modules...",
        "[OK] Loading security tools...",
        "[OK] Initializing terminal...",
        "[OK] Loading network monitor...",
        "[OK] Initializing dashboard...",
        "[OK] Loading password generator...",
        "[OK] Loading hash generator...",
        "[OK] Checking local environment...",
        "[OK] Loading interface components...",
        "[OK] All modules loaded.",
        "[SYSTEM] ACCESS GRANTED"
    ];

    let index = 0;

    function next() {
        const percent = Math.round(
            ((index + 1) / messages.length) * 100
        );

        const line = document.createElement("div");
        line.className = "boot-line";
        line.textContent = messages[index];

        output.appendChild(line);
        output.scrollTop = output.scrollHeight;

        progress.style.width = percent + "%";
        status.textContent = "LOADING... " + percent + "%";

        index++;

        if (index < messages.length) {
            setTimeout(next, CONFIG.bootSpeed);
        } else {
            status.textContent = "100% — SYSTEM READY";
            setTimeout(startMatrixIntro, 500);
        }
    }

    next();
}

/* ---------- INTRO MATRIX ROUGE ---------- */

function startMatrixIntro() {
    const boot = document.getElementById("boot-screen");
    const matrix = document.getElementById("matrix-screen");
    const main = document.getElementById("main-site");

    if (boot) boot.style.display = "none";
    if (matrix) matrix.style.display = "block";
    if (main) main.style.display = "none";

    drawMatrixIntro();

    matrixTimer = setTimeout(() => {
        stopMatrix();

        if (matrix) matrix.style.display = "none";
        if (main) main.style.display = "block";

        loadNetworkInfo();
        showPage("dashboard");
    }, CONFIG.matrixDuration);
}

function drawMatrixIntro() {
    const canvas = document.getElementById("matrix");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = "01ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオ";
    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = CONFIG.matrixColor;
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const char = characters[
                Math.floor(Math.random() * characters.length)
            ];

            ctx.fillText(
                char,
                i * fontSize,
                drops[i] * fontSize
            );

            if (
                drops[i] * fontSize > canvas.height &&
                Math.random() > 0.975
            ) {
                drops[i] = 0;
            }

            drops[i]++;
        }

        matrixAnimation = requestAnimationFrame(draw);
    }

    draw();
}

function stopMatrix() {
    if (matrixAnimation) {
        cancelAnimationFrame(matrixAnimation);
        matrixAnimation = null;
    }

    if (matrixTimer) {
        clearTimeout(matrixTimer);
        matrixTimer = null;
    }
}

/* ---------- NAVIGATION ---------- */

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    const links = document.querySelectorAll(".nav-link");

    let target = document.getElementById(pageId);

    if (!target || !target.classList.contains("page")) {
        target = document.getElementById("dashboard");
        pageId = "dashboard";
    }

    pages.forEach(page => {
        page.classList.remove("active");
    });

    links.forEach(link => {
        link.classList.remove("active");
    });

    target.classList.add("active");

    const activeLink = document.querySelector(
        '.nav-link[href="#' + pageId + '"]'
    );

    if (activeLink) {
        activeLink.classList.add("active");
    }

    history.replaceState(null, "", "#" + pageId);

    closeMenu();
}

function initializeNavigation() {
    document.querySelectorAll(".nav-link, .tool-link")
        .forEach(link => {
            link.addEventListener("click", event => {
                const href = link.getAttribute("href");

                if (!href || !href.startsWith("#")) return;

                const pageId = href.substring(1);
                const target = document.getElementById(pageId);

                if (target && target.classList.contains("page")) {
                    event.preventDefault();
                    showPage(pageId);
                }
            });
        });
}

/* ---------- MENU ---------- */

function toggleMenu() {
    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}

function closeMenu() {
    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}

/* ---------- NOTIFICATIONS ---------- */

function notify(message) {
    const area = document.getElementById("notifications");

    if (!area) {
        console.log("[DARKC-SINT]", message);
        return;
    }

    const item = document.createElement("div");
    item.className = "notification";
    item.textContent = message;

    area.appendChild(item);

    setTimeout(() => {
        item.remove();
    }, 4000);
}

/* ---------- TERMINAL ---------- */

function terminalWrite(message) {
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

    terminalWrite("> " + command);

    const commands = {
        help: () => {
            terminalWrite("AVAILABLE COMMANDS:");
            terminalWrite("help   - Show commands");
            terminalWrite("about  - About DARKC-SINT");
            terminalWrite("status - Interface status");
            terminalWrite("tools  - Available tools");
            terminalWrite("date   - Current date");
            terminalWrite("privacy - Privacy information");
            terminalWrite("clear  - Clear terminal");
        },

        about: () => {
            terminalWrite("DARKC-SINT");
            terminalWrite("Educational cybersecurity dashboard.");
            terminalWrite("Local browser tools only.");
        },

        status: () => {
            terminalWrite("SYSTEM STATUS: ONLINE");
            terminalWrite("INTERFACE: READY");
            terminalWrite("LOCAL TOOLS: AVAILABLE");
        },

        tools: () => {
            terminalWrite("PASSWORD GENERATOR");
            terminalWrite("PASSWORD CHECKER");
            terminalWrite("NETWORK INFORMATION");
            terminalWrite("SHA-256 GENERATOR");
            terminalWrite("LOCAL LOG VIEWER");
        },

        date: () => {
            terminalWrite(new Date().toLocaleString());
        },

        privacy: () => {
            terminalWrite("No visitor IP collection.");
            terminalWrite("No password transmission.");
            terminalWrite("Tools run locally in your browser.");
        },

        clear: () => {
            const output = document.getElementById("terminalOutput");
            if (output) output.innerHTML = "";
        }
    };

    if (commands[command]) {
        commands[command]();
    } else {
        terminalWrite("Unknown command. Type help.");
    }

    input.value = "";
}

/* ---------- GÉNÉRATEUR DE MOT DE PASSE ---------- */

function generatePassword() {
    const lengthInput = document.getElementById("passwordLength");
    const result = document.getElementById("password");

    if (!lengthInput || !result) return;

    const length = Math.max(
        8,
        Math.min(64, Number(lengthInput.value) || 16)
    );

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*_-";

    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    let password = "";

    for (let i = 0; i < length; i++) {
        password += characters[
            randomValues[i] % characters.length
        ];
    }

    result.value = password;
    notify("New password generated.");
}

async function copyPassword() {
    const password = document.getElementById("password");

    if (!password || !password.value) {
        notify("Generate a password first.");
        return;
    }

    try {
        await navigator.clipboard.writeText(password.value);
        notify("Password copied.");
    } catch {
        notify("Clipboard unavailable.");
    }
}

/* ---------- VÉRIFICATEUR DE MOT DE PASSE ---------- */

function analyzePassword() {
    const input = document.getElementById("checkPassword");
    const result = document.getElementById("result");

    if (!input || !result) return;

    const password = input.value;

    if (!password) {
        result.textContent = "Enter a password to analyze.";
        return;
    }

    let score = 0;

    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        "Very weak",
        "Weak",
        "Moderate",
        "Good",
        "Strong",
        "Very strong"
    ];

    result.textContent = "Password strength: " + levels[score];
}

/* ---------- INFORMATIONS RÉSEAU LOCALES ---------- */

function loadNetworkInfo() {
    const browser = document.getElementById("browserInfo");
    const platform = document.getElementById("platformInfo");
    const language = document.getElementById("languageInfo");
    const screen = document.getElementById("screenInfo");

    if (browser) {
        browser.textContent = navigator.userAgent;
    }

    if (platform) {
        platform.textContent = navigator.platform || "Unavailable";
    }

    if (language) {
        language.textContent = navigator.language;
    }

    if (screen) {
        screen.textContent =
            window.screen.width + " × " + window.screen.height;
    }
}

/* ---------- SHA-256 ---------- */

async function generateHash() {
    const input = document.getElementById("hashInput");
    const result = document.getElementById("hashResult");

    if (!input || !result) return;

    if (!input.value.trim()) {
        result.textContent = "Enter text first.";
        return;
    }

    try {
        const data = new TextEncoder().encode(input.value);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);

        const hash = Array.from(new Uint8Array(hashBuffer))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");

        result.textContent = hash;
    } catch {
        result.textContent = "SHA-256 unavailable in this browser.";
    }
}

/* ---------- JOURNAL LOCAL ---------- */

function addDemoLog() {
    const output = document.getElementById("logOutput");

    if (!output) return;

    const time = new Date().toLocaleTimeString();
    const messages = [
        "Dashboard initialized",
        "Local tool accessed",
        "Network information refreshed",
        "Security module checked",
        "Interface status: online"
    ];

    const message = messages[
        Math.floor(Math.random() * messages.length)
    ];

    const line = document.createElement("div");
    line.textContent = "[" + time + "] " + message;

    output.prepend(line);
}

function clearLogs() {
    const output = document.getElementById("logOutput");

    if (output) {
        output.innerHTML = "";
        notify("Logs cleared.");
    }
}

/* ---------- PARAMÈTRES MATRIX ---------- */

function toggleMatrix() {
    const checkbox = document.getElementById("matrixToggle");
    const status = document.getElementById("settingsStatus");

    if (!checkbox) return;

    if (status) {
        status.textContent = checkbox.checked
            ? "Matrix intro enabled."
            : "Matrix intro disabled for this session.";
    }

    notify("Settings updated.");
}

/* ---------- ÉVÉNEMENTS ---------- */

function initializeTerminal() {
    const input = document.getElementById("terminalInput");

    if (!input) return;

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            runCommand();
        }
    });
}

function initializeButtons() {
    const menuButton = document.getElementById("menuButton");

    if (menuButton) {
        menuButton.addEventListener("click", toggleMenu);
    }
}

/* ---------- INITIALISATION ---------- */

document.addEventListener("DOMContentLoaded", () => {
    initializeNavigation();
    initializeTerminal();
    initializeButtons();

    startBoot();
});
