import { LayoutDashboard, Users, Settings } from "lucide-react";
import type { NavConfig } from "@/types/nav";

export const orgNavConfig: NavConfig = {
  label: "Organization",
  items: [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Members",
      href: "/members",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      items: [
        { title: "General", href: "/settings/general" },
        { title: "Billing", href: "/settings/billing" },
      ],
    },
  ],
};
