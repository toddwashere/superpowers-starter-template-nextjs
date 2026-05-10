"use client";

import NiceModal from "@ebay/nice-modal-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { DeleteAccountConfirmDialog } from "./delete-account-confirm-dialog";

export function DangerZoneSettings() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={() => NiceModal.show(DeleteAccountConfirmDialog)}
        >
          Delete my account
        </Button>
      </CardContent>
    </Card>
  );
}
