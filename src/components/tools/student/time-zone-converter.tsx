"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftRight, Clock3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimeZoneSelector } from "@/components/tools/student/timezone-selector";
import { trackTimezoneEvent } from "@/lib/timezone/analytics";
import {
  convertAcrossTimeZones,
  getBrowserTimeZone,
  getCurrentLocalDateTime,
  getNowInTimeZone,
  getZonedParts,
  instantToConvertedResult,
  sanitizeTimeZoneList,
  toIsoDate,
  type Disambiguation,
  type TimeFormat,
} from "@/lib/timezone/convert";
import {
  DEFAULT_DESTINATION_IDS,
  MAX_DESTINATIONS,
  POPULAR_TIMEZONE_IDS,
  QUICK_CONVERSIONS,
  canonicalizeTimeZoneId,
  getTimeZoneCity,
} from "@/lib/timezone/data";
import {
  loadTimeZonePreferences,
  pushRecentTimeZone,
  saveTimeZonePreferences,
  toggleFavoriteTimeZone,
} from "@/lib/timezone/storage";
import { cn } from "@/lib/utils";

function useReferenceInstant(sourceDate: string, sourceTime: string) {
  return useMemo(() => {
    const parsedDate = sourceDate.split("-").map(Number);
    const parsedTime = sourceTime.split(":").map(Number);
    if (parsedDate.length !== 3 || parsedTime.length !== 2) return new Date();
    const guess = Date.UTC(parsedDate[0], parsedDate[1] - 1, parsedDate[2], parsedTime[0], parsedTime[1]);
    return Number.isFinite(guess) ? new Date(guess) : new Date();
  }, [sourceDate, sourceTime]);
}

export function TimeZoneConverterTool() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center text-sm text-muted-foreground">
          Loading time zone converter…
        </div>
      }
    >
      <TimeZoneConverterContent />
    </Suspense>
  );
}

function TimeZoneConverterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [preferences, setPreferences] = useState(loadTimeZonePreferences);
  const [sourceDate, setSourceDate] = useState("2026-08-11");
  const [sourceTime, setSourceTime] = useState("19:30");
  const [sourceTimeZone, setSourceTimeZone] = useState("UTC");
  const [destinations, setDestinations] = useState<string[]>([...DEFAULT_DESTINATION_IDS]);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12");
  const [disambiguation, setDisambiguation] = useState<Disambiguation>("earlier");
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);

  useEffect(() => {
    setMounted(true);
    const local = getCurrentLocalDateTime();
    setSourceTimeZone(canonicalizeTimeZoneId(local.timeZone));
    setSourceDate(local.date);
    setSourceTime(local.time);
    const saved = loadTimeZonePreferences();
    setPreferences(saved);
    setTimeFormat(saved.timeFormat);
    setDisambiguation(saved.disambiguation);
    setDestinations(saved.lastDestinations.map(canonicalizeTimeZoneId));
  }, []);

  useEffect(() => {
    if (!mounted || initializedFromUrl) return;
    const date = searchParams.get("date");
    const time = searchParams.get("time");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (date) setSourceDate(date);
    if (time) setSourceTime(time);
    if (from) setSourceTimeZone(from);
    if (to) setDestinations(sanitizeTimeZoneList(to.split(","), [...DEFAULT_DESTINATION_IDS]));
    setInitializedFromUrl(true);
  }, [initializedFromUrl, mounted, searchParams]);

  useEffect(() => {
    if (!mounted) return;
    saveTimeZonePreferences({
      ...preferences,
      timeFormat,
      disambiguation,
      lastDestinations: destinations,
    });
  }, [destinations, disambiguation, mounted, preferences, timeFormat]);

  useEffect(() => {
    if (!mounted || !initializedFromUrl) return;
    const params = new URLSearchParams();
    params.set("date", sourceDate);
    params.set("time", sourceTime);
    params.set("from", sourceTimeZone);
    if (destinations.length) params.set("to", destinations.join(","));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [destinations, initializedFromUrl, mounted, router, sourceDate, sourceTime, sourceTimeZone]);

  const referenceInstant = useReferenceInstant(sourceDate, sourceTime);

  const conversion = useMemo(
    () =>
      convertAcrossTimeZones({
        sourceDate,
        sourceTime,
        sourceTimeZone,
        destinationTimeZones: destinations,
        format: timeFormat,
        disambiguation,
      }),
    [destinations, disambiguation, sourceDate, sourceTime, sourceTimeZone, timeFormat],
  );

  const sourceDisplay = useMemo(() => {
    if (!conversion.source.instant) return null;
    return instantToConvertedResult(conversion.source.instant, sourceTimeZone, sourceDate, timeFormat);
  }, [conversion.source.instant, sourceDate, sourceTimeZone, timeFormat]);

  const primaryResult = conversion.results[0] ?? null;

  const updateRecent = useCallback((timeZone: string) => {
    setPreferences((current) => ({
      ...current,
      recent: pushRecentTimeZone(current.recent, timeZone),
    }));
  }, []);

  const handleSourceTimeZoneChange = (timeZone: string) => {
    setSourceTimeZone(timeZone);
    updateRecent(timeZone);
    trackTimezoneEvent("timezone_conversion", { source_timezone: timeZone });
  };

  const handleDestinationChange = (index: number, timeZone: string) => {
    setDestinations((current) => current.map((item, idx) => (idx === index ? timeZone : item)));
    updateRecent(timeZone);
    trackTimezoneEvent("timezone_added", { destination_timezone: timeZone });
  };

  const addDestination = () => {
    if (destinations.length >= MAX_DESTINATIONS) return;
    const fallback = POPULAR_TIMEZONE_IDS.find((id) => !destinations.includes(id) && id !== sourceTimeZone) ?? "UTC";
    setDestinations((current) => [...current, fallback]);
    trackTimezoneEvent("timezone_added", { destination_timezone: fallback });
  };

  const removeDestination = (index: number) => {
    const removed = destinations[index];
    setDestinations((current) => current.filter((_, idx) => idx !== index));
    if (removed) trackTimezoneEvent("timezone_removed", { destination_timezone: removed });
  };

  const useCurrentTime = () => {
    const local = getCurrentLocalDateTime();
    const zone = canonicalizeTimeZoneId(local.timeZone);
    setSourceDate(local.date);
    setSourceTime(local.time);
    setSourceTimeZone(zone);
    updateRecent(zone);
    trackTimezoneEvent("current_time_used", { source_timezone: zone });
  };

  const swapWithPrimary = () => {
    const target = destinations[0];
    if (!target || !conversion.source.instant) return;
    const sourceParts = getZonedParts(conversion.source.instant, target);
    setSourceTimeZone(target);
    setSourceDate(toIsoDate(sourceParts));
    setSourceTime(`${String(sourceParts.hour).padStart(2, "0")}:${String(sourceParts.minute).padStart(2, "0")}`);
    setDestinations((current) => [sourceTimeZone, ...current.slice(1)]);
    trackTimezoneEvent("timezone_swapped", {
      source_timezone: target,
      destination_timezone: sourceTimeZone,
    });
  };

  const applyQuickConversion = (preset: (typeof QUICK_CONVERSIONS)[number]) => {
    setSourceTimeZone(preset.from);
    setDestinations([...preset.to]);
    trackTimezoneEvent("quick_conversion_selected", {
      source_timezone: preset.from,
      destination_timezone: preset.to.join(","),
    });
  };

  const addPopularDestination = (timeZone: string) => {
    if (destinations.includes(timeZone)) return;
    if (destinations.length >= MAX_DESTINATIONS) {
      setDestinations((current) => [...current.slice(0, -1), timeZone]);
    } else {
      setDestinations((current) => [...current, timeZone]);
    }
    updateRecent(timeZone);
  };

  const toggleFavorite = (timeZone: string) => {
    setPreferences((current) => ({
      ...current,
      favorites: toggleFavoriteTimeZone(current.favorites, timeZone),
    }));
  };

  const popularNow = useMemo(() => {
    if (!mounted) return [];
    return POPULAR_TIMEZONE_IDS.map((timeZone) => ({
      timeZone,
      city: getTimeZoneCity(timeZone),
      now: getNowInTimeZone(timeZone, timeFormat),
    })).filter((item) => item.now);
  }, [mounted, timeFormat]);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-10 text-center text-sm text-muted-foreground">
        Loading time zone data…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick start */}
      <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Quick start</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Tap a route to fill the converter instantly.</p>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Time format">
            <span className="text-xs text-muted-foreground">Format</span>
            <Button
              type="button"
              size="sm"
              variant={timeFormat === "12" ? "default" : "outline"}
              className="min-h-10 min-w-11"
              onClick={() => {
                setTimeFormat("12");
                trackTimezoneEvent("time_format_changed", { time_format: "12" });
              }}
              aria-pressed={timeFormat === "12"}
            >
              12h
            </Button>
            <Button
              type="button"
              size="sm"
              variant={timeFormat === "24" ? "default" : "outline"}
              className="min-h-10 min-w-11"
              onClick={() => {
                setTimeFormat("24");
                trackTimezoneEvent("time_format_changed", { time_format: "24" });
              }}
              aria-pressed={timeFormat === "24"}
            >
              24h
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_CONVERSIONS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              className="min-h-10"
              onClick={() => applyQuickConversion(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </section>

      {/* Main converter */}
      <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Your time</h2>
          <p className="mt-1 text-sm text-[var(--body)]">
            Enter when and where you are — results update as you change anything.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="tz-date">Date</Label>
            <Input
              id="tz-date"
              type="date"
              value={sourceDate}
              onChange={(event) => setSourceDate(event.target.value)}
              className="mt-1 min-h-11"
            />
          </div>
          <div>
            <Label htmlFor="tz-time">Time</Label>
            <Input
              id="tz-time"
              type="time"
              value={sourceTime}
              onChange={(event) => setSourceTime(event.target.value)}
              className="mt-1 min-h-11"
            />
          </div>
          <div className="sm:col-span-2">
            <TimeZoneSelector
              id="tz-source"
              label="Your city / time zone"
              value={sourceTimeZone}
              onChange={handleSourceTimeZoneChange}
              favorites={preferences.favorites}
              recent={preferences.recent}
              onToggleFavorite={toggleFavorite}
              referenceDate={referenceInstant}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" className="min-h-11" onClick={useCurrentTime}>
            <Clock3 className="mr-2 h-4 w-4" aria-hidden="true" />
            Use my current time
          </Button>
          {sourceTimeZone === canonicalizeTimeZoneId(getBrowserTimeZone()) ? (
            <span className="text-xs text-muted-foreground">Detected: {getTimeZoneCity(sourceTimeZone)}</span>
          ) : null}
        </div>

        {conversion.source.error ? (
          <p className="text-sm text-destructive" role="alert">
            {conversion.source.error}
          </p>
        ) : null}

        {conversion.source.warning ? (
          <div
            className="rounded-xl border border-[#e8a55a]/50 bg-[#e8a55a]/10 px-4 py-3 text-sm text-[var(--body)]"
            role="note"
          >
            <p>{conversion.source.warning.message}</p>
            {conversion.source.warning.type === "ambiguous" ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={disambiguation === "earlier" ? "default" : "outline"}
                  onClick={() => setDisambiguation("earlier")}
                >
                  Earlier occurrence
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={disambiguation === "later" ? "default" : "outline"}
                  onClick={() => setDisambiguation("later")}
                >
                  Later occurrence
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* At-a-glance comparison */}
      {sourceDisplay && primaryResult ? (
        <section
          className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5"
          aria-live="polite"
          aria-label="Conversion summary"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">At a glance</p>
          <div className="mt-3 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <p className="text-sm text-[var(--body)]">In {getTimeZoneCity(sourceTimeZone)}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-ink sm:text-4xl">{sourceDisplay.time}</p>
              <p className="mt-1 text-sm text-[var(--body)]">{sourceDisplay.date}</p>
              <p className="mt-1 text-xs text-muted-foreground">{sourceDisplay.offsetLabel}</p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="min-h-11 min-w-11 rounded-full border-primary/30 bg-surface-card"
                aria-label={`Swap ${getTimeZoneCity(sourceTimeZone)} with ${getTimeZoneCity(destinations[0])}`}
                onClick={swapWithPrimary}
              >
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <span className="text-[11px] text-muted-foreground">Swap</span>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-sm text-[var(--body)]">In {getTimeZoneCity(primaryResult.timeZone)}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-ink sm:text-4xl">{primaryResult.time}</p>
              <p className="mt-1 text-sm text-[var(--body)]">{primaryResult.date}</p>
              <p
                className={cn(
                  "mt-1 text-xs font-medium",
                  primaryResult.dateLabel === "same" ? "text-muted-foreground" : "text-primary",
                )}
              >
                {primaryResult.dateLabelText}
                {primaryResult.dateLabel !== "same" ? ` · ${primaryResult.date}` : null}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{primaryResult.offsetLabel}</p>
            </div>
          </div>
        </section>
      ) : null}

      {/* All destinations */}
      <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Converted times</h2>
            <p className="mt-1 text-sm text-[var(--body)]">
              Compare up to {MAX_DESTINATIONS} cities. Change a city anytime.
            </p>
          </div>
          {destinations.length < MAX_DESTINATIONS ? (
            <Button type="button" variant="outline" className="min-h-11" onClick={addDestination}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Add city
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2" aria-live="polite">
          {destinations.map((timeZone, index) => {
            const result = conversion.results.find((item) => item.timeZone === timeZone);
            return (
              <article
                key={`${timeZone}-${index}`}
                className={cn(
                  "rounded-xl border p-4",
                  index === 0 ? "border-primary/30 bg-primary/5 sm:col-span-2" : "border-[var(--hairline)] bg-surface-soft",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <TimeZoneSelector
                      value={timeZone}
                      onChange={(next) => handleDestinationChange(index, next)}
                      favorites={preferences.favorites}
                      recent={preferences.recent}
                      onToggleFavorite={toggleFavorite}
                      referenceDate={referenceInstant}
                      showOffsetHint={false}
                      compact
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="min-h-10 min-w-10 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${getTimeZoneCity(timeZone)}`}
                    onClick={() => removeDestination(index)}
                    disabled={destinations.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                {result ? (
                  <div className="mt-3">
                    <p className="text-3xl font-semibold tabular-nums text-ink">{result.time}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="text-[var(--body)]">{result.date}</span>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-medium",
                          result.dateLabel === "same"
                            ? "bg-surface-card text-muted-foreground"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        {result.dateLabelText}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{result.offsetLabel}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Unable to convert to this time zone.</p>
                )}
              </article>
            );
          })}
        </div>

        {destinations.length >= MAX_DESTINATIONS ? (
          <p className="text-xs text-muted-foreground">Maximum of {MAX_DESTINATIONS} cities reached.</p>
        ) : null}
      </section>

      {/* World clock */}
      <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <h3 className="font-display text-lg font-semibold text-ink">World clock right now</h3>
        <p className="mt-1 text-sm text-[var(--body)]">Live times in your browser. Tap a city to add it below.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {popularNow.map((item) => {
            const alreadyAdded = destinations.includes(item.timeZone);
            return (
              <button
                key={item.timeZone}
                type="button"
                disabled={alreadyAdded}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                  alreadyAdded
                    ? "cursor-default border-primary/20 bg-primary/5 opacity-80"
                    : "border-[var(--hairline)] bg-surface-soft hover:border-primary/30",
                )}
                onClick={() => addPopularDestination(item.timeZone)}
                aria-label={
                  alreadyAdded
                    ? `${item.city} already added`
                    : `Add ${item.city} to converted times`
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-ink">{item.city}</p>
                  {alreadyAdded ? (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-primary">Added</span>
                  ) : (
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <p className="mt-1 text-lg font-semibold tabular-nums">{item.now?.displayTime}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.now?.offsetLabel}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
