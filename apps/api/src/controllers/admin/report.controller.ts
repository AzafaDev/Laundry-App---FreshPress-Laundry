// Admin report controller
import { NextFunction, Request, Response } from "express";
import { attendanceReportQuerySchema } from "../../validations/attendance.validation.js";
import { attendanceService } from "../../services/driver-worker/index.js";
import { Parser } from "json2csv";
import { AppError } from "../../middlewares/error.middleware.js";

export const getAttendanceReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // ✅ Ubah destructuring userId → employeeId
    const { outletId, employeeId, status, startDate, endDate, page, limit } =
      attendanceReportQuerySchema.parse(req.query);

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // ✅ Kirim employeeId (bukan userId)
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
      "Check In": att.check_in_time?.toLocaleTimeString("id-ID") ?? "-",
      "Check Out": att.check_out_time?.toLocaleTimeString("id-ID") ?? "-",
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
