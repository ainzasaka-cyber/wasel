"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMad } from "@/lib/money";

type Order = { id: string; orderNumber: string; status: string; priority: string; paymentMethod: string; paymentStatus: string; currency: string; totalAmount: string | number; codAmount: string | number; deliveryCity: string; itemCount: number; placedAt: string; customer: { fullName: string; phone: string }; store: { name: string; code: string } };
type ApiResponse = { data: Order[]; page: { nextCursor: string | null; hasMore: boolean; limit: number } };

const labels: Record<string, string> = { ORDER_RECEIVED: "Reçue", CONFIRMATION_PENDING: "À confirmer", CONFIRMED: "Confirmée", PREPARING: "Préparation", READY_FOR_PICKUP: "Prête", PICKED_UP: "Enlevée", IN_TRANSIT: "En transit", OUT_FOR_DELIVERY: "En livraison", DELIVERED: "Livrée", CANCELLED: "Annulée", DELIVERY_FAILED: "Échec", RESCHEDULED: "Rappel", RETURNED: "Retournée" };

export default function OrdersTable() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [searched, setSearched] = useState(false);

  async function load(cursor?: string) {
    setState("loading");
    const params = new URLSearchParams({ limit: "25" });
    if (query.trim()) params.set("q", query.trim());
    if (status) params.set("status", status);
    if (cursor) params.set("cursor", cursor);
    try {
      const response = await fetch(`/api/v1/orders?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("orders");
      const body = await response.json() as ApiResponse;
      setOrders((current) => cursor ? [...current, ...body.data] : body.data);
      setNextCursor(body.page.nextCursor);
      setHasMore(body.page.hasMore);
      setState("ready");
      setSearched(Boolean(query.trim() || status));
    } catch {
      setState("error");
    }
  }

  useEffect(() => { void load(); }, []);

  return <section className="mt-5 rounded-[8px] border border-line bg-paper"><form onSubmit={(event) => { event.preventDefault(); void load(); }} className="flex flex-col gap-3 border-b border-line p-4 md:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Rechercher une commande" placeholder="N° commande, client ou téléphone" className="h-9 min-w-0 flex-1 rounded-[7px] border border-line-strong px-3 text-[12.5px]" /><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrer par statut" className="h-9 rounded-[7px] border border-line-strong bg-paper px-3 text-[12.5px]"><option value="">Tous les statuts</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="submit" className="h-9 rounded-[7px] bg-ink-800 px-3 text-[12.5px] font-semibold text-paper">Rechercher</button></form>{state === "loading" && <div className="px-4 py-16 text-center text-[12px] text-muted">Chargement des commandes…</div>}{state === "error" && <div className="px-4 py-16 text-center"><p className="text-[13px] font-semibold">Impossible de charger les commandes</p><button type="button" onClick={() => void load()} className="mt-3 rounded-[6px] border border-line-strong px-3 py-2 text-[11px]">Réessayer</button></div>}{state === "ready" && orders.length === 0 && <div className="px-4 py-16 text-center"><p className="font-mono text-[20px] text-faint">Ø</p><h2 className="mt-2 text-[13.5px] font-semibold">{searched ? "Aucun résultat" : "Aucune commande à afficher"}</h2><p className="mx-auto mt-1 max-w-[360px] text-[11.5px] leading-5 text-muted">{searched ? "Modifiez les filtres ou la recherche." : "La base de données ne contient aucune commande visible pour cet espace."}</p></div>}{state === "ready" && orders.length > 0 && <><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-[12px]"><thead className="border-b border-line text-[10px] uppercase tracking-[0.08em] text-faint"><tr><th className="px-4 py-3">Commande</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Ville</th><th className="px-4 py-3 text-right">Montant</th></tr></thead><tbody className="divide-y divide-line">{orders.map((order) => <tr key={order.id}><td className="px-4 py-3"><Link href={`/app/orders/${order.id}`} className="font-mono text-cyan-700 hover:underline">{order.orderNumber}</Link><span className="mt-1 block text-[10.5px] text-faint">{order.store.name}</span></td><td className="px-4 py-3"><span className="font-medium">{order.customer.fullName}</span><span className="mt-1 block text-[10.5px] text-muted">{order.customer.phone}</span></td><td className="px-4 py-3"><span className="rounded-full border border-line-strong px-2 py-1 text-[10.5px]">{labels[order.status] ?? order.status}</span></td><td className="px-4 py-3 text-muted">{order.deliveryCity}</td><td className="px-4 py-3 text-right font-mono">{formatMad(String(order.totalAmount))}</td></tr>)}</tbody></table></div><div className="grid divide-y divide-line md:hidden">{orders.map((order) => <Link href={`/app/orders/${order.id}`} key={order.id} className="block p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[12px] text-cyan-700">{order.orderNumber}</p><h3 className="mt-1 text-[13px] font-semibold">{order.customer.fullName}</h3><p className="mt-1 text-[11px] text-muted">{order.deliveryCity} · {order.customer.phone}</p></div><span className="rounded-full border border-line-strong px-2 py-1 text-[10px]">{labels[order.status] ?? order.status}</span></div><p className="mt-3 font-mono text-[14px]">{formatMad(String(order.totalAmount))}</p></Link>)}</div>{hasMore && nextCursor && <div className="border-t border-line p-4 text-center"><button type="button" onClick={() => void load(nextCursor)} className="rounded-[6px] border border-line-strong px-3 py-2 text-[11px] font-semibold">Charger plus</button></div>}</>}</section>;
}
