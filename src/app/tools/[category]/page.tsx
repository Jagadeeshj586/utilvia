import { permanentRedirect } from "next/navigation";
import { getCategory } from "@/lib/tools/catalog";

export default function LegacyCategoryPage({ params }: { params: { category: string } }) {
  const mapped: Record<string, string> = {
    calculators: "finance",
    generators: "other",
    india: "finance",
    finance: "finance",
    dev: "developer",
  };
  const next = mapped[params.category] ?? params.category;
  if (!getCategory(next)) permanentRedirect("/tools");
  permanentRedirect(`/category/${next}`);
}
