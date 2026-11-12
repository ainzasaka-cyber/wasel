import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WASEL — Last-mile operations",
  description: "Delivery operations for Moroccan merchants and internal fleet teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
