"use client";

import { useEffect, useState } from "react";

type ConfirmationOrder = { id: string; orderNumber: string; totalAmount: string; deliveryCity: string; placedAt: string; customer: { fullName: string; phone: string; address: string | null } };

export default function ConfirmationQueue() {
  const [orders, setOrders] = useState<ConfirmationOrder[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setState("loading");
    try {
      const response = await fetch("/api/v1/confirmation?limit=50", { cache: "no-store" });
      if (!response.ok) throw new Error("load");
      const body = await response.json() as { data: ConfirmationOrder[] };
      setOrders(body.data);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => { void load(); }, []);

  async function act(orderId: string, action: "confirm" | "cancel" | "reschedule") {
    setNotice(null);
    const response = await fetch(`/api/v1/orders/${orderId}/confirmation`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    if (!response.ok) { setNotice("Action impossible pour le moment."); return; }
    setNotice(action === "confirm" ? "Commande confirmée." : action === "cancel" ? "Commande annulée." : "Rappel planifié.");
    await load();
  }

  return <section className="mt-5 rounded-[8px] border border-line bg-paper"><div className="flex items-center justify-between border-b border-line p-4"><div><h2 className="text-[13.5px] font-semibold">File à traiter</h2><p className="mt-1 text-[11px] text-muted">Les actions écrivent un événement append-only.</p></div><button type="button" onClick={() => void load()} className="text-[11px] font-semibold text-cyan-700">Actualiser</button></div>{notice && <p role="status" className="border-b border-line bg-cyan-50 px-4 py-2 text-[12px] text-cyan-700">{notice}</p>}{state === "loading" && <div className="px-4 py-16 text-center text-[12px] text-muted">Chargement de la file…</div>}{state === "error" && <div className="px-4 py-16 text-center"><p className="text-[13px] font-semibold">Impossible de charger la file</p><button type="button" onClick={() => void load()} className="mt-3 rounded-[6px] border border-line-strong px-3 py-2 text-[11px]">Réessayer</button></div>}{state === "ready" && orders.length === 0 && <div className="px-4 py-16 text-center"><p className="font-mono text-[20px] text-faint">Ø</p><p className="mt-2 text-[13px] font-medium">File vide</p><p className="mt-1 text-[11.5px] text-muted">Aucune commande en attente de confirmation.</p></div>}{state === "ready" && orders.length > 0 && <div className="divide-y divide-line">{orders.map((order) => <article key={order.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-mono text-[12px] text-cyan-700">{order.orderNumber}</p><h3 className="mt-1 text-[13px] font-semibold">{order.customer.fullName}</h3><p className="mt-1 text-[11.5px] text-muted">{order.customer.phone} · {order.deliveryCity}</p><p className="mt-1 text-[11px] text-faint">{order.customer.address ?? "Adresse non renseignée"}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void act(order.id, "confirm")} className="rounded-[6px] bg-cyan-600 px-3 py-2 text-[11px] font-semibold text-paper">Confirmer</button><button type="button" onClick={() => void act(order.id, "reschedule")} className="rounded-[6px] border border-line-strong px-3 py-2 text-[11px] font-semibold">Rappeler</button><button type="button" onClick={() => void act(order.id, "cancel")} className="rounded-[6px] border border-danger px-3 py-2 text-[11px] font-semibold text-danger">Annuler</button></div></article>)}</div>}</section>;
}
