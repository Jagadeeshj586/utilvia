"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MONTHS,
  PAY_MODES,
  PLACEHOLDERS,
  RENT_RECEIPT_RULES,
  RENT_RECEIPT_STEPS,
  currentMonthName,
  defaultReceiptNumber,
  ensureMonthSelected,
  formatRentInr,
  hasRentReceiptErrors,
  panRequired,
  pdfFilename,
  previewReceipt,
  selectedMonths,
  toggleMonth,
  validateRentReceipt,
  type MonthName,
  type PayMode,
  type RentReceiptInput,
  type RentReceiptView,
} from "@/lib/rent-receipt/generate";
import { buildRentReceiptPdf } from "@/lib/rent-receipt/pdf";
import { cn, downloadBlob, uint8ToBlob } from "@/lib/utils";

const selectClass =
  "mt-1 h-10 w-full rounded-md border border-[var(--hairline)] bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-primary";

type Draft = {
  tenant: string;
  landlord: string;
  amount: string;
  month: MonthName;
  year: string;
  payMode: PayMode;
  address: string;
  pan: string;
  receiptNo: string;
  months: MonthName[];
};

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[₹,\s]/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function defaultDraft(now = new Date()): Draft {
  const month = currentMonthName(now);
  return {
    tenant: "",
    landlord: "",
    amount: String(RENT_RECEIPT_RULES.defaultAmount),
    month,
    year: String(now.getFullYear()),
    payMode: RENT_RECEIPT_RULES.defaultPayMode,
    address: "",
    pan: "",
    receiptNo: defaultReceiptNumber(now),
    months: [month],
  };
}

export function RentReceiptGenerator() {
  const [draft, setDraft] = useState<Draft>(() => defaultDraft());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.classList.add("rent-receipt-print");
    return () => document.body.classList.remove("rent-receipt-print");
  }, []);

  const input = useMemo<RentReceiptInput>(
    () => ({
      tenant: draft.tenant,
      landlord: draft.landlord,
      amount: parseAmount(draft.amount),
      month: draft.month,
      year: Number(draft.year),
      payMode: draft.payMode,
      address: draft.address,
      pan: draft.pan,
      receiptNo: draft.receiptNo,
      months: draft.months,
    }),
    [draft],
  );

  const errors = useMemo(() => validateRentReceipt(input), [input]);
  const invalid = hasRentReceiptErrors(errors);
  const months = selectedMonths(draft.months);
  const preview = previewReceipt(input);
  const needsPan = panRequired(input.amount) && !draft.pan.trim();

  const patch = (next: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...next }));
  };

  const setPrimaryMonth = (month: MonthName) => {
    setDraft((current) => ({
      ...current,
      month,
      months: ensureMonthSelected(current.months, month),
    }));
  };

  const onToggleMonth = (month: MonthName) => {
    setDraft((current) => {
      const next = toggleMonth(current.months, month);
      if (month === current.month && !next.includes(month) && next[0]) {
        return { ...current, months: next, month: next[0] };
      }
      return { ...current, months: next };
    });
  };

  const downloadPdf = async () => {
    if (invalid) {
      toast.error(errors.months ?? errors.amount ?? "Check the form before downloading.");
      return;
    }
    setBusy(true);
    try {
      const bytes = await buildRentReceiptPdf(input);
      downloadBlob(uint8ToBlob(bytes, "application/pdf"), pdfFilename(input.year, input.months));
      toast.success(months.length > 1 ? `Downloaded ${months.length} receipts` : "Downloaded PDF");
    } catch {
      toast.error("Could not generate PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--body)]">
        Generate professional rent receipts for HRA claims. Download a PDF for one month or the whole year — nothing
        leaves your browser.
      </p>

      <ol className="grid gap-2 sm:grid-cols-3">
        {RENT_RECEIPT_STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-[var(--hairline)] bg-surface-card px-3 py-3 sm:px-4"
          >
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-coral">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">{step.title}</p>
            <p className="mt-0.5 text-xs text-[var(--muted-ink)]">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form
          className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5 print:hidden"
          onSubmit={(event) => event.preventDefault()}
        >
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted-ink)]">Receipt details</p>

          <Field id="tenant-name" label="Tenant Name">
            <Input
              id="tenant-name"
              value={draft.tenant}
              placeholder={PLACEHOLDERS.tenantInput}
              autoComplete="name"
              onChange={(event) => patch({ tenant: event.target.value })}
            />
          </Field>

          <Field id="landlord-name" label="Landlord Name">
            <Input
              id="landlord-name"
              value={draft.landlord}
              placeholder={PLACEHOLDERS.landlordInput}
              onChange={(event) => patch({ landlord: event.target.value })}
            />
          </Field>

          <Field id="rental-amount" label="Rental Amount (₹)" error={errors.amount}>
            <Input
              id="rental-amount"
              inputMode="numeric"
              value={draft.amount}
              aria-invalid={Boolean(errors.amount)}
              className="tabular-nums"
              onChange={(event) => {
                const raw = event.target.value;
                if (raw === "" || /^[\d,]*\.?[\d]*$/.test(raw)) patch({ amount: raw });
              }}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="receipt-month" label="Month">
              <select
                id="receipt-month"
                className={selectClass}
                value={draft.month}
                onChange={(event) => setPrimaryMonth(event.target.value as MonthName)}
              >
                {MONTHS.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="receipt-year" label="Year" error={errors.year}>
              <Input
                id="receipt-year"
                inputMode="numeric"
                value={draft.year}
                aria-invalid={Boolean(errors.year)}
                className="tabular-nums"
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "" || /^\d{0,4}$/.test(raw)) patch({ year: raw });
                }}
              />
            </Field>
          </div>

          <div>
            <p className="text-sm font-medium">Payment Mode</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Payment mode">
              {PAY_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={cn(
                    "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors",
                    draft.payMode === mode
                      ? "border-coral bg-coral text-white"
                      : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                  )}
                  onClick={() => patch({ payMode: mode })}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <Field id="property-address" label="Property Address">
            <Textarea
              id="property-address"
              value={draft.address}
              placeholder={PLACEHOLDERS.addressInput}
              className="min-h-[88px]"
              onChange={(event) => patch({ address: event.target.value })}
            />
          </Field>

          <Field id="landlord-pan" label="Landlord PAN (optional)" error={errors.pan}>
            <Input
              id="landlord-pan"
              value={draft.pan}
              placeholder={PLACEHOLDERS.panInput}
              autoCapitalize="characters"
              aria-invalid={Boolean(errors.pan)}
              className="uppercase"
              onChange={(event) => patch({ pan: event.target.value.toUpperCase() })}
            />
            {needsPan ? (
              <p className="mt-1.5 text-xs text-amber">
                Annual rent is {formatRentInr(input.amount * 12)}. Include landlord PAN when yearly rent exceeds ₹1
                lakh.
              </p>
            ) : null}
          </Field>

          <Field id="receipt-number" label="Receipt Number" error={errors.receiptNo}>
            <Input
              id="receipt-number"
              value={draft.receiptNo}
              aria-invalid={Boolean(errors.receiptNo)}
              className="tabular-nums"
              onChange={(event) => patch({ receiptNo: event.target.value })}
            />
          </Field>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Generate for Multiple Months</p>
              <div className="flex gap-2 text-xs font-medium">
                <button
                  type="button"
                  className="text-coral hover:underline"
                  onClick={() => patch({ months: [...MONTHS] })}
                >
                  All 12 months
                </button>
                <span className="text-[var(--hairline)]">·</span>
                <button
                  type="button"
                  className="text-coral hover:underline"
                  onClick={() => patch({ months: [draft.month] })}
                >
                  This month only
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {MONTHS.map((month) => {
                const checked = draft.months.includes(month);
                return (
                  <button
                    key={month}
                    type="button"
                    aria-pressed={checked}
                    className={cn(
                      "min-h-10 rounded-lg border text-sm font-medium transition-colors",
                      checked
                        ? "border-coral bg-coral text-white"
                        : "border-[var(--hairline)] bg-canvas text-ink hover:border-coral/40",
                    )}
                    onClick={() => onToggleMonth(month)}
                  >
                    {month.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {errors.months ? <p className="mt-1.5 text-xs text-[var(--error)]">{errors.months}</p> : null}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" onClick={() => void downloadPdf()} disabled={busy || invalid}>
              <Download className="mr-2 size-4" />
              {busy ? "Generating..." : "Download PDF"}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 size-4" />
              Print
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {months.length > 1 ? (
            <p className="text-sm text-[var(--muted-ink)] print:hidden">
              Previewing {preview.period}. PDF will include {months.length} months
              {Number.isFinite(input.amount)
                ? ` · ${formatRentInr(input.amount * months.length)} total`
                : ""}
              .
            </p>
          ) : null}
          <ReceiptCard receipt={preview} />
        </div>
      </div>
    </div>
  );
}

function ReceiptCard({ receipt }: { receipt: RentReceiptView }) {
  const rows: [string, string][] = [
    ["Received From", receipt.tenant],
    ["Landlord", receipt.landlord],
    ["Amount", receipt.amountLabel],
    ["Period", receipt.period],
    ["Payment Mode", receipt.payMode],
    ["Property Address", receipt.address],
  ];
  if (receipt.pan) rows.push(["Landlord PAN", receipt.pan]);

  return (
    <article
      id="rent-receipt-preview"
      className="rounded-xl border border-[var(--hairline)] bg-white p-6 shadow-[0_12px_40px_rgba(20,20,19,0.06)] sm:p-8"
    >
      <header className="text-center">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">RENT RECEIPT</h3>
        <span className="mx-auto mt-2 block h-0.5 w-16 bg-coral" />
      </header>

      <div className="mt-6 flex items-start justify-between gap-4 text-sm text-[var(--body)]">
        <p>
          Receipt No: <span className="font-medium text-ink">{receipt.receiptNo}</span>
        </p>
        <p className="shrink-0 tabular-nums">{receipt.date}</p>
      </div>

      <dl className="mt-5 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] gap-3 py-2.5 text-sm">
            <dt className="text-[var(--muted-ink)]">{label}</dt>
            <dd className="font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 text-sm italic text-[var(--body)]">{RENT_RECEIPT_RULES.certification}</p>

      <div className="mt-10 flex items-end justify-between gap-6">
        <div className="flex size-[4.5rem] items-center justify-center rounded-full border border-dashed border-coral text-center text-[10px] font-medium uppercase tracking-wide text-coral">
          Stamp
          <br />
          / Seal
        </div>
        <div className="min-w-[9rem] text-right">
          <div className="mb-2 h-px w-full bg-[var(--hairline)]" />
          <p className="text-xs text-[var(--muted-ink)]">Landlord Signature</p>
        </div>
      </div>

      <p className="mt-8 text-center text-[11px] text-[var(--muted-ink)]">{RENT_RECEIPT_RULES.footer}</p>
    </article>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
      {error ? <p className="mt-1 text-xs text-[var(--error)]">{error}</p> : null}
    </div>
  );
}
