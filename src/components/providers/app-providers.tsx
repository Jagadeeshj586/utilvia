"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { FaviconSwitcher } from "@/components/layout/favicon-switcher";
import { CommandPalette } from "@/components/search/command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="toolhub-theme"
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={200}>
        <FaviconSwitcher />
        {children}
        <CommandPalette />
        <Toaster richColors position="bottom-left" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
