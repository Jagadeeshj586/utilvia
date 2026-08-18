"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useUiStore } from "@/stores/ui-store";

const CommandPalette = dynamic(
  () => import("@/components/search/command-palette").then((module) => module.CommandPalette),
  { ssr: false },
);

export function CommandPaletteHost() {
  const open = useUiStore((s) => s.commandOpen);
  const setOpen = useUiStore((s) => s.setCommandOpen);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typingInField =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setReady(true);
        setOpen(!open);
        return;
      }

      if (event.key === "/" && !typingInField) {
        event.preventDefault();
        setReady(true);
        setOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) setReady(true);
  }, [open]);

  if (!ready) return null;
  return <CommandPalette />;
}
