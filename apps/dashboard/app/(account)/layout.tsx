import Link from "next/link";
import { homePath } from "@workspace/routes";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-4 px-6">
          <Link
            href={homePath()}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to dashboard
          </Link>
          <h1 className="font-semibold">Account Settings</h1>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-10">{children}</main>
    </div>
  );
}
