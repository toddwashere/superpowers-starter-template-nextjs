"use client";

import { useEffect, useState, useCallback } from "react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "@workspace/ui/components/button";
import { toast } from "@workspace/ui/components/sonner";
import { ApiKeyTable } from "./api-key-table";
import { ApiKeyCreateModal } from "./api-key-create-modal";
import { listPersonalApiKeysAction, revokePersonalApiKeyAction } from "../data/api-key-actions";
import type { ApiKeyRecord } from "../data/api-key-types";

export function PersonalApiKeysSection() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPersonalApiKeysAction();
      const raw = result as unknown as { apiKeys?: ApiKeyRecord[] } | ApiKeyRecord[] | null;
      const list = Array.isArray(raw) ? raw : ((raw as { apiKeys?: ApiKeyRecord[] })?.apiKeys ?? []);
      setKeys(list);
    } catch {
      toast.error("Failed to load personal API keys.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRevoke = useCallback(async (keyId: string) => {
    try {
      await revokePersonalApiKeyAction(keyId);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke key.");
    }
  }, [load]);

  const handleCreate = useCallback(async () => {
    try {
      const created = await NiceModal.show(ApiKeyCreateModal);
      if (created) await load();
    } catch {
      // modal dismissed
    }
  }, [load]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Personal API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Keys tied to your user account.
          </p>
        </div>
        <Button size="sm" onClick={() => void handleCreate()}>
          Create Personal Key
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ApiKeyTable keys={keys} onRevoke={(id) => void handleRevoke(id)} />
      )}
    </section>
  );
}
