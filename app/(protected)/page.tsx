import type { Metadata } from "next";

import { HomeOverview } from "@/components/home-overview";
import { requireCurrentUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  const user = await requireCurrentUser("/");
  const dashboard = await getDashboardData(user.id);

  return (
    <HomeOverview
      firstName={user.name.split(" ")[0]}
      metrics={dashboard.metrics}
      recentActivity={dashboard.recentActivity}
      currency={dashboard.settings.currency}
    />
  );
}
