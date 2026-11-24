
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  // NOTIFICATIONS
  function notify(message) {
    if (localStorage.getItem("darkc-notifications") === "false") return;
    const area = $("notifications");
    const item = document.createElement("div");
    item.className = "notification";
    item.textContent = message;
    area.appendChild(item);
    setTimeout(() => item.remove(), 3500);
  }

  function log(message) {
    const list = $("logs-list");
    if (list.textContent.includes("No activity")) list.textContent = "";
    const line = document.createElement("p");
    line.textContent = new Date().toLocaleTimeString() + " — " + message;
    list.prepend(line);
  }

  // CLOCK
  function updateClock() {
    const now = new Date().toLocaleTimeString("fr-FR");
    $("clock").textContent = now;
    $("dashboard-time").textContent = now;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // DEVICE INFO
  const ua = navigator.userAgent;
  $("browser-info").textContent =
    ua.includes("Firefox") ? "Firefox" :
    ua.includes("Edg") ? "Edge" :
    ua.includes("Chrome") ? "Chrome" :
    ua.includes("Safari") ? "Safari" : "Browser";
  $("platform-info").textContent = navigator.platform || "Unknown";
  $("language-info").textContent = "Language: " + navigator.language;

  // NAVIGATION
  const sidebar = $("sidebar");
  const main = document.querySelector(".main-content");

  $("menu-toggle").addEventListener("click", () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle("open");
    } else {
      sidebar.classList.toggle("closed");
      main.classList.toggle("full");
    }
  });

  function openPage(name) {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));

    const page = $("page-" + name);
    const link = document.querySelector('[data-page="' + name + '"]');

    if (page) page.classList.add("active");
    if (link) link.classList.add("active");

    sidebar.classList.remove("open");
    log("Opened " + name);
  }

  document.querySelectorAll("[data-page]").forEach(link => {
    link.addEventListener("click", () => openPage(link.dataset.page));
  });

  document.querySelectorAll("[data-open]").forEach(button => {
    button.addEventListener("click", () => openPage(button.dataset.open));
  });

  // BOOT SCREEN
  const bootMessages = [
    "Initializing DARKC-SINT...",
    "Loading interface modules...",
    "Checking local environment...",
    "Preparing security tools...",
    "Starting dashboard...",
    "System ready."
  ];

  let progress = 0;
  let lastIndex = -1;

  const bootInterval = setInterval(() => {
    progress = Math.min(progress + 2, 100);
    $("progress-fill").style.width = progress + "%";
    $("boot-percent").textContent = progress + "%";

    const index = Math.min(bootMessages.length - 1, Math.floor(progress / 17));
    $("boot-status").textContent = bootMessages[index].toUpperCase();

    if (index !== lastIndex) {
      lastIndex = index;
      const line = document.createElement("div");
      line.textContent = "> " + bootMessages[index];
      $("boot-lines").appendChild(line);
    }

    if (progress >= 100) {
      clearInterval(bootInterval);
      setTimeout(() => {
        $("boot-screen").classList.add("hidden");

        if (localStorage.getItem("darkc-matrix") !== "false") {
          startMatrix();
        } else {
          $("app").classList.remove("hidden");
        }
      }, 300);
    }
  }, 35);

  // MATRIX
  function startMatrix() {
    const screen = $("matrix-screen");
    const canvas = $("matrix");
    const ctx = canvas.getContext("2d");

    screen.style.display = "block";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01";
    const size = 17;
    const columns = Math.ceil(canvas.width / size);
    const drops = Array(columns).fill(1);

    const animation = setInterval(() => {
      ctx.fillStyle = "rgba(0,0,0,0.09)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ed2020";
      ctx.font = size + "px monospace";

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * size, y * size);

        if (y * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 45);

    setTimeout(() => {
      clearInterval(animation);
      screen.style.display = "none";
      $("app").classList.remove("hidden");
      notify("DARKC-SINT system ready");
    }, 2000);
  }

  // PASSWORD GENERATOR
  $("password-length").addEventListener("input", event => {
    $("length-value").textContent = event.target.value;
  });

  $("generate-password").addEventListener("click", () => {
    let chars = "";
    if ($("include-uppercase").checked) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if ($("include-lowercase").checked) chars += "abcdefghijklmnopqrstuvwxyz";
    if ($("include-numbers").checked) chars += "0123456789";
    if ($("include-symbols").checked) chars += "!@#$%^&*()-_=+";

    if (!chars) return notify("Select at least one character type");

    const length = Number($("password-length").value);
    const random = new Uint32Array(length);
    crypto.getRandomValues(random);

    let password = "";
    for (let i = 0; i < length; i++) password += chars[random[i] % chars.length];

    $("generated-password").textContent = password;
    log("Password generated locally");
  });

  $("copy-password").addEventListener("click", async () => {
    const value = $("generated-password").textContent;
    if (!value || value === "Your password will appear here") return;
    try {
      await navigator.clipboard.writeText(value);
      notify("Password copied");
    } catch {
      notify("Clipboard unavailable");
    }
  });

  // PASSWORD ANALYZER
  $("password-test").addEventListener("click", () => {
    const password = $("check-password").value;
    if (!password) return notify("Enter a password first");

    let score = 0;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
    $("password-result").textContent = "Result: " + levels[score] + " (" + score + "/5)";
  });

  // NETWORK
  function refreshNetwork() {
    $("network-status").textContent = navigator.onLine ? "● Connected" : "● Offline";
    $("network-status").style.color = navigator.onLine ? "#00ff75" : "#ed2020";

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    $("network-type").textContent = connection?.type || connection?.effectiveType || "Not provided";
    $("network-speed").textContent = connection?.downlink ? connection.downlink + " Mbps (estimate)" : "Not provided";
  }

  $("refresh-network").addEventListener("click", refreshNetwork);
  window.addEventListener("online", refreshNetwork);
  window.addEventListener("offline", refreshNetwork);
  refreshNetwork();

  // SHA-256
  $("generate-hash").addEventListener("click", async () => {
    const value = $("hash-input").value;
    if (!value) return notify("Enter some text first");

    if (!crypto.subtle) return notify("SHA-256 requires HTTPS or localhost");

    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const hash = Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, "0")).join("");

    $("hash-result").textContent = hash;
    log("SHA-256 hash generated");
  });

  $("copy-hash").addEventListener("click", async () => {
    const value = $("hash-result").textContent;
    if (!value || value === "Hash will appear here") return;
    try {
      await navigator.clipboard.writeText(value);
      notify("Hash copied");
    } catch {
      notify("Clipboard unavailable");
    }
  });

  // EDUCATIONAL TERMINAL
  $("terminal-form").addEventListener("submit", event => {
    event.preventDefault();
    const input = $("terminal-input");
    const command = input.value.trim().toLowerCase();
    if (!command) return;

    const output = $("terminal-output");
    const responses = {
      help: "Available commands: help, date, time, status, clear, about",
      date: new Date().toLocaleDateString("fr-FR"),
      time: new Date().toLocaleTimeString("fr-FR"),
      status: "DARKC-SINT interface: ONLINE",
      about: "DARKC-SINT educational security workspace.",
      clear: ""
    };

    if (command === "clear") {
      output.textContent = "";
    } else {
      output.textContent += "\n> " + command + "\n" + (responses[command] || "Unknown command. Type help.");
    }

    output.scrollTop = output.scrollHeight;
    input.value = "";
  });

  // DISCORD LOOKUP
  $("discord-form").addEventListener("submit", async event => {
    event.preventDefault();
    const id = $("discord-id").value.trim();

    if (!/^\d{17,20}$/.test(id)) {
      $("discord-state").textContent = "Please enter a valid Discord ID.";
      return;
    }

    $("discord-state").textContent = "Looking up authorised profile information...";
    $("discord-profile").textContent = "";

    try {
      const response = await fetch("/api/discord/profile?id=" + encodeURIComponent(id));
      if (!response.ok) throw new Error("Profile unavailable");

      const data = await response.json();
      const container = $("discord-profile");

      const card = document.createElement("div");
      card.className = "discord-card";

      if (data.avatarUrl) {
        const avatar = document.createElement("img");
        avatar.src = data.avatarUrl;
        avatar.alt = "Discord avatar";
        card.appendChild(avatar);
      }

      const details = document.createElement("div");
      const username = document.createElement("strong");
      username.textContent = data.globalName || data.username || "Discord user";

      const idText = document.createElement("p");
      idText.textContent = "ID: " + id;

      details.append(username, idText);
      card.appendChild(details);
      container.appendChild(card);

      $("discord-state").textContent = "Profile information received.";
    } catch {
      $("discord-state").textContent =
        "Lookup unavailable. Check that your authorised Discord integration is configured.";
    }
  });

  // SETTINGS
  $("setting-matrix").checked = localStorage.getItem("darkc-matrix") !== "false";
  $("setting-notifications").checked = localStorage.getItem("darkc-notifications") !== "false";

  $("save-settings").addEventListener("click", () => {
    localStorage.setItem("darkc-matrix", $("setting-matrix").checked);
    localStorage.setItem("darkc-notifications", $("setting-notifications").checked);
    notify("Settings saved");
    log("Settings updated");
  });
});
