"use client";

import { AgeCalculator } from "@/components/tools/calculators/age-calculator";
import { CtcCalculator } from "@/components/tools/calculators/ctc-calculator";
import { DiscountCalculator } from "@/components/tools/calculators/discount-calculator";
import { FdCalculator } from "@/components/tools/calculators/fd-calculator";
import { GstCalculator } from "@/components/tools/calculators/gst-calculator";
import { HourlySalaryCalculator } from "@/components/tools/calculators/hourly-salary-calculator";
import { HraCalculator } from "@/components/tools/calculators/hra-calculator";
import { NoticePeriodCalculator } from "@/components/tools/calculators/notice-period-calculator";
import { PercentageCalculator } from "@/components/tools/calculators/percentage-calculator";
import { SalaryHikeCalculator } from "@/components/tools/calculators/salary-hike-calculator";
import { TipCalculator } from "@/components/tools/calculators/tip-calculator";
import { EpfCalculator } from "@/components/tools/finance/epf-calculator";
import { PpfCalculator } from "@/components/tools/finance/ppf-calculator";
import { GratuityCalculator } from "@/components/tools/finance/gratuity-calculator";
import { LtaCalculator } from "@/components/tools/finance/lta-calculator";
import { InflationCalculator } from "@/components/tools/finance/inflation-calculator";
import { EmiCalculator } from "@/components/tools/finance/emi-calculator";
import { SipCalculator } from "@/components/tools/finance/sip/sip-calculator";
import { IncomeTaxCalculator, TaxRegimeComparison } from "@/components/tools/finance/india-tax-tools";
import { PayStubGenerator } from "@/components/tools/finance/pay-stub-generator";
import { RentReceiptGenerator } from "@/components/tools/finance/rent-receipt-generator";
import { MortgageCalculator } from "@/components/tools/finance/mortgage-calculator";
import { LoanEligibilityCalculator } from "@/components/tools/finance/loan-eligibility-calculator";
import { LabourCode2026SalaryCalculator } from "@/components/tools/finance/labour-code-2026-salary";
import { CurrencyConverter } from "@/components/tools/finance/currency-converter";
import { CryptoPriceTracker } from "@/components/tools/finance/crypto-price-tracker";
import { CapitalGainsTaxCalculator } from "@/components/tools/finance/capital-gains-tax-calculator";
import { RdCalculator } from "@/components/tools/finance/rd-calculator";
import { NpsCalculator } from "@/components/tools/finance/nps-calculator";
import { K401Calculator } from "@/components/tools/finance/k401-calculator";
import { RothCompareCalculator } from "@/components/tools/finance/401k-vs-roth-ira";
import { BonusCalculatorIndia } from "@/components/tools/finance/bonus-calculator";
import { EsiCalculator } from "@/components/tools/finance/esi-calculator";
import { SwpCalculator } from "@/components/tools/finance/swp-calculator";
import { DividendYieldCalculator } from "@/components/tools/finance/dividend-yield-calculator";
import { GstThresholdChecker } from "@/components/tools/finance/gst-threshold-checker";
import { HsaCalculator } from "@/components/tools/finance/hsa-calculator";
import { LeaveEncashmentCalculator } from "@/components/tools/finance/leave-encashment-calculator";
import { CagrCalculator } from "@/components/tools/finance/cagr-calculator";
import { AdvanceTaxCalculator } from "@/components/tools/finance/advance-tax-calculator";
import { ProfessionalTaxCalculator } from "@/components/tools/finance/professional-tax-calculator";
import { W2Vs1099Calculator } from "@/components/tools/finance/w2-vs-1099-calculator";
import { SelfEmploymentTaxCalculator } from "@/components/tools/finance/self-employment-tax-calculator";
import { UsPaycheckCalculatorTool } from "@/components/tools/finance/us-paycheck-calculator";
import { FormulaCalculator } from "@/components/tools/shared/formula-calculator";
import { FINANCE_CONFIGS } from "@/lib/calculators/finance-configs";

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
