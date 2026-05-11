import type { Metadata } from "next";
import { AiChatPageContent } from "@/features/ai-chat/ui/ai-chat-page-content";

export const metadata: Metadata = { title: "AI Assistant" };

export default function AiPage() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <AiChatPageContent />
    </div>
  );
}
