import { formatMad } from "@/lib/money";

const statuses = [
  { label: "Confirmée", tone: "ok" },
  { label: "À confirmer", tone: "warn" },
  { label: "En cours de livraison", tone: "progress" },
  { label: "Livraison échouée", tone: "danger" },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas p-5 text-text">
      <div className="mx-auto max-w-[1100px]">
        <header className="mb-6 flex items-end justify-between border-b border-line pb-4">
          <div>
            <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint">WASEL · style tile</p>
            <h1 className="text-[19px] font-semibold tracking-tight">Operational instrument</h1>
          </div>
          <span className="font-mono text-[11px] text-faint">FR / LTR</span>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[10px] border border-line bg-paper p-4">
            <h2 className="mb-3 text-[13.5px] font-semibold">Controls</h2>
            <div className="flex flex-wrap gap-2">
              <button className="h-[34px] rounded-[7px] border border-line-strong bg-paper px-3 text-[12.5px] font-medium">Default</button>
              <button className="h-[34px] rounded-[7px] bg-ink-800 px-3 text-[12.5px] font-medium text-paper">Primary</button>
              <button className="h-[34px] rounded-[7px] bg-cyan-600 px-3 text-[12.5px] font-medium text-paper">Accent</button>
              <button className="h-[34px] rounded-[7px] border border-danger px-3 text-[12.5px] font-medium text-danger">Danger</button>
            </div>
            <label className="mt-4 block text-[11px] font-semibold uppercase tracking-[0.03em] text-faint" htmlFor="style-search">Search</label>
            <input id="style-search" className="mt-1 h-[34px] w-full rounded-[7px] border border-line-strong bg-paper px-3 text-[13px]" placeholder="Order number, customer or phone" />
          </article>

          <article className="rounded-[10px] border border-line bg-paper p-4">
            <h2 className="mb-3 text-[13.5px] font-semibold">Status language</h2>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => <span key={status.label} className={`inline-flex items-center gap-1 rounded-[5px] border px-2 py-1 text-[11px] font-medium status-${status.tone}`}><span className="h-[5px] w-[5px] rounded-full bg-current" />{status.label}</span>)}
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[11px] uppercase tracking-[0.03em] text-faint">Money</p>
              <p className="mt-1 font-mono text-[23px] font-semibold tabular-nums">{formatMad("308.20")}</p>
            </div>
          </article>
        </section>

        <section className="mt-4 rounded-[10px] border border-line bg-paper p-4">
          <h2 className="mb-3 text-[13.5px] font-semibold">Timeline signature</h2>
          <ol className="grid gap-4 md:grid-cols-4">
            {["Commande reçue", "Confirmée", "En préparation", "Livrée"].map((step, index) => (
              <li key={step} className="flex items-start gap-2">
                <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 ${index < 2 ? "border-cyan-600 bg-cyan-600" : index === 2 ? "border-cyan-500 bg-paper" : "border-line-strong bg-paper"}`} />
                <span><strong className="block text-[12.5px]">{step}</strong><small className="text-[11px] text-faint">{index < 2 ? "Terminé" : index === 2 ? "Étape actuelle" : "À venir"}</small></span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
