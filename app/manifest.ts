import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stockeyfy",
    short_name: "Stockeyfy",
    description:
      "Manage inventory, products, orders, and business operations in one secure place.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#2563EB",
  };
}
