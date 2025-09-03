import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, html } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_HOST,   // smtp.zoho.in
      port: process.env.ZOHO_PORT,   // 465
      secure: true,
      auth: {
        user: process.env.ZOHO_USER, // no-reply@paisabada.in
        pass: process.env.ZOHO_PASS  // your app password
      }
    });

    await transporter.sendMail({
      from: `"Paisabada" <${process.env.ZOHO_USER}>`,
      to,
      subject,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
