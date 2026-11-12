import { getCurrentUser } from "@/modules/auth/current-user";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <main className="min-h-screen bg-canvas p-5 text-text"><section className="mx-auto mt-16 max-w-[520px] rounded-[10px] border border-line bg-paper p-6"><h1 className="text-[19px] font-semibold">Connexion requise</h1><p className="mt-2 text-[13.5px] text-muted">Cette zone est réservée aux utilisateurs WASEL authentifiés.</p></section></main>;
  }
  return <main className="min-h-screen bg-canvas p-5 text-text"><section className="mx-auto max-w-[1100px]"><p className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-faint">WASEL · console</p><h1 className="mt-2 text-[19px] font-semibold">Bonjour, {user.fullName}</h1><p className="mt-2 text-[13.5px] text-muted">Votre espace opérationnel est prêt.</p></section></main>;
}
