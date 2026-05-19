import type { PageHeaderProps } from "@workspace/ui/components/page-header";

/** Org shell: sidebar + command menu; do not pass `leading` or `trailing`. */
export type DashboardPageHeaderInOrgProps = Omit<
  PageHeaderProps,
  "leading" | "trailing"
>;

/** Pre-org / account / dev: command menu only; optional `leading` (e.g. back link). */
export type DashboardPageHeaderNoOrgProps = Omit<PageHeaderProps, "trailing">;
