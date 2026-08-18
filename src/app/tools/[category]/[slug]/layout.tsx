import { JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400"],
  display: "swap",
});

export default function ToolLayout({ children }: { children: ReactNode }) {
  return <div className={`${mono.variable} min-h-full`}>{children}</div>;
}
