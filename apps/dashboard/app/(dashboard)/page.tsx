import type { Metadata } from "next";
import { OrgPickerPageContent } from "@/features/dashboard/ui/org-picker-page-content";

export const metadata: Metadata = {
  title: "Organizations",
};

export default function DashboardPage() {
  return <OrgPickerPageContent />;
}
