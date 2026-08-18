import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center", className)} aria-label={`${SITE.name} home`}>
      <Image
        src="/brand/logo-light.png"
        alt=""
        width={120}
        height={24}
        priority
        className="h-6 w-auto dark:hidden"
      />
      <Image
        src="/brand/logo-dark.png"
        alt=""
        width={120}
        height={24}
        priority
        className="hidden h-6 w-auto dark:block"
      />
    </Link>
  );
}
