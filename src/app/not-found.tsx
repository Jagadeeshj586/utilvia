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
        description="The tool or page you are looking for may have moved. Try a category or the full catalog."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/tools">All Tools</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/category/pdf">PDF Tools</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/category/image">Image Tools</Link>
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
