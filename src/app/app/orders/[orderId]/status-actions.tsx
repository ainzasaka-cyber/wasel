"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const labels: Record<string, string> = { CONFIRMATION_PENDING: "Passer en attente de confirmation", CONFIRMED: "Confirmer", CANCELLED: "Annuler", RESCHEDULED: "Reprogrammer", PREPARING: "Passer en préparation", READY_FOR_PICKUP: "Marquer prête", PICKED_UP: "Marquer enlevée", IN_TRANSIT: "Passer en transit", OUT_FOR_DELIVERY: "Sortir en livraison", DELIVERED: "Marquer livrée", DELIVERY_FAILED: "Marquer en échec", RETURNED: "Marquer retournée" };

export default function OrderStatusActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [transitions, setTransitions] = useState<string[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setState("loading");
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/status`, { cache: "no-store" });
      if (!response.ok) throw new Error("transitions");
      const body = await response.json() as { data: { transitions: string[] } };
      setTransitions(body.data.transitions);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => { void load(); }, [orderId]);

  async function change(status: string) {
    setSaving(status);
    setMessage(null);
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!response.ok) throw new Error("change");
      setMessage("Statut mis à jour.");
      router.refresh();
      await load();
    } catch {
      setMessage("Impossible de modifier le statut pour le moment.");
    } finally {
      setSaving(null);
    }
  }

  if (state === "loading") return <div className="mt-5 rounded-[8px] border border-line bg-paper p-4 text-[11.5px] text-muted">Chargement des actions autorisées…</div>;
  if (state === "error") return <div className="mt-5 rounded-[8px] border border-line bg-paper p-4"><p className="text-[12px] text-muted">Actions indisponibles.</p><button type="button" onClick={() => void load()} className="mt-2 text-[11px] font-semibold text-cyan-700">Réessayer</button></div>;
  if (!transitions.length) return null;
  return <section className="mt-5 rounded-[8px] border border-line bg-paper p-4"><h2 className="text-[13.5px] font-semibold">Actions opérateur</h2><p className="mt-1 text-[11px] text-muted">Seules les transitions valides pour votre rôle sont affichées.</p>{message && <p role="status" className="mt-3 text-[11px] text-cyan-700">{message}</p>}<div className="mt-4 flex flex-wrap gap-2">{transitions.map((status) => <button key={status} type="button" disabled={Boolean(saving)} onClick={() => void change(status)} className={`rounded-[6px] px-3 py-2 text-[11px] font-semibold ${status === "CANCELLED" || status === "DELIVERY_FAILED" ? "border border-danger text-danger" : "bg-cyan-600 text-paper"}`}>{saving === status ? "Enregistrement…" : labels[status] ?? status}</button>)}</div></section>;
}
