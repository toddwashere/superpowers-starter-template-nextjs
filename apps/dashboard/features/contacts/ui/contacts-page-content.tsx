"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { IconForAdd, IconForMore } from "@workspace/ui/components/icon-for";
import { listContactsAction, archiveContactAction } from "../data/contact-actions";
import { exportContactsCsvAction } from "../data/csv-actions";
import { CsvImportDialog } from "./csv-import-dialog";

type Contact = NonNullable<
  Extract<Awaited<ReturnType<typeof listContactsAction>>, { success: true }>["data"]
>[number];

export function ContactsPageContent({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  function load(q: string) {
    startTransition(async () => {
      const result = await listContactsAction({ search: q || undefined });
      if (result.success) setContacts(result.data);
    });
  }

  useEffect(() => {
    load("");
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    load(e.target.value);
  }

  async function handleArchive(id: string) {
    await archiveContactAction(id);
    load(search);
  }

  async function handleExport() {
    const result = await exportContactsCsvAction();
    if (!result.success) return;
    const blob = new Blob([result.data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <div className="flex gap-2">
          <CsvImportDialog onImported={() => load(search)} />
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
          <Button onClick={() => router.push(`/${orgSlug}/contacts/new`)}>
            <IconForAdd className="mr-2" />
            New Contact
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search contacts…"
        value={search}
        onChange={handleSearchChange}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Loading…
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No contacts yet.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/${orgSlug}/contacts/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.displayName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.kind}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.primaryEmail ?? "—"}
                  </TableCell>
                  <TableCell>
                    {c.stage ? (
                      <Badge
                        style={{ backgroundColor: c.stage.color ?? undefined }}
                        className="text-white"
                      >
                        {c.stage.name}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <IconForMore />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/${orgSlug}/contacts/${c.id}`)}
                        >
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleArchive(c.id)}
                        >
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
