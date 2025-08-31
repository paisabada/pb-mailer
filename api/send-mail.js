// api/send-mail.js  (ESM + CORS + Zoho SMTP on Vercel)
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { to, subject, html, winCardUrl } = req.body || {};

    if (!to || !subject || !html) {
      return res.status(400).json({ ok: false, error: "Missing to/subject/html" });
    }

    // Make sure image URL is absolute; fallback to your domain image
    const cardUrl = winCardUrl || "https://paisa-bada.github.io/assets/win-card-500.jpg";

    // If your HTML expects the image URL variable, inject it:
    const finalHtml = html.replaceAll("{{WIN_CARD_URL}}", cardUrl);

    const port = Number(process.env.ZOHO_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_HOST,        // e.g. "smtp.zoho.in"
      port,                               // 465 SSL or 587 STARTTLS
      secure: port === 465,               // true for 465, false for 587
      auth: {
        user: process.env.ZOHO_USER,      // no-reply@paisabada.in
        pass: process.env.ZOHO_PASS       // app password
      }
    });

    const fromName  = process.env.FROM_NAME  || "Paisabada";
    const fromEmail = process.env.FROM_EMAIL || process.env.ZOHO_USER;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: finalHtml,
      headers: { "X-Entity-Ref-ID": "Paisabada-SpinWin" }
    });

    return res.status(200).json({ ok: true, id: info.messageId });
  } catch (e) {
    console.error("send-mail error:", e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
