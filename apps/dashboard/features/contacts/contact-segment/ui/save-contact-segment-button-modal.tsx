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
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { resolveAndHideModal } from "@/common/ui/nice-modal-helpers";
import type { ContactListFilters } from "@workspace/contacts/schemas/contact-schemas";
import { createContactSegmentAction } from "../data/contact-segment-actions";
import { buildCreateSegmentInput } from "../data/contact-segment-filters";

export const SaveContactSegmentButtonModal = NiceModal.create(
  ({ filters }: { filters: Partial<ContactListFilters> }) => {
    const modal = useModal();
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
      if (!name.trim() || isSubmitting) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await createContactSegmentAction(
          buildCreateSegmentInput(name, filters),
        );
        if (!result.success) {
          setError(result.error);
          return;
        }
        resolveAndHideModal(modal, result.data);
      } finally {
        setIsSubmitting(false);
      }
    }

    return (
      <Dialog
        open={modal.visible}
        onOpenChange={(open) => {
          if (!open) modal.hide();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Segment</DialogTitle>
            <DialogDescription>
              Save the current filters as a reusable segment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="segment-name">Segment name</Label>
            <Input
              id="segment-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Active customers"
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
              onClick={() => void handleSave()}
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save Segment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
