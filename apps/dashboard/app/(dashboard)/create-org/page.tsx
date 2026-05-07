import type { Metadata } from "next";
import { CreateOrgPageContent } from "@/features/organization/ui/create-org-page-content";

export const metadata: Metadata = { title: "Create Organization" };

export default function CreateOrgPage() {
  return <CreateOrgPageContent />;
}
