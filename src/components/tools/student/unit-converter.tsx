"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UNIT_CATEGORIES,
  allConversions,
  convertUnits,
  formatUnitValue,
  getUnitCategory,
  parseUnitInput,
  type UnitCategoryId,
} from "@/lib/converters/units";
import { cn } from "@/lib/utils";

const selectClass =
  "mt-1 h-11 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/15 focus-visible:border-primary";

export function UnitConverter() {
  const [categoryId, setCategoryId] = useState<UnitCategoryId>("length");
  const category = getUnitCategory(categoryId);
  const [fromId, setFromId] = useState(category.units[0].id);
  const [toId, setToId] = useState(category.units[1]?.id ?? category.units[0].id);
  const [value, setValue] = useState("1");

  const amount = parseUnitInput(value);
  const result = useMemo(() => convertUnits(amount, fromId, toId, categoryId), [amount, categoryId, fromId, toId]);
  const conversions = useMemo(() => allConversions(amount, fromId, categoryId), [amount, categoryId, fromId]);

  const switchCategory = (nextId: UnitCategoryId) => {
    const next = getUnitCategory(nextId);
    setCategoryId(nextId);
    setFromId(next.units[0].id);
    setToId(next.units[1]?.id ?? next.units[0].id);
  };

  const swapUnits = () => {
    setFromId(toId);
    setToId(fromId);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-[var(--muted-ink)]">Category</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Unit category">
          {UNIT_CATEGORIES.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={categoryId === item.id ? "default" : "outline"}
              onClick={() => switchCategory(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-3">
          <div>
            <Label htmlFor="unit-from">From</Label>
            <select
              id="unit-from"
              aria-label="From unit"
              value={fromId}
              onChange={(event) => setFromId(event.target.value)}
              className={selectClass}
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="unit-value" className="sr-only">
              Value to convert
            </Label>
            <Input
              id="unit-value"
              inputMode="decimal"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="1"
              aria-label="Value to convert"
              className="h-11 text-base tabular-nums"
            />
          </div>
        </div>

        <div className="flex justify-center pb-1 sm:pb-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={swapUnits}
            aria-label="Swap units"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="unit-to">To</Label>
            <select
              id="unit-to"
              aria-label="To unit"
              value={toId}
              onChange={(event) => setToId(event.target.value)}
              className={selectClass}
            >
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
          <div
            className={cn(
              "flex h-11 items-center rounded-md border border-[var(--hairline)] bg-surface-soft px-3 text-base font-semibold tabular-nums text-ink",
            )}
            aria-live="polite"
            aria-label="Converted value"
          >
            {result == null ? "—" : formatUnitValue(result, categoryId)}
          </div>
        </div>
      </div>

      {conversions.length ? (
        <section className="rounded-lg border border-[var(--hairline)] bg-surface-soft p-5 sm:p-6">
          <h2 className="font-display text-[22px] tracking-[-0.3px] text-ink">All Conversions</h2>
          <ul className="mt-4 divide-y divide-[var(--hairline)]">
            {conversions.map(({ unit, value: converted }) => (
              <li key={unit.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-[var(--body)]">{unit.label}</span>
                <span className="font-medium tabular-nums text-ink">{formatUnitValue(converted, categoryId)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
