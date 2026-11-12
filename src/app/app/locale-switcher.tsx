"use client";

import { useState } from "react";

type Locale = "fr" | "ar";

export default function LocaleSwitcher({ locale }: { locale: Locale }) {
  const [busy, setBusy] = useState(false);
  async function change(nextLocale: Locale) {
    if (nextLocale === locale) return;
    setBusy(true);
    try {
      const response = await fetch("/api/auth/locale", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale: nextLocale }) });
      if (!response.ok) throw new Error("locale");
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }
  return <div className="mt-2 flex items-center gap-1" aria-label="Langue"><button type="button" disabled={busy} aria-pressed={locale === "fr"} onClick={() => void change("fr")} className={`rounded-[4px] px-2 py-1 text-[10px] ${locale === "fr" ? "bg-white/15 text-paper" : "text-cyan-200 hover:bg-white/10"}`}>FR</button><button type="button" disabled={busy} aria-pressed={locale === "ar"} onClick={() => void change("ar")} className={`rounded-[4px] px-2 py-1 text-[10px] ${locale === "ar" ? "bg-white/15 text-paper" : "text-cyan-200 hover:bg-white/10"}`}>AR</button></div>;
}
