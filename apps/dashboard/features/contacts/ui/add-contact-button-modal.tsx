"use client";

import { useEffect, useState } from "react";
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
import type { CreateContactInput } from "@workspace/contacts";
import type { AddContactResult } from "./add-contact-flow";
import {
  contactFormStateToInput,
  createEmptyContactFormState,
  type ContactFormState,
} from "./contact-form-state";

export const AddContactButtonModal = NiceModal.create(() => {
  const modal = useModal();
  const [form, setForm] = useState<ContactFormState>(() =>
    createEmptyContactFormState(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setForm(createEmptyContactFormState());
    setError(null);
    setIsSubmitting(false);
  }

  useEffect(() => {
    if (modal.visible) resetForm();
  }, [modal.visible]);

  async function handleCreate() {
    if (!form.displayName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createContactAction(
        contactFormStateToInput(form) as CreateContactInput,
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      resetForm();
      resolveAndHideModal<AddContactResult>(modal, result.data);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={modal.visible}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          modal.hide();
        }
      }}
    >
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
              value={form.kind}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  kind: value as "person" | "company",
                }))
              }
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
              value={form.displayName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
              placeholder={form.kind === "person" ? "Jane Doe" : "Acme Inc"}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={form.primaryEmail}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  primaryEmail: event.target.value,
                }))
              }
              placeholder="jane@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={form.primaryPhone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  primaryPhone: event.target.value,
                }))
              }
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
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              modal.hide();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!form.displayName.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
