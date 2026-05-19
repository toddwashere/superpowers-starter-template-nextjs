"use client";

import { useEffect, useState, useCallback } from "react";
import NiceModal from "@ebay/nice-modal-react";
import { Button } from "@workspace/ui/components/button";
import { Page, PageBody } from "@workspace/ui/components/page";
import { toast } from "@workspace/ui/components/sonner";
import { PageHeaderInOrg } from "@/common/ui/page-header-in-org";
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

  const handleRevoke = useCallback(async (keyId: string) => {
    try {
      await revokeApiKeyAction(keyId);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to revoke API key.";
      toast.error(message);
    }
  }, [load]);

  const handleCreate = useCallback(async () => {
    try {
      const created = await NiceModal.show(ApiKeyCreateModal);
      if (created) await load();
    } catch {
      // ignore modal dismissal
    }
  }, [load]);

  return (
    <Page className="flex min-h-0 flex-1 flex-col">
      <PageHeaderInOrg
        title="API Keys"
        description="Manage keys for third-party integrations and AI agents."
        actions={<Button onClick={() => void handleCreate()}>Create Key</Button>}
      />
      <PageBody disableScroll className="space-y-6 p-6">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <ApiKeyTable keys={keys} onRevoke={(id) => void handleRevoke(id)} />
      )}
      </PageBody>
    </Page>
  );
}
