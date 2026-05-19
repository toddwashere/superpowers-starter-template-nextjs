import {
  IconForDashboard,
  IconForSettings,
  IconForAi,
  IconForContacts,
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
      title: "Contacts",
      href: "/contacts",
      icon: IconForContacts,
    },
    {
      title: "AI Assistant",
      href: "/ai",
      icon: IconForAi,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: IconForSettings,
      items: [
        { title: "General", href: "/settings/general" },
        { title: "Members", href: "/settings/members" },
        { title: "Billing", href: "/settings/billing" },
        { title: "API Keys", href: "/settings/api-keys" },
        { title: "MCP", href: "/settings/mcp" },
      ],
    },
  ],
};
