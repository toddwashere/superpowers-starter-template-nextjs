import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

export interface NavItem {
  title: string;
  href: string;
  icon: ComponentType<LucideProps>;
  isActive?: boolean;
  items?: NavSubItem[];
}

export interface NavSubItem {
  title: string;
  href: string;
}

export interface NavConfig {
  label?: string;
  items: NavItem[];
}
