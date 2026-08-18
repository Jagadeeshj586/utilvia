"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Base64Tool = dynamic(() => import("@/components/tools/dev/base64-tool").then((m) => m.Base64Tool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const ColorPaletteGenerator = dynamic(() => import("@/components/tools/dev/color-palette-generator").then((m) => m.ColorPaletteGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const ColorPickerTool = dynamic(() => import("@/components/tools/dev/color-picker").then((m) => m.ColorPickerTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const CronExpressionGenerator = dynamic(() => import("@/components/tools/dev/cron-expression-generator").then((m) => m.CronExpressionGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const CssGradientGenerator = dynamic(() => import("@/components/tools/dev/css-gradient-generator").then((m) => m.CssGradientGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const UnixTimestampConverter = dynamic(() => import("@/components/tools/dev/unix-timestamp-converter").then((m) => m.UnixTimestampConverter), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const FaviconGenerator = dynamic(() => import("@/components/tools/dev/favicon-generator").then((m) => m.FaviconGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const SubnetCalculator = dynamic(() => import("@/components/tools/dev/subnet-calculator").then((m) => m.SubnetCalculator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const JsonFormatter = dynamic(() => import("@/components/tools/dev/json-formatter").then((m) => m.JsonFormatter), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const HashGeneratorTool = dynamic(() => import("@/components/tools/dev/hash-generator").then((m) => m.HashGeneratorTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const BinaryConverterTool = dynamic(() => import("@/components/tools/dev/binary-converter").then((m) => m.BinaryConverterTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const AspectRatioCalculatorTool = dynamic(() => import("@/components/tools/dev/aspect-ratio-calculator").then((m) => m.AspectRatioCalculatorTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const CsvToJsonTool = dynamic(() => import("@/components/tools/dev/csv-to-json").then((m) => m.CsvToJsonTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const JsonToCsvTool = dynamic(() => import("@/components/tools/dev/json-to-csv").then((m) => m.JsonToCsvTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const DnsLookupTool = dynamic(() => import("@/components/tools/dev/dns-lookup").then((m) => m.DnsLookupTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const RobotsTxtGenerator = dynamic(() => import("@/components/tools/dev/robots-txt-generator").then((m) => m.RobotsTxtGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const HtaccessGenerator = dynamic(() => import("@/components/tools/dev/htaccess-generator").then((m) => m.HtaccessGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const HttpStatusCodesTool = dynamic(() => import("@/components/tools/dev/http-status-codes").then((m) => m.HttpStatusCodesTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const JsonSchemaValidator = dynamic(() => import("@/components/tools/dev/json-schema-validator").then((m) => m.JsonSchemaValidator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const IpAddressLookup = dynamic(() => import("@/components/tools/dev/ip-address-lookup").then((m) => m.IpAddressLookup), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const GlassmorphismGenerator = dynamic(() => import("@/components/tools/dev/glassmorphism-generator").then((m) => m.GlassmorphismGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const BoxShadowGenerator = dynamic(() => import("@/components/tools/dev/box-shadow-generator").then((m) => m.BoxShadowGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const ColorContrastCheckerTool = dynamic(() => import("@/components/tools/dev/color-contrast-checker").then((m) => m.ColorContrastCheckerTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const HtmlEntityEncoderTool = dynamic(() => import("@/components/tools/dev/html-entity-encoder").then((m) => m.HtmlEntityEncoderTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const JwtDecoderTool = dynamic(() => import("@/components/tools/dev/jwt-decoder").then((m) => m.JwtDecoderTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const MorseCodeConverterTool = dynamic(() => import("@/components/tools/dev/morse-code-converter").then((m) => m.MorseCodeConverterTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const RomanNumeralConverterTool = dynamic(() => import("@/components/tools/dev/roman-numeral-converter").then((m) => m.RomanNumeralConverterTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const XmlFormatterTool = dynamic(() => import("@/components/tools/dev/xml-formatter").then((m) => m.XmlFormatterTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const SqlFormatterTool = dynamic(() => import("@/components/tools/dev/sql-formatter").then((m) => m.SqlFormatterTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const SvgCodePreviewer = dynamic(() => import("@/components/tools/dev/svg-code-previewer").then((m) => m.SvgCodePreviewer), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const RegexTesterTool = dynamic(() => import("@/components/tools/dev/regex-tester").then((m) => m.RegexTesterTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const UrlEncoderTool = dynamic(() => import("@/components/tools/dev/url-encoder").then((m) => m.UrlEncoderTool), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const UuidHashGenerator = dynamic(() => import("@/components/tools/dev/uuid-hash").then((m) => m.UuidHashGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });

function MissingTool({ slug }: { slug: string }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-8 text-center text-sm text-muted-foreground">
      No workspace for “{slug}” yet.
    </p>
  );
}

function DeviceBrowserInfo() {
  const [info, setInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const nav = navigator as Navigator & { deviceMemory?: number };
      setInfo({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages?.join(", ") ?? "",
        cookies: String(navigator.cookieEnabled),
        online: String(navigator.onLine),
        hardwareConcurrency: String(navigator.hardwareConcurrency ?? "-"),
        deviceMemory: nav.deviceMemory != null ? `${nav.deviceMemory} GB` : "-",
        screen: `${screen.width} × ${screen.height}`,
        avail: `${screen.availWidth} × ${screen.availHeight}`,
        colorDepth: String(screen.colorDepth),
        viewport: `${window.innerWidth} × ${window.innerHeight}`,
        devicePixelRatio: String(window.devicePixelRatio),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    };
    read();
    window.addEventListener("resize", read);
    window.addEventListener("online", read);
    window.addEventListener("offline", read);
    return () => {
      window.removeEventListener("resize", read);
      window.removeEventListener("online", read);
      window.removeEventListener("offline", read);
    };
  }, []);

  return (
    <div className="grid gap-2">
      {Object.entries(info).map(([key, value]) => (
        <div key={key} className="rounded-lg border border-[var(--hairline)] bg-surface-soft px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{key}</p>
          <p className="break-all font-mono text-sm">{value || "-"}</p>
        </div>
      ))}
    </div>
  );
}

export function DevRouter({ slug }: { slug: string }) {
  switch (slug) {
    case "json-formatter":
      return <JsonFormatter />;
    case "base64-encoder":
      return <Base64Tool />;
    case "url-encoder":
      return <UrlEncoderTool />;
    case "binary-converter":
      return <BinaryConverterTool />;
    case "hash-generator":
      return <HashGeneratorTool />;
    case "csv-to-json":
      return <CsvToJsonTool />;
    case "regex-tester":
      return <RegexTesterTool />;
    case "html-entity-encoder":
      return <HtmlEntityEncoderTool />;
    case "jwt-decoder":
      return <JwtDecoderTool />;
    case "xml-formatter":
      return <XmlFormatterTool />;
    case "sql-formatter":
      return <SqlFormatterTool />;
    case "uuid-generator":
      return <UuidHashGenerator />;
    case "cron-expression-generator":
      return <CronExpressionGenerator />;
    case "subnet-calculator":
      return <SubnetCalculator />;
    case "svg-code-previewer":
      return <SvgCodePreviewer />;
    case "unix-timestamp-converter":
      return <UnixTimestampConverter />;
    case "json-to-csv":
      return <JsonToCsvTool />;
    case "dns-lookup":
      return <DnsLookupTool />;
    case "htaccess-generator":
      return <HtaccessGenerator />;
    case "http-status-codes":
      return <HttpStatusCodesTool />;
    case "json-schema-validator":
      return <JsonSchemaValidator />;
    case "ip-address-lookup":
      return <IpAddressLookup />;
    case "robots-txt-generator":
      return <RobotsTxtGenerator />;
    case "css-gradient-generator":
      return <CssGradientGenerator />;
    case "glassmorphism-generator":
      return <GlassmorphismGenerator />;
    case "box-shadow-generator":
      return <BoxShadowGenerator />;
    case "favicon-generator":
      return <FaviconGenerator />;
    case "color-picker":
      return <ColorPickerTool />;
    case "color-contrast-checker":
      return <ColorContrastCheckerTool />;
    case "color-palette-generator":
      return <ColorPaletteGenerator />;
    case "aspect-ratio-calculator":
      return <AspectRatioCalculatorTool />;
    case "device-browser-info":
      return <DeviceBrowserInfo />;
    case "morse-code-converter":
      return <MorseCodeConverterTool />;
    case "roman-numeral-converter":
      return <RomanNumeralConverterTool />;
    default:
      return <MissingTool slug={slug} />;
  }
}
