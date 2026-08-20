import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/session";

export default async function ReportsPage() {
  await requireCurrentUser("/reports");
  redirect("/");
}
