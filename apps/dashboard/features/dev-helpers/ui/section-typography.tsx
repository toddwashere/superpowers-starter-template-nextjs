"use client";

import { Separator } from "@workspace/ui/components/separator";

const textSizes = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
];

const fontWeights = [
  "font-normal",
  "font-medium",
  "font-semibold",
  "font-bold",
];

const SAMPLE = "The quick brown fox jumps over the lazy dog";

export function SectionTypography() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Typography</h2>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Size Scale</h3>
        <div className="space-y-3">
          {textSizes.map((size) => (
            <div key={size} className="flex items-baseline gap-4">
              <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                {size}
              </span>
              <span className={size}>{SAMPLE}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-lg font-semibold">Weight Variations</h3>
        <div className="space-y-3">
          {fontWeights.map((weight) => (
            <div key={weight} className="flex items-baseline gap-4">
              <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                {weight}
              </span>
              <span className={`text-base ${weight}`}>{SAMPLE}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-lg font-semibold">Foreground Colors</h3>
        <div className="space-y-3">
          <div className="flex items-baseline gap-4">
            <span className="w-36 shrink-0 font-mono text-xs text-muted-foreground">
              text-foreground
            </span>
            <span className="text-base text-foreground">{SAMPLE}</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="w-36 shrink-0 font-mono text-xs text-muted-foreground">
              text-muted-foreground
            </span>
            <span className="text-base text-muted-foreground">{SAMPLE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
