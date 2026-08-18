"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ACTIVITY_OPTIONS,
  calculateCalorieDeficit,
  fromCm,
  fromKg,
  GOAL_OPTIONS,
  toCm,
  toKg,
  type ActivityLevel,
  type GoalLevel,
  type Sex,
  type UnitSystem,
} from "@/lib/calorie/calculate";
import { cn } from "@/lib/utils";

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "min-h-11 rounded-lg border px-4 text-sm font-medium transition-colors",
              value === option.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-[var(--hairline)] bg-surface-soft text-ink hover:border-primary/40",
            )}
            aria-pressed={value === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: string;
  hint: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-4",
        emphasize ? "border-primary/40 bg-primary/5 sm:col-span-1" : "border-[var(--hairline)] bg-surface-soft",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-semibold tabular-nums text-ink", emphasize ? "text-4xl" : "text-3xl")}>{value}</p>
      <p className="mt-1 text-sm text-[var(--body)]">{hint}</p>
    </div>
  );
}

export function CalorieDeficitCalculatorTool() {
  const [unit, setUnit] = useState<UnitSystem>("metric");
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState("30");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const [activity, setActivity] = useState<ActivityLevel>("moderately-active");
  const [goal, setGoal] = useState<GoalLevel>("moderate");

  const ageNum = Number(age);
  const weightNum = Number(weight);
  const heightNum = Number(height);
  const weightKg = toKg(weightNum, unit);
  const heightCm = toCm(heightNum, unit);

  const inputError = useMemo(() => {
    if (!age.trim() || !Number.isFinite(ageNum) || ageNum < 15 || ageNum > 100) {
      return "Enter an age between 15 and 100.";
    }
    if (!weight.trim() || !Number.isFinite(weightNum) || weightNum <= 0) {
      return unit === "metric" ? "Enter a valid weight in kg." : "Enter a valid weight in lbs.";
    }
    if (!height.trim() || !Number.isFinite(heightNum) || heightNum <= 0) {
      return unit === "metric" ? "Enter a valid height in cm." : "Enter a valid height in inches.";
    }
    return null;
  }, [age, ageNum, height, heightNum, unit, weight, weightNum]);

  const result = useMemo(() => {
    if (inputError) return null;
    return calculateCalorieDeficit({
      sex,
      age: ageNum,
      weightKg,
      heightCm,
      activity,
      goal,
    });
  }, [activity, ageNum, goal, heightCm, inputError, sex, weightKg]);

  const switchUnit = (next: UnitSystem) => {
    if (next === unit) return;
    const nextWeight = fromKg(weightKg, next);
    const nextHeight = fromCm(heightCm, next);
    if (Number.isFinite(nextWeight) && nextWeight > 0) {
      setWeight(String(Math.round(nextWeight * 10) / 10));
    }
    if (Number.isFinite(nextHeight) && nextHeight > 0) {
      setHeight(String(Math.round(nextHeight * 10) / 10));
    }
    setUnit(next);
  };

  const weightUnit = unit === "metric" ? "kg" : "lbs";
  const heightUnit = unit === "metric" ? "cm" : "in";
  const selectedGoal = GOAL_OPTIONS.find((item) => item.id === goal);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
      <section className="space-y-5 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Your details</h2>
          <p className="mt-1 text-sm text-[var(--body)]">Results update instantly as you change anything.</p>
        </div>

        <SegmentedControl
          label="Units"
          value={unit}
          options={[
            { id: "metric", label: "Metric (kg/cm)" },
            { id: "imperial", label: "Imperial (lbs/in)" },
          ]}
          onChange={switchUnit}
        />

        <SegmentedControl
          label="Sex"
          value={sex}
          options={[
            { id: "male", label: "Male" },
            { id: "female", label: "Female" },
          ]}
          onChange={setSex}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="cal-age">Age</Label>
            <div className="relative mt-1">
              <Input
                id="cal-age"
                inputMode="numeric"
                value={age}
                onChange={(event) => setAge(event.target.value.replace(/[^\d]/g, ""))}
                placeholder="30"
                className="pr-14"
                aria-describedby="cal-age-unit"
              />
              <span id="cal-age-unit" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                years
              </span>
            </div>
          </div>
          <div>
            <Label htmlFor="cal-weight">Weight</Label>
            <div className="relative mt-1">
              <Input
                id="cal-weight"
                inputMode="decimal"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder={unit === "metric" ? "70" : "154"}
                className="pr-12"
                aria-describedby="cal-weight-unit"
              />
              <span id="cal-weight-unit" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                {weightUnit}
              </span>
            </div>
          </div>
          <div>
            <Label htmlFor="cal-height">Height</Label>
            <div className="relative mt-1">
              <Input
                id="cal-height"
                inputMode="decimal"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                placeholder={unit === "metric" ? "170" : "67"}
                className="pr-12"
                aria-describedby="cal-height-unit"
              />
              <span id="cal-height-unit" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                {heightUnit}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Activity level</p>
          <div className="grid gap-2">
            {ACTIVITY_OPTIONS.map((option) => {
              const selected = activity === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActivity(option.id)}
                  className={cn(
                    "min-h-11 rounded-xl border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-[var(--hairline)] bg-surface-soft hover:border-primary/40",
                  )}
                  aria-pressed={selected}
                >
                  <span className="block text-sm font-medium text-ink">{option.label.split(" (")[0]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {option.label.includes("(") ? option.label.slice(option.label.indexOf("(") + 1, -1) : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink">Goal</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {GOAL_OPTIONS.map((option) => {
              const selected = goal === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setGoal(option.id)}
                  className={cn(
                    "min-h-11 rounded-xl border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-[var(--hairline)] bg-surface-soft hover:border-primary/40",
                  )}
                  aria-pressed={selected}
                >
                  <span className="block text-sm font-medium text-ink">
                    {option.id === "maintain"
                      ? "Maintain"
                      : option.id === "mild"
                        ? "Mild"
                        : option.id === "moderate"
                          ? "Moderate"
                          : "Aggressive"}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {option.deficit === 0 ? "Keep current weight" : `~${option.deficit} cal/day deficit`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {inputError ? (
          <p className="text-sm text-destructive" role="alert">
            {inputError}
          </p>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5 lg:sticky lg:top-24">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Your estimates</h2>
          <p className="mt-1 text-sm text-[var(--body)]">
            {selectedGoal ? selectedGoal.label : "Choose a goal to see your daily target."}
          </p>
        </div>

        {result ? (
          <div className="space-y-3" aria-live="polite">
            <ResultCard
              label="Daily calorie target"
              value={`${result.dailyTarget.toLocaleString()} cal`}
              hint={
                result.deficit === 0
                  ? "Eat around this amount to maintain weight."
                  : `About ${result.deficit} calories below maintenance.`
              }
              emphasize
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard label="BMR" value={`${result.bmr.toLocaleString()} cal`} hint="Calories at complete rest" />
              <ResultCard
                label="TDEE"
                value={`${result.tdee.toLocaleString()} cal`}
                hint="Estimated maintenance calories"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--hairline)] bg-surface-soft px-4 py-8 text-center">
            <p className="font-medium text-ink">Enter valid details</p>
            <p className="mt-1 text-sm text-muted-foreground">Your daily calorie target will appear here.</p>
          </div>
        )}

      </section>
      </div>

      <aside
        role="note"
        aria-label="Important medical disclaimer"
        className="rounded-xl border border-[#e8a55a]/50 bg-[#e8a55a]/10 px-4 py-4 text-sm leading-relaxed text-[var(--body)]"
      >
        <p>
          <span className="font-semibold text-ink">Important:</span> This tool provides a general estimate for
          informational purposes only — not medical or nutritional advice. Anyone with health conditions, a history of
          disordered eating, who is pregnant or breastfeeding, or considering a significant deficit should consult a
          doctor or registered dietitian.
        </p>
      </aside>
    </div>
  );
}
