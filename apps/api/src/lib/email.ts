import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);
const FROM = "FreshPress Laundry <noreply@azafadev.web.id>";

export const sendVerificationEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const link = `${env.CLIENT_URL}/verify?token=${token}`;
  await resend.emails.send({
    from: FROM,
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

export const sendEmployeeResetPasswordEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const link = `${env.CLIENT_URL}/employee/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset Password Akun Karyawan FreshPress",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#1a73e8;">Reset Password Karyawan</h2>
        <p>Kami menerima permintaan reset password untuk akun karyawan Anda. Klik tombol di bawah untuk membuat password baru. Link berlaku selama <strong>30 menit</strong>.</p>
        <a href="${link}" style="display:inline-block;background:#1a73e8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Reset Password</a>
        <p style="color:#666;font-size:13px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const link = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
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

export const sendEmailChangeVerification = async (
  to: string,
  token: string,
): Promise<void> => {
  const link = `${env.CLIENT_URL}/verify-email-change?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Konfirmasi Perubahan Email FreshPress Laundry",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#1a73e8;">Konfirmasi Perubahan Email</h2>
        <p>Kami menerima permintaan untuk mengubah email akun Anda ke <strong>${to}</strong>. Klik tombol di bawah untuk mengkonfirmasi perubahan email. Link berlaku selama <strong>1 jam</strong>.</p>
        <a href="${link}" style="display:inline-block;background:#1a73e8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Konfirmasi Perubahan Email</a>
        <p style="color:#666;font-size:13px;">Jika Anda tidak melakukan perubahan email, abaikan email ini. Email Anda tidak akan berubah.</p>
      </div>
    `,
  });
};
