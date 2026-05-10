"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/features/auth/data/auth-client";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { IconForDevice } from "@workspace/ui/components/icon-for";
import { isCurrentSession } from "../lib/account-logic";
import { parseUserAgent } from "../lib/parse-user-agent";
import { toast } from "@workspace/ui/components/sonner";

export function SessionsSettings() {
  const queryClient = useQueryClient();
  const { data: sessionData } = authClient.useSession();
  const currentToken = sessionData?.session?.token ?? "";

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const result = await authClient.listSessions();
      return result.data ?? [];
    },
  });

  const handleRevoke = async (token: string) => {
    const result = await authClient.revokeSession({ token });
    if (result.error) {
      toast.error(result.error.message ?? "Failed to revoke session");
      return;
    }
    toast.success("Session revoked");
    await queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  const handleRevokeAll = async () => {
    const result = await authClient.revokeSessions();
    if (result.error) {
      toast.error(result.error.message ?? "Failed to revoke sessions");
      return;
    }
    toast.success("All other sessions revoked");
    await queryClient.invalidateQueries({ queryKey: ["sessions"] });
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (isCurrentSession(a.token, currentToken)) return -1;
    if (isCurrentSession(b.token, currentToken)) return 1;
    return 0;
  });

  const otherSessionCount = sessions.filter(
    (s) => !isCurrentSession(s.token, currentToken)
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconForDevice />
          Active Sessions
        </CardTitle>
        <CardDescription>View and revoke active sign-in sessions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedSessions.map((s) => {
          const isCurrent = isCurrentSession(s.token, currentToken);
          return (
            <div
              key={s.token}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {parseUserAgent(s.userAgent ?? "")}
                  </span>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs">
                      This device
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {s.ipAddress} · {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
              {isCurrent ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => authClient.signOut()}
                >
                  Sign out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(s.token)}
                >
                  Revoke
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
      {otherSessionCount > 0 && (
        <CardFooter>
          <Button variant="outline" onClick={handleRevokeAll}>
            Revoke all other sessions
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
