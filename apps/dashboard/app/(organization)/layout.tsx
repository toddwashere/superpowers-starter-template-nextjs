import { redirect } from "next/navigation";
import { getCurrentUser } from "@workspace/auth/session";

export default async function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/api/clear-session");
  }

  return children;
}
