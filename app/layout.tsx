import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { AUTHOR_NAME, AUTHOR_URL, COMPANY_NAME } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: AUTHOR_NAME,
  publisher: COMPANY_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Stockeyfy",
    title: "Stockeyfy | Inventory Management System",
    description:
      "Manage inventory, products, orders, and business operations in one secure place.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stockeyfy | Inventory Management System",
    description:
      "Manage inventory, products, orders, and business operations in one secure place.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7f6f3",
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
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-foreground">
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
