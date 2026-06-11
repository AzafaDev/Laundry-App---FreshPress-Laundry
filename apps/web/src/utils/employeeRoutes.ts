import type { EmployeeRole } from "@/types/employee.types";

export function getDashboardPath(role: EmployeeRole): string {
  switch (role) {
    case "super_admin":    return "/dashboard/admin";
    case "outlet_admin":   return "/dashboard/admin";
    case "driver":         return "/dashboard/driver";
    case "washing_worker":
    case "ironing_worker":
    case "packing_worker": return "/dashboard/worker";
    default:               return "/employee/login";
  }
}
