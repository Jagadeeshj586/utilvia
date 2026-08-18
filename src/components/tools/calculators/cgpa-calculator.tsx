"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNum } from "@/lib/utils";

function gradeLabel(pct: number) {
  if (pct >= 90) return "O / A+ (Outstanding)";
  if (pct >= 80) return "A (Excellent)";
  if (pct >= 70) return "B+ (Very Good)";
  if (pct >= 60) return "B (Good)";
  if (pct >= 50) return "C (Average)";
  if (pct >= 40) return "D (Pass)";
  return "F (Fail)";
}

export function CgpaCalculator() {
  const [mode, setMode] = useState<"cgpa-to-percentage" | "percentage-to-cgpa">("cgpa-to-percentage");
  const [scale, setScale] = useState<"10" | "4">("10");
  const [cgpa, setCgpa] = useState("8.2");
  const [percentage, setPercentage] = useState("77.9");

  const cgpaN = Number(cgpa) || 0;
  const pctN = Number(percentage) || 0;

  const forward = useMemo(() => {
    if (cgpaN < 0 || (scale === "10" && cgpaN > 10) || (scale === "4" && cgpaN > 4)) return null;
    const vtuPercentage = scale === "10" ? 9.5 * cgpaN : (cgpaN / 4) * 100;
    const cbsePercentage = scale === "10" ? (cgpaN - 0.75) * 10 : (cgpaN / 4) * 100;
    const fourPointPercentage = scale === "10" ? (cgpaN / 10) * 100 : (cgpaN / 4) * 100;
    return {
      vtuPercentage,
      cbsePercentage,
      fourPointPercentage,
      grade: gradeLabel(scale === "10" ? vtuPercentage : fourPointPercentage),
    };
  }, [cgpaN, scale]);

  const reverse = useMemo(() => {
    if (pctN < 0 || pctN > 100) return null;
    return {
      vtuCgpa: pctN / 9.5,
      cbseCgpa: pctN / 10 + 0.75,
      fourPointCgpa: (pctN / 100) * 4,
      grade: gradeLabel(pctN),
    };
  }, [pctN]);

  return (
    <div className="space-y-6">
      <div>
        <Label>Converter Mode</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant={mode === "cgpa-to-percentage" ? "default" : "outline"} onClick={() => setMode("cgpa-to-percentage")}>
            CGPA → Percentage
          </Button>
          <Button size="sm" variant={mode === "percentage-to-cgpa" ? "default" : "outline"} onClick={() => setMode("percentage-to-cgpa")}>
            Percentage → CGPA
          </Button>
        </div>
      </div>
      {mode === "cgpa-to-percentage" ? (
        <>
          <div>
            <Label htmlFor="cgpa-scale">Scale</Label>
            <select
              id="cgpa-scale"
              value={scale}
              onChange={(e) => setScale(e.target.value as "10" | "4")}
              className="mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm"
            >
              <option value="10">10-point</option>
              <option value="4">4-point</option>
            </select>
          </div>
          <div>
            <Label htmlFor="cgpa-value">CGPA</Label>
            <Input id="cgpa-value" value={cgpa} onChange={(e) => setCgpa(e.target.value)} className="mt-1" placeholder="8.2" />
          </div>
          {forward ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="VTU (× 9.5)" value={`${formatNum(forward.vtuPercentage)}%`} highlight />
              <Stat label="CBSE ((CGPA − 0.75) × 10)" value={`${formatNum(forward.cbsePercentage)}%`} />
              <Stat label="4-point equivalent" value={`${formatNum(forward.fourPointPercentage)}%`} />
              <Stat label="Grade" value={forward.grade} />
            </div>
          ) : (
            <p className="text-sm text-destructive">Enter a valid CGPA for the selected scale.</p>
          )}
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="percentage-value">Percentage</Label>
            <Input id="percentage-value" value={percentage} onChange={(e) => setPercentage(e.target.value)} className="mt-1" placeholder="77.9" />
          </div>
          {reverse ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="VTU CGPA (÷ 9.5)" value={formatNum(reverse.vtuCgpa, 2)} highlight />
              <Stat label="CBSE CGPA (÷ 10 + 0.75)" value={formatNum(reverse.cbseCgpa, 2)} />
              <Stat label="4-point CGPA" value={formatNum(reverse.fourPointCgpa, 2)} />
              <Stat label="Grade" value={reverse.grade} />
            </div>
          ) : (
            <p className="text-sm text-destructive">Enter a percentage between 0 and 100.</p>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-primary/30 bg-surface-card" : "border-[var(--hairline)] bg-surface-soft"}`}>
      <p className="text-sm text-[var(--muted-ink)]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}
