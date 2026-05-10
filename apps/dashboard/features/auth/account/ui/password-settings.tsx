"use client";

import NiceModal from "@ebay/nice-modal-react";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/features/auth/data/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { IconForPassword } from "@workspace/ui/components/icon-for";
import { hasCredentialAccount } from "../lib/account-logic";
import { ChangePasswordButtonModal } from "./change-password-button-modal";

export function PasswordSettings() {
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const result = await authClient.listAccounts();
      return result.data ?? [];
    },
  });

  const isCredentialUser = hasCredentialAccount(accounts);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconForPassword />
          Password
        </CardTitle>
        <CardDescription>Manage your password.</CardDescription>
      </CardHeader>
      <CardContent>
        {isCredentialUser ? (
          <Button
            variant="outline"
            onClick={() => NiceModal.show(ChangePasswordButtonModal)}
          >
            Change password
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            You signed in with a social account. No password is set.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
