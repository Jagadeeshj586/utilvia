"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentsStore } from "@/stores/recents-store";

export function RecentsTracker({ toolId }: { toolId: string }) {
  const recordVisit = useRecentsStore((s) => s.recordVisit);

  useEffect(() => {
    recordVisit(toolId);
  }, [toolId, recordVisit]);

  return null;
}

export function ToolSaveButton({ toolId }: { toolId: string }) {
  const toggleFavorite = useRecentsStore((s) => s.toggleFavorite);
  const favorite = useRecentsStore((s) => s.favorites.includes(toolId));

  return (
    <Button
      variant={favorite ? "default" : "outline"}
      onClick={() => {
        const next = !favorite;
        toggleFavorite(toolId);
        toast.success(next ? "Saved to your tools" : "Removed from saved tools");
      }}
    >
      <Star className={favorite ? "fill-current" : ""} />
      {favorite ? "Saved" : "Save tool"}
    </Button>
  );
}
