import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/current-user";
import TenantSwitcher from "../tenant-switcher";

export default async function TenantSelectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app/tenant-select");
  if (user.memberships.length < 2) redirect("/app");
  return <main className="min-h-screen bg-canvas text-text"><div className="mx-auto max-w-[900px] px-5 py-8 sm:px-8"><header className="border-b border-line pb-5"><p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-faint">Workspace</p><h1 className="mt-2 text-[25px] font-semibold tracking-tight">Choisir un espace</h1><p className="mt-1 text-[13px] text-muted">Votre compte possède plusieurs espaces opérationnels. Sélectionnez celui à ouvrir.</p></header><div className="mt-5 max-w-[320px]"><TenantSwitcher memberships={user.memberships} activeTenantId={user.memberships[0]?.tenantId} /></div></div></main>;
}
