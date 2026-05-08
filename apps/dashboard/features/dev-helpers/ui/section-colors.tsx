"use client";

import { Separator } from "@workspace/ui/components/separator";

const corePalette: { bg: string; fg?: string; label: string }[] = [
  { bg: "bg-background", fg: "text-foreground", label: "background" },
  { bg: "bg-card", fg: "text-card-foreground", label: "card" },
  { bg: "bg-popover", fg: "text-popover-foreground", label: "popover" },
  { bg: "bg-primary", fg: "text-primary-foreground", label: "primary" },
  { bg: "bg-secondary", fg: "text-secondary-foreground", label: "secondary" },
  { bg: "bg-muted", fg: "text-muted-foreground", label: "muted" },
  { bg: "bg-accent", fg: "text-accent-foreground", label: "accent" },
  { bg: "bg-destructive", label: "destructive" },
  { bg: "bg-border", label: "border" },
  { bg: "bg-input", label: "input" },
  { bg: "bg-ring", label: "ring" },
];

const sidebarPalette: { bg: string; fg?: string; label: string }[] = [
  { bg: "bg-sidebar", fg: "text-sidebar-foreground", label: "sidebar" },
  {
    bg: "bg-sidebar-primary",
    fg: "text-sidebar-primary-foreground",
    label: "sidebar-primary",
  },
  {
    bg: "bg-sidebar-accent",
    fg: "text-sidebar-accent-foreground",
    label: "sidebar-accent",
  },
  { bg: "bg-sidebar-border", label: "sidebar-border" },
  { bg: "bg-sidebar-ring", label: "sidebar-ring" },
];

const chartColors = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

const radiusScale = [
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
];

function Swatch({
  bg,
  fg,
  label,
}: {
  bg: string;
  fg?: string;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <div
        className={`${bg} flex h-16 w-full items-center justify-center rounded-lg border border-border/50`}
      >
        {fg && (
          <span className={`${fg} text-sm font-medium`}>Aa</span>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="font-mono text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-xs text-muted-foreground/70">{bg}</p>
      </div>
    </div>
  );
}

export function SectionColors() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Colors & Tokens</h2>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Core Palette</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {corePalette.map((swatch) => (
            <Swatch key={swatch.label} {...swatch} />
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-lg font-semibold">Sidebar Palette</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sidebarPalette.map((swatch) => (
            <Swatch key={swatch.label} {...swatch} />
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-lg font-semibold">Chart Colors</h3>
        <div className="flex gap-4">
          {chartColors.map((color) => (
            <div key={color} className="flex flex-col items-center gap-1.5">
              <div className={`${color} h-12 w-12 rounded-full`} />
              <p className="font-mono text-xs text-muted-foreground">
                {color.replace("bg-", "")}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-lg font-semibold">Radius Scale</h3>
        <div className="flex flex-wrap gap-4">
          {radiusScale.map((radius) => (
            <div key={radius} className="flex flex-col items-center gap-1.5">
              <div
                className={`${radius} h-16 w-16 border-2 border-border bg-muted`}
              />
              <p className="font-mono text-xs text-muted-foreground">
                {radius}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
