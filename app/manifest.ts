import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stockeyfy",
    short_name: "Stockeyfy",
    description:
      "Manage inventory, products, orders, and business operations in one secure place.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f3",
    theme_color: "#f7f6f3",
  };
}
