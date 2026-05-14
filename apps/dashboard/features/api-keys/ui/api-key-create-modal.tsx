"use client";

import { useState } from "react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { toast } from "@workspace/ui/components/sonner";
import { publicApiPermissions } from "@workspace/auth/api-keys/permissions";
import { createOrgApiKeyAction, createPersonalApiKeyAction } from "../data/api-key-actions";

export const ApiKeyCreateModal = NiceModal.create(({ personalMode = false }: { personalMode?: boolean }) => {
  const modal = useModal();
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resources = Object.keys(publicApiPermissions) as Array<
    keyof typeof publicApiPermissions
  >;

  function toggleAction(resource: string, action: string) {
    setPermissions((prev) => {
      const current = prev[resource] ?? [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      if (updated.length === 0) {
        const { [resource]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [resource]: updated };
    });
  }

  async function handleCreate() {
    setLoading(true);
    setError(null);
    try {
      const result = personalMode
        ? await createPersonalApiKeyAction({ name, permissions, expiresIn: null })
        : await createOrgApiKeyAction({ name, configId: "org-keys", permissions, expiresIn: null });
      const key = (result as { key?: string; error?: string }).key;
      const resultError = (result as { key?: string; error?: string }).error;
      if (resultError) {
        setError(resultError);
        toast.error(resultError);
        return;
      }
      if (!key) {
        setError("Failed to create API key. Please try again.");
        toast.error("Failed to create API key. Please try again.");
        return;
      }
      setCreatedKey(key);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create API key.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{personalMode ? "Create Personal API Key" : "Create API Key"}</DialogTitle>
          <DialogDescription>
            {personalMode
              ? "Personal keys are tied to your user account."
              : "API keys grant programmatic access to your organization."}
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Copy this key now — it won&apos;t be shown again.
              </AlertDescription>
            </Alert>
            <code className="block bg-muted p-3 rounded text-sm break-all">
              {createdKey}
            </code>
            <Button className="w-full" onClick={() => navigator.clipboard.writeText(createdKey)}>
              Copy Key
            </Button>
            <Button variant="outline" className="w-full" onClick={() => modal.resolve(true)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="key-name">Name</Label>
                <Input
                  id="key-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Integration"
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                {resources.map((resource) => {
                  const actions = publicApiPermissions[resource] as readonly string[];
                  return (
                    <div key={resource} className="space-y-1">
                      <p className="text-sm font-medium capitalize">{resource}</p>
                      <div className="flex gap-3">
                        {actions.map((action) => (
                          <label key={action} className="flex items-center gap-1.5 text-sm">
                            <Checkbox
                              checked={(permissions[resource] ?? []).includes(action)}
                              onCheckedChange={() => toggleAction(resource, action)}
                            />
                            {action}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => modal.hide()}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!name || loading}>
                {loading ? "Creating…" : "Create Key"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});
