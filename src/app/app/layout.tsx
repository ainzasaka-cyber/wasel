import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/current-user";
import TenantSwitcher from "./tenant-switcher";

export default async function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");
  const activeTenantId = user.memberships[0]?.tenantId;
  return <><div className="fixed right-4 top-4 z-20 w-[220px] rounded-[7px] bg-ink-950 p-2 shadow-lg"><TenantSwitcher memberships={user.memberships} activeTenantId={activeTenantId} /></div>{children}</>;
}
