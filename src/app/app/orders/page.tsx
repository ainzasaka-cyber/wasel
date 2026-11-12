import Link from "next/link";
import OrdersTable from "./table";

export default function OrdersPage() {
  return <main className="min-h-screen bg-canvas p-5 text-text sm:p-8 lg:p-10"><div className="mx-auto max-w-[1180px]"><header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint">Opérations · 02</p><h1 className="mt-2 text-[25px] font-semibold tracking-tight">Commandes</h1><p className="mt-1 text-[13.5px] text-muted">Rechercher, confirmer et préparer les commandes entrantes.</p></div><Link href="/app/orders/new" className="inline-flex h-9 items-center justify-center rounded-[7px] bg-cyan-600 px-3.5 text-[12.5px] font-semibold text-paper">Nouvelle commande</Link></header><OrdersTable /></div></main>;
}
