
/* ==========================================
   DARKC-SINT V3 — MAIN SCRIPT
========================================== */

"use strict";

const CONFIG = {
    bootSpeed: 450,
    matrixDuration: 2000,
    matrixColor: "#ff2020"
};

const state = {
    bootStarted: false,
    matrixRunning: false,
    matrixFrame: null,
    matrixColumns: [],
    logs: [],
    visitNotificationSent: false
};

/* ==========================================
   HELPERS
========================================== */

const $ = (selector) => document.querySelector(selector);

function addLog(message) {
    const time = new Date().toLocaleTimeString();
    state.logs.unshift(`[${time}] ${message}`);

    const output = $("#logOutput");
    if (output) {
        output.textContent = state.logs.slice(0, 100).join("\n");
    }
}

function notify(message) {
    const container = $("#notifications");
    if (!container) return;

    const item = document.createElement("div");
    item.className = "notification";
    item.textContent = message;
    container.appendChild(item);

    setTimeout(() => item.remove(), 4000);
}

/* ==========================================
   BOOT SCREEN
========================================== */

function startBoot() {
    if (state.bootStarted) return;
    state.bootStarted = true;

    const lines = [
        "[ OK ] DARKC-SINT CORE INITIALIZED",
        "[ OK ] LOADING SECURITY MODULES",
        "[ OK ] CHECKING INTERFACE",
        "[ OK ] TERMINAL READY",
        "[ OK ] NETWORK MODULE READY",
        "[ OK ] PASSWORD TOOLS READY",
        "[ OK ] HASH ENGINE READY",
        "[ OK ] LOG SYSTEM READY",
        "[ OK ] VISITOR MONITOR READY",
        "[ OK ] LOADING DASHBOARD",
        "[ OK ] INITIALIZING GRAPHICS",
        "[ OK ] SYSTEM CHECK COMPLETE",
        "[ OK ] ALL MODULES LOADED"
    ];

    const output = $("#boot-lines");
    const fill = $("#progress-fill");
    const status = $("#boot-status");

    if (!output || !fill || !status) {
        startMatrixIntro();
        return;
    }

    let index = 0;

    const timer = setInterval(() => {
        if (index >= lines.length) {
            clearInterval(timer);
            fill.style.width = "100%";
            status.textContent = "SYSTEM READY — 100%";

            setTimeout(startMatrixIntro, 350);
            return;
        }

        const line = document.createElement("div");
        line.className = "boot-line";
        line.textContent = lines[index];

        output.appendChild(line);
        output.scrollTop = output.scrollHeight;

        index++;

        const percentage = Math.round(
            (index / lines.length) * 100
        );

        fill.style.width = percentage + "%";
        status.textContent = `LOADING SYSTEM... ${percentage}%`;
    }, CONFIG.bootSpeed);
}

/* ==========================================
   MATRIX INTRO
========================================== */

function drawMatrixIntro() {
    const canvas = $("#matrix");
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);

    state.matrixColumns = Array(columns).fill(1);
    state.matrixRunning = true;

    const characters = "01DARKCSINTABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function draw() {
        if (!state.matrixRunning) return;

        context.fillStyle = "rgba(0, 0, 0, 0.08)";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = CONFIG.matrixColor;
        context.font = `${fontSize}px monospace`;

        state.matrixColumns.forEach((position, index) => {
            const character = characters[
                Math.floor(Math.random() * characters.length)
            ];

            context.fillText(
                character,
                index * fontSize,
                position * fontSize
            );

            if (
                position * fontSize > canvas.height &&
                Math.random() > 0.975
            ) {
                state.matrixColumns[index] = 0;
            }

            state.matrixColumns[index]++;
        });

        state.matrixFrame = requestAnimationFrame(draw);
    }

    draw();
}

function startMatrixIntro() {
    const boot = $("#boot-screen");
    const matrix = $("#matrix-screen");
    const main = $("#main-site");

    if (boot) boot.style.display = "none";
    if (matrix) matrix.style.display = "block";
    if (main) main.style.display = "none";

    drawMatrixIntro();

    setTimeout(() => {
        state.matrixRunning = false;

        if (state.matrixFrame) {
            cancelAnimationFrame(state.matrixFrame);
        }

        if (matrix) matrix.style.display = "none";
        if (main) main.style.display = "block";

        showPage("dashboard");
        loadNetworkInfo();
        updateClock();
        addLog("DARKC-SINT started");
        initializeVisitorMonitor();
    }, CONFIG.matrixDuration);
}

/* ==========================================
   NAVIGATION
========================================== */

function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    const links = document.querySelectorAll(".nav-link");

    let found = false;

    pages.forEach(page => {
        const active = page.id === pageId;
        page.classList.toggle("active", active);
        if (active) found = true;
    });

    if (!found) return;

    links.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === pageId
        );
    });

    history.replaceState(null, "", "#" + pageId);
    closeMenu();
}

function initializeNavigation() {
    document.querySelectorAll("[data-page]").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            showPage(link.dataset.page);
        });
    });
}

function toggleMenu() {
    const sidebar = $("#sidebar");
    if (sidebar) sidebar.classList.toggle("open");
}

function closeMenu() {
    const sidebar = $("#sidebar");
    if (sidebar) sidebar.classList.remove("open");
}

/* ==========================================
   CLOCK AND DASHBOARD
========================================== */

function updateClock() {
    const clock = $("#statTime");
    if (!clock) return;

    clock.textContent = new Date().toLocaleTimeString(
        "fr-FR",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );
}

setInterval(updateClock, 1000);

/* ==========================================
   NETWORK INFORMATION
========================================== */

function getBrowserName() {
    const ua = navigator.userAgent;

    if (ua.includes("Edg/")) return "Microsoft Edge";
    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Chrome/")) return "Chrome";
    if (ua.includes("Safari/")) return "Safari";

    return "Unknown browser";
}

function getDeviceType() {
    const ua = navigator.userAgent;

    if (/iPad|Tablet/i.test(ua)) return "Tablet";
    if (/Mobile|Android|iPhone/i.test(ua)) return "Mobile";

    return "Desktop";
}

function loadNetworkInfo() {
    const browser = $("#browserInfo");
    const platform = $("#platformInfo");
    const language = $("#languageInfo");
    const screenInfo = $("#screenInfo");
    const connection = $("#connectionInfo");

    if (browser) browser.textContent = getBrowserName();
    if (platform) {
        platform.textContent =
            navigator.userAgentData?.platform ||
            navigator.platform ||
            "Unknown";
    }

    if (language) language.textContent = navigator.language;

    if (screenInfo) {
        screenInfo.textContent =
            `${window.screen.width} × ${window.screen.height}`;
    }

    if (connection) {
        connection.textContent =
            navigator.onLine ? "Online" : "Offline";
    }
}

/* ==========================================
   TERMINAL
========================================== */

const terminalCommands = {
    help() {
        return [
            "AVAILABLE COMMANDS",
            "help     - Show commands",
            "about    - About DARKC-SINT",
            "status   - System status",
            "tools    - Available modules",
            "date     - Current date",
            "privacy  - Privacy information",
            "clear    - Clear terminal"
        ].join("\n");
    },

    about() {
        return "DARKC-SINT V3 — Cybersecurity learning platform.";
    },

    status() {
        return "SYSTEM: ONLINE\nMODULES: READY\nSECURITY: ACTIVE";
    },

    tools() {
        return "Terminal, Password Generator, Password Checker, Network Monitor, SHA-256.";
    },

    date() {
        return new Date().toString();
    },

    privacy() {
        return "Visitor statistics are optional and require consent. No raw IP is collected by this feature.";
    },

    clear() {
        const output = $("#terminalOutput");
        if (output) output.textContent = "";
        return "";
    }
};

function executeTerminalCommand() {
    const input = $("#terminalInput");
    const output = $("#terminalOutput");

    if (!input || !output) return;

    const command = input.value.trim().toLowerCase();
    if (!command) return;

    const line = document.createElement("div");
    line.textContent = `root@darkc-sint:~$ ${command}`;
    output.appendChild(line);

    const result = terminalCommands[command];

    const response = document.createElement("div");
    response.textContent = result
        ? result()
        : `Unknown command: ${command}. Type help.`;

    output.appendChild(response);
    output.scrollTop = output.scrollHeight;

    input.value = "";
}

/* ==========================================
   PASSWORD GENERATOR
========================================== */

function generatePassword() {
    const lengthInput = $("#passwordLength");
    const result = $("#generatedPassword");

    if (!lengthInput || !result) return;

    const length = Math.min(
        64,
        Math.max(8, Number(lengthInput.value) || 20)
    );

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

    const random = new Uint32Array(length);
    crypto.getRandomValues(random);

    let password = "";

    for (let i = 0; i < length; i++) {
        password += characters[random[i] % characters.length];
    }

    result.value = password;
    addLog("Password generated locally");
}

async function copyPassword() {
    const input = $("#generatedPassword");

    if (!input || !input.value) {
        notify("Generate a password first.");
        return;
    }

    try {
        await navigator.clipboard.writeText(input.value);
        notify("Password copied.");
    } catch {
        input.select();
        document.execCommand("copy");
        notify("Password copied.");
    }
}

/* ==========================================
   PASSWORD CHECKER
========================================== */

function checkPassword() {
    const input = $("#passwordToCheck");
    const result = $("#passwordResult");

    if (!input || !result) return;

    const password = input.value;

    if (!password) {
        result.textContent = "Enter a password first.";
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
        "Fair",
        "Good",
        "Strong",
        "Very strong"
    ];

    result.textContent = `Result: ${levels[score]}`;
}

/* ==========================================
   SHA-256
========================================== */

async function generateHash() {
    const input = $("#hashInput");
    const result = $("#hashResult");

    if (!input || !result) return;

    if (!input.value) {
        result.textContent = "Enter some text first.";
        return;
    }

    try {
        const encoded = new TextEncoder().encode(input.value);
        const digest = await crypto.subtle.digest("SHA-256", encoded);

        const hash = Array.from(new Uint8Array(digest))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");

        result.textContent = hash;
        addLog("SHA-256 generated");
    } catch {
        result.textContent = "SHA-256 is unavailable in this context.";
    }
}

/* ==========================================
   ACTIVITY LOGS
========================================== */

function clearLogs() {
    state.logs = [];

    const output = $("#logOutput");
    if (output) output.textContent = "Logs cleared.";

    addLog("Log history cleared");
}

/* ==========================================
   VISITOR MONITOR
========================================== */

function initializeVisitorMonitor() {
    const consentBox = $("#visitor-consent");
    const acceptButton = $("#visitor-accept");
    const refuseButton = $("#visitor-refuse");
    const status = $("#visitorStatus");

    if (!consentBox || !acceptButton || !refuseButton) return;

    let choice = null;

    try {
        choice = localStorage.getItem("darkc_visit_consent");
    } catch {
        choice = null;
    }

    if (choice === "accepted") {
        sendVisitNotification();
        return;
    }

    if (choice === "refused") {
        if (status) status.textContent = "Visit statistics refused.";
        return;
    }

    consentBox.style.display = "flex";

    acceptButton.onclick = () => {
        try {
            localStorage.setItem("darkc_visit_consent", "accepted");
        } catch {}

        consentBox.style.display = "none";

        if (status) status.textContent = "Consent accepted.";
        sendVisitNotification();
    };

    refuseButton.onclick = () => {
        try {
            localStorage.setItem("darkc_visit_consent", "refused");
        } catch {}

        consentBox.style.display = "none";

        if (status) status.textContent = "Visit statistics refused.";

        addLog("Visitor refused optional statistics");
    };
}

async function sendVisitNotification() {
    if (state.visitNotificationSent) return;

    state.visitNotificationSent = true;

    const payload = {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        device: getDeviceType()
    };

    try {
        const response = await fetch("/api/visit-notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            state.visitNotificationSent = false;
            console.error("Visitor notification could not be sent.");
            return;
        }

        addLog("Consented visit notification sent");
        const status = $("#visitorStatus");

        if (status) status.textContent = "Notification sent to administrator.";
    } catch (error) {
        state.visitNotificationSent = false;
        console.error("Visitor monitor error:", error);
    }
}

/* ==========================================
   SETTINGS
========================================== */

function toggleMatrix() {
    const toggle = $("#matrixToggle");
    const status = $("#settingsStatus");

    if (!toggle || !status) return;

    status.textContent = toggle.checked
        ? "Matrix effects enabled for the next intro."
        : "Matrix effects disabled for the next intro.";

    notify(status.textContent);
}

/* ==========================================
   BUTTON INITIALIZATION
========================================== */

function initializeButtons() {
    $("#generatePassword")?.addEventListener("click", generatePassword);
    $("#copyPassword")?.addEventListener("click", copyPassword);
    $("#checkPassword")?.addEventListener("click", checkPassword);
    $("#generateHash")?.addEventListener("click", generateHash);
    $("#clearLogs")?.addEventListener("click", clearLogs);

    $("#terminalInput")?.addEventListener("keydown", event => {
        if (event.key === "Enter") executeTerminalCommand();
    });

    $("#matrixToggle")?.addEventListener("change", toggleMatrix);
}

/* ==========================================
   ONLINE / OFFLINE EVENTS
========================================== */

window.addEventListener("online", () => {
    notify("Connection restored.");
    addLog("Network online");
    loadNetworkInfo();
});

window.addEventListener("offline", () => {
    notify("Connection lost.");
    addLog("Network offline");
    loadNetworkInfo();
});

window.addEventListener("resize", () => {
    if (state.matrixRunning) {
        const canvas = $("#matrix");
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
});

/* ==========================================
   INITIALIZATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeNavigation();
    initializeButtons();
    startBoot();
});
