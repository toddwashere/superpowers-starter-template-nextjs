"use client";

import { useEffect, useState, useCallback } from "react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "@workspace/ui/components/button";
import { ApiKeyTable } from "./api-key-table";
import { ApiKeyCreateModal } from "./api-key-create-modal";
import { listOrgApiKeysAction, revokeApiKeyAction } from "../data/api-key-actions";
import type { ApiKeyRecord } from "../data/api-key-types";

export function ApiKeysPageContent() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listOrgApiKeysAction();
      const raw = result as unknown as { apiKeys?: ApiKeyRecord[] } | ApiKeyRecord[] | null;
      const list = Array.isArray(raw) ? raw : ((raw as { apiKeys?: ApiKeyRecord[] })?.apiKeys ?? []);
      setKeys(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRevoke(keyId: string) {
    await revokeApiKeyAction(keyId);
    await load();
  }

  async function handleCreate() {
    const created = await NiceModal.show(ApiKeyCreateModal);
    if (created) await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage keys for third-party integrations and AI agents.
          </p>
        </div>
        <Button onClick={() => void handleCreate()}>Create Key</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ApiKeyTable keys={keys} onRevoke={(id) => void handleRevoke(id)} />
      )}
    </div>
  );
}
