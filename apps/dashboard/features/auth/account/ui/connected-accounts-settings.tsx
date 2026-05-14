"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/data/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  IconForConnect,
  IconForDisconnect,
} from "@workspace/ui/components/icon-for";
import {
  hasOnlyOneAuthMethod,
  shouldShowConnectedAccounts,
} from "../lib/account-logic";
import { toast } from "@workspace/ui/components/sonner";

// Update this array when adding or removing OAuth providers in packages/auth/src/auth.ts
const CONFIGURED_PROVIDERS: { id: string; name: string }[] = [
  { id: "google", name: "Google" },
  { id: "microsoft", name: "Microsoft" },
];

export function ConnectedAccountsSettings() {
  const queryClient = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const result = await authClient.listAccounts();
      return result ?? [];
    },
  });

  if (!shouldShowConnectedAccounts(CONFIGURED_PROVIDERS)) {
    return null;
  }

  const canUnlink = !hasOnlyOneAuthMethod(accounts);

  const handleLink = (provider: string) => {
    authClient.linkSocial({
      provider: provider as "google" | "microsoft",
      callbackURL: "/account",
    });
  };

  const handleUnlink = async (providerId: string) => {
    try {
      await authClient.unlinkAccount({ providerId });
      toast.success("Account unlinked");
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unlink account");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Link or unlink OAuth sign-in providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <TooltipProvider>
          {CONFIGURED_PROVIDERS.map((provider) => {
            const linked = accounts.some((a) => a.providerId === provider.id);
            return (
              <div
                key={provider.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{provider.name}</span>
                {linked ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Connected
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* span wrapper required so Tooltip works on a disabled button */}
                        <span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnlink(provider.id)}
                            disabled={!canUnlink}
                          >
                            <IconForDisconnect className="mr-1" />
                            Unlink
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canUnlink && (
                        <TooltipContent>
                          You need at least one sign-in method.
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLink(provider.id)}
                  >
                    <IconForConnect className="mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
