"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { FaviconSwitcher } from "@/components/layout/favicon-switcher";
import { CommandPaletteHost } from "@/components/search/command-palette-host";
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
        <CommandPaletteHost />
        <Toaster richColors position="bottom-left" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
