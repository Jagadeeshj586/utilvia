"use client";

import dynamic from "next/dynamic";
import { FINANCE_CONFIGS } from "@/lib/calculators/finance-configs";

const AgeCalculator = dynamic(() => import("@/components/tools/calculators/age-calculator").then((m) => m.AgeCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const CtcCalculator = dynamic(() => import("@/components/tools/calculators/ctc-calculator").then((m) => m.CtcCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const DiscountCalculator = dynamic(() => import("@/components/tools/calculators/discount-calculator").then((m) => m.DiscountCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const FdCalculator = dynamic(() => import("@/components/tools/calculators/fd-calculator").then((m) => m.FdCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const GstCalculator = dynamic(() => import("@/components/tools/calculators/gst-calculator").then((m) => m.GstCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const HourlySalaryCalculator = dynamic(() => import("@/components/tools/calculators/hourly-salary-calculator").then((m) => m.HourlySalaryCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const HraCalculator = dynamic(() => import("@/components/tools/calculators/hra-calculator").then((m) => m.HraCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const NoticePeriodCalculator = dynamic(() => import("@/components/tools/calculators/notice-period-calculator").then((m) => m.NoticePeriodCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const PercentageCalculator = dynamic(() => import("@/components/tools/calculators/percentage-calculator").then((m) => m.PercentageCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const SalaryHikeCalculator = dynamic(() => import("@/components/tools/calculators/salary-hike-calculator").then((m) => m.SalaryHikeCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const TipCalculator = dynamic(() => import("@/components/tools/calculators/tip-calculator").then((m) => m.TipCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const EpfCalculator = dynamic(() => import("@/components/tools/finance/epf-calculator").then((m) => m.EpfCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const PpfCalculator = dynamic(() => import("@/components/tools/finance/ppf-calculator").then((m) => m.PpfCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const GratuityCalculator = dynamic(() => import("@/components/tools/finance/gratuity-calculator").then((m) => m.GratuityCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const LtaCalculator = dynamic(() => import("@/components/tools/finance/lta-calculator").then((m) => m.LtaCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const InflationCalculator = dynamic(() => import("@/components/tools/finance/inflation-calculator").then((m) => m.InflationCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const EmiCalculator = dynamic(() => import("@/components/tools/finance/emi-calculator").then((m) => m.EmiCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const SipCalculator = dynamic(() => import("@/components/tools/finance/sip/sip-calculator").then((m) => m.SipCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const IncomeTaxCalculator = dynamic(() => import("@/components/tools/finance/india-tax-tools").then((m) => m.IncomeTaxCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const TaxRegimeComparison = dynamic(() => import("@/components/tools/finance/india-tax-tools").then((m) => m.TaxRegimeComparison), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const PayStubGenerator = dynamic(() => import("@/components/tools/finance/pay-stub-generator").then((m) => m.PayStubGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const RentReceiptGenerator = dynamic(() => import("@/components/tools/finance/rent-receipt-generator").then((m) => m.RentReceiptGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const MortgageCalculator = dynamic(() => import("@/components/tools/finance/mortgage-calculator").then((m) => m.MortgageCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const LoanEligibilityCalculator = dynamic(() => import("@/components/tools/finance/loan-eligibility-calculator").then((m) => m.LoanEligibilityCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const LabourCode2026SalaryCalculator = dynamic(() => import("@/components/tools/finance/labour-code-2026-salary").then((m) => m.LabourCode2026SalaryCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const CurrencyConverter = dynamic(() => import("@/components/tools/finance/currency-converter").then((m) => m.CurrencyConverter), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const CryptoPriceTracker = dynamic(() => import("@/components/tools/finance/crypto-price-tracker").then((m) => m.CryptoPriceTracker), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const CapitalGainsTaxCalculator = dynamic(() => import("@/components/tools/finance/capital-gains-tax-calculator").then((m) => m.CapitalGainsTaxCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const RdCalculator = dynamic(() => import("@/components/tools/finance/rd-calculator").then((m) => m.RdCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const NpsCalculator = dynamic(() => import("@/components/tools/finance/nps-calculator").then((m) => m.NpsCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const K401Calculator = dynamic(() => import("@/components/tools/finance/k401-calculator").then((m) => m.K401Calculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const RothCompareCalculator = dynamic(() => import("@/components/tools/finance/401k-vs-roth-ira").then((m) => m.RothCompareCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const BonusCalculatorIndia = dynamic(() => import("@/components/tools/finance/bonus-calculator").then((m) => m.BonusCalculatorIndia), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const EsiCalculator = dynamic(() => import("@/components/tools/finance/esi-calculator").then((m) => m.EsiCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const SwpCalculator = dynamic(() => import("@/components/tools/finance/swp-calculator").then((m) => m.SwpCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const DividendYieldCalculator = dynamic(() => import("@/components/tools/finance/dividend-yield-calculator").then((m) => m.DividendYieldCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const GstThresholdChecker = dynamic(() => import("@/components/tools/finance/gst-threshold-checker").then((m) => m.GstThresholdChecker), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const HsaCalculator = dynamic(() => import("@/components/tools/finance/hsa-calculator").then((m) => m.HsaCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const LeaveEncashmentCalculator = dynamic(() => import("@/components/tools/finance/leave-encashment-calculator").then((m) => m.LeaveEncashmentCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const CagrCalculator = dynamic(() => import("@/components/tools/finance/cagr-calculator").then((m) => m.CagrCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const AdvanceTaxCalculator = dynamic(() => import("@/components/tools/finance/advance-tax-calculator").then((m) => m.AdvanceTaxCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const ProfessionalTaxCalculator = dynamic(() => import("@/components/tools/finance/professional-tax-calculator").then((m) => m.ProfessionalTaxCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const W2Vs1099Calculator = dynamic(() => import("@/components/tools/finance/w2-vs-1099-calculator").then((m) => m.W2Vs1099Calculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const SelfEmploymentTaxCalculator = dynamic(() => import("@/components/tools/finance/self-employment-tax-calculator").then((m) => m.SelfEmploymentTaxCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const UsPaycheckCalculatorTool = dynamic(() => import("@/components/tools/finance/us-paycheck-calculator").then((m) => m.UsPaycheckCalculatorTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const FormulaCalculator = dynamic(() => import("@/components/tools/shared/formula-calculator").then((m) => m.FormulaCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });

export function FinanceRouter({ slug }: { slug: string }) {
  switch (slug) {
    case "emi-calculator":
      return <EmiCalculator />;
    case "sip-calculator":
      return <SipCalculator />;
    case "ctc-to-in-hand-salary":
      return <CtcCalculator />;
    case "salary-hike-calculator":
      return <SalaryHikeCalculator />;
    case "fd-calculator":
      return <FdCalculator />;
    case "notice-period-calculator":
      return <NoticePeriodCalculator />;
    case "old-vs-new-tax-regime":
      return <TaxRegimeComparison />;
    case "income-tax-calculator":
      return <IncomeTaxCalculator />;
    case "percentage-calculator":
      return <PercentageCalculator />;
    case "age-calculator":
      return <AgeCalculator />;
    case "gst-calculator":
      return <GstCalculator />;
    case "tip-calculator":
      return <TipCalculator />;
    case "discount-calculator":
      return <DiscountCalculator />;
    case "hourly-to-salary-calculator":
      return <HourlySalaryCalculator />;
    case "hra-calculator":
      return <HraCalculator />;
    case "epf-calculator":
      return <EpfCalculator />;
    case "ppf-calculator":
      return <PpfCalculator />;
    case "gratuity-calculator":
      return <GratuityCalculator />;
    case "lta-calculator":
      return <LtaCalculator />;
    case "inflation-calculator":
      return <InflationCalculator />;
    case "paycheck-calculator":
      return <UsPaycheckCalculatorTool />;
    case "mortgage-calculator":
      return <MortgageCalculator />;
    case "loan-eligibility-calculator":
      return <LoanEligibilityCalculator />;
    case "labour-code-2026-salary":
      return <LabourCode2026SalaryCalculator />;
    case "w2-vs-1099":
      return <W2Vs1099Calculator />;
    case "self-employment-tax":
      return <SelfEmploymentTaxCalculator />;
    case "currency-converter":
      return <CurrencyConverter />;
    case "crypto-price-tracker":
      return <CryptoPriceTracker />;
    case "capital-gains-tax":
      return <CapitalGainsTaxCalculator />;
    case "rd-calculator":
      return <RdCalculator />;
    case "nps-calculator":
      return <NpsCalculator />;
    case "401k-calculator":
      return <K401Calculator />;
    case "401k-vs-roth-ira":
      return <RothCompareCalculator />;
    case "bonus-calculator-india":
      return <BonusCalculatorIndia />;
    case "esi-calculator":
      return <EsiCalculator />;
    case "swp-calculator":
      return <SwpCalculator />;
    case "dividend-yield-calculator":
      return <DividendYieldCalculator />;
    case "gst-threshold-checker":
      return <GstThresholdChecker />;
    case "hsa-calculator":
      return <HsaCalculator />;
    case "leave-encashment-calculator":
      return <LeaveEncashmentCalculator />;
    case "cagr-calculator":
      return <CagrCalculator />;
    case "advance-tax-calculator":
      return <AdvanceTaxCalculator />;
    case "professional-tax-calculator":
      return <ProfessionalTaxCalculator />;
    case "pay-stub-generator":
      return <PayStubGenerator />;
    case "rent-receipt-generator":
      return <RentReceiptGenerator />;
    default: {
      const config = FINANCE_CONFIGS[slug];
      if (!config) {
        return (
          <p className="rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-8 text-center text-sm text-muted-foreground">
            No calculator config for “{slug}” yet.
          </p>
        );
      }
      return <FormulaCalculator key={slug} config={config} />;
    }
  }
}
