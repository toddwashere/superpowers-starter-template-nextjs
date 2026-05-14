import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@workspace/auth/session";
import { DashboardShell } from "@/features/dashboard/ui/dashboard-shell";

const SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session) {
    const cookieStore = await cookies();
    for (const name of SESSION_COOKIES) {
      cookieStore.delete(name);
    }
    redirect("/sign-in");
  }

  return (
    <DashboardShell user={session.user}>{children}</DashboardShell>
  );
}
