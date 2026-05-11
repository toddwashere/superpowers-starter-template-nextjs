"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import type { ApiKeyRecord } from "../data/api-key-types";

type Props = {
  keys: ApiKeyRecord[];
  onRevoke: (keyId: string) => void;
};

export function ApiKeyTable({ keys, onRevoke }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Prefix</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last Used</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((k) => (
          <TableRow key={k.id}>
            <TableCell>{k.name ?? "—"}</TableCell>
            <TableCell>
              <code className="text-xs">{k.prefix ?? "—"}…</code>
            </TableCell>
            <TableCell>
              <Badge variant={k.enabled ? "default" : "secondary"}>
                {k.enabled ? "Active" : "Disabled"}
              </Badge>
            </TableCell>
            <TableCell>
              {k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "—"}
            </TableCell>
            <TableCell>
              {k.lastRequest ? new Date(k.lastRequest).toLocaleDateString() : "Never"}
            </TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRevoke(k.id)}
              >
                Revoke
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {keys.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
              No API keys yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
