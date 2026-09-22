import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  applicationName: "Stockeyfy",
  title: {
    default: "Stockeyfy | Inventory Management System",
    template: "%s · Stockeyfy",
  },
  description:
    "Manage inventory, products, orders, purchasing, and business operations in one secure place.",
  keywords: [
    "Stockeyfy",
    "inventory management",
    "secure inventory",
    "stock management",
    "account security",
  ],
  authors: [{ name: "Stockeyfy" }],
  creator: "Stockeyfy",
  publisher: "Stockeyfy",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Stockeyfy",
    title: "Stockeyfy | Inventory Management System",
    description:
      "Manage inventory, products, orders, and business operations in one secure place.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Stockeyfy Inventory Management System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stockeyfy | Inventory Management System",
    description:
      "Manage inventory, products, orders, and business operations in one secure place.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <footer className="border-t border-brand-border px-6 py-5 text-center text-sm text-zinc-400">
          Made by{" "}
          <a
            href="https://huzaifa-rehan-portfolio.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-primary transition-colors hover:text-primary-hover hover:underline"
          >
            Huzaifa Rehan
          </a>
        </footer>
      </body>
    </html>
  );
}
