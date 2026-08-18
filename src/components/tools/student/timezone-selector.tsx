"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getOffsetLabel } from "@/lib/timezone/convert";
import {
  filterTimeZones,
  getTimeZoneEntry,
  getTimeZoneLabel,
  groupTimeZones,
  TIMEZONE_CATALOG,
} from "@/lib/timezone/data";
import { cn } from "@/lib/utils";

type TimeZoneSelectorProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (timeZone: string) => void;
  favorites?: string[];
  recent?: string[];
  onToggleFavorite?: (timeZone: string) => void;
  referenceDate?: Date;
  className?: string;
  /** Hide the offset line under the trigger when the parent already shows it */
  showOffsetHint?: boolean;
  /** Compact trigger for nested result cards */
  compact?: boolean;
};

export function TimeZoneSelector({
  id,
  label,
  value,
  onChange,
  favorites = [],
  recent = [],
  onToggleFavorite,
  referenceDate = new Date(),
  className,
  showOffsetHint = true,
  compact = false,
}: TimeZoneSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const groupedResults = useMemo(() => filterTimeZones(query), [query]);
  const selectedEntry = getTimeZoneEntry(value);
  const selectedOffset = getOffsetLabel(referenceDate, value);
  const city = selectedEntry?.city ?? getTimeZoneLabel(value);

  const favoriteEntries = favorites
    .map(
      (timeZone) =>
        getTimeZoneEntry(timeZone) ?? {
          id: timeZone,
          city: timeZone.split("/").pop()?.replace(/_/g, " ") ?? timeZone,
          country: "",
          region: "Favorites",
        },
    )
    .filter(Boolean);

  const recentEntries = recent
    .filter((timeZone) => timeZone !== value && !favorites.includes(timeZone))
    .map((timeZone) => getTimeZoneEntry(timeZone))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, 6);

  const renderItem = (timeZone: string, itemCity: string, country: string) => {
    const offset = getOffsetLabel(referenceDate, timeZone);
    const selected = value === timeZone;
    return (
      <CommandItem
        key={timeZone}
        value={`${itemCity} ${country} ${timeZone} ${offset}`}
        onSelect={() => {
          onChange(timeZone);
          setOpen(false);
          setQuery("");
        }}
        className="flex items-start gap-2 py-2.5"
      >
        <Check className={cn("mt-0.5 h-4 w-4 shrink-0", selected ? "opacity-100" : "opacity-0")} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{itemCity}</p>
          <p className="truncate text-xs text-muted-foreground">
            {country ? `${country} · ` : ""}
            {timeZone}
          </p>
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {offset.split(" · ")[1] ?? offset}
        </span>
        {onToggleFavorite ? (
          <button
            type="button"
            className="ml-1 rounded-md p-1 text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label={
              favorites.includes(timeZone) ? `Remove ${itemCity} from favorites` : `Add ${itemCity} to favorites`
            }
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(timeZone);
            }}
          >
            <Star className={cn("h-4 w-4", favorites.includes(timeZone) ? "fill-primary text-primary" : "")} />
          </button>
        ) : null}
      </CommandItem>
    );
  };

  return (
    <div className={className}>
      {label ? <p className="mb-2 text-sm font-medium text-ink">{label}</p> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label ? `${label}: ${city}` : `Time zone: ${city}`}
            className={cn(
              "w-full justify-between px-3 text-left font-normal",
              compact ? "min-h-10" : "min-h-11",
            )}
          >
            <span className="min-w-0 truncate">
              <span className="font-medium text-ink">{city}</span>
              {!compact && selectedEntry ? (
                <span className="text-muted-foreground"> · {selectedEntry.country || value.replace(/_/g, " ")}</span>
              ) : null}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search city, country, IST, UTC+5:30…"
              value={query}
              onValueChange={setQuery}
              aria-label="Search time zones"
            />
            <CommandList className="max-h-72">
              <CommandEmpty>No time zones found.</CommandEmpty>

              {!query && favoriteEntries.length ? (
                <CommandGroup heading="Favorites">
                  {favoriteEntries.map((entry) => renderItem(entry.id, entry.city, entry.country))}
                </CommandGroup>
              ) : null}

              {!query && recentEntries.length ? (
                <CommandGroup heading="Recent">
                  {recentEntries.map((entry) => renderItem(entry.id, entry.city, entry.country))}
                </CommandGroup>
              ) : null}

              {(query ? groupedResults : groupTimeZones(TIMEZONE_CATALOG)).map(({ region, items }) => (
                <CommandGroup key={region} heading={region}>
                  {items.map((entry) => renderItem(entry.id, entry.city, entry.country))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {showOffsetHint ? <p className="mt-1.5 text-xs text-muted-foreground">{selectedOffset}</p> : null}
    </div>
  );
}
