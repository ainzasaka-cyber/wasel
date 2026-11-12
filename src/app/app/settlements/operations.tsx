"use client";

import { useEffect, useState } from "react";
import { formatMad } from "@/lib/money";

type Collection = { id: string; orderId: string; status: string; expectedAmount: string; collectedAmount: string | null; currency: string; createdAt: string };
type Batch = { id: string; status: string; periodStart: string; periodEnd: string; grossCod: string; deliveryFees: string; adjustments: string; netAmount: string; currency: string; paymentReference: string | null };
type LoadState = "loading" | "ready" | "unavailable" | "error";

async function readJson<T>(url: string): Promise<{ response: Response; body?: { data: T } }> {
  const response = await fetch(url, { cache: "no-store" });
  let body: { data: T } | undefined;
  try { body = await response.json() as { data: T }; } catch { body = undefined; }
  return { response, body };
}

function statusClass(status: string): string {
  if (["VERIFIED", "APPROVED", "PAID"].includes(status)) return "status-ok";
  if (["DISPUTED", "CANCELLED"].includes(status)) return "status-danger";
  return "status-warn";
}

export default function SettlementOperations() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [collectionState, setCollectionState] = useState<LoadState>("loading");
  const [batchState, setBatchState] = useState<LoadState>("loading");

  async function load() {
    setCollectionState("loading");
    setBatchState("loading");
    try {
      const [collectionResult, batchResult] = await Promise.all([readJson<Collection[]>("/api/v1/collections"), readJson<Batch[]>("/api/v1/settlement-batches")]);
      setCollectionState(collectionResult.response.status === 503 ? "unavailable" : collectionResult.response.ok && collectionResult.body ? "ready" : "error");
      setBatchState(batchResult.response.status === 503 ? "unavailable" : batchResult.response.ok && batchResult.body ? "ready" : "error");
      if (collectionResult.body) setCollections(collectionResult.body.data);
      if (batchResult.body) setBatches(batchResult.body.data);
    } catch {
      setCollectionState("error");
      setBatchState("error");
    }
  }

  useEffect(() => { void load(); }, []);
  const unavailable = collectionState === "unavailable" || batchState === "unavailable";

  return <section className="mt-5 rounded-[8px] border border-line bg-paper"><div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-[13.5px] font-semibold">Opérations de collecte</h2><p className="mt-1 text-[11px] text-muted">Lecture des collectes COD et des lots de règlement après activation du schéma.</p></div><button type="button" onClick={() => void load()} className="rounded-[6px] border border-line-strong px-3 py-2 text-[11px] font-medium">Actualiser</button></div>{unavailable ? <div className="border-b border-line bg-amber-50 px-4 py-4 text-[11px] text-amber-800">Les tables de collecte et de règlement ne sont pas encore initialisées dans Supabase. Cette vue reste en mode exposition uniquement.</div> : null}<div className="grid gap-5 p-4 lg:grid-cols-2"><div><div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold">Collectes récentes</h3><span className="text-[10px] text-faint">{collectionState === "ready" ? `${collections.length} chargée(s)` : collectionState}</span></div>{collectionState === "ready" && collections.length ? <div className="mt-3 divide-y divide-line rounded-[6px] border border-line">{collections.map((collection) => <div key={collection.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[11px]"><span><strong className="font-mono text-cyan-700">{collection.orderId.slice(0, 8)}</strong><span className={`ml-2 rounded-[4px] border px-1.5 py-0.5 ${statusClass(collection.status)}`}>{collection.status}</span></span><span className="font-mono">{formatMad(collection.collectedAmount ?? collection.expectedAmount)}</span></div>)}</div> : <p className="mt-3 rounded-[6px] border border-dashed border-line-strong px-3 py-8 text-center text-[11px] text-muted">{collectionState === "unavailable" ? "Schéma non initialisé" : "Aucune collecte chargée"}</p>}</div><div><div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold">Lots de règlement</h3><span className="text-[10px] text-faint">{batchState === "ready" ? `${batches.length} chargé(s)` : batchState}</span></div>{batchState === "ready" && batches.length ? <div className="mt-3 divide-y divide-line rounded-[6px] border border-line">{batches.map((batch) => <div key={batch.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[11px]"><span><strong className="font-mono text-cyan-700">{batch.id.slice(0, 8)}</strong><span className={`ml-2 rounded-[4px] border px-1.5 py-0.5 ${statusClass(batch.status)}`}>{batch.status}</span></span><span className="font-mono">{formatMad(batch.netAmount)}</span></div>)}</div> : <p className="mt-3 rounded-[6px] border border-dashed border-line-strong px-3 py-8 text-center text-[11px] text-muted">{batchState === "unavailable" ? "Schéma non initialisé" : "Aucun lot chargé"}</p>}</div></div></section>;
}
