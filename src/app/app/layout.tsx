import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/auth/current-user";

export default async function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");
  return <>{children}</>;
}
