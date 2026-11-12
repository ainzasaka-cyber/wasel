import Link from "next/link";
import { getCurrentUser } from "@/modules/auth/current-user";

const navItems = [
  { href: "/app", label: "Vue d’ensemble", code: "01" },
  { href: "/app/orders", label: "Commandes", code: "02" },
  { href: "/app/confirmation", label: "Confirmation", code: "03" },
  { href: "/app/dispatch", label: "Dispatch", code: "04" },
  { href: "/app/settlements", label: "Règlements", code: "05" },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const membership = user.memberships[0];

  return (
    <main className="min-h-screen bg-canvas text-text">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-line bg-ink-950 px-4 py-5 text-paper lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex items-center justify-between lg:block">
            <Link href="/app" className="font-mono text-[13px] font-bold tracking-[0.12em] text-paper">WASEL</Link>
            <span className="font-mono text-[10px] text-cyan-300">OPS / 01</span>
          </div>
          <p className="mt-10 hidden text-[9.5px] font-semibold uppercase tracking-[0.12em] text-cyan-300 lg:block">Workspace</p>
          <nav className="mt-3 grid grid-cols-2 gap-1 lg:block" aria-label="Navigation principale">
            {navItems.map((item, index) => <Link key={item.href} href={item.href} className={`flex items-center justify-between rounded-[6px] px-2.5 py-2 text-[12px] ${index === 0 ? "bg-white/10 text-paper" : "text-cyan-100 hover:bg-white/10"}`}><span>{item.label}</span><span className="font-mono text-[10px] text-cyan-300">{item.code}</span></Link>)}
          </nav>
          <div className="mt-10 hidden border-t border-white/15 pt-4 text-[11px] text-cyan-100 lg:block">
            <p className="text-[9.5px] uppercase tracking-[0.1em] text-cyan-300">Session</p>
            <p className="mt-2 truncate text-paper">{user.email}</p>
            <p className="mt-1">{membership?.role ?? "Utilisateur"}</p>
          </div>
        </aside>

        <section className="min-w-0 px-5 py-5 sm:px-8 lg:px-10 lg:py-8">
          <header className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint">Vue d’ensemble · aujourd’hui</p>
              <h1 className="mt-2 text-[25px] font-semibold tracking-tight">Bonjour, {user.fullName}</h1>
              <p className="mt-1 text-[13.5px] text-muted">Un poste clair pour décider ce qui doit avancer maintenant.</p>
            </div>
            <Link href="/app/orders/new" className="inline-flex h-9 items-center justify-center rounded-[7px] bg-cyan-600 px-3.5 text-[12.5px] font-semibold text-paper hover:bg-cyan-700">Nouvelle commande</Link>
          </header>

          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs du jour">
            {["À confirmer", "En préparation", "En livraison", "À régler"].map((label) => <article key={label} className="rounded-[8px] border border-line bg-paper p-4"><p className="text-[11px] text-muted">{label}</p><p className="mt-3 font-mono text-[26px] font-semibold tabular-nums text-faint">—</p><p className="mt-1 text-[10.5px] text-faint">Données en attente de connexion</p></article>)}
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <article className="rounded-[8px] border border-line bg-paper">
              <div className="flex items-center justify-between border-b border-line px-4 py-3"><div><h2 className="text-[13.5px] font-semibold">File opérationnelle</h2><p className="mt-0.5 text-[11px] text-muted">Les commandes qui demandent une action.</p></div><Link href="/app/orders" className="text-[11px] font-semibold text-cyan-700">Voir tout</Link></div>
              <div className="px-4 py-12 text-center"><p className="font-mono text-[20px] text-faint">Ø</p><p className="mt-2 text-[13px] font-medium">Aucune commande chargée</p><p className="mx-auto mt-1 max-w-[300px] text-[11.5px] leading-5 text-muted">Connectez la base de données pour afficher la file en temps réel. Aucun chiffre n’est simulé ici.</p></div>
            </article>
            <article className="rounded-[8px] border border-line bg-paper">
              <div className="border-b border-line px-4 py-3"><h2 className="text-[13.5px] font-semibold">Activité récente</h2><p className="mt-0.5 text-[11px] text-muted">Historique append-only.</p></div>
              <div className="px-4 py-12 text-center"><p className="font-mono text-[20px] text-faint">—</p><p className="mt-2 text-[13px] font-medium">Pas encore d’activité</p><p className="mt-1 text-[11.5px] leading-5 text-muted">Les événements apparaîtront ici après la première opération.</p></div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
