import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_HOST,
      port: process.env.ZOHO_PORT,
      secure: process.env.ZOHO_PORT == 465, // true for SSL
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Paisabada" <${process.env.ZOHO_USER}>`,
      to: req.body.to,
      subject: req.body.subject,
      html: req.body.html,
    });

    res.status(200).json({ ok: true, info });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
