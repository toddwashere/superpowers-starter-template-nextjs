"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@workspace/auth/client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  "account:read": "Read your account identity and current organization context",
  offline_access: "Maintain access after your session ends (uses refresh tokens)",
};

export function ConsentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  const scopeParam = searchParams.get("scope") ?? "";
  const scopes = scopeParam ? scopeParam.split(" ").filter(Boolean) : [];

  const { data: orgsResult } = authClient.useListOrganizations();
  const organizations = orgsResult ?? [];
  const needsOrgSelection = organizations.length > 1;

  const handleConsent = async (accept: boolean) => {
    setLoading(accept ? "accept" : "deny");
    setError(null);
    try {
      if (accept && needsOrgSelection && selectedOrgId) {
        await authClient.organization.setActive({ organizationId: selectedOrgId });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (authClient as any).oauth2.consent({ accept });
      const data = result as { data?: { redirectURI?: string; redirect?: string } };
      const redirectTarget = data.data?.redirectURI ?? data.data?.redirect;
      if (redirectTarget) {
        router.push(redirectTarget);
      }
    } catch (err) {
      console.error("Consent error:", err);
      setError("Failed to process consent. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const acceptDisabled = loading !== null || (needsOrgSelection && !selectedOrgId);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authorize Application</CardTitle>
        <CardDescription>
          An application is requesting access to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">This application is requesting:</p>
            {scopes.length > 0 ? (
              <ul className="space-y-2">
                {scopes.map((scope) => (
                  <li key={scope} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-green-600" aria-hidden>
                      ✓
                    </span>
                    <span>{SCOPE_DESCRIPTIONS[scope] ?? scope}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific permissions requested.
              </p>
            )}
          </div>

          {needsOrgSelection && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Select which organization to grant access to:
              </p>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
              >
                <option value="">Choose an organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => void handleConsent(false)}
          disabled={loading !== null}
        >
          {loading === "deny" ? "Denying…" : "Deny"}
        </Button>
        <Button
          className="flex-1"
          onClick={() => void handleConsent(true)}
          disabled={acceptDisabled}
        >
          {loading === "accept" ? "Authorizing…" : "Authorize"}
        </Button>
      </CardFooter>
    </Card>
  );
}
