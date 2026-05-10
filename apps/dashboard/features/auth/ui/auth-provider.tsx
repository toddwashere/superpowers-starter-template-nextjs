"use client";

import NiceModal from "@ebay/nice-modal-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@workspace/ui/components/theme-provider";
import { Toaster } from "@workspace/ui/components/sonner";
import type { ReactNode } from "react";
import { getQueryClient } from "../data/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <NiceModal.Provider>
          {children}
        </NiceModal.Provider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
