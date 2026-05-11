import type { Metadata } from "next";
import { ApiKeysPageContent } from "@/features/api-keys/ui/api-keys-page-content";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  return <ApiKeysPageContent />;
}
