"use client";

import { useState } from "react";

type Membership = { tenantId: string; role: string; tenant: { name: string; slug: string } };

export default function TenantSwitcher({ memberships, activeTenantId }: { memberships: Membership[]; activeTenantId?: string }) {
  const [busy, setBusy] = useState(false);
  if (memberships.length < 2) return null;
  const selected = activeTenantId ?? memberships[0]?.tenantId ?? "";
  async function change(tenantId: string) {
    if (tenantId === selected) return;
    setBusy(true);
    try {
      const response = await fetch("/api/auth/tenant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenantId }) });
      if (!response.ok) throw new Error("tenant");
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }
  return <label className="mt-3 block text-[11px] text-cyan-100"><span className="sr-only">Espace actif</span><select value={selected} disabled={busy} onChange={(event) => void change(event.target.value)} className="w-full rounded-[5px] border border-white/20 bg-white/10 px-2 py-1.5 text-[11px] text-paper"><option value="" disabled>Choisir un espace</option>{memberships.map((membership) => <option key={membership.tenantId} value={membership.tenantId} className="text-text">{membership.tenant.name} · {membership.role}</option>)}</select></label>;
}
