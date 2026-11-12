const columns = [
  { title: "À confirmer", detail: "Nouveaux appels à traiter" },
  { title: "Rappel demandé", detail: "À recontacter plus tard" },
  { title: "Confirmées", detail: "Prêtes pour la préparation" },
];

export default function ConfirmationPage() {
  return <main className="min-h-screen bg-canvas p-5 text-text sm:p-8 lg:p-10"><div className="mx-auto max-w-[1180px]"><header className="border-b border-line pb-5"><p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint">Opérations · 03</p><h1 className="mt-2 text-[25px] font-semibold tracking-tight">Confirmation</h1><p className="mt-1 text-[13.5px] text-muted">Une file courte pour transformer les commandes reçues en commandes confirmées.</p></header><section className="mt-5 grid gap-3 lg:grid-cols-3">{columns.map((column) => <article key={column.title} className="min-h-[300px] rounded-[8px] border border-line bg-paper"><div className="border-b border-line p-4"><h2 className="text-[13.5px] font-semibold">{column.title}</h2><p className="mt-1 text-[11px] text-muted">{column.detail}</p></div><div className="px-4 py-16 text-center"><p className="font-mono text-[18px] text-faint">—</p><p className="mt-2 text-[12.5px] font-medium">File vide</p><p className="mt-1 text-[11px] text-muted">Aucune donnée chargée.</p></div></article>)}</section></div></main>;
}
