import { redirect } from "next/navigation";

export default function AttendanceReportRedirectPage() {
  redirect("/dashboard/admin/attendance-report");
}
