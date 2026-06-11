import { redirect } from "next/navigation";

export default function OutletAdminRedirectPage() {
  redirect("/dashboard/admin");
}
