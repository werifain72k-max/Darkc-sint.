
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  // NOTIFICATIONS
  function notify(message) {
    if (localStorage.getItem("darkc-notifications") === "false") return;
    const area = $("notifications");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    area.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // CLOCK
  function updateClock() {
    const now = new Date();
    $("clock").textContent = now.toLocaleTimeString("fr-FR");
    $("dashboard-time").textContent = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // BOOT SCREEN — GREEN
  const bootMessages = [
    "Initializing DARKC-SINT...",
    "Loading interface modules...",
    "Checking local environment...",
    "Preparing security tools...",
    "Starting intelligence dashboard...",
    "System ready."
  ];

  let progress = 0;
  const bootInterval = setInterval(() => {
    progress = Math.min(progress + 2, 100);
    $("progress-fill").style.width = progress + "%";
    $("boot-percent").textContent = progress + "%";

    const index = Math.min(bootMessages.length - 1, Math.floor(progress / 17));
    $("boot-status").textContent = bootMessages[index].toUpperCase();

    if (progress % 20 === 0) {
      const line = document.createElement("div");
      line.textContent = "> " + bootMessages[index];
      $("boot-lines").appendChild(line);
    }

    if (progress >= 100) {
      clearInterval(bootInterval);
      $("boot-screen").classList.add("hidden");

      if (localStorage.getItem("darkc-matrix") !== "false") {
        startMatrix();
      } else {
        $("app").classList.remove("hidden");
      }
    }
  }, 35);

  // MATRIX INTRO — RED — 2 SECONDS
  function startMatrix() {
    const screen = $("matrix-screen");
    const canvas = $("matrix");
    const ctx = canvas.getContext("2d");

    screen.style.display = "block";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01DARKCSINT";
    const size = 16;
    const columns = Math.floor(canvas.width / size);
    const drops = Array(columns).fill(1);

    const animation = setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // RED MATRIX
      ctx.fillStyle = "#ed2020";
      ctx.font = size + "px monospace";

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * size, y * size);

        if (y * size > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      });
    }, 45);

    setTimeout(() => {
      clearInterval(animation);
      screen.style.display = "none";
      $("app").classList.remove("hidden");
    }, 2000);
  }

  // NAVIGATION
  function openPage(name) {
    document.querySelectorAll(".page").forEach(page => {
      page.classList.remove("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link.dataset.page === name);
    });

    const page = $("page-" + name);
    if (page) page.classList.add("active");

    $("sidebar").classList.remove("open");
  }

  document.querySelectorAll(".nav-link").forEach(button => {
    button.addEventListener("click", () => openPage(button.dataset.page));
  });

  document.querySelectorAll("[data-open]").forEach(button => {
    button.addEventListener("click", () => openPage(button.dataset.open));
  });

  $("menu-toggle").addEventListener("click", () => {
    $("sidebar").classList.toggle("open");
  });

  // BROWSER INFORMATION
  const agent = navigator.userAgent;
  let browser = "Unknown";

  if (agent.includes("Edg/")) browser = "Microsoft Edge";
  else if (agent.includes("Firefox/")) browser = "Mozilla Firefox";
  else if (agent.includes("Chrome/")) browser = "Google Chrome";
  else if (agent.includes("Safari/")) browser = "Safari";

  $("browser-info").textContent = browser;
  $("platform-info").textContent = navigator.platform || "Unavailable";
  $("language-info").textContent = navigator.language || "Unavailable";

  // PASSWORD GENERATOR
  const lengthInput = $("password-length");

  lengthInput.addEventListener("input", () => {
    $("length-value").textContent = lengthInput.value;
  });

  function randomIndex(max) {
    const range = 0x100000000;
    const limit = range - (range % max);
    const array = new Uint32Array(1);
    let value;

    do {
      crypto.getRandomValues(array);
      value = array[0];
    } while (value >= limit);

    return value % max;
  }

  $("generate-password").addEventListener("click", () => {
    let chars = "";
    const groups = [];

    if ($("include-uppercase").checked) groups.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if ($("include-lowercase").checked) groups.push("abcdefghijklmnopqrstuvwxyz");
    if ($("include-numbers").checked) groups.push("0123456789");
    if ($("include-symbols").checked) groups.push("!@#$%^&*()-_=+[]{}?");

    if (!groups.length) {
      notify("Select at least one character type.");
      return;
    }

    groups.forEach(group => chars += group);

    const length = Number(lengthInput.value);
    const password = [];

    groups.forEach(group => {
      password.push(group[randomIndex(group.length)]);
    });

    while (password.length < length) {
      password.push(chars[randomIndex(chars.length)]);
    }

    for (let i = password.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [password[i], password[j]] = [password[j], password[i]];
    }

    $("generated-password").textContent = password.join("");
    notify("Password generated locally.");
  });

  $("copy-password").addEventListener("click", async () => {
    const value = $("generated-password").textContent;
    if (!value || value.includes("appear here")) return;

    try {
      await navigator.clipboard.writeText(value);
      notify("Password copied.");
    } catch {
      notify("Clipboard unavailable.");
    }
  });

  // PASSWORD CHECKER
  $("check-password").addEventListener("click", () => {
    const value = $("password-test").value;
    if (!value) {
      notify("Enter a sample password.");
      return;
    }

    let score = 0;
    if (value.length >= 12) score++;
    if (value.length >= 16) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const levels = [
      "Very weak", "Very weak", "Weak",
      "Medium", "Good", "Strong", "Very strong"
    ];

    $("password-result").textContent =
      "Estimated strength: " + levels[score];

    notify("Analysis completed locally.");
  });

  // NETWORK INFORMATION
  function refreshNetwork() {
    $("network-status").textContent =
      navigator.onLine ? "ONLINE" : "OFFLINE";

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    $("network-type").textContent =
      connection?.effectiveType || "Unavailable";

    $("network-speed").textContent =
      connection?.downlink
        ? connection.downlink + " Mbps"
        : "Unavailable";
  }

  $("refresh-network").addEventListener("click", () => {
    refreshNetwork();
    notify("Network information refreshed.");
  });

  window.addEventListener("online", refreshNetwork);
  window.addEventListener("offline", refreshNetwork);
  refreshNetwork();

  // SHA-256
  $("generate-hash").addEventListener("click", async () => {
    const input = $("hash-input").value;

    try {
      const bytes = new TextEncoder().encode(input);
      const digest = await crypto.subtle.digest("SHA-256", bytes);

      const hash = Array.from(new Uint8Array(digest))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

      $("hash-result").textContent = hash;
      notify("SHA-256 generated.");
    } catch {
      notify("SHA-256 unavailable in this browser.");
    }
  });

  $("copy-hash").addEventListener("click", async () => {
    const value = $("hash-result").textContent;
    if (!value || value.includes("appear here")) return;

    try {
      await navigator.clipboard.writeText(value);
      notify("Hash copied.");
    } catch {
      notify("Clipboard unavailable.");
    }
  });

  // EDUCATIONAL TERMINAL
  const terminalCommands = {
    help: "Available commands: help, clear, date, time, status, tools, about, whoami, version",
    status: "DARKC-SINT: ONLINE | MODE: LOCAL SIMULATION",
    tools: "Password Generator | Password Checker | Network Monitor | SHA-256 | Discord Lookup",
    about: "DARKC-SINT is an educational cybersecurity interface.",
    whoami: "LOCAL DEMO USER",
    version: "DARKC-SINT VERSION 4.0"
  };

  $("terminal-form").addEventListener("submit", event => {
    event.preventDefault();

    const input = $("terminal-input");
    const command = input.value.trim().toLowerCase();
    if (!command) return;

    const output = $("terminal-output");
    const commandLine = document.createElement("p");
    commandLine.textContent = "root@darkc:~$ " + command;
    output.appendChild(commandLine);

    if (command === "clear") {
      output.textContent = "";
    } else {
      const response = document.createElement("p");

      if (command === "date") {
        response.textContent = new Date().toLocaleDateString("fr-FR");
      } else if (command === "time") {
        response.textContent = new Date().toLocaleTimeString("fr-FR");
      } else {
        response.textContent =
          terminalCommands[command] || "Unknown command. Type help.";
      }

      output.appendChild(response);
    }

    input.value = "";
    output.scrollTop = output.scrollHeight;
  });

  // DISCORD LOOKUP
  const DISCORD_EPOCH = 1420070400000n;

  function addDataItem(container, label, value) {
    const item = document.createElement("div");
    item.className = "data-item";

    const small = document.createElement("small");
    small.textContent = label;

    const strong = document.createElement("strong");
    strong.textContent = value || "Unavailable";

    item.append(small, strong);
    container.appendChild(item);
  }

  function addServerList(container, servers) {
    const section = document.createElement("div");
    section.className = "card";
    section.style.marginTop = "18px";

    const title = document.createElement("h3");
    title.textContent = "AUTHORIZED MUTUAL SERVERS";
    title.style.color = "#ed2020";
    title.style.fontSize = "12px";

    section.appendChild(title);

    if (!Array.isArray(servers) || servers.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No mutual server information supplied.";
      section.appendChild(empty);
    } else {
      servers.forEach(server => {
        const row = document.createElement("p");
        row.textContent = typeof server === "string"
          ? server
          : (server.name || "Server");
        section.appendChild(row);
      });
    }

    container.appendChild(section);
  }

  $("discord-form").addEventListener("submit", async event => {
    event.preventDefault();

    const id = $("discord-id").value.trim();
    const state = $("discord-state");
    const result = $("discord-profile");
    const history = document.querySelector(".history-card");

    if (!/^\d{17,20}$/.test(id)) {
      state.textContent = "INVALID ID";
      result.textContent =
        "Invalid Discord ID. Enter a numeric ID containing 17 to 20 digits.";
      notify("Invalid Discord ID.");
      return;
    }

    state.textContent = "ANALYZING...";
    result.textContent = "Analyzing Discord ID...";
    history.innerHTML = `
      <div class="section-title">SERVER HISTORY</div>
      <div class="empty-state compact">
        <h3>NOT PUBLICLY AVAILABLE</h3>
        <p>A complete list of joined or departed servers is not available from a Discord ID.</p>
      </div>
    `;

    try {
      const snowflake = BigInt(id);
      const timestamp = (snowflake >> 22n) + DISCORD_EPOCH;
      const date = new Date(Number(timestamp));

      if (
        !Number.isFinite(date.getTime()) ||
        date.getTime() < Number(DISCORD_EPOCH) ||
        date.getTime() > Date.now()
      ) {
        throw new Error("Invalid timestamp");
      }

      const formattedDate = date.toLocaleString("fr-FR", {
        dateStyle: "long",
        timeStyle: "short"
      });

      // Optional same-origin endpoint.
      // It must be implemented server-side with an authorized Discord integration.
      let profileData = null;

      try {
        const response = await fetch(
          "/api/discord/profile?id=" + encodeURIComponent(id),
          { headers: { Accept: "application/json" } }
        );

        if (response.ok) {
          profileData = await response.json();
        }
      } catch {
        // The public Snowflake analysis still works without this endpoint.
      }

      state.textContent = "ANALYSIS COMPLETE";
      result.textContent = "";

      const profile = document.createElement("div");
      profile.className = "profile-result";

      const avatar = document.createElement("div");
      avatar.className = "profile-avatar";
      avatar.textContent = "D";

      if (profileData?.avatarUrl) {
        const image = document.createElement("img");
        image.src = profileData.avatarUrl;
        image.alt = "Discord avatar";
        image.referrerPolicy = "no-referrer";
        image.style.width = "70px";
        image.style.height = "70px";
        image.style.borderRadius = "50%";
        image.style.objectFit = "cover";

        image.onerror = () => {
          image.remove();
          avatar.textContent = "D";
        };

        avatar.textContent = "";
        avatar.appendChild(image);
      }

      const identity = document.createElement("div");
      const heading = document.createElement("h3");
      heading.textContent =
        profileData?.globalName ||
        profileData?.username ||
        "Discord account";

      const identifier = document.createElement("div");
      identifier.className = "profile-id";
      identifier.textContent = id;

      identity.append(heading, identifier);
      profile.append(avatar, identity);

      const data = document.createElement("div");
      data.className = "profile-data";

      addDataItem(data, "DISCORD USER ID", id);
      addDataItem(data, "ACCOUNT CREATED", formattedDate);
      addDataItem(data, "USERNAME", profileData?.username || "Not available");
      addDataItem(data, "DISPLAY NAME", profileData?.globalName || "Not available");
      addDataItem(data, "BADGES", Array.isArray(profileData?.badges)
        ? profileData.badges.join(", ")
        : "Not available");

      const link = document.createElement("a");
      link.className = "profile-link";
      link.href = "https://discord.com/users/" + encodeURIComponent(id);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "OPEN DISCORD PROFILE ↗";

      const notice = document.createElement("p");
      notice.className = "muted note";
      notice.textContent = profileData
        ? "Profile details are supplied by the configured authorized integration."
        : "ID and creation date are calculated locally. Avatar, username and badges require an authorized Discord integration.";

      result.append(profile, data, link, notice);

      if (profileData?.mutualServers) {
        history.innerHTML = "";
        addServerList(history, profileData.mutualServers);
      }

      notify("Discord ID analyzed.");
    } catch {
      state.textContent = "ANALYSIS ERROR";
      result.textContent = "Unable to analyze this ID.";
      notify("Unable to analyze this ID.");
    }
  });

  // SETTINGS
  $("setting-matrix").checked =
    localStorage.getItem("darkc-matrix") !== "false";

  $("setting-notifications").checked =
    localStorage.getItem("darkc-notifications") !== "false";

  $("save-settings").addEventListener("click", () => {
    localStorage.setItem("darkc-matrix", $("setting-matrix").checked);
    localStorage.setItem(
      "darkc-notifications",
      $("setting-notifications").checked
    );

    notify("Settings saved locally.");
  });
});
