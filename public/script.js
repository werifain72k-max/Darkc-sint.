
// ==========================================
// DARKC-SINT V3 — MAIN SYSTEM
// ==========================================

let matrixEnabled = true;
let matrixFrame = null;
let matrixDrops = [];

// ==========================================
// BOOT SEQUENCE
// ==========================================

function startBoot() {
    const output = document.getElementById("boot-lines");
    const progress = document.getElementById("progress-fill");
    const status = document.getElementById("boot-status");

    const messages = [
        "[SYSTEM] Initializing DARKC-SINT...",
        "[OK] Loading interface modules",
        "[OK] Security dashboard loaded",
        "[OK] Terminal initialized",
        "[OK] Local tools ready",
        "[SYSTEM] Starting interface..."
    ];

    let index = 0;

    function next() {
        if (index >= messages.length) {
            if (status) status.textContent = "SYSTEM READY";

            setTimeout(startMatrixIntro, 250);
            return;
        }

        const line = document.createElement("div");
        line.textContent = messages[index];

        if (output) output.appendChild(line);

        index++;

        if (progress) {
            progress.style.width =
                (index / messages.length * 100) + "%";
        }

        setTimeout(next, 260);
    }

    next();
}

// ==========================================
// MATRIX INTRO — 2 SECONDS
// ==========================================

function startMatrixIntro() {
    const boot = document.getElementById("boot-screen");
    const matrixScreen = document.getElementById("matrix-screen");

    if (boot) boot.style.display = "none";
    if (matrixScreen) matrixScreen.style.display = "block";

    drawMatrixIntro();

    setTimeout(() => {
        if (matrixFrame) cancelAnimationFrame(matrixFrame);

        if (matrixScreen) matrixScreen.style.display = "none";

        const site = document.getElementById("main-site");

        if (site) site.style.display = "block";

        loadNetworkInfo();
        showPage("dashboard");
    }, 2000);
}

function drawMatrixIntro() {
    const canvas = document.getElementById("matrix");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 15;
    const columns = Math.floor(canvas.width / fontSize);

    matrixDrops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.13)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

        for (let i = 0; i < matrixDrops.length; i++) {
            const character =
                chars[Math.floor(Math.random() * chars.length)];

            ctx.fillStyle =
                Math.random() > 0.85 ? "#ff7777" : "#ff2020";

            ctx.font = fontSize + "px monospace";

            ctx.fillText(
                character,
                i * fontSize,
                matrixDrops[i] * fontSize
            );

            if (
                matrixDrops[i] * fontSize > canvas.height &&
                Math.random() > 0.975
            ) {
                matrixDrops[i] = 0;
            }

            matrixDrops[i]++;
        }

        matrixFrame = requestAnimationFrame(draw);
    }

    draw();
}

// ==========================================
// NAVIGATION
// ==========================================

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

    if (activeLink) activeLink.classList.add("active");

    closeMenu();

    history.replaceState(null, "", "#" + pageId);
}

document.querySelectorAll(".nav-link, .tool-link").forEach(link => {
    link.addEventListener("click", event => {
        const href = link.getAttribute("href");

        if (!href || !href.startsWith("#")) return;

        const pageId = href.substring(1);

        if (document.getElementById(pageId)?.classList.contains("page")) {
            event.preventDefault();
            showPage(pageId);
        }
    });
});

// ==========================================
// MENU
// ==========================================

function toggleMenu() {
    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("active");
    }
}

function closeMenu() {
    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("active");
    }
}

// ==========================================
// NOTIFICATIONS
// ==========================================

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

// ==========================================
// TERMINAL
// ==========================================

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

    terminalPrint("root@darkc:~$ " + command);

    switch (command) {
        case "help":
            terminalPrint("AVAILABLE COMMANDS:");
            terminalPrint("help     - Show commands");
            terminalPrint("about    - About DARKC-SINT");
            terminalPrint("status   - System status");
            terminalPrint("tools    - Show tools");
            terminalPrint("date     - Current date");
            terminalPrint("privacy  - Privacy information");
            terminalPrint("clear    - Clear terminal");
            break;

        case "about":
            terminalPrint("DARKC-SINT V3");
            terminalPrint("Educational cybersecurity dashboard.");
            break;

        case "status":
            terminalPrint("INTERFACE: ONLINE");
            terminalPrint("MODULES: READY");
            terminalPrint("TERMINAL: ACTIVE");
            break;

        case "tools":
            terminalPrint("PASSWORD GENERATOR");
            terminalPrint("PASSWORD CHECKER");
            terminalPrint("NETWORK MONITOR");
            terminalPrint("SHA-256");
            terminalPrint("LOG VIEWER");
            break;

        case "date":
            terminalPrint(new Date().toLocaleString());
            break;

        case "privacy":
            terminalPrint("No IP collection is enabled.");
            terminalPrint("Network information stays in your browser.");
            break;

        case "clear":
            document.getElementById("terminalOutput").textContent = "";
            break;

        default:
            terminalPrint("Unknown command. Type help.");
    }

    input.value = "";
}

document.getElementById("terminalInput")?.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") runCommand();
    }
);

// ==========================================
// PASSWORD GENERATOR
// ==========================================

function generatePassword() {
    const lengthInput = document.getElementById("passwordLength");
    const result = document.getElementById("password");

    if (!lengthInput || !result) return;

    const length = Math.max(
        8,
        Math.min(64, Number(lengthInput.value) || 16)
    );

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    const values = new Uint32Array(length);

    crypto.getRandomValues(values);

    let password = "";

    for (let i = 0; i < length; i++) {
        password += chars[values[i] % chars.length];
    }

    result.value = password;

    notify("Password generated.");
}

async function copyPassword() {
    const password = document.getElementById("password");
    const status = document.getElementById("copyStatus");

    if (!password || !password.value) {
        notify("Generate a password first.");
        return;
    }

    try {
        await navigator.clipboard.writeText(password.value);

        if (status) status.textContent = "Copied!";
        notify("Password copied.");
    } catch {
        if (status) status.textContent = "Copy unavailable.";
    }
}

// ==========================================
// PASSWORD CHECKER
// ==========================================

function analyzePassword() {
    const input = document.getElementById("checkPassword");
    const result = document.getElementById("result");

    if (!input || !result) return;

    const password = input.value;

    if (!password) {
        result.textContent = "Enter a test password.";
        return;
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let strength = "WEAK";

    if (score >= 5) strength = "STRONG";
    else if (score >= 3) strength = "MEDIUM";

    result.textContent = "ESTIMATED STRENGTH: " + strength;
}

// ==========================================
// NETWORK MONITOR
// ==========================================

function loadNetworkInfo() {
    const browser = document.getElementById("browserInfo");
    const platform = document.getElementById("platformInfo");
    const language = document.getElementById("languageInfo");
    const screen = document.getElementById("screenInfo");

    if (browser) browser.textContent = navigator.userAgent;
    if (platform) {
        platform.textContent = navigator.platform || "Unavailable";
    }
    if (language) language.textContent = navigator.language;
    if (screen) {
        screen.textContent =
            window.screen.width + " × " + window.screen.height;
    }
}

// ==========================================
// SHA-256
// ==========================================

async function generateHash() {
    const input = document.getElementById("hashInput");
    const result = document.getElementById("hashResult");

    if (!input || !result) return;

    if (!input.value) {
        result.textContent = "Enter some text first.";
        return;
    }

    try {
        const data = new TextEncoder().encode(input.value);

        const buffer = await crypto.subtle.digest("SHA-256", data);

        const bytes = Array.from(new Uint8Array(buffer));

        const hash = bytes
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");

        result.textContent = hash;

        notify("SHA-256 generated.");
    } catch {
        result.textContent = "SHA-256 unavailable in this browser.";
    }
}

// ==========================================
// LOG VIEWER
// ==========================================

function addDemoLog() {
    const output = document.getElementById("logOutput");

    if (!output) return;

    const messages = [
        "Interface initialized",
        "Local security check completed",
        "Password module ready",
        "Terminal initialized",
        "Network information loaded"
    ];

    const message =
        messages[Math.floor(Math.random() * messages.length)];

    const line = document.createElement("div");

    line.textContent =
        "[" + new Date().toLocaleTimeString() + "] " + message;

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function clearLogs() {
    const output = document.getElementById("logOutput");

    if (output) output.textContent = "";

    notify("Logs cleared.");
}

// ==========================================
// MATRIX SETTINGS
// ==========================================

function toggleMatrix() {
    const checkbox = document.getElementById("matrixToggle");
    const status = document.getElementById("settingsStatus");

    matrixEnabled = checkbox ? checkbox.checked : !matrixEnabled;

    const canvas = document.getElementById("matrix");

    if (canvas) {
        canvas.style.display = matrixEnabled ? "block" : "none";
    }

    if (status) {
        status.textContent = matrixEnabled
            ? "Matrix effect enabled."
            : "Matrix effect disabled.";
    }

    notify(matrixEnabled ? "Matrix enabled." : "Matrix disabled.");
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    startBoot();
});
