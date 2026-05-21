"use client";

import {
  IconForAdd,
  IconForBilling,
  IconForDashboard,
  IconForDevice,
  IconForExpand,
  IconForMembers,
  IconForMoon,
  IconForNotifications,
  IconForProfile,
  IconForSettings,
  IconForSignOut,
  IconForSun,
} from "@workspace/ui/components/icon-for";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Separator } from "@workspace/ui/components/separator";
import { useTheme } from "@workspace/ui/components/theme-provider";
import { ThemeToggle } from "@workspace/ui/components/theme-toggle";
import { NavMain } from "@/common/ui/nav-main";
import type { NavConfig } from "@/types/nav";

const mockNavConfig: NavConfig = {
  label: "Organization",
  items: [
    { title: "Dashboard", href: "#", icon: IconForDashboard },
    { title: "Analytics", href: "#", icon: IconForBilling },
    {
      title: "Users",
      href: "#",
      icon: IconForMembers,
      items: [
        { title: "Active", href: "#" },
        { title: "Invited", href: "#" },
      ],
    },
    {
      title: "Settings",
      href: "#",
      icon: IconForSettings,
      items: [
        { title: "General", href: "#" },
        { title: "Billing", href: "#" },
        { title: "Security", href: "#" },
      ],
    },
  ],
};

function MockOrgSwitcher() {
  const { isMobile } = useSidebar();
  const orgs = ["Acme Corp", "Globex Industries", "Initech"];
  const activeOrg = "Acme Corp";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex shrink-0 aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeOrg.slice(0, 1)}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeOrg}</span>
              </div>
              <IconForExpand className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {orgs.map((org) => (
              <DropdownMenuItem key={org} className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {org.slice(0, 1)}
                </div>
                <span className={org === activeOrg ? "font-semibold" : ""}>
                  {org}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <IconForAdd />
              </div>
              <span className="font-medium text-muted-foreground">
                Create Organization
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function MockNavUser() {
  const { isMobile } = useSidebar();
  const { setTheme } = useTheme();
  const displayName = "Jane Designer";
  const displayEmail = "jane@example.com";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src="" alt={displayName} />
                <AvatarFallback className="rounded-lg">JD</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {displayEmail}
                </span>
              </div>
              <IconForExpand className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {displayEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconForProfile />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconForNotifications />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setTheme("light")}>
                <IconForSun />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme("dark")}>
                <IconForMoon />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme("system")}>
                <IconForDevice />
                System
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IconForSignOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function MockAppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <MockOrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain config={mockNavConfig} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <MockNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function SectionSidebar() {
  return (
    <section>
      <h2 className="text-2xl font-bold">Sidebar</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A live interactive sidebar with mock data. Try collapsing, expanding
        sub-menus, switching orgs, and toggling themes.
      </p>
      <div className="relative mt-4 min-h-[600px] contain-layout overflow-hidden rounded-lg border">
        <SidebarProvider className="!min-h-full">
          <MockAppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <span className="text-sm text-muted-foreground">
                Sample page content area
              </span>
            </header>
            <div className="p-6">
              <p className="text-sm text-muted-foreground">
                This is a live preview of the sidebar component with mock data.
                Try collapsing it, expanding sub-menus, and switching themes.
              </p>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </section>
  );
}
