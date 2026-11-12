import SettlementExposure from "./exposure";

export default function SettlementsPage() {
  return <main className="min-h-screen bg-canvas p-5 text-text sm:p-8 lg:p-10"><div className="mx-auto max-w-[1180px]"><header className="border-b border-line pb-5"><p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint">Finance · 05</p><h1 className="mt-2 text-[25px] font-semibold tracking-tight">Règlements</h1><p className="mt-1 text-[13.5px] text-muted">Suivre l’exposition COD issue des commandes avant d’ajouter le rapprochement.</p><div className="mt-4 inline-flex items-center gap-2 rounded-[6px] border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-800"><span className="h-1.5 w-1.5 rounded-full bg-amber-600" />Rapprochement désactivé jusqu’à activation du schéma Supabase</div></header><SettlementExposure /></div></main>;
}
