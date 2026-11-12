"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMad } from "@/lib/money";

type DispatchOrder = { id: string; orderNumber: string; status: string; priority: string; deliveryCity: string; itemCount: number; codAmount: string | number; createdAt: string; store: { name: string }; customer: { fullName: string; phone: string; address: string | null } };
type Queue = { lanes: { ready: DispatchOrder[]; active: DispatchOrder[]; exceptions: DispatchOrder[] }; assignmentAvailable: false };

const lanes = [{ key: "ready", title: "Prêtes à enlever", detail: "Commandes prêtes pour la prise en charge" }, { key: "active", title: "En livraison", detail: "Dernier kilomètre en cours" }, { key: "exceptions", title: "Exceptions", detail: "Échec ou reprogrammation" }] as const;
const statusLabels: Record<string, string> = { READY_FOR_PICKUP: "Prête", PICKED_UP: "Enlevée", IN_TRANSIT: "En transit", OUT_FOR_DELIVERY: "Sortie", DELIVERY_FAILED: "Échec", RESCHEDULED: "Reprogrammer" };

export default function DispatchBoard() {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  async function load() { setState("loading"); try { const response = await fetch("/api/v1/dispatch", { cache: "no-store" }); if (!response.ok) throw new Error("dispatch"); setQueue((await response.json() as { data: Queue }).data); setState("ready"); } catch { setState("error"); } }
  useEffect(() => { void load(); }, []);
  if (state === "loading") return <section className="mt-5 rounded-[8px] border border-line bg-paper px-4 py-16 text-center text-[12px] text-muted">Chargement du dispatch…</section>;
  if (state === "error") return <section className="mt-5 rounded-[8px] border border-line bg-paper px-4 py-16 text-center"><p className="text-[13px] font-semibold">Impossible de charger le dispatch</p><button type="button" onClick={() => void load()} className="mt-3 rounded-[6px] border border-line-strong px-3 py-2 text-[11px]">Réessayer</button></section>;
  if (!queue) return null;
  return <><div className="mt-5 rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] text-amber-800">Les affectations courier ne sont pas disponibles dans le schéma actuel. Cette vue affiche uniquement la file d’ordres par statut.</div><section className="mt-3 grid gap-3 xl:grid-cols-3">{lanes.map((lane) => { const orders = queue.lanes[lane.key]; return <article key={lane.key} className="min-h-[320px] rounded-[8px] border border-line bg-paper"><div className="border-b border-line p-4"><h2 className="text-[13.5px] font-semibold">{lane.title}</h2><p className="mt-1 text-[11px] text-muted">{lane.detail}</p><p className="mt-2 font-mono text-[11px] text-faint">{orders.length} commande(s)</p></div>{orders.length ? <div className="divide-y divide-line">{orders.map((order) => <Link key={order.id} href={`/app/orders/${order.id}`} className="block p-4 hover:bg-canvas"><div className="flex items-start justify-between gap-2"><span className="font-mono text-[12px] text-cyan-700">{order.orderNumber}</span><span className="rounded-full border border-line-strong px-2 py-1 text-[10px]">{statusLabels[order.status] ?? order.status}</span></div><p className="mt-2 text-[12px] font-semibold">{order.customer.fullName}</p><p className="mt-1 text-[11px] text-muted">{order.deliveryCity} · {order.itemCount} article(s)</p><p className="mt-1 text-[11px] text-faint">{order.customer.address ?? "Adresse non renseignée"}</p><p className="mt-3 font-mono text-[11px]">COD {formatMad(String(order.codAmount))}</p></Link>)}</div> : <div className="px-4 py-16 text-center"><p className="font-mono text-[18px] text-faint">Ø</p><p className="mt-2 text-[12.5px] font-medium">File vide</p><p className="mt-1 text-[11px] text-muted">Aucune commande dans cette file.</p></div>}</article>; })}</section></>;
}
