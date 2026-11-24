
"use strict";

/* ==========================================
   DARKC-SINT — MAIN SCRIPT
   Navigation, boot, Matrix, tools and consent
========================================== */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const safeStorage = {
    get(key) {
      try { return localStorage.getItem(key); }
      catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); }
      catch {}
    }
  };

  let eventCount = 0;
  let notificationsEnabled = safeStorage.get("darkcsint-notifications") !== "false";
  let currentPage = "dashboard";
  let terminalHistory = [];

  /* ---------- NOTIFICATIONS ---------- */

  function notify(message, type = "success") {
    const container = $("#notifications");
    if (!container || !notificationsEnabled) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
  }

  /* ---------- ACTIVITY LOGS ---------- */

  function addLog(message) {
    eventCount++;

    const counter = $("#event-count");
    if (counter) counter.textContent = eventCount;

    const stats = $("#statistics-events");
    if (stats) stats.textContent = eventCount;

    const list = $("#logs-list");

    if (list) {
      const item = document.createElement("div");
      item.className = "log-entry";

      const time = new Date().toLocaleTimeString("fr-FR");
      item.textContent = `[${time}] ${message}`;

      list.prepend(item);
    }
  }

  /* ---------- CLOCK ---------- */

  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString("fr-FR");

    const clock = $("#clock");
    const dashboardTime = $("#dashboard-time");

    if (clock) clock.textContent = time;
    if (dashboardTime) {
      dashboardTime.textContent = now.toLocaleString("fr-FR");
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* ---------- BOOT SCREEN ---------- */

  const bootMessages = [
    "DARKC-SINT SYSTEM INITIALIZATION",
    "Loading security interface...",
    "Checking local modules...",
    "Initializing terminal...",
    "Loading cybersecurity tools...",
    "Preparing Matrix interface...",
    "Starting dashboard...",
    "All modules initialized."
  ];

  function startBoot() {
    const boot = $("#boot-screen");
    const matrixScreen = $("#matrix-screen");
    const mainSite = $("#main-site");
    const lines = $("#boot-lines");
    const progress = $("#progress-fill");
    const status = $("#boot-status");
    const percent = $("#boot-percent");

    if (!boot || !mainSite) {
      if (mainSite) mainSite.style.display = "block";
      return;
    }

    boot.style.display = "flex";
    if (matrixScreen) matrixScreen.style.display = "none";
    mainSite.style.display = "none";

    let value = 0;
    let messageIndex = 0;

    if (lines) lines.textContent = "";

    const loading = setInterval(() => {
      value = Math.min(100, value + Math.floor(Math.random() * 8) + 3);

      if (progress) progress.style.width = `${value}%`;
      if (percent) percent.textContent = `${value}%`;

      if (status) {
        status.textContent = value < 100
          ? "INITIALIZING SYSTEM..."
          : "SYSTEM READY";
      }

      if (lines && messageIndex < bootMessages.length && value >= messageIndex * 13) {
        const line = document.createElement("div");
        line.textContent = `> ${bootMessages[messageIndex]}`;
        lines.appendChild(line);
        messageIndex++;
      }

      if (value >= 100) {
        clearInterval(loading);

        setTimeout(() => {
          boot.style.display = "none";
          showMatrixIntro();
        }, 350);
      }
    }, 180);
  }

  /* ---------- MATRIX INTRO ---------- */

  let matrixAnimation = null;

  function runMatrix() {
    const canvas = $("#matrix");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const characters = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 14;
    let columns = 0;
    let drops = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1);
    }

    resize();

    window.addEventListener("resize", resize);

    matrixAnimation = setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff75";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const character = characters.charAt(
          Math.floor(Math.random() * characters.length)
        );

        ctx.fillText(character, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }, 45);
  }

  function showMatrixIntro() {
    const matrixScreen = $("#matrix-screen");
    const mainSite = $("#main-site");

    if (safeStorage.get("darkcsint-matrix") === "false" || !matrixScreen) {
      if (matrixScreen) matrixScreen.style.display = "none";
      if (mainSite) mainSite.style.display = "block";
      finishStartup();
      return;
    }

    matrixScreen.style.display = "flex";
    if (mainSite) mainSite.style.display = "none";

    runMatrix();

    setTimeout(() => {
      if (matrixAnimation) clearInterval(matrixAnimation);
      matrixAnimation = null;

      matrixScreen.style.display = "none";

      if (mainSite) mainSite.style.display = "block";

      finishStartup();
    }, 2000);
  }

  function finishStartup() {
    addLog("DARKC-SINT interface initialized");
    updateBrowserInformation();
    checkVisitorConsent();
    updateNetworkInformation();
  }

  /* ---------- NAVIGATION ---------- */

  function openPage(pageName) {
    const target = $(`#page-${pageName}`);
    if (!target) return;

    $$(".page").forEach((page) => page.classList.remove("active"));
    target.classList.add("active");

    $$(".nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === pageName);
    });

    currentPage = pageName;

    const sidebar = $("#sidebar");
    if (sidebar) sidebar.classList.remove("open");

    addLog(`Page opened: ${pageName}`);
  }

  $$(".nav-link, .tool-link").forEach((link) => {
    link.addEventListener("click", () => {
      const page = link.dataset.page;
      if (page) openPage(page);
    });
  });

  const menuToggle = $("#menu-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      $("#sidebar")?.classList.toggle("open");
    });
  }

  /* ---------- DASHBOARD INFORMATION ---------- */

  function updateBrowserInformation() {
    const browser = $("#browser-info");
    const platform = $("#platform-info");
    const language = $("#language-info");

    if (browser) {
      const ua = navigator.userAgent;

      let name = "Navigateur inconnu";
      if (ua.includes("Edg/")) name = "Microsoft Edge";
      else if (ua.includes("Firefox/")) name = "Mozilla Firefox";
      else if (ua.includes("Chrome/")) name = "Google Chrome";
      else if (ua.includes("Safari/")) name = "Safari";

      browser.textContent = name;
    }

    if (platform) {
      platform.textContent = navigator.platform || "Non disponible";
    }

    if (language) {
      language.textContent = navigator.language || "Non disponible";
    }
  }

  /* ---------- PASSWORD GENERATOR ---------- */

  function generatePassword() {
    const lengthInput = $("#password-length");
    const length = Math.min(64, Math.max(8, Number(lengthInput?.value || 20)));

    let characters = "";

    if ($("#include-uppercase")?.checked) characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if ($("#include-lowercase")?.checked) characters += "abcdefghijklmnopqrstuvwxyz";
    if ($("#include-numbers")?.checked) characters += "0123456789";
    if ($("#include-symbols")?.checked) characters += "!@#$%^&*()-_=+[]{}";

    const output = $("#generated-password");

    if (!output) return;

    if (!characters) {
      output.textContent = "Select at least one character type.";
      notify("Choisis au moins un type de caractère.", "error");
      return;
    }

    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    let password = "";

    for (let i = 0; i < length; i++) {
      password += characters[randomValues[i] % characters.length];
    }

    output.textContent = password;

    addLog("Password generated locally");
    notify("Mot de passe généré.");
  }

  $("#generate-password")?.addEventListener("click", generatePassword);

  $("#copy-password")?.addEventListener("click", async () => {
    const password = $("#generated-password")?.textContent || "";

    if (!password || password === "Your password will appear here.") return;

    try {
      await navigator.clipboard.writeText(password);
      notify("Mot de passe copié.");
    } catch {
      notify("Copie impossible sur ce navigateur.", "error");
    }
  });

  /* ---------- PASSWORD CHECKER ---------- */

  function analyzePassword() {
    const value = $("#password-test")?.value || "";
    const result = $("#password-result");

    if (!result) return;

    if (!value) {
      result.textContent = "Entre un mot de passe pour commencer.";
      return;
    }

    let score = 0;

    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const levels = [
      "Très faible",
      "Faible",
      "Moyen",
      "Bon",
      "Fort",
      "Très fort"
    ];

    result.textContent = `Niveau estimé : ${levels[score]}`;
  }

  $("#check-password")?.addEventListener("click", analyzePassword);

  $("#password-test")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") analyzePassword();
  });

  /* ---------- NETWORK INFORMATION ---------- */

  function updateNetworkInformation() {
    const status = $("#network-status");
    const type = $("#network-type");
    const speed = $("#network-speed");

    if (status) {
      status.textContent = navigator.onLine ? "En ligne" : "Hors ligne";
    }

    const connection = navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (type) {
      type.textContent = connection?.effectiveType || "Non disponible";
    }

    if (speed) {
      speed.textContent = connection?.downlink
        ? `${connection.downlink} Mb/s`
        : "Non disponible";
    }
  }

  $("#refresh-network")?.addEventListener("click", () => {
    updateNetworkInformation();
    addLog("Network information refreshed");
    notify("Informations réseau actualisées.");
  });

  window.addEventListener("online", updateNetworkInformation);
  window.addEventListener("offline", updateNetworkInformation);

  /* ---------- SHA-256 HASH ---------- */

  async function generateHash() {
    const input = $("#hash-input")?.value || "";
    const output = $("#hash-result");

    if (!output) return;

    if (!input.trim()) {
      output.textContent = "Entre un texte avant de générer le hash.";
      return;
    }

    try {
      const encoded = new TextEncoder().encode(input);
      const digest = await crypto.subtle.digest("SHA-256", encoded);

      const hash = [...new Uint8Array(digest)]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      output.textContent = hash;

      addLog("SHA-256 hash generated locally");
      notify("Hash SHA-256 généré.");
    } catch {
      output.textContent = "Impossible de générer le hash dans ce navigateur.";
      notify("Erreur de génération.", "error");
    }
  }

  $("#generate-hash")?.addEventListener("click", generateHash);

  $("#copy-hash")?.addEventListener("click", async () => {
    const hash = $("#hash-result")?.textContent || "";

    if (!/^[a-f0-9]{64}$/i.test(hash)) {
      notify("Aucun hash à copier.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(hash);
      notify("Hash copié.");
    } catch {
      notify("Copie impossible.", "error");
    }
  });

  /* ---------- EDUCATIONAL TERMINAL ---------- */

  function terminalPrint(message, className = "") {
    const output = $("#terminal-output");
    if (!output) return;

    const line = document.createElement("div");
    if (className) line.className = className;
    line.textContent = message;

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  function executeTerminalCommand(command) {
    const parts = command.trim().toLowerCase().split(/\s+/);
    const action = parts[0];

    if (!action) return;

    terminalPrint(`visitor@darkc-sint:~$ ${command}`, "terminal-command");
    terminalHistory.push(command);

    switch (action) {
      case "help":
        terminalPrint("Available commands:");
        terminalPrint("help | clear | date | time | status | tools | about");
        break;

      case "clear":
        if ($("#terminal-output")) $("#terminal-output").textContent = "";
        break;

      case "date":
        terminalPrint(new Date().toLocaleDateString("fr-FR"));
        break;

      case "time":
        terminalPrint(new Date().toLocaleTimeString("fr-FR"));
        break;

      case "status":
        terminalPrint("DARKC-SINT interface: ONLINE");
        terminalPrint(`Browser online: ${navigator.onLine ? "YES" : "NO"}`);
        break;

      case "tools":
        terminalPrint("Password generator");
        terminalPrint("Password checker");
        terminalPrint("Network information");
        terminalPrint("SHA-256 hash generator");
        break;

      case "about":
        terminalPrint("DARKC-SINT — Educational cybersecurity interface.");
        terminalPrint("This terminal is simulated. It does not execute system commands.");
        break;

      default:
        terminalPrint(`Command not found: ${action}`);
        terminalPrint("Type 'help' to see available commands.");
    }
  }

  $("#terminal-form")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = $("#terminal-input");
    if (!input) return;

    const command = input.value;
    input.value = "";

    executeTerminalCommand(command);
  });

  /* ---------- LOGS ---------- */

  $("#clear-logs")?.addEventListener("click", () => {
    const list = $("#logs-list");
    if (list) list.textContent = "";

    notify("Journal local vidé.");
    addLog("Local activity log cleared");
  });

  /* ---------- VISITOR CONSENT AND EMAIL ---------- */

  const CONSENT_KEY = "darkcsint-visitor-consent";
  const SENT_KEY = "darkcsint-notification-sent";

  function getDeviceCategory() {
    const ua = navigator.userAgent || "";

    if (/iPad|Tablet/i.test(ua)) return "Tablet";
    if (/Mobi|Android|iPhone/i.test(ua)) return "Mobile";

    return "Desktop";
  }

  async function sendVisitNotification() {
    try {
      const response = await fetch("/api/visit-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          page: window.location.pathname,
          userAgent: navigator.userAgent.slice(0, 250),
          device: getDeviceCategory()
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        console.error("DARKC-SINT notification error:", data.error || response.status);
        addLog("Visit notification could not be sent");
        return;
      }

      addLog("Consent-based visit notification accepted by server");
    } catch (error) {
      console.error("DARKC-SINT notification request failed:", error);
      addLog("Visit notification service unavailable");
    }
  }

  function sendOnceAfterConsent() {
    if (safeStorage.get(SENT_KEY) === "true") return;

    safeStorage.set(SENT_KEY, "true");
    sendVisitNotification();
  }

  function checkVisitorConsent() {
    const modal = $("#visitor-consent");
    const consent = safeStorage.get(CONSENT_KEY);

    const consentStatus = $("#visitor-consent-status");

    if (consentStatus) {
      consentStatus.textContent =
        consent === "accepted" ? "Accepted" :
        consent === "refused" ? "Refused" :
        "Not selected";
    }

    if (consent === "accepted") {
      if (modal) modal.style.display = "none";
      sendOnceAfterConsent();
      return;
    }

    if (consent === "refused") {
      if (modal) modal.style.display = "none";
      return;
    }

    if (modal) modal.style.display = "flex";
  }

  $("#visitor-accept")?.addEventListener("click", () => {
    safeStorage.set(CONSENT_KEY, "accepted");

    const modal = $("#visitor-consent");
    if (modal) modal.style.display = "none";

    const consentStatus = $("#visitor-consent-status");
    if (consentStatus) consentStatus.textContent = "Accepted";

    addLog("Optional visit notification consent accepted");
    notify("Consentement accepté.");

    sendOnceAfterConsent();
  });

  $("#visitor-refuse")?.addEventListener("click", () => {
    safeStorage.set(CONSENT_KEY, "refused");

    const modal = $("#visitor-consent");
    if (modal) modal.style.display = "none";

    const consentStatus = $("#visitor-consent-status");
    if (consentStatus) consentStatus.textContent = "Refused";

    addLog("Optional visit notification consent refused");
    notify("Tu as refusé la notification.");
  });

  /* ---------- SERVICE HEALTH CHECK ---------- */

  $("#visitor-test")?.addEventListener("click", async () => {
    const status = $("#visitor-api-status");

    if (status) status.textContent = "Checking...";

    try {
      const response = await fetch("/api/health");
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error("Service unavailable");
      }

      if (status) status.textContent = "ONLINE";
      notify("Serveur DARKC-SINT en ligne.");
      addLog("API health check successful");
    } catch {
      if (status) status.textContent = "OFFLINE";
      notify("Serveur inaccessible.", "error");
      addLog("API health check failed");
    }
  });

  /* ---------- SETTINGS ---------- */

  const matrixSetting = $("#setting-matrix");
  const notificationSetting = $("#setting-notifications");

  if (matrixSetting) {
    matrixSetting.checked = safeStorage.get("darkcsint-matrix") !== "false";
  }

  if (notificationSetting) {
    notificationSetting.checked = notificationsEnabled;
  }

  $("#save-settings")?.addEventListener("click", () => {
    if (matrixSetting) {
      safeStorage.set(
        "darkcsint-matrix",
        matrixSetting.checked ? "true" : "false"
      );
    }

    if (notificationSetting) {
      notificationsEnabled = notificationSetting.checked;
      safeStorage.set(
        "darkcsint-notifications",
        notificationsEnabled ? "true" : "false"
      );
    }

    addLog("Interface settings saved locally");
    notify("Paramètres enregistrés.");
  });

  /* ---------- START ---------- */

  startBoot();
});
