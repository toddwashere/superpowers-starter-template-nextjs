"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Page, PageBody } from "@workspace/ui/components/page";
import { PageHeaderInOrg } from "@/common/ui/page-header-in-org";
import { ChatMessageItem } from "./chat-message";
import { callMcpToolAction } from "../data/ai-chat-actions";
import type { ChatMessage } from "../data/ai-chat-types";

export function AiChatPageContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const mcpResult = await callMcpToolAction("account-info", {});
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Here is your account info:",
        toolResults: [
          { toolName: "account-info", arguments: {}, result: mcpResult },
        ],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Failed to call MCP server. Check that it is running.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page className="flex min-h-0 flex-1 flex-col">
      <PageHeaderInOrg
        title="AI Assistant"
        description="Send messages and run MCP tools with your current organization session."
      />
      <PageBody disableScroll className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                Send a message to interact with AI tools.
              </p>
            )}
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
          </div>

          <div className="flex shrink-0 gap-2 border-t p-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              disabled={loading}
            />
            <Button
              onClick={() => void handleSend()}
              disabled={!input.trim() || loading}
            >
              {loading ? "…" : "Send"}
            </Button>
          </div>
        </div>
      </PageBody>
    </Page>
  );
}
