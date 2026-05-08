import type { Metadata } from "next";
import { ThemeProvider } from "@workspace/ui/components/theme-provider";
import { ThemeToggle } from "@workspace/ui/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Starter Template",
    template: "%s — Starter Template",
  },
  description: "A modern SaaS starter template built with Next.js.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="light">
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
