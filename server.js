require("dotenv").config();

const express = require("express");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"]
}));

const notificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { ok: false, error: "Please wait before sending another notification." }
});

function getMailer() {
  const required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "MAIL_FROM", "MAIL_TO"];
  if (required.some((key) => !process.env[key])) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

app.post("/api/visit-notification", notificationLimiter, async (req, res) => {
  // This endpoint is called only after the visitor actively accepts analytics.
  const { page, userAgent, device } = req.body || {};

  const safePage = typeof page === "string" && page.startsWith("/")
    ? page.slice(0, 160)
    : "/";
  const safeAgent = typeof userAgent === "string"
    ? userAgent.slice(0, 250)
    : "Not provided";
  const safeDevice = ["Mobile", "Tablet", "Desktop", "Unknown"].includes(device)
    ? device
    : "Unknown";

  const mailer = getMailer();
  if (!mailer) {
    return res.status(503).json({
      ok: false,
      error: "Email is not configured. Copy .env.example to .env and add SMTP settings."
    });
  }

  const visitedAt = new Date().toISOString();

  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: "DARKC-SINT — consented website visit",
      text: [
        "A visitor who accepted the site's optional visit notification has opened a page.",
        "",
        `Time (UTC): ${visitedAt}`,
        `Page: ${safePage}`,
        `Device category: ${safeDevice}`,
        `Browser user-agent: ${safeAgent}`,
        "",
        "No raw IP address is collected, stored, or included in this notification."
      ].join("\n")
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("Email notification failed:", error.message);
    return res.status(502).json({ ok: false, error: "Email delivery failed." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "DARKC-SINT" });
});

app.listen(PORT, () => {
  console.log(`DARKC-SINT running at http://localhost:${PORT}`);
});
