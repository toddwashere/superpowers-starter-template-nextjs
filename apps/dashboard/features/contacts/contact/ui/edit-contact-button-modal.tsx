"use client";

import { useEffect, useState, useTransition } from "react";
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
import { updateContactAction } from "../data/contact-actions";
import type { UpdateContactInput } from "@workspace/contacts/schemas/contact-schemas";
import {
  contactFormStateToInput,
  contactToContactFormState,
  type ContactFormState,
} from "./contact-form-state";
import { listContactStagesAction } from "../../contact-stage/data/contact-stage-actions";
import { ContactStageField } from "../../contact-stage/ui/contact-stage-field";

type EditableContact = {
  id: string;
  kind: string;
  displayName: string;
  primaryEmail?: string | null;
  primaryPhone?: string | null;
  website?: string | null;
  source?: string | null;
  stageId?: string | null;
};

export const EditContactButtonModal = NiceModal.create(
  ({ contact }: { contact: EditableContact }) => {
    const modal = useModal();
    const [form, setForm] = useState<ContactFormState>(() =>
      contactToContactFormState(contact),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stages, setStages] = useState<{ id: string; name: string }[]>([]);
    const [, startStagesTransition] = useTransition();

    function resetForm() {
      setForm(contactToContactFormState(contact));
      setError(null);
      setIsSubmitting(false);
    }

    useEffect(() => {
      if (!modal.visible) return;
      setForm(contactToContactFormState(contact));
      setError(null);
      setIsSubmitting(false);
      startStagesTransition(async () => {
        const result = await listContactStagesAction();
        if (result.success) setStages(result.data);
      });
    }, [modal.visible, contact]);

    async function handleUpdate() {
      if (!form.displayName.trim() || isSubmitting) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await updateContactAction(
          contact.id,
          contactFormStateToInput(form) as UpdateContactInput,
        );
        if (!result.success) {
          setError(result.error);
          return;
        }
        resolveAndHideModal(modal, true);
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
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update this contact&apos;s basic details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-contact-kind">Kind</Label>
              <Select
                value={form.kind}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    kind: value as "person" | "company",
                  }))
                }
              >
                <SelectTrigger id="edit-contact-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="person">Person</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-contact-name">Name</Label>
              <Input
                id="edit-contact-name"
                value={form.displayName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    displayName: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-contact-email">Email</Label>
              <Input
                id="edit-contact-email"
                type="email"
                value={form.primaryEmail}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    primaryEmail: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-contact-phone">Phone</Label>
              <Input
                id="edit-contact-phone"
                value={form.primaryPhone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    primaryPhone: event.target.value,
                  }))
                }
              />
            </div>

            <ContactStageField
              id="edit-contact-stage"
              value={form.stageId}
              stages={stages}
              onChange={(stageId) =>
                setForm((current) => ({ ...current, stageId }))
              }
            />
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
              onClick={handleUpdate}
              disabled={!form.displayName.trim() || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
