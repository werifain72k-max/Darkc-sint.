
/* ==========================================
   DARKC-SINT — COMPLETE JAVASCRIPT
   No visitor tracking / No email / No Resend
========================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const $ = (selector) => document.querySelector(selector);

  /* ========================================
     LOCAL SETTINGS
  ======================================== */

  const STORAGE_KEY = "darkcsint_settings";

  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  let settings = loadSettings();

  let matrixEnabled = settings.matrix !== false;
  let notificationsEnabled = settings.notifications !== false;

  /* ========================================
     LOCAL NOTIFICATIONS
  ======================================== */

  function notify(message, type = "success") {
    if (!notificationsEnabled) return;

    const container = $("#notifications");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast" + (type === "error" ? " error" : "");
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  /* ========================================
     CLOCK
  ======================================== */

  function updateClock() {
    const now = new Date();

    const time = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    if ($("#clock")) $("#clock").textContent = time;
    if ($("#dashboard-time")) {
      $("#dashboard-time").textContent = time;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* ========================================
     BOOT SCREEN
  ======================================== */

  function startBoot() {
    const boot = $("#boot-screen");
    const app = $("#app");
    const fill = $("#progress-fill");
    const percent = $("#boot-percent");
    const status = $("#boot-status");
    const lines = $("#boot-lines");

    if (!boot || !app || !fill) {
      if (app) app.classList.add("visible");
      return;
    }

    const messages = [
      "INITIALIZING DARKC-SINT...",
      "LOADING INTERFACE MODULES...",
      "CHECKING LOCAL COMPONENTS...",
      "INITIALIZING SECURITY TOOLS...",
      "LOADING DASHBOARD...",
      "SYSTEM READY."
    ];

    let progress = 0;
    let messageIndex = 0;

    function addBootLine(message) {
      if (!lines) return;

      const line = document.createElement("div");
      line.className = "boot-line";
      line.textContent = "> " + message;
      lines.appendChild(line);

      while (lines.children.length > 7) {
        lines.removeChild(lines.firstChild);
      }
    }

    addBootLine(messages[0]);

    const interval = setInterval(() => {
      progress = Math.min(progress + 2, 100);

      fill.style.width = progress + "%";

      if (percent) {
        percent.textContent = progress + "%";
      }

      if (progress % 20 === 0 && messageIndex < messages.length - 1) {
        messageIndex++;
        addBootLine(messages[messageIndex]);

        if (status) {
          status.textContent = messages[messageIndex];
        }
      }

      if (progress >= 100) {
        clearInterval(interval);

        setTimeout(() => {
          boot.style.display = "none";

          if (matrixEnabled) {
            startMatrix();
          } else {
            showApp();
          }
        }, 400);
      }
    }, 45);
  }

  /* ========================================
     MATRIX INTRO — 2 SECONDS
  ======================================== */

  let matrixAnimation = null;

  function startMatrix() {
    const screen = $("#matrix-screen");
    const canvas = $("#matrix");

    if (!screen || !canvas) {
      showApp();
      return;
    }

    screen.classList.add("active");

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      showApp();
      return;
    }

    let width = 0;
    let height = 0;
    let columns = 0;
    let drops = [];

    const fontSize = 15;
    const characters = "01アイウエオカキクケコサシスセソタチツテト";

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      columns = Math.ceil(width / fontSize);
      drops = Array(columns).fill(1);
    }

    function drawMatrix() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#00ff75";
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const character = characters[
          Math.floor(Math.random() * characters.length)
        ];

        ctx.fillText(
          character,
          i * fontSize,
          drops[i] * fontSize
        );

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      matrixAnimation = requestAnimationFrame(drawMatrix);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    drawMatrix();

    setTimeout(() => {
      if (matrixAnimation) {
        cancelAnimationFrame(matrixAnimation);
        matrixAnimation = null;
      }

      window.removeEventListener("resize", resizeCanvas);
      screen.classList.remove("active");
      showApp();
    }, 2000);
  }

  function showApp() {
    const app = $("#app");

    if (app) {
      app.classList.add("visible");
    }

    notify("DARKC-SINT initialized successfully.");
  }

  /* ========================================
     NAVIGATION
  ======================================== */

  function openPage(pageName) {
    const target = $("#page-" + pageName);

    if (!target) return;

    document.querySelectorAll(".page").forEach(page => {
      page.classList.remove("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle(
        "active",
        link.dataset.page === pageName
      );
    });

    target.classList.add("active");

    const sidebar = $("#sidebar");
    if (sidebar) sidebar.classList.remove("open");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      openPage(link.dataset.page);
    });
  });

  document.querySelectorAll("[data-goto]").forEach(button => {
    button.addEventListener("click", () => {
      openPage(button.dataset.goto);
    });
  });

  const menuToggle = $("#menu-toggle");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      $("#sidebar")?.classList.toggle("open");
    });
  }

  /* ========================================
     DEVICE INFORMATION
  ======================================== */

  function detectBrowser() {
    const ua = navigator.userAgent;

    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg")) return "Microsoft Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";

    return "Unknown browser";
  }

  if ($("#browser-info")) {
    $("#browser-info").textContent = detectBrowser();
  }

  if ($("#platform-info")) {
    $("#platform-info").textContent =
      navigator.userAgentData?.platform ||
      navigator.platform ||
      "Unknown";
  }

  if ($("#language-info")) {
    $("#language-info").textContent =
      navigator.language || "Unknown";
  }

  /* ========================================
     PASSWORD GENERATOR
  ======================================== */

  const lengthInput = $("#password-length");
  const lengthValue = $("#length-value");

  if (lengthInput && lengthValue) {
    lengthInput.addEventListener("input", () => {
      lengthValue.textContent = lengthInput.value;
    });
  }

  function randomIndex(max) {
    const array = new Uint32Array(1);
    const limit = Math.floor(4294967296 / max) * max;

    let value;

    do {
      crypto.getRandomValues(array);
      value = array[0];
    } while (value >= limit);

    return value % max;
  }

  function generatePassword() {
    const length = Number(lengthInput?.value || 20);

    const groups = [];

    if ($("#include-uppercase")?.checked) {
      groups.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    }

    if ($("#include-lowercase")?.checked) {
      groups.push("abcdefghijklmnopqrstuvwxyz");
    }

    if ($("#include-numbers")?.checked) {
      groups.push("0123456789");
    }

    if ($("#include-symbols")?.checked) {
      groups.push("!@#$%^&*()-_=+[]{}?");
    }

    if (groups.length === 0) {
      notify("Select at least one character type.", "error");
      return;
    }

    if (length < groups.length) {
      notify("Password length is too short for selected options.", "error");
      return;
    }

    let password = "";

    // Include at least one character from each selected group.
    groups.forEach(group => {
      password += group[randomIndex(group.length)];
    });

    const allCharacters = groups.join("");

    while (password.length < length) {
      password += allCharacters[
        randomIndex(allCharacters.length)
      ];
    }

    // Securely shuffle the characters.
    const chars = password.split("");

    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    password = chars.join("");

    const output = $("#generated-password");

    if (output) {
      output.textContent = password;
    }

    notify("Password generated locally.");
  }

  $("#generate-password")?.addEventListener(
    "click",
    generatePassword
  );

  $("#copy-password")?.addEventListener("click", async () => {
    const password = $("#generated-password")?.textContent;

    if (!password || password === "Your password will appear here.") {
      notify("Generate a password first.", "error");
      return;
    }

    await copyText(password);
  });

  /* ========================================
     PASSWORD CHECKER
  ======================================== */

  function analyzePassword() {
    const input = $("#password-test");
    const result = $("#password-result");

    if (!input || !result) return;

    const value = input.value;

    if (!value) {
      result.innerHTML = "";
      const message = document.createElement("p");
      message.textContent = "Please enter a password.";
      result.appendChild(message);
      notify("Enter a password first.", "error");
      return;
    }

    let score = 0;

    if (value.length >= 12) score++;
    if (value.length >= 16) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    let level = "Very weak";

    if (score >= 2) level = "Weak";
    if (score >= 3) level = "Medium";
    if (score >= 4) level = "Good";
    if (score >= 5) level = "Strong";
    if (score >= 6) level = "Very strong";

    result.innerHTML = "";

    const heading = document.createElement("span");
    heading.textContent = "ANALYSIS RESULT";

    const message = document.createElement("p");
    message.textContent = "Estimated strength: " + level;

    result.append(heading, message);

    notify("Password analysis complete.");
  }

  $("#check-password")?.addEventListener(
    "click",
    analyzePassword
  );

  /* ========================================
     NETWORK INFORMATION
  ======================================== */

  function refreshNetwork() {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const status = navigator.onLine ? "Online" : "Offline";

    if ($("#network-status")) {
      $("#network-status").textContent = status;
      $("#network-status").className =
        navigator.onLine ? "green-text" : "";
    }

    if ($("#network-type")) {
      $("#network-type").textContent =
        connection?.type || "Not provided by browser";
    }

    if ($("#network-speed")) {
      $("#network-speed").textContent =
        connection?.effectiveType
          ? connection.effectiveType.toUpperCase()
          : "Unavailable";
    }
  }

  $("#refresh-network")?.addEventListener("click", () => {
    refreshNetwork();
    notify("Network information refreshed.");
  });

  window.addEventListener("online", refreshNetwork);
  window.addEventListener("offline", refreshNetwork);

  refreshNetwork();

  /* ========================================
     SHA-256 GENERATOR
  ======================================== */

  async function generateHash() {
    const input = $("#hash-input");
    const output = $("#hash-result");

    if (!input || !output) return;

    if (!input.value) {
      output.textContent = "Enter some text first.";
      notify("Text is required.", "error");
      return;
    }

    if (!window.crypto?.subtle) {
      output.textContent =
        "SHA-256 requires a secure browser context (HTTPS).";
      notify("Secure context unavailable.", "error");
      return;
    }

    try {
      const data = new TextEncoder().encode(input.value);

      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        data
      );

      const hashArray = Array.from(new Uint8Array(hashBuffer));

      const hash = hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

      output.textContent = hash;

      notify("SHA-256 hash generated.");
    } catch {
      output.textContent = "Hash generation failed.";
      notify("Unable to generate hash.", "error");
    }
  }

  $("#generate-hash")?.addEventListener(
    "click",
    generateHash
  );

  $("#copy-hash")?.addEventListener("click", async () => {
    const hash = $("#hash-result")?.textContent;

    if (
      !hash ||
      hash === "Your hash will appear here." ||
      hash === "Enter some text first."
    ) {
      notify("Generate a hash first.", "error");
      return;
    }

    await copyText(hash);
  });

  /* ========================================
     COPY FUNCTION
  ======================================== */

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temporary = document.createElement("textarea");
        temporary.value = text;
        temporary.style.position = "fixed";
        temporary.style.opacity = "0";

        document.body.appendChild(temporary);
        temporary.select();

        const success = document.execCommand("copy");
        temporary.remove();

        if (!success) throw new Error("Copy failed");
      }

      notify("Copied to clipboard.");
    } catch {
      notify("Copy failed. Select the text manually.", "error");
    }
  }

  /* ========================================
     SIMULATED TERMINAL
  ======================================== */

  const terminalForm = $("#terminal-form");
  const terminalInput = $("#terminal-input");
  const terminalOutput = $("#terminal-output");

  function terminalWrite(message, className = "") {
    if (!terminalOutput) return;

    const line = document.createElement("p");

    if (className) {
      line.className = className;
    }

    line.textContent = message;
    terminalOutput.appendChild(line);

    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function terminalCommand(command) {
    const value = command.trim();
    const cmd = value.toLowerCase();

    if (!cmd) return;

    terminalWrite("root@darkc-sint:~$ " + value);

    switch (cmd) {
      case "help":
        terminalWrite("AVAILABLE SIMULATED COMMANDS:");
        terminalWrite("help     - Display available commands");
        terminalWrite("clear    - Clear the terminal");
        terminalWrite("date     - Display local date");
        terminalWrite("time     - Display local time");
        terminalWrite("status   - Display interface status");
        terminalWrite("tools    - Display available tools");
        terminalWrite("about    - About DARKC-SINT");
        terminalWrite("whoami   - Display simulated identity");
        terminalWrite("version  - Display interface version");
        break;

      case "clear":
        terminalOutput.innerHTML = "";
        break;

      case "date":
        terminalWrite(new Date().toLocaleDateString("fr-FR"));
        break;

      case "time":
        terminalWrite(new Date().toLocaleTimeString("fr-FR"));
        break;

      case "status":
        terminalWrite("DARKC-SINT: ONLINE");
        terminalWrite("INTERFACE: OPERATIONAL");
        terminalWrite("MODE: EDUCATIONAL SIMULATION");
        break;

      case "tools":
        terminalWrite("PASSWORD GENERATOR");
        terminalWrite("PASSWORD CHECKER");
        terminalWrite("NETWORK INFORMATION");
        terminalWrite("SHA-256 GENERATOR");
        terminalWrite("THREAT INTELLIGENCE");
        break;

      case "about":
        terminalWrite("DARKC-SINT CYBERSECURITY INTERFACE.");
        terminalWrite("Educational tools running in your browser.");
        break;

      case "whoami":
        terminalWrite("simulated-user");
        break;

      case "version":
        terminalWrite("DARKC-SINT VERSION 1.0.0");
        break;

      default:
        terminalWrite("Unknown command. Type help.", "green-text");
    }
  }

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener("submit", event => {
      event.preventDefault();

      terminalCommand(terminalInput.value);
      terminalInput.value = "";
    });
  }

  /* ========================================
     SETTINGS
  ======================================== */

  const matrixSetting = $("#setting-matrix");
  const notificationSetting = $("#setting-notifications");

  if (matrixSetting) {
    matrixSetting.checked = matrixEnabled;
  }

  if (notificationSetting) {
    notificationSetting.checked = notificationsEnabled;
  }

  $("#save-settings")?.addEventListener("click", () => {
    matrixEnabled = matrixSetting?.checked ?? true;

    notificationsEnabled =
      notificationSetting?.checked ?? true;

    settings = {
      matrix: matrixEnabled,
      notifications: notificationsEnabled
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch {
      notify("Settings could not be saved.", "error");
      return;
    }

    notify("Settings saved successfully.");
  });

  /* ========================================
     START
  ======================================== */

  startBoot();

});
