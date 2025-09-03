import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    const { to, subject, html } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_HOST,
      port: process.env.ZOHO_PORT,
      secure: true, // true for port 465
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    res.status(200).json({ ok: true, info });
  } catch (e) {
    console.error("Mailer error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
}
