"use client";

import { useState } from "react";
import { authClient } from "@workspace/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { MoreHorizontal, Shield, UserMinus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useCurrentOrg } from "./org-provider";
import { InviteMemberDialog } from "./invite-member-dialog";
import { PendingInvitations } from "./pending-invitations";
import { UpdateMemberRoleDialog } from "./update-member-role-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  owner: "default",
  admin: "secondary",
  member: "outline",
};

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MembersPageContent({ orgSlug }: { orgSlug: string }) {
  const { organization, members, invitations, isLoading } = useCurrentOrg();
  const { data: session } = authClient.useSession();

  const [roleDialog, setRoleDialog] = useState<{
    open: boolean;
    memberId: string;
    memberName: string;
    currentRole: string;
  }>({ open: false, memberId: "", memberName: "", currentRole: "" });

  const [removeDialog, setRemoveDialog] = useState<{
    open: boolean;
    memberId: string;
    memberName: string;
  }>({ open: false, memberId: "", memberName: "" });

  if (isLoading || !organization) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const currentMember = members.find(
    (m) => m.userId === session?.user?.id,
  );
  const currentUserRole = currentMember?.role ?? "member";
  const canManageMembers =
    currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">
            Manage your organization's team members.
          </p>
        </div>
        {canManageMembers && (
          <InviteMemberDialog
            organizationId={organization.id}
            orgSlug={orgSlug}
          />
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {canManageMembers && (
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const isCurrentUser = member.userId === session?.user?.id;
              const isOwner = member.role === "owner";

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={member.user.image ?? undefined}
                          alt={member.user.name ?? ""}
                        />
                        <AvatarFallback>
                          {getInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.user.name}
                          {isCurrentUser && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant[member.role] ?? "outline"}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                  {canManageMembers && (
                    <TableCell>
                      {!isCurrentUser && !isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() =>
                                setRoleDialog({
                                  open: true,
                                  memberId: member.id,
                                  memberName: member.user.name ?? "Member",
                                  currentRole: member.role,
                                })
                              }
                            >
                              <Shield className="mr-2 size-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() =>
                                setRemoveDialog({
                                  open: true,
                                  memberId: member.id,
                                  memberName: member.user.name ?? "Member",
                                })
                              }
                            >
                              <UserMinus className="mr-2 size-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {canManageMembers && (
        <PendingInvitations
          invitations={invitations}
          orgSlug={orgSlug}
          canManageInvitations={canManageMembers}
        />
      )}

      <UpdateMemberRoleDialog
        open={roleDialog.open}
        onOpenChange={(open) =>
          setRoleDialog((prev) => ({ ...prev, open }))
        }
        memberId={roleDialog.memberId}
        memberName={roleDialog.memberName}
        currentRole={roleDialog.currentRole}
        organizationId={organization.id}
        orgSlug={orgSlug}
      />

      <RemoveMemberDialog
        open={removeDialog.open}
        onOpenChange={(open) =>
          setRemoveDialog((prev) => ({ ...prev, open }))
        }
        memberId={removeDialog.memberId}
        memberName={removeDialog.memberName}
        organizationId={organization.id}
        orgSlug={orgSlug}
      />
    </div>
  );
}
