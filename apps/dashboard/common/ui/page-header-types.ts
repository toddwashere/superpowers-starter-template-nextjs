import type { PageHeaderProps } from "@workspace/ui/components/page-header";

/** Props for dashboard page headers (leading/trailing are set by shell wrappers). */
export type DashboardPageHeaderProps = Omit<
  PageHeaderProps,
  "leading" | "trailing"
>;
