import { Logo } from "@/components/layout/logo";
import { HeaderActions } from "@/components/layout/header-actions";

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[var(--hairline)] bg-canvas/85 backdrop-blur-md transition-colors duration-150">
      <div className="max-site relative flex h-16 items-center justify-between gap-4">
        <Logo />
        <HeaderActions />
      </div>
    </header>
  );
}
