"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { authClient } from "@/features/auth/data/auth-client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { isDeleteConfirmationValid } from "../lib/account-logic";
import { getPathForSignIn } from "@workspace/routes";

export const DeleteAccountConfirmDialog = NiceModal.create(() => {
  const modal = useModal();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canConfirm = isDeleteConfirmationValid(confirmText);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.deleteUser();
      if (result.error) {
        setIsLoading(false);
        return;
      }
      await authClient.signOut();
      router.push(getPathForSignIn());
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog
      open={modal.visible}
      onOpenChange={(open) => !open && modal.hide()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your account, remove you from all
            organizations, and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="confirm-delete">
            Type <strong>delete my account</strong> to confirm
          </Label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete my account"
          />
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={modal.hide}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
          >
            {isLoading ? "Deleting..." : "Delete my account"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
