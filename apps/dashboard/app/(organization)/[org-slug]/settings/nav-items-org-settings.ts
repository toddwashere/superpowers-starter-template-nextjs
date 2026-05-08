import {
  IconForSettings,
  IconForMembers,
  IconForBilling,
  IconForSecurity,
} from "@workspace/ui/components/icon-for";
import type { NavConfig } from "@/types/nav";

export const orgSettingsNavConfig: NavConfig = {
  label: "Settings",
  items: [
    {
      title: "General",
      href: "/settings/general",
      icon: IconForSettings,
    },
    {
      title: "Members",
      href: "/settings/members",
      icon: IconForMembers,
    },
    {
      title: "Billing",
      href: "/settings/billing",
      icon: IconForBilling,
    },
    {
      title: "Security",
      href: "/settings/security",
      icon: IconForSecurity,
    },
  ],
};
