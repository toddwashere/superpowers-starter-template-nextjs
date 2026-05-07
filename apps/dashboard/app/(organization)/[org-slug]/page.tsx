import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organization Dashboard",
};

export default function OrgDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Organization Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome to your organization. Select a section from the sidebar.
      </p>
    </div>
  );
}
