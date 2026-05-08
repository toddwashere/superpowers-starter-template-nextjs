"use client"

import { forwardRef } from "react"
import type { LucideProps } from "lucide-react"
import {
  BadgeCheck,
  Bell,
  Bold,
  Building2,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  Italic,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  Shield,
  Underline,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import { cn } from "#lib/utils"

export const IconForDashboard = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <LayoutDashboard ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForDashboard.displayName = "IconForDashboard";

export const IconForOrganization = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Building2 ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForOrganization.displayName = "IconForOrganization";

export const IconForSettings = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Settings ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForSettings.displayName = "IconForSettings";

export const IconForMembers = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Users ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForMembers.displayName = "IconForMembers";

export const IconForSecurity = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Shield ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForSecurity.displayName = "IconForSecurity";

export const IconForBilling = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <CreditCard ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForBilling.displayName = "IconForBilling";

export const IconForProfile = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <BadgeCheck ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForProfile.displayName = "IconForProfile";

export const IconForNotifications = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Bell ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForNotifications.displayName = "IconForNotifications";

export const IconForSignOut = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <LogOut ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForSignOut.displayName = "IconForSignOut";

export const IconForExpand = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <ChevronsUpDown ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForExpand.displayName = "IconForExpand";

export const IconForAdd = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Plus ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForAdd.displayName = "IconForAdd";

export const IconForInvite = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <UserPlus ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForInvite.displayName = "IconForInvite";

export const IconForRemove = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <UserMinus ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForRemove.displayName = "IconForRemove";

export const IconForMore = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <MoreHorizontal ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForMore.displayName = "IconForMore";

export const IconForClose = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <X ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForClose.displayName = "IconForClose";

export const IconForChevronRight = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <ChevronRight ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForChevronRight.displayName = "IconForChevronRight";

export const IconForBold = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Bold ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForBold.displayName = "IconForBold";

export const IconForItalic = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Italic ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForItalic.displayName = "IconForItalic";

export const IconForUnderline = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <Underline ref={ref} {...props} className={cn("size-4", props.className)} />
  )
);
IconForUnderline.displayName = "IconForUnderline";
