// Admin report controller
import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { attendanceReportQuerySchema } from "../../validations/attendance.validation.js";
import { attendanceService } from "../../services/driver-worker/index.js";
import { Parser } from "json2csv";
import { AppError } from "../../middlewares/error.middleware.js";
import { prisma } from "../../lib/prisma.js";

export const getAttendanceReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let { outletId, employeeId, status, startDate, endDate, page, limit } =
      attendanceReportQuerySchema.parse(req.query);

    if (req.user?.role === "outlet_admin") {
      if (!req.user.outletId) {
        throw new AppError("Outlet admin tidak memiliki outlet terdaftar.", 403);
      }
      outletId = req.user.outletId;
    }

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const result = await attendanceService.getAttendanceReport(
      outletId,
      employeeId,
      status,
      start,
      end,
      page,
      limit,
    );

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const exportAttendanceReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { outletId, employeeId, status, startDate, endDate } =
      attendanceReportQuerySchema.parse(req.query);

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // Gunakan limit besar untuk export (maksimal 5000)
    const result = await attendanceService.getAttendanceReport(
      outletId,
      employeeId,
      status,
      start,
      end,
      1,
      5000,
    );

    if (result.data.length >= 5000) {
      throw new AppError("Data terlalu besar, persempit filter.", 422);
    }

    // Mapping ke format CSV
    const csvData = result.data.map((att) => ({
      Outlet: att.outlet?.name ?? "-",
      "Nama Karyawan": att.user?.full_name ?? "-",
      Role: att.user?.role ?? "-",
      Email: att.user?.email ?? "-",
      Tanggal: new Date(att.attendance_date).toLocaleDateString("id-ID"),
      "Check In": att.check_in_time ?? "-",
      "Check Out": att.check_out_time ?? "-",
      Status:
        att.status === "on_time"
          ? "Tepat Waktu"
          : att.status === "late"
            ? "Terlambat"
            : "Absen",
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=attendance_report_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// ── Sales report schema ───────────────────────────────────────────────────────
const salesReportQuerySchema = z.object({
  outlet_id: z.string().uuid().optional(),
  group_by: z.enum(["day", "month", "year"]).default("month"),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

const employeeReportQuerySchema = z.object({
  outlet_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  role: z.enum(["washing_worker", "ironing_worker", "packing_worker", "driver"]).optional(),
});

// ── Sales report ─────────────────────────────────────────────────────────────
export const getSalesReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = salesReportQuerySchema.parse(req.query);

    const isOutletAdmin = req.user?.role === "outlet_admin";
    const outletId = isOutletAdmin ? (req.user?.outletId ?? undefined) : q.outlet_id;

    const dateFrom = q.date_from ? new Date(q.date_from) : undefined;
    const dateTo = q.date_to ? new Date(q.date_to) : undefined;

    const where = {
      status: "completed" as const,
      ...(outletId && { outlet_id: outletId }),
      ...(dateFrom || dateTo
        ? {
            updated_at: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    };

    // Summary totals
    const [totalResult, orderCount] = await Promise.all([
      prisma.order.aggregate({
        where,
        _sum: { total_price: true },
        _count: { id: true },
      }),
      prisma.order.count({ where }),
    ]);

    // Build grouped data using raw prisma queries
    let groupedData: Array<{ period: string; income: number; order_count: number }> = [];

    const completedOrders = await prisma.order.findMany({
      where,
      select: { total_price: true, updated_at: true },
      orderBy: { updated_at: "asc" },
    });

    // Group by period in TypeScript
    const grouped = new Map<string, { income: number; count: number }>();
    for (const order of completedOrders) {
      const d = new Date(order.updated_at);
      let key: string;
      if (q.group_by === "day") {
        key = d.toISOString().slice(0, 10);
      } else if (q.group_by === "month") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      } else {
        key = String(d.getFullYear());
      }
      const existing = grouped.get(key) ?? { income: 0, count: 0 };
      grouped.set(key, {
        income: existing.income + Number(order.total_price ?? 0),
        count: existing.count + 1,
      });
    }

    groupedData = Array.from(grouped.entries())
      .map(([period, v]) => ({ period, income: v.income, order_count: v.count }))
      .sort((a, b) => a.period.localeCompare(b.period));

    res.json({
      success: true,
      data: {
        summary: {
          total_income: Number(totalResult._sum.total_price ?? 0),
          total_orders: orderCount,
        },
        chart: groupedData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Employee performance report ───────────────────────────────────────────────
export const getEmployeePerformanceReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = employeeReportQuerySchema.parse(req.query);

    const isOutletAdmin = req.user?.role === "outlet_admin";
    const outletId = isOutletAdmin ? (req.user?.outletId ?? undefined) : q.outlet_id;

    const dateFrom = q.date_from ? new Date(q.date_from) : undefined;
    const dateTo = q.date_to ? new Date(q.date_to) : undefined;

    // Worker performance: count completed process logs per employee
    const workerPerf = await prisma.processLog.groupBy({
      by: ["employee_id"],
      where: {
        completed_at: { not: null },
        ...(dateFrom || dateTo
          ? {
              completed_at: {
                ...(dateFrom && { gte: dateFrom }),
                ...(dateTo && { lte: dateTo }),
              },
            }
          : {}),
        ...(outletId && {
          employee: { outlet_id: outletId },
        }),
        ...(q.role && ["washing_worker", "ironing_worker", "packing_worker"].includes(q.role ?? "") && {
          employee: { role: q.role as any },
        }),
      },
      _count: { id: true },
    });

    // Driver performance: count completed driver tasks
    const driverPerf = await prisma.driverTask.groupBy({
      by: ["driver_id"],
      where: {
        status: "completed",
        driver_id: { not: null },
        ...(dateFrom || dateTo
          ? {
              completed_at: {
                ...(dateFrom && { gte: dateFrom }),
                ...(dateTo && { lte: dateTo }),
              },
            }
          : {}),
        ...(outletId && {
          driver: { outlet_id: outletId },
        }),
      },
      _count: { id: true },
    });

    // Collect all employee IDs
    const workerIds = workerPerf.map((w) => w.employee_id);
    const driverIds = driverPerf.map((d) => d.driver_id).filter(Boolean) as string[];
    const allIds = [...new Set([...workerIds, ...driverIds])];

    const employees = await prisma.employee.findMany({
      where: { id: { in: allIds }, deleted_at: null },
      select: { id: true, full_name: true, role: true, outlet_id: true,
        outlet: { select: { name: true } } },
    });

    const empMap = new Map(employees.map((e) => [e.id, e]));

    const workerRows = workerPerf
      .map((w) => {
        const emp = empMap.get(w.employee_id);
        if (!emp) return null;
        return {
          employee_id: w.employee_id,
          full_name: emp.full_name,
          role: emp.role,
          outlet: emp.outlet?.name ?? "—",
          total_jobs: w._count.id,
          job_type: "station_processing",
        };
      })
      .filter(Boolean);

    const driverRows = driverPerf
      .map((d) => {
        if (!d.driver_id) return null;
        const emp = empMap.get(d.driver_id);
        if (!emp) return null;
        return {
          employee_id: d.driver_id,
          full_name: emp.full_name,
          role: emp.role,
          outlet: emp.outlet?.name ?? "—",
          total_jobs: d._count.id,
          job_type: "pickup_delivery",
        };
      })
      .filter(Boolean);

    const data = [...workerRows, ...driverRows].sort(
      (a, b) => (b?.total_jobs ?? 0) - (a?.total_jobs ?? 0),
    );

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
