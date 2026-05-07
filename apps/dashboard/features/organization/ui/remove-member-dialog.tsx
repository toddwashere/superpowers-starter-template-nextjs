"use client";

import { useState } from "react";
import { authClient } from "@workspace/auth/client";
import { Button } from "@workspace/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  organizationId: string;
  orgSlug: string;
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
  organizationId,
  orgSlug,
}: RemoveMemberDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const queryClient = useQueryClient();

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await authClient.organization.removeMember({
        memberId,
        organizationId,
      });
      await queryClient.invalidateQueries({
        queryKey: ["members", orgSlug],
      });
      onOpenChange(false);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-medium">{memberName}</span> from this
            organization? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove Member"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
