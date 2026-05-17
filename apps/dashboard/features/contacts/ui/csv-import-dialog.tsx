"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { previewCsvImportAction, commitCsvImportAction } from "../data/csv-actions";

type PreviewData = Extract<
  Awaited<ReturnType<typeof previewCsvImportAction>>,
  { success: true }
>["data"];

export function CsvImportDialog({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      startTransition(async () => {
        const result = await previewCsvImportAction(text);
        if (result.success) setPreview(result.data);
      });
    };
    reader.readAsText(file);
  }

  function handleCommit() {
    startTransition(async () => {
      const result = await commitCsvImportAction(csvText);
      if (result.success) {
        setOpen(false);
        setCsvText("");
        setPreview(null);
        onImported();
      }
    });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setCsvText("");
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input type="file" accept=".csv" ref={fileRef} onChange={handleFile} />

          {preview && (
            <div className="space-y-2 text-sm">
              <p className="text-green-600">
                {preview.valid.length} valid row(s) ready to import.
              </p>
              {preview.errors.length > 0 && (
                <div>
                  <p className="font-medium text-destructive">
                    Errors ({preview.errors.length}):
                  </p>
                  <ul className="list-disc pl-4 text-destructive">
                    {preview.errors.slice(0, 5).map((e: { row: number; field: string; message: string }, i: number) => (
                      <li key={i}>
                        Row {e.row}: {e.field} — {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {preview.duplicateWarnings.length > 0 && (
                <p className="text-yellow-600">
                  {preview.duplicateWarnings.length} duplicate email(s) detected.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!preview || preview.valid.length === 0 || isPending}
            onClick={handleCommit}
          >
            {isPending ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
