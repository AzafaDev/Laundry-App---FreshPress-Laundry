import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { notifyCustomer } from "../lib/notification.js";

async function autoCompleteOrders() {
  const now = new Date();

  const orders = await prisma.order.findMany({
    where: {
      status: "received_by_customer",
      auto_confirm_at: { lte: now },
      deleted_at: null,
    },
    select: { id: true, invoice_number: true, customer_id: true },
  });

  if (orders.length === 0) return;

  console.log(`[Cron] Auto-completing ${orders.length} order(s)...`);

  for (const order of orders) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: "completed" },
      }),
      prisma.orderStatusHistory.create({
        data: {
          order_id: order.id,
          old_status: "received_by_customer",
          new_status: "completed",
          changed_by_type: "system",
          changed_by_id: null,
          note: "Pesanan dikonfirmasi otomatis setelah 2x24 jam.",
        },
      }),
    ]);

    await notifyCustomer(
      order.customer_id,
      "Pesanan selesai otomatis",
      `Pesanan ${order.invoice_number} telah diselesaikan secara otomatis karena tidak ada konfirmasi dalam 2x24 jam. Terima kasih telah menggunakan layanan kami.`,
      "order_completed",
      order.id,
    );

    console.log(`[Cron] Auto-completed order ${order.invoice_number}`);
  }
}

// Setiap jam
cron.schedule("0 * * * *", async () => {
  try {
    await autoCompleteOrders();
  } catch (err) {
    console.error("[Cron] autoCompleteOrders error:", err);
  }
});
