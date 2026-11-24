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
  let lastIndex = -1;

  const bootInterval = setInterval(() => {
    progress = Math.min(progress + 2, 100);

    $("progress-fill").style.width = progress + "%";
    $("boot-percent").textContent = progress + "%";

    const index = Math.min(
      bootMessages.length - 1,
      Math.floor(progress / 17)
    );

    $("boot-status").textContent =
      bootMessages[index].toUpperCase();

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


  // MATRIX INTRO — RED — 2 SECONDS
  function startMatrix() {
    const screen = $("matrix-screen");
    const canvas = $("matrix");
    const ctx = canvas.getContext("2d");

    screen.style.display = "block";

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01";
    const size = 17;
    const columns = Math.floor(canvas.width / size);
    const drops = Array(columns).fill(1);

    const animation = setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.09)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ed2020";
      ctx.font = size + "px monospace";

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];

        ctx.fillText(char, i * size, y * size);

        if (
          y * size > canvas.height &&
          Math.random() > 0.975
        ) {
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
