import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/current-user";
import { isSupportedLocale, LOCALE_COOKIE } from "@/modules/auth/session";
import { cookies } from "next/headers";
import LocaleSwitcher from "./locale-switcher";
import TenantSwitcher from "./tenant-switcher";

export default async function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");
  const storedLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isSupportedLocale(storedLocale) ? storedLocale : "fr";
  const activeTenantId = user.memberships[0]?.tenantId;
  return <><div className="fixed right-4 top-4 z-20 w-[220px] rounded-[7px] bg-ink-950 p-2 shadow-lg"><LocaleSwitcher locale={locale} /><TenantSwitcher memberships={user.memberships} activeTenantId={activeTenantId} /></div>{children}</>;
}
