import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="max-site py-10">
      <EmptyState
        icon={SearchX}
        title="Page not found"
        description="That route does not exist. Search tools with ⌘K or head back to the workspace."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/tools">Explore All Tools</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Home</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
