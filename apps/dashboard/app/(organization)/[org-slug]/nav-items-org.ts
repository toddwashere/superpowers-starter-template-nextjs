import {
  IconForDashboard,
  IconForMembers,
  IconForSettings,
} from "@workspace/ui/components/icon-for";
import type { NavConfig } from "@/types/nav";

export const orgNavConfig: NavConfig = {
  label: "Organization",
  items: [
    {
      title: "Dashboard",
      href: "/",
      icon: IconForDashboard,
    },
    {
      title: "Members",
      href: "/members",
      icon: IconForMembers,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: IconForSettings,
      items: [
        { title: "General", href: "/settings/general" },
        { title: "Billing", href: "/settings/billing" },
      ],
    },
  ],
};
