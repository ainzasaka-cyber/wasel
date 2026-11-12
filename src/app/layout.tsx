import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isSupportedLocale, LOCALE_COOKIE } from "@/modules/auth/session";
import "./globals.css";
import "./status.css";

export const metadata: Metadata = { title: "WASEL — Last-mile operations", description: "Delivery operations for Moroccan merchants and internal fleet teams." };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const storedLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(storedLocale) ? storedLocale : "fr";
  return <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"><body>{children}</body></html>;
}
