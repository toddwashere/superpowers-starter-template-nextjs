"use client";

import {
  IconForDashboard,
  IconForOrganization,
  IconForSettings,
  IconForMembers,
  IconForSecurity,
  IconForBilling,
  IconForProfile,
  IconForNotifications,
  IconForSignOut,
  IconForExpand,
  IconForAdd,
  IconForInvite,
  IconForRemove,
  IconForMore,
  IconForClose,
  IconForChevronRight,
} from "@workspace/ui/components/icon-for";

const icons = [
  { component: IconForDashboard, name: "IconForDashboard", lucide: "LayoutDashboard" },
  { component: IconForOrganization, name: "IconForOrganization", lucide: "Building2" },
  { component: IconForSettings, name: "IconForSettings", lucide: "Settings" },
  { component: IconForMembers, name: "IconForMembers", lucide: "Users" },
  { component: IconForSecurity, name: "IconForSecurity", lucide: "Shield" },
  { component: IconForBilling, name: "IconForBilling", lucide: "CreditCard" },
  { component: IconForProfile, name: "IconForProfile", lucide: "BadgeCheck" },
  { component: IconForNotifications, name: "IconForNotifications", lucide: "Bell" },
  { component: IconForSignOut, name: "IconForSignOut", lucide: "LogOut" },
  { component: IconForExpand, name: "IconForExpand", lucide: "ChevronsUpDown" },
  { component: IconForAdd, name: "IconForAdd", lucide: "Plus" },
  { component: IconForInvite, name: "IconForInvite", lucide: "UserPlus" },
  { component: IconForRemove, name: "IconForRemove", lucide: "UserMinus" },
  { component: IconForMore, name: "IconForMore", lucide: "MoreHorizontal" },
  { component: IconForClose, name: "IconForClose", lucide: "X" },
  { component: IconForChevronRight, name: "IconForChevronRight", lucide: "ChevronRight" },
] as const;

export function SectionIcons() {
  return (
    <section>
      <h2 className="text-2xl font-bold">Icons</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {icons.map(({ component: Icon, name, lucide }) => (
          <div
            key={name}
            className="flex flex-col items-center gap-2 rounded-lg border p-4"
          >
            <Icon className="size-6" />
            <span className="text-xs font-mono">{name}</span>
            <span className="text-xs text-muted-foreground">{lucide}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
