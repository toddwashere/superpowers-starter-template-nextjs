"use client";

import NiceModal from "@ebay/nice-modal-react";
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
  IconForEmail,
  IconForVerified,
  IconForWarning,
} from "@workspace/ui/components/icon-for";
import { ChangeEmailButtonModal } from "./change-email-button-modal";

export function EmailSettings() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconForEmail />
          Email
        </CardTitle>
        <CardDescription>Manage your email address.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">{user?.email}</span>
          {user?.emailVerified ? (
            <IconForVerified
              className="text-green-500"
              aria-label="Email verified"
            />
          ) : (
            <IconForWarning
              className="text-amber-500"
              aria-label="Email not verified"
            />
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => NiceModal.show(ChangeEmailButtonModal)}
        >
          Change email
        </Button>
      </CardContent>
    </Card>
  );
}
