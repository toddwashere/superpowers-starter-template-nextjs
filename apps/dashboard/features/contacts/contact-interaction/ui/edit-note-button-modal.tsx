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
import { Textarea } from "@workspace/ui/components/textarea";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { resolveAndHideModal } from "@/common/ui/nice-modal-helpers";
import { updateContactInteractionAction } from "../data/contact-interaction-actions";

export const EditNoteButtonModal = NiceModal.create(
  ({ interactionId, body }: { interactionId: string; body: string }) => {
    const modal = useModal();
    const [noteBody, setNoteBody] = useState(body);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function resetForm() {
      setNoteBody(body);
      setError(null);
      setIsSubmitting(false);
    }

    useEffect(() => {
      if (!modal.visible) return;
      setNoteBody(body);
      setError(null);
      setIsSubmitting(false);
    }, [modal.visible, body]);

    async function handleSave() {
      if (!noteBody.trim() || isSubmitting) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await updateContactInteractionAction(interactionId, {
          body: noteBody.trim(),
        });
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
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Update this contact note.</DialogDescription>
          </DialogHeader>

          <Textarea
            value={noteBody}
            onChange={(event) => setNoteBody(event.target.value)}
            rows={5}
          />

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
              onClick={handleSave}
              disabled={!noteBody.trim() || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
