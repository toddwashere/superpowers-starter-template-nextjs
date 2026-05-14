import { redirect } from "next/navigation";
import { getCurrentUser } from "@workspace/auth/session";
import { DashboardShell } from "@/features/dashboard/ui/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/api/clear-session");
  }

  return (
    <DashboardShell user={session.user}>{children}</DashboardShell>
  );
}
