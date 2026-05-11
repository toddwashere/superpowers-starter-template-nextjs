"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import type { ToolResult } from "../data/ai-chat-types";

export function ToolResultCard({ result }: { result: ToolResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded p-3 space-y-2 bg-muted/30 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold">{result.toolName}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Collapse" : "Expand"}
        </Button>
      </div>
      {expanded && (
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(result.result, null, 2)}
        </pre>
      )}
    </div>
  );
}
