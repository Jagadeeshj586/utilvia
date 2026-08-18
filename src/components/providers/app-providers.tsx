"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { FaviconSwitcher } from "@/components/layout/favicon-switcher";
import { CommandPaletteHost } from "@/components/search/command-palette-host";

const Toaster = dynamic(() => import("sonner").then((module) => module.Toaster), { ssr: false });

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="toolhub-theme"
      disableTransitionOnChange
    >
      <FaviconSwitcher />
      {children}
      <CommandPaletteHost />
      <Toaster richColors position="bottom-left" />
    </ThemeProvider>
  );
}
