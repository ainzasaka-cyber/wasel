"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" } });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return <button type="button" onClick={() => void logout()} disabled={busy} className="mt-3 text-left text-[11px] font-semibold text-cyan-300 hover:text-paper disabled:opacity-60">{busy ? "Déconnexion…" : "Se déconnecter"}</button>;
}
