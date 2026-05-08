import {
  IconForDashboard,
  IconForOrganization,
  IconForSettings,
} from "@workspace/ui/components/icon-for";
import type { NavConfig } from "@/types/nav";

export const rootNavConfig: NavConfig = {
  label: "Platform",
  items: [
    {
      title: "Dashboard",
      href: "/",
      icon: IconForDashboard,
    },
    {
      title: "Organizations",
      href: "/organizations",
      icon: IconForOrganization,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: IconForSettings,
    },
  ],
};
