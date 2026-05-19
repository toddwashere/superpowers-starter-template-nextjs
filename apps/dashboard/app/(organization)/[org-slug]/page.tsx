import type { Metadata } from "next";
import { OrgDashboardPageContent } from "@/features/organization/ui/org-dashboard-page-content";

export const metadata: Metadata = {
  title: "Organization Dashboard",
};

export default function OrgDashboardPage() {
  return <OrgDashboardPageContent />;
}
