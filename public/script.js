
function startBoot() {
    const output = document.getElementById("boot-lines");
    const progress = document.getElementById("progress-fill");
    const status = document.getElementById("boot-status");

    const messages = [
        "[SYSTEM] DARKC-SINT INITIALIZATION",
        "[OK] Loading system modules...",
        "[OK] Checking interface...",
        "[OK] Loading security tools...",
        "[OK] Initializing terminal...",
        "[OK] Loading network monitor...",
        "[OK] Initializing dashboard...",
        "[OK] All modules loaded.",
        "[SYSTEM] ACCESS GRANTED"
    ];

    let index = 0;

    function next() {
        if (index >= messages.length) {
            if (progress) progress.style.width = "100%";
            if (status) status.textContent = "100% — SYSTEM READY";

            setTimeout(startMatrixIntro, 500);
            return;
        }

        const line = document.createElement("div");
        line.textContent = messages[index];

        if (output) {
            output.appendChild(line);
            output.scrollTop = output.scrollHeight;
        }

        index++;

        const percent = Math.round(
            (index / messages.length) * 100
        );

        if (progress) {
            progress.style.width = percent + "%";
        }

        if (status) {
            status.textContent = "LOADING... " + percent + "%";
        }

        setTimeout(next, 350);
    }

    next();
}
