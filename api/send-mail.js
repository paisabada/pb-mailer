// api/send-mail.js
import nodemailer from "nodemailer";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*"; // e.g. https://paisabada.github.io

export default async function handler(req, res) {
  // CORS (preflight)
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const {
      to,               // required: recipient email
      subject,          // required
      html,             // optional: if not given, we send a default
      cc, bcc, replyTo, // optional
      winCardUrl,       // optional: remote image to attach inline
      text              // optional plain-text fallback
    } = req.body || {};

    if (!to || !subject) {
      return res.status(400).json({ ok: false, error: "Missing 'to' or 'subject'" });
    }

    // --- Transporter (Zoho) ---
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_HOST,        // e.g. smtp.zoho.in  (India DC) / smtp.zoho.com
      port: Number(process.env.ZOHO_PORT || 465),
      secure: true,                        // 465 = SSL
      auth: {
        user: process.env.ZOHO_USER,       // no-reply@paisabada.in
        pass: process.env.ZOHO_PASS        // Zoho App Password (not your login pass)
      }
    });

    // Inline win card (optional)
    const attachments = [];
    if (winCardUrl) {
      attachments.push({
        filename: "win-card.jpg",
        path: winCardUrl,                  // remote URL is fine
        cid: "wincard"                     // use as <img src="cid:wincard">
      });
    }

    // Default HTML if not provided
    const fallbackHtml = `
      <div style="font-family:system-ui,Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 12px">🎉 You won ₹500 SIP credit!</h2>
        <p>Thanks for playing <b>Paisabada Spin & Win</b>.</p>
        ${winCardUrl ? `<p><img src="cid:wincard" alt="Win Card" style="max-width:600px;width:100%;border-radius:8px"></p>` : ""}
        <p style="margin-top:16px">Start your Paisa journey → <a href="https://paisabada.in/spin-and-win">Claim now</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
        <p style="font-size:12px;color:#666">No cash rewards. SIP investment credit only. T&amp;C apply.</p>
      </div>
    `;

    // --- Send ---
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || "Paisabada"}" <${process.env.FROM_EMAIL}>`,
      to, cc, bcc, replyTo,
      subject,
      text: text || "You won ₹500 SIP credit bonus on Paisabada.",
      html: html || fallbackHtml,
      attachments
    });

    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("Mailer error:", err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
