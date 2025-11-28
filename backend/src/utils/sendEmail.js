// backend/src/utils/sendEmail.js
import nodemailer from "nodemailer";

// Force defaults in case .env is missing (prevents 127.0.0.1 crash)
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || "gajjardhrumil189@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "fnuwqtiklbevjxal";

if (!SMTP_PASS) {
  console.error("SMTP_PASS is missing! Email will not work.");
}

console.log("SMTP Config →", { SMTP_HOST, SMTP_PORT, SMTP_USER }); // Debug line

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // ONLY true for port 465
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection once at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Failed:", error.message);
  } else {
    console.log("SMTP Ready! Emails will be sent via Gmail");
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Gajjar Samaj" <${SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw error; // Let controller handle the error
  }
};