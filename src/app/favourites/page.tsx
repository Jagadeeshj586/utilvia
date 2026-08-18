import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TitleTrustRow } from "@/components/layout/title-trust-row";
import { FavouritesList } from "@/components/tools/favourites-list";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Favourites",
  description: `Your saved ${SITE.name} tools - open them quickly from one page.`,
};

export default function FavouritesPage() {
  return (
    <div className="max-site py-10">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Favourites" }]} />
      <h1 className="font-display text-[36px] tracking-[-0.5px] sm:text-[48px]">Favourites</h1>
      <p className="mt-2 max-w-2xl text-[var(--body)]">Tools you have saved for quick access.</p>
      <TitleTrustRow className="mt-4" />
      <div className="mt-8">
        <FavouritesList />
      </div>
    </div>
  );
}
