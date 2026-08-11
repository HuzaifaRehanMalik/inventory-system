import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/session";

export default async function HomeAliasPage() {
  await requireCurrentUser("/home");
  redirect("/");
}
