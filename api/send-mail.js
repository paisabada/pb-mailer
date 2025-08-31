// /api/send-mail.js
const nodemailer = require("nodemailer");

/** Vercel Node.js Serverless Function */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Parse JSON body robustly
  let body = req.body;
  if (!body || typeof body === "string") {
    try { body = JSON.parse(body || "{}"); } catch { body = {}; }
  }
  const { to, subject, html, text } = body;

  if (!to || !subject || !html) {
    return res.status(400).json({ ok: false, error: "Missing to/subject/html" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_HOST,                 // smtp.zoho.in
      port: Number(process.env.ZOHO_PORT || 465),  // 465
      secure: true,                                // SSL/TLS
      auth: {
        user: process.env.ZOHO_USER,               // no-reply@paisabada.in
        pass: process.env.ZOHO_PASS                // Zoho app password
      }
    });

    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || "Paisabada"}" <${process.env.FROM_EMAIL || process.env.ZOHO_USER}>`,
      to,
      subject,
      html,
      text: text || undefined
    });

    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("send-mail error:", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
};
