import nodemailer from "nodemailer";

function allowCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "https://paisabada.in");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  allowCORS(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const { to, name, prize } = req.body || {};
    if (!to || !name || !prize) return res.status(400).json({ ok: false, error: "Missing to/name/prize" });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_PORT || "465") === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const html = `
      <h2>🎉 Congrats ${name}!</h2>
      <p>You won <b>₹${prize} SIP credit</b> on Spin & Win.</p>
      <p>Team PaisaBada will connect with you soon.</p>
      <small>No cash rewards. SIP investment credit only. T&C apply.</small>
    `;

    await transporter.sendMail({
      from: `"PaisaBada" <${process.env.SMTP_USER}>`,
      to,
      subject: `🎉 You won ₹${prize} SIP credit!`,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
// api/send-mail.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { to, subject, html, text, fromName = "PaisaBada" } = req.body || {};
    if (!to || !subject || !(html || text)) {
      return res.status(400).json({ ok: false, error: "Missing to/subject/body" });
    }

    // SMTP Transport (Zoho)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,   // smtp.zoho.in
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE || "true") === "true",
      auth: {
        user: process.env.SMTP_USER, // no-reply@paisabada.in
        pass: process.env.SMTP_PASS, // app password
      },
    });

    // Build message
    const fromAddress = `"${fromName}" <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,                    // "user@example.com, another@ex.com" allowed
      subject,
      text: text || undefined,
      html: html || undefined,
      replyTo: process.env.REPLY_TO || "contact@paisabada.in",
    });

    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("MAIL ERROR:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Server error" });
  }
}

