import Link from "next/link";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <LoginForm searchParams={searchParams} />;
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="min-h-screen bg-canvas text-text">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
        <section className="flex items-center justify-center border-b border-line bg-paper px-6 py-12 lg:border-b-0 lg:border-r">
          <div className="w-full max-w-[360px]">
            <Link href="/" className="font-mono text-[13px] font-bold tracking-[0.12em] text-ink-800">WASEL</Link>
            <p className="mt-10 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint">Espace opérateur</p>
            <h1 className="mt-2 text-[25px] font-semibold tracking-tight">Se connecter</h1>
            <p className="mt-2 text-[13.5px] leading-6 text-muted">Accédez à vos commandes, confirmations et opérations de livraison.</p>
            <form action="/api/auth/login" method="post" className="mt-8 space-y-4">
              <input type="hidden" name="next" value={next ?? "/app"} />
              <div>
                <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.03em] text-faint">Email professionnel</label>
                <input id="email" name="email" type="email" autoComplete="email" required className="mt-1 h-10 w-full rounded-[7px] border border-line-strong bg-paper px-3 text-[13.5px]" />
              </div>
              <div>
                <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.03em] text-faint">Mot de passe</label>
                <input id="password" name="password" type="password" autoComplete="current-password" minLength={10} required className="mt-1 h-10 w-full rounded-[7px] border border-line-strong bg-paper px-3 text-[13.5px]" />
              </div>
              <button type="submit" className="h-10 w-full rounded-[7px] bg-ink-800 px-4 text-[13px] font-semibold text-paper hover:bg-ink-700">Ouvrir la console</button>
            </form>
            <p className="mt-6 text-[11px] leading-5 text-faint">Votre session est protégée par un cookie HttpOnly et expire automatiquement.</p>
          </div>
        </section>
        <aside className="hidden bg-ink-950 p-10 text-paper lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="font-mono text-[12px] tracking-[0.12em] text-cyan-300">LAST-MILE / MOROCCO</p>
            <h2 className="mt-16 max-w-[520px] text-[42px] font-semibold leading-[1.05] tracking-[-0.04em]">Une vue nette sur chaque commande.</h2>
          </div>
          <div className="grid max-w-[520px] grid-cols-2 gap-3 border-t border-white/20 pt-5 text-[12px] text-cyan-100">
            <p><strong className="block text-paper">Confirmation</strong>Décider vite, avec le bon contexte.</p>
            <p><strong className="block text-paper">Livraison</strong>Suivre le dernier kilomètre sans bruit.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
