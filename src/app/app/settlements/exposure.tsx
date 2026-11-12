"use client";

import { useEffect, useState } from "react";
import { formatMad } from "@/lib/money";

type Exposure = { pendingCod: { count: number; amount: string }; paidPrepaid: { count: number; amount: string }; failedPayments: { count: number; amount: string }; recentCodOrders: Array<{ id: string; orderNumber: string; codAmount: string | number; status: string; deliveryCity: string; createdAt: string; store: { name: string } }>; settlementAvailable: false };

export default function SettlementExposure() {
  const [data, setData] = useState<Exposure | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  async function load() {
    setState("loading");
    try {
      const response = await fetch("/api/v1/settlements/exposure", { cache: "no-store" });
      if (!response.ok) throw new Error("exposure");
      const body = await response.json() as { data: Exposure };
      setData(body.data);
      setState("ready");
    } catch {
      setState("error");
    }
  }

  useEffect(() => { void load(); }, []);
  if (state === "loading") return <section className="mt-5 rounded-[8px] border border-line bg-paper px-4 py-16 text-center text-[12px] text-muted">Chargement des données COD…</section>;
  if (state === "error") return <section className="mt-5 rounded-[8px] border border-line bg-paper px-4 py-16 text-center"><p className="text-[13px] font-semibold">Impossible de charger l’exposition COD</p><button type="button" onClick={() => void load()} className="mt-3 rounded-[6px] border border-line-strong px-3 py-2 text-[11px]">Réessayer</button></section>;
  if (!data) return null;
  return <><section className="mt-5 grid gap-3 sm:grid-cols-3"><article className="rounded-[8px] border border-line bg-paper p-4"><p className="text-[11px] text-muted">COD attendu</p><p className="mt-3 font-mono text-[25px]">{formatMad(data.pendingCod.amount)}</p><p className="mt-1 text-[10.5px] text-faint">{data.pendingCod.count} commande(s) non collectée(s)</p></article><article className="rounded-[8px] border border-line bg-paper p-4"><p className="text-[11px] text-muted">Prépayé encaissé</p><p className="mt-3 font-mono text-[25px]">{formatMad(data.paidPrepaid.amount)}</p><p className="mt-1 text-[10.5px] text-faint">{data.paidPrepaid.count} commande(s) marquée(s) payée(s)</p></article><article className="rounded-[8px] border border-line bg-paper p-4"><p className="text-[11px] text-muted">Paiements échoués</p><p className="mt-3 font-mono text-[25px]">{formatMad(data.failedPayments.amount)}</p><p className="mt-1 text-[10.5px] text-faint">{data.failedPayments.count} commande(s)</p></article></section><section className="mt-5 rounded-[8px] border border-line bg-paper"><div className="border-b border-line p-4"><h2 className="text-[13.5px] font-semibold">COD en attente</h2><p className="mt-1 text-[11px] text-muted">Vue d’exposition issue des commandes. Ce n’est pas encore un règlement rapproché.</p></div>{data.recentCodOrders.length ? <div className="divide-y divide-line">{data.recentCodOrders.map((order) => <div key={order.id} className="flex flex-col gap-2 p-4 text-[12px] sm:flex-row sm:items-center sm:justify-between"><span><strong className="font-mono text-cyan-700">{order.orderNumber}</strong><span className="ml-2 text-muted">{order.store.name} · {order.deliveryCity}</span></span><span className="font-mono">{formatMad(String(order.codAmount))}</span></div>)}</div> : <div className="px-4 py-16 text-center"><p className="font-mono text-[20px] text-faint">Ø</p><p className="mt-2 text-[13px] font-semibold">Aucune exposition COD</p><p className="mt-1 text-[11.5px] text-muted">Aucune commande COD en attente dans cet espace.</p></div>}<div className="border-t border-line bg-amber-50 px-4 py-3 text-[11px] text-amber-800">Les modèles de collecte, remise, rapprochement et règlement ne sont pas encore disponibles dans le schéma Prisma actuel.</div></section></>;
}
