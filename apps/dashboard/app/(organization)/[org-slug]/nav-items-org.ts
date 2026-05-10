import {
  IconForDashboard,
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
      title: "Settings",
      href: "/settings",
      icon: IconForSettings,
      items: [
        { title: "General", href: "/settings/general" },
        { title: "Members", href: "/settings/members" },
        { title: "Billing", href: "/settings/billing" },
      ],
    },
  ],
};
