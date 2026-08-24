import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: proxy.ts already gates /admin/*, but every data
  // request should still verify the session itself rather than relying on
  // proxy alone (see Next.js data-security guidance).
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminShell adminEmail={session.email}>{children}</AdminShell>;
}
