import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user: env.NODEMAILER_USER, pass: env.NODEMAILER_PASS },
});

export const sendVerificationEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const link = `${env.CLIENT_URL}/verify?token=${token}`;
  await transporter.sendMail({
    from: `"FreshPress Laundry" <${env.NODEMAILER_USER}>`,
    to,
    subject: "Verifikasi Akun FreshPress Laundry",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#1a73e8;">Selamat Datang di FreshPress Laundry!</h2>
        <p>Terima kasih telah mendaftar. Klik tombol di bawah untuk memverifikasi akun Anda dan membuat password. Link berlaku selama <strong>1 jam</strong>.</p>
        <a href="${link}" style="display:inline-block;background:#1a73e8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Verifikasi & Buat Password</a>
        <p style="color:#666;font-size:13px;">Jika Anda tidak melakukan pendaftaran, abaikan email ini.</p>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const link = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"FreshPress Laundry" <${env.NODEMAILER_USER}>`,
    to,
    subject: "Reset Password FreshPress Laundry",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#1a73e8;">Reset Password</h2>
        <p>Kami menerima permintaan reset password untuk akun Anda. Klik tombol di bawah untuk membuat password baru. Link berlaku selama <strong>1 jam</strong>.</p>
        <a href="${link}" style="display:inline-block;background:#1a73e8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Reset Password</a>
        <p style="color:#666;font-size:13px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
      </div>
    `,
  });
};