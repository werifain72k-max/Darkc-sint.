
"use strict";

/* ==========================================
   DARKC-SINT V3 — MAIN ENGINE
========================================== */

const CONFIG = {
    bootSpeed: 450,
    matrixDuration: 2000,
    matrixColor: "#ed2020"
};

const state = {
    events: [],
    visitNotificationSent: false,
    settings: {
        matrix: true,
        notifications: true
    }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function logEvent(message) {
    const event = {
        message,
        time: new Date().toLocaleTimeString("fr-FR")
    };

    state.events.unshift(event);

    if (state.events.length > 100) {
        state.events.pop();
    }

    renderLogs();
    updateStatistics();
}

function notify(message) {
    if (!state.settings.notifications) return;

    const container = $("#notifications");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
}

/* ==========================================
   BOOT SEQUENCE
========================================== */

const bootMessages = [
    "DARKC-SINT BIOS INITIALIZATION...",
    "Loading core interface modules...",
    "Checking browser environment...",
    "Loading security dashboard...",
    "Initializing local tools...",
    "Checking interface components...",
    "Loading cryptography module...",
    "Initializing terminal interface...",
    "Preparing network information...",
    "Loading activity logger...",
    "Checking privacy settings...",
    "Starting visual interface...",
    "SYSTEM READY."
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBoot() {
    const screen = $("#boot-screen");
    const lines = $("#boot-lines");
    const fill = $("#progress-fill");
    const status = $("#boot-status");
    const percent = $("#boot-percent");

    if (!screen || !lines || !fill || !status || !percent) {
        startWebsite();
        return;
    }

    for (let i = 0; i <= 100; i++) {
        const messageIndex = Math.min(
            bootMessages.length - 1,
            Math.floor(i / (100 / bootMessages.length))
        );

        const previousCount = lines.children.length;

        if (previousCount < messageIndex + 1) {
            const line = document.createElement("div");
            line.className = "boot-line";
            line.textContent = bootMessages[messageIndex];
            lines.appendChild(line);

            while (lines.children.length > 12) {
                lines.removeChild(lines.firstChild);
            }
        }

        fill.style.width = i + "%";
        percent.textContent = i + "%";
        status.textContent = i < 100 ? "INITIALIZING..." : "SYSTEM READY";

        await sleep(CONFIG.bootSpeed / 100);
    }

    await sleep(250);

    screen.style.display = "none";

    const matrixEnabled = state.settings.matrix;

    if (matrixEnabled) {
        await runMatrix();
    }

    startWebsite();
}

/* ==========================================
   MATRIX EFFECT
========================================== */

function runMatrix() {
    return new Promise(resolve => {
        const screen = $("#matrix-screen");
        const canvas = $("#matrix");

        if (!screen || !canvas) {
            resolve();
            return;
        }

        screen.style.display = "block";

        const ctx = canvas.getContext("2d");
        const characters = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&";
        const fontSize = 14;

        let columns = 0;
        let drops = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            columns = Math.ceil(canvas.width / fontSize);
            drops = Array(columns).fill(1);
        }

        resize();

        ctx.font = fontSize + "px monospace";

        const resizeHandler = () => resize();
        window.addEventListener("resize", resizeHandler);

        const interval = setInterval(() => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = CONFIG.matrixColor;
            ctx.font = fontSize + "px monospace";

            drops.forEach((y, index) => {
                const character = characters[
                    Math.floor(Math.random() * characters.length)
                ];

                ctx.fillText(
                    character,
                    index * fontSize,
                    y * fontSize
                );

                if (y * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[index] = 0;
                }

                drops[index]++;
            });
        }, 35);

        setTimeout(() => {
            clearInterval(interval);
            window.removeEventListener("resize", resizeHandler);
            screen.style.display = "none";
            resolve();
        }, CONFIG.matrixDuration);
    });
}

function startWebsite() {
    const site = $("#main-site");

    if (site) {
        site.style.display = "block";
    }

    initializeDashboard();
    initializeNavigation();
    initializeTerminal();
    initializePasswordGenerator();
    initializePasswordChecker();
    initializeNetwork();
    initializeHash();
    initializeLogs();
    initializeVisitorMonitor();
    initializeSettings();

    updateClock();
    logEvent("DARKC-SINT interface started");
    notify("DARKC-SINT SYSTEM ONLINE");
}

/* ==========================================
   NAVIGATION
========================================== */

function showPage(pageName) {
    const target = $("#page-" + pageName);

    if (!target) {
        notify("Page unavailable");
        return;
    }

    $$(".page").forEach(page => page.classList.remove("active"));

    $$(".nav-link").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    target.classList.add("active");

    const sidebar = $("#sidebar");
    if (sidebar) sidebar.classList.remove("open");

    logEvent("Opened page: " + pageName);
}

function initializeNavigation() {
    $$("[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            showPage(button.dataset.page);
        });
    });

    const toggle = $("#menu-toggle");

    if (toggle) {
        toggle.addEventListener("click", () => {
            $("#sidebar")?.classList.toggle("open");
        });
    }
}

/* ==========================================
   CLOCK AND DASHBOARD
========================================== */

function updateClock() {
    const now = new Date();

    const clock = $("#clock");
    const dashboardTime = $("#dashboard-time");

    if (clock) {
        clock.textContent = now.toLocaleTimeString("fr-FR");
    }

    if (dashboardTime) {
        dashboardTime.textContent = now.toLocaleTimeString(
            "fr-FR",
            { hour: "2-digit", minute: "2-digit" }
        );
    }
}

function detectBrowser() {
    const ua = navigator.userAgent;

    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";

    return "Unknown";
}

function initializeDashboard() {
    const browser = $("#browser-info");
    const platform = $("#platform-info");
    const language = $("#language-info");

    if (browser) browser.textContent = detectBrowser();
    if (platform) platform.textContent = navigator.platform || "Unknown";
    if (language) language.textContent = navigator.language || "Unknown";

    setInterval(updateClock, 1000);
}

/* ==========================================
   TERMINAL
========================================== */

function initializeTerminal() {
    const form = $("#terminal-form");
    const input = $("#terminal-input");
    const output = $("#terminal-output");

    if (!form || !input || !output) return;

    const commands = {
        help: [
            "Available commands:",
            "help     - Show commands",
            "about    - About DARKC-SINT",
            "status   - Interface status",
            "tools    - List security tools",
            "date     - Current date",
            "privacy  - Privacy information",
            "clear    - Clear terminal"
        ],
        about: [
            "DARKC-SINT V3",
            "Educational cybersecurity interface."
        ],
        status: [
            "Interface: ONLINE",
            "Browser: ACTIVE",
            "Local tools: READY"
        ],
        tools: [
            "Password Generator",
            "Password Checker",
            "Network Monitor",
            "SHA-256 Generator",
            "Threat Intelligence",
            "Activity Logs"
        ],
        date: [
            new Date().toString()
        ],
        privacy: [
            "Tools run locally in your browser.",
            "No raw IP address is collected.",
            "Visit notifications require visitor consent."
        ]
    };

    form.addEventListener("submit", event => {
        event.preventDefault();

        const command = input.value.trim().toLowerCase();
        if (!command) return;

        const entered = document.createElement("p");
        entered.textContent = "root@darkc-sint:~$ " + command;
        output.appendChild(entered);

        if (command === "clear") {
            output.innerHTML = "";
        } else if (commands[command]) {
            commands[command].forEach(message => {
                const line = document.createElement("p");
                line.textContent = message;
                line.className = "terminal-success";
                output.appendChild(line);
            });
        } else {
            const error = document.createElement("p");
            error.textContent = "Unknown command. Type help.";
            error.className = "terminal-error";
            output.appendChild(error);
        }

        logEvent("Terminal command: " + command);

        input.value = "";
        output.scrollTop = output.scrollHeight;
    });
}

/* ==========================================
   PASSWORD GENERATOR
========================================== */

function initializePasswordGenerator() {
    const button = $("#generate-password");
    const result = $("#generated-password");
    const copy = $("#copy-password");

    if (!button || !result) return;

    button.addEventListener("click", () => {
        const length = Math.min(
            64,
            Math.max(8, Number($("#password-length").value) || 20)
        );

        let characters = "";

        if ($("#include-uppercase").checked) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if ($("#include-lowercase").checked) characters += "abcdefghijklmnopqrstuvwxyz";
        if ($("#include-numbers").checked) characters += "0123456789";
        if ($("#include-symbols").checked) characters += "!@#$%^&*()-_=+";

        if (!characters) {
            notify("Select at least one character type");
            return;
        }

        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);

        let password = "";

        for (let i = 0; i < length; i++) {
            password += characters[randomValues[i] % characters.length];
        }

        result.value = password;

        logEvent("Password generated locally");
        notify("Password generated");
    });

    copy?.addEventListener("click", async () => {
        if (!result.value) return;

        try {
            await navigator.clipboard.writeText(result.value);
            notify("Password copied");
        } catch {
            result.select();
            notify("Select and copy the password manually");
        }
    });
}

/* ==========================================
   PASSWORD CHECKER
========================================== */

function initializePasswordChecker() {
    const button = $("#check-password");

    if (!button) return;

    button.addEventListener("click", () => {
        const password = $("#password-test").value;
        const result = $("#password-result");

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
            "Moderate",
            "Good",
            "Strong",
            "Very strong"
        ];

        result.textContent =
            "Estimated strength: " + levels[score] +
            " (" + score + "/5).";

        logEvent("Password strength checked locally");
    });
}

/* ==========================================
   NETWORK MONITOR
========================================== */

function initializeNetwork() {
    const refresh = $("#refresh-network");

    function updateNetwork() {
        const connection =
            navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;

        $("#network-status").textContent =
            navigator.onLine ? "ONLINE" : "OFFLINE";

        $("#network-type").textContent =
            connection?.type || "Browser limited";

        $("#network-speed").textContent =
            connection?.effectiveType || "Unknown";
    }

    refresh?.addEventListener("click", () => {
        updateNetwork();
        notify("Network status refreshed");
    });

    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);

    updateNetwork();
}

/* ==========================================
   SHA-256
========================================== */

function initializeHash() {
    const button = $("#generate-hash");
    const copy = $("#copy-hash");

    button?.addEventListener("click", async () => {
        const text = $("#hash-input").value;
        const result = $("#hash-result");

        try {
            const data = new TextEncoder().encode(text);
            const hash = await crypto.subtle.digest("SHA-256", data);

            result.value = Array.from(new Uint8Array(hash))
                .map(byte => byte.toString(16).padStart(2, "0"))
                .join("");

            logEvent("SHA-256 hash generated");
            notify("Hash generated");
        } catch {
            result.value = "SHA-256 unavailable in this browser context.";
        }
    });

    copy?.addEventListener("click", async () => {
        const result = $("#hash-result");

        if (!result.value) return;

        try {
            await navigator.clipboard.writeText(result.value);
            notify("Hash copied");
        } catch {
            result.select();
            notify("Select and copy manually");
        }
    });
}

/* ==========================================
   ACTIVITY LOGS
========================================== */

function renderLogs() {
    const container = $("#logs-list");
    if (!container) return;

    container.replaceChildren();

    if (state.events.length === 0) {
        container.textContent = "No activity recorded.";
        return;
    }

    state.events.forEach(event => {
        const entry = document.createElement("div");
        entry.className = "log-entry";

        const message = document.createElement("span");
        message.textContent = event.message;

        const time = document.createElement("time");
        time.textContent = event.time;

        entry.append(message, time);
        container.appendChild(entry);
    });
}

function updateStatistics() {
    const count = state.events.length;

    if ($("#event-count")) $("#event-count").textContent = count;
    if ($("#statistics-events")) $("#statistics-events").textContent = count;
}

function initializeLogs() {
    $("#clear-logs")?.addEventListener("click", () => {
        state.events = [];
        renderLogs();
        updateStatistics();
        notify("Logs cleared");
    });

    renderLogs();
}

/* ==========================================
   VISITOR MONITOR — CONSENT REQUIRED
========================================== */

function initializeVisitorMonitor() {
    const modal = $("#visitor-consent");
    const accept = $("#visitor-accept");
    const refuse = $("#visitor-refuse");

    const preference = localStorage.getItem("darkc_visit_consent");

    function updateConsentStatus() {
        const status = $("#visitor-consent-status");
        if (status) {
            status.textContent = preferenceText();
        }
    }

    function preferenceText() {
        const saved = localStorage.getItem("darkc_visit_consent");

        if (saved === "accepted") return "ACCEPTED";
        if (saved === "refused") return "REFUSED";

        return "NOT SET";
    }

    updateConsentStatus();

    if (!preference && modal) {
        modal.style.display = "flex";
    }

    accept?.addEventListener("click", async () => {
        localStorage.setItem("darkc_visit_consent", "accepted");
        modal.style.display = "none";
        updateConsentStatus();
        await sendVisitNotification();
    });

    refuse?.addEventListener("click", () => {
        localStorage.setItem("darkc_visit_consent", "refused");
        modal.style.display = "none";
        updateConsentStatus();
        notify("Privacy preference saved");
    });

    $("#visitor-test")?.addEventListener("click", async () => {
        const status = $("#visitor-api-status");

        try {
            const response = await fetch("/api/health");
            const data = await response.json();

            status.textContent = data.ok ? "ONLINE" : "UNAVAILABLE";
            notify(data.ok ? "Service is online" : "Service unavailable");
        } catch {
            status.textContent = "OFFLINE";
            notify("Could not reach the service");
        }
    });
}

async function sendVisitNotification() {
    if (state.visitNotificationSent) return;

    state.visitNotificationSent = true;

    const userAgent = navigator.userAgent.slice(0, 250);
    const isMobile = /Android|iPhone|iPod/i.test(userAgent);
    const isTablet = /iPad|Tablet/i.test(userAgent);

    const device = isTablet
        ? "Tablet"
        : isMobile
            ? "Mobile"
            : "Desktop";

    try {
        const response = await fetch("/api/visit-notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                page: window.location.pathname,
                userAgent,
                device
            })
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            notify("Email notification unavailable");
            return;
        }

        logEvent("Consented visit notification sent");
        notify("Visit notification sent");
    } catch {
        notify("Visit notification could not be sent");
    }
}

/* ==========================================
   SETTINGS
========================================== */

function initializeSettings() {
    const matrix = $("#setting-matrix");
    const notifications = $("#setting-notifications");

    if (matrix) matrix.checked = state.settings.matrix;
    if (notifications) notifications.checked = state.settings.notifications;

    $("#save-settings")?.addEventListener("click", () => {
        state.settings.matrix = matrix.checked;
        state.settings.notifications = notifications.checked;

        notify("Settings saved for this session");
        logEvent("Interface settings updated");
    });
}

/* ==========================================
   START APPLICATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    runBoot();
});
