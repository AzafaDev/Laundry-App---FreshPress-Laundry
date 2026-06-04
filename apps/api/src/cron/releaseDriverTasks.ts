import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { emitToRoom } from "../lib/socket.js";

const RELEASE_WINDOW_MS = 60 * 60 * 1000; // 1 jam sebelum pickup_schedule

async function releasePickupTasks() {
  const releaseThreshold = new Date(Date.now() + RELEASE_WINDOW_MS);

  const tasks = await prisma.driverTask.findMany({
    where: {
      task_type: "pickup",
      status: "pending",
      order: {
        pickup_schedule: { lte: releaseThreshold },
      },
    },
    select: {
      id: true,
      order: { select: { id: true, outlet_id: true, invoice_number: true } },
    },
  });

  if (tasks.length === 0) return;

  const taskIds = tasks.map((t) => t.id);

  await prisma.driverTask.updateMany({
    where: { id: { in: taskIds } },
    data: { status: "available" },
  });

  const byOutlet = new Map<string, string[]>();
  for (const task of tasks) {
    const outletId = task.order.outlet_id;
    if (!outletId) continue;
    if (!byOutlet.has(outletId)) byOutlet.set(outletId, []);
    byOutlet.get(outletId)!.push(task.order.invoice_number);
  }

  for (const [outletId, invoices] of byOutlet) {
    emitToRoom(`outlet:${outletId}`, "driver:tasks-released", {
      count: invoices.length,
      invoices,
    });
  }

  console.log(`[Cron] Released ${tasks.length} pickup task(s)`);
}

// Tiap 5 menit
cron.schedule("*/5 * * * *", async () => {
  try {
    await releasePickupTasks();
  } catch (err) {
    console.error("[Cron] releaseDriverTasks error:", err);
  }
});
