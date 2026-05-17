"use client";

import { useState } from "react";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { resolveAndHideModal } from "@/common/ui/nice-modal-helpers";
import { createContactAction } from "../data/contact-actions";
import type { AddContactResult } from "./add-contact-flow";

export const AddContactButtonModal = NiceModal.create(() => {
  const modal = useModal();
  const [kind, setKind] = useState<"person" | "company">("person");
  const [displayName, setDisplayName] = useState("");
  const [primaryEmail, setPrimaryEmail] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!displayName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createContactAction({
        kind,
        displayName: displayName.trim(),
        primaryEmail: primaryEmail.trim() || undefined,
        primaryPhone: primaryPhone.trim() || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      resolveAndHideModal<AddContactResult>(modal, result.data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Create a person or company contact for this organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="contact-kind">Kind</Label>
            <Select
              value={kind}
              onValueChange={(value) => setKind(value as "person" | "company")}
            >
              <SelectTrigger id="contact-kind" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder={kind === "person" ? "Jane Doe" : "Acme Inc"}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={primaryEmail}
              onChange={(event) => setPrimaryEmail(event.target.value)}
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={primaryPhone}
              onChange={(event) => setPrimaryPhone(event.target.value)}
              placeholder="(555) 123-4567"
            />
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
          <Button
            onClick={handleCreate}
            disabled={!displayName.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
