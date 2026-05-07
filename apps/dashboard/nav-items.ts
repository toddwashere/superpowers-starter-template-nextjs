import { LayoutDashboard, Building2, Settings } from "lucide-react";
import type { NavConfig } from "@/types/nav";

export const rootNavConfig: NavConfig = {
  label: "Platform",
  items: [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Organizations",
      href: "/organizations",
      icon: Building2,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ],
};
