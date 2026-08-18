"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const LIGHT = "/brand/favicon-light.png";
const DARK = "/brand/favicon-dark.png";

export function FaviconSwitcher() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const href = resolvedTheme === "dark" ? DARK : LIGHT;
    let link = document.querySelector<HTMLLinkElement>("link[data-app-favicon]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.setAttribute("data-app-favicon", "true");
      document.head.appendChild(link);
    }
    link.href = href;
  }, [resolvedTheme]);

  return null;
}
