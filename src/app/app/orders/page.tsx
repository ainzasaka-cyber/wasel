import Link from "next/link";

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-canvas p-5 text-text sm:p-8 lg:p-10">
      <div className="mx-auto max-w-[1180px]">
        <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint">Opérations · 02</p><h1 className="mt-2 text-[25px] font-semibold tracking-tight">Commandes</h1><p className="mt-1 text-[13.5px] text-muted">Rechercher, confirmer et préparer les commandes entrantes.</p></div><Link href="/app/orders/new" className="inline-flex h-9 items-center justify-center rounded-[7px] bg-cyan-600 px-3.5 text-[12.5px] font-semibold text-paper">Nouvelle commande</Link></header>
        <section className="mt-5 rounded-[8px] border border-line bg-paper"><div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row"><input aria-label="Rechercher une commande" placeholder="N° commande, client ou téléphone" className="h-9 min-w-0 flex-1 rounded-[7px] border border-line-strong px-3 text-[12.5px]" /><select aria-label="Filtrer par statut" className="h-9 rounded-[7px] border border-line-strong bg-paper px-3 text-[12.5px]"><option>Tous les statuts</option></select><button disabled className="h-9 rounded-[7px] border border-line px-3 text-[12.5px] text-faint">Exporter</button></div><div className="px-4 py-16 text-center"><p className="font-mono text-[20px] text-faint">Ø</p><h2 className="mt-2 text-[13.5px] font-semibold">Aucune commande à afficher</h2><p className="mx-auto mt-1 max-w-[360px] text-[11.5px] leading-5 text-muted">La liste sera alimentée par la base de données et les intégrations de boutique. Les commandes ne sont pas simulées.</p></div></section>
      </div>
    </main>
  );
}
