import { ToolResultCard } from "./tool-result-card";
import type { ChatMessage } from "../data/ai-chat-types";

export function ChatMessageItem({ message }: { message: ChatMessage }) {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] space-y-2 ${message.role === "user" ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          {message.content}
        </div>
        {message.toolResults?.map((tr, i) => (
          <ToolResultCard key={i} result={tr} />
        ))}
      </div>
    </div>
  );
}
