// api/send-mail.js
import nodemailer from "nodemailer";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { to, subject, html, winCardUrl } = req.body || {};
    if (!to || !subject || !html) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields: to, subject, html" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,                 // e.g. smtp.zoho.in
      port: Number(process.env.SMTP_PORT || 465),  // 465 for SSL
      secure:
        String(process.env.SMTP_SECURE || "true").toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,               // e.g. no-reply@paisabada.in
        pass: process.env.ZOHO_PASS,               // Zoho app password
      },
    });

    /** Optional inline image attachment (win card)
     *  If you want to display it inline via CID, reference it in your HTML as:
     *  <img src="cid:wincard">
     *  Or keep your <img src="https://.../win-card.jpg"> — both work.
     */
    const attachments = [];
    if (winCardUrl) {
      attachments.push({
        filename: winCardUrl.split("/").pop() || "win-card.jpg",
        path: winCardUrl,
        cid: "wincard",
      });
    }

    const info = await transporter.sendMail({
      from: `${process.env.FROM_NAME || "Paisabada"} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      attachments,
    });

    return res.status(200).json({ ok: true, info });
  } catch (e) {
    console.error("Mailer error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
