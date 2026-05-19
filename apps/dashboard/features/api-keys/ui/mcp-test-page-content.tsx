"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import { Page, PageBody } from "@workspace/ui/components/page";
import { Textarea } from "@workspace/ui/components/textarea";
import { PageHeaderInOrg } from "@/common/ui/page-header-in-org";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { listOrgApiKeysAction, callMcpToolAsSessionAction } from "../data/api-key-actions";
import type { ApiKeyRecord } from "../data/api-key-types";

const TOOLS = [
  { name: "account-info", description: "Returns the authenticated identity" },
];

export function McpTestPageContent() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState(TOOLS[0]!.name);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await listOrgApiKeysAction();
      const raw = result as unknown as { apiKeys?: ApiKeyRecord[] } | ApiKeyRecord[] | null;
      const list = Array.isArray(raw) ? raw : ((raw as { apiKeys?: ApiKeyRecord[] })?.apiKeys ?? []);
      setKeys(list);
    } catch {
      // silently ignore load failure
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRun() {
    setLoading(true);
    try {
      const json = await callMcpToolAsSessionAction(selectedTool, {});
      setResponse(JSON.stringify(json, null, 2));
    } catch (err) {
      setResponse(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page className="flex min-h-0 flex-1 flex-col">
      <PageHeaderInOrg
        title="MCP Test Panel"
        description="Test MCP tools using your current session. Select a key to see its context (calls authenticate as you, not as the key)."
      />
      <PageBody disableScroll className="space-y-6 p-6">
      <div className="max-w-md space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">API Key (context only)</label>
          <Select value={selectedKeyId} onValueChange={setSelectedKeyId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a key to view" />
            </SelectTrigger>
            <SelectContent>
              {keys.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.name ?? k.prefix ?? k.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Tool</label>
          <Select value={selectedTool} onValueChange={setSelectedTool}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOOLS.map((t) => (
                <SelectItem key={t.name} value={t.name}>
                  {t.name} — {t.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => void handleRun()} disabled={loading}>
          {loading ? "Running…" : "Run Tool"}
        </Button>
      </div>

      {response && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Response</p>
          <Textarea
            readOnly
            value={response}
            rows={12}
            className="font-mono text-xs"
          />
        </div>
      )}
      </PageBody>
    </Page>
  );
}
