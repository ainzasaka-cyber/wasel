import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/current-user";
import TenantSwitcher from "./tenant-switcher";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");
  return <main className="min-h-screen bg-canvas text-text"><div className="mx-auto max-w-[900px] px-5 py-8 sm:px-8"><header className="border-b border-line pb-5"><p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-faint">Workspace</p><h1 className="mt-2 text-[25px] font-semibold tracking-tight">Choisir un espace</h1><p className="mt-1 text-[13px] text-muted">Votre compte possède plusieurs espaces opérationnels. Sélectionnez celui à ouvrir.</p></header><section className="mt-5 grid gap-3 sm:grid-cols-2">{user.memberships.map((membership) => <Link key={`${membership.tenantId}-${membership.role}`} href={`/app?tenant=${membership.tenantId}`} className="rounded-[8px] border border-line bg-paper p-4 hover:border-cyan-500"><p className="text-[14px] font-semibold">{membership.tenant.name}</p><p className="mt-1 text-[11px] text-muted">{membership.tenant.slug} · {membership.role}</p></Link>)}</section></div></main>;
}
