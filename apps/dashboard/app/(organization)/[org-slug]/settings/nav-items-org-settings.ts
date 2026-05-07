import { Settings, CreditCard, Users, Shield } from "lucide-react";
import type { NavConfig } from "@/types/nav";

export const orgSettingsNavConfig: NavConfig = {
  label: "Settings",
  items: [
    {
      title: "General",
      href: "/settings/general",
      icon: Settings,
    },
    {
      title: "Members",
      href: "/settings/members",
      icon: Users,
    },
    {
      title: "Billing",
      href: "/settings/billing",
      icon: CreditCard,
    },
    {
      title: "Security",
      href: "/settings/security",
      icon: Shield,
    },
  ],
};
