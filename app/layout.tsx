import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito_Sans } from "next/font/google";

import { PRODUCT } from "@/lib/config";

import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${PRODUCT.eyebrow}`,
  description:
    "Pre-order slime handmade Nostabox. Rp20.000 per pcs, ukuran 200 ml, custom warna dan aroma.",
  applicationName: PRODUCT.name,
  openGraph: {
    title: `${PRODUCT.eyebrow}`,
    description: "Slime handmade, dibuat satu per satu sesuai pesananmu.",
    siteName: PRODUCT.name,
    images: [{ url: "/logo.png", width: 1181, height: 1181, alt: PRODUCT.name }],
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8f3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}
