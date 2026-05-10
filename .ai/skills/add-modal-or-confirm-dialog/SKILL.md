---
name: add-modal-or-confirm-dialog
description: >-
  Conventions for adding modals, confirm dialogs, and overlay UI using
  NiceModal. Use when adding a modal, dialog, confirm dialog, alert dialog,
  drawer, or any overlay triggered by a user action.
---

# Add Modal or Confirm Dialog

## Purpose

Use this skill when adding any modal, confirm dialog, alert dialog, or overlay to the dashboard app. The project uses NiceModal (`@ebay/nice-modal-react`) to eliminate `useState` open/close boilerplate and ensure a single instance of each modal type per page.

## Core Rules

- Use NiceModal (`@ebay/nice-modal-react`) for **all** modals and related overlays.
- Name the component file `{action}-{model}-button-modal.tsx`.
  - Examples: `add-contact-button-modal.tsx`, `delete-user-confirm-dialog.tsx`
- **Always** open a modal via JavaScript (`NiceModal.show(MyModal, { props })`). Never use `DialogTrigger` or other declarative open mechanisms.
- If multiple buttons on the same page can trigger the same modal, there must be only **one** instance of that modal component rendered in the tree — NiceModal handles the rest.

## Component Pattern

```tsx
// apps/dashboard/features/<domain>/ui/delete-user-confirm-dialog.tsx
"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
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

interface DeleteUserConfirmDialogProps {
  userId: string;
  userName: string;
}

export const DeleteUserConfirmDialog = NiceModal.create(
  ({ userId, userName }: DeleteUserConfirmDialogProps) => {
    const modal = useModal();

    async function handleConfirm() {
      // perform the action
      modal.resolve(true);
      modal.hide();
    }

    return (
      <AlertDialog open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={modal.hide}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);
```

For non-destructive modals use shadcn `Dialog` instead of `AlertDialog`:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";

export const AddContactButtonModal = NiceModal.create(
  ({ orgId }: { orgId: string }) => {
    const modal = useModal();
    return (
      <Dialog open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          {/* form content */}
        </DialogContent>
      </Dialog>
    );
  }
);
```

## Summoning Pattern

Open a modal from a button — no `useState` required:

```tsx
"use client";

import NiceModal from "@ebay/nice-modal-react";
import { DeleteUserConfirmDialog } from "@/features/users/ui/delete-user-confirm-dialog";

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  return (
    <button
      onClick={() => NiceModal.show(DeleteUserConfirmDialog, { userId, userName })}
    >
      Delete
    </button>
  );
}
```

`NiceModal.show()` returns a Promise that resolves with whatever `modal.resolve()` was called with.

## File Location

Modal components live inside the feature that owns them:

```
apps/dashboard/features/<domain>/ui/{action}-{model}-button-modal.tsx
```

Examples:
```
apps/dashboard/features/members/ui/invite-member-button-modal.tsx
apps/dashboard/features/members/ui/remove-member-confirm-dialog.tsx
apps/dashboard/features/contacts/ui/add-contact-button-modal.tsx
```

## Migration Guidance

Existing dialogs (`invite-member-dialog.tsx`, `remove-member-dialog.tsx`, `update-member-role-dialog.tsx`) should be migrated to NiceModal **when touched**, not proactively refactored.

## Checklist

- [ ] Component uses `NiceModal.create()` wrapper
- [ ] Uses `useModal()` hook internally for `visible`, `hide`, and `resolve`
- [ ] File named `{action}-{model}-button-modal.tsx`
- [ ] Opened via `NiceModal.show(Modal, { props })` from JavaScript
- [ ] Only one instance of a given modal type per page
- [ ] No `DialogTrigger` or other declarative open patterns
- [ ] Located in the owning feature's `ui/` directory
- [ ] Uses shadcn `Dialog` (non-destructive) or `AlertDialog` (destructive)
