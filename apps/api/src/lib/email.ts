import { Resend } from "resend";
import { env } from "../config/env.js";
import { prisma } from "./prisma.js";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set in environment variables");
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
}
const FROM = "FreshPress Laundry <noreply@azafadev.web.id>";

export const sendVerificationEmail = async (
  to: string,
  token: string,
): Promise<void> => {
  const link = `${env.CLIENT_URL}/verify?token=${token}`;
  await getResend().emails.send({
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
  await getResend().emails.send({
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
  await getResend().emails.send({
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
  await getResend().emails.send({
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

export const sendEmployeeInviteEmail = async (
  to: string,
  name: string,
  token: string,
): Promise<void> => {
  const link = `${env.CLIENT_URL}/employee/reset-password?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Undangan Akun Karyawan FreshPress Laundry",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#00685f;">Selamat Datang di FreshPress Laundry!</h2>
        <p>Halo <strong>${name}</strong>,</p>
        <p>Akun karyawan Anda telah dibuat oleh admin. Klik tombol di bawah untuk membuat password dan mengaktifkan akun Anda. Link berlaku selama <strong>24 jam</strong>.</p>
        <a href="${link}" style="display:inline-block;background:#00685f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Buat Password & Aktifkan Akun</a>
        <p style="color:#666;font-size:13px;">Jika Anda tidak merasa membuat akun ini, abaikan email ini.</p>
      </div>
    `,
  });
};

export const sendPaymentReminderEmail = async (
  to: string,
  customerName: string,
  invoiceNumber: string,
  amount: number,
  orderId: string,
): Promise<void> => {
  const link = `${env.CLIENT_URL}/customer/payment/${orderId}`;
  const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  const [orderItems, order] = await Promise.all([
    prisma.orderItem.findMany({
      where: { order_id: orderId },
      include: { laundry_item: { select: { name: true, unit: true } } },
    }),
    prisma.order.findUnique({
      where: { id: orderId },
      select: { total_weight_kg: true, delivery_fee: true },
    }),
  ]);

  const itemRows = orderItems.map((item) => `
    <tr>
      <td style="padding:8px 4px;border-bottom:1px solid #eee;">${item.laundry_item.name}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #eee;text-align:center;">${Number(item.quantity)} ${item.laundry_item.unit}</td>
      <td style="padding:8px 4px;border-bottom:1px solid #eee;text-align:right;">${fmt(Number(item.price_at_order))}</td>
    </tr>
  `).join("");

  const weightRow = order?.total_weight_kg
    ? `<p style="color:#555;font-size:14px;">Berat total: <strong>${Number(order.total_weight_kg)} kg</strong></p>`
    : "";

  const deliveryFeeRow = order?.delivery_fee
    ? `<tr>
        <td colspan="2" style="padding:8px 4px;color:#555;">Ongkos kirim</td>
        <td style="padding:8px 4px;text-align:right;">${fmt(Number(order.delivery_fee))}</td>
       </tr>`
    : "";

  await getResend().emails.send({
    from: FROM,
    to,
    subject: `Pembayaran Diperlukan — Pesanan ${invoiceNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h2 style="color:#00685f;">Pesanan Anda Sudah Selesai Diproses</h2>
        <p>Halo <strong>${customerName}</strong>,</p>
        <p>Pesanan <strong>${invoiceNumber}</strong> sudah selesai dikemas. Berikut rincian pesanan Anda:</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px 4px;text-align:left;">Item</th>
              <th style="padding:8px 4px;text-align:center;">Jumlah</th>
              <th style="padding:8px 4px;text-align:right;">Harga</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            ${deliveryFeeRow}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:10px 4px;font-weight:bold;">Total Pembayaran</td>
              <td style="padding:10px 4px;text-align:right;font-weight:bold;color:#00685f;">${fmt(amount)}</td>
            </tr>
          </tfoot>
        </table>

        ${weightRow}

        <div style="background:#fff8e1;border-left:4px solid #f59e0b;padding:12px 16px;margin:16px 0;border-radius:4px;">
          <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">⚠️ Pesanan Anda tidak akan diantar sebelum pembayaran diselesaikan.</p>
        </div>

        <a href="${link}" style="display:inline-block;background:#00685f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Bayar Sekarang</a>
        <p style="color:#666;font-size:13px;">Jika Anda sudah melakukan pembayaran, abaikan email ini.</p>
      </div>
    `,
  });
};
