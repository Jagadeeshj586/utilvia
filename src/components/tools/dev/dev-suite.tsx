"use client";

import { useEffect, useState } from "react";
import { Base64Tool } from "@/components/tools/dev/base64-tool";
import { ColorPaletteGenerator } from "@/components/tools/dev/color-palette-generator";
import { ColorPickerTool } from "@/components/tools/dev/color-picker";
import { CronExpressionGenerator } from "@/components/tools/dev/cron-expression-generator";
import { CssGradientGenerator } from "@/components/tools/dev/css-gradient-generator";
import { UnixTimestampConverter } from "@/components/tools/dev/unix-timestamp-converter";
import { FaviconGenerator } from "@/components/tools/dev/favicon-generator";
import { SubnetCalculator } from "@/components/tools/dev/subnet-calculator";
import { JsonFormatter } from "@/components/tools/dev/json-formatter";
import { HashGeneratorTool } from "@/components/tools/dev/hash-generator";
import { BinaryConverterTool } from "@/components/tools/dev/binary-converter";
import { AspectRatioCalculatorTool } from "@/components/tools/dev/aspect-ratio-calculator";
import { CsvToJsonTool } from "@/components/tools/dev/csv-to-json";
import { JsonToCsvTool } from "@/components/tools/dev/json-to-csv";
import { DnsLookupTool } from "@/components/tools/dev/dns-lookup";
import { RobotsTxtGenerator } from "@/components/tools/dev/robots-txt-generator";
import { HtaccessGenerator } from "@/components/tools/dev/htaccess-generator";
import { HttpStatusCodesTool } from "@/components/tools/dev/http-status-codes";
import { JsonSchemaValidator } from "@/components/tools/dev/json-schema-validator";
import { IpAddressLookup } from "@/components/tools/dev/ip-address-lookup";
import { GlassmorphismGenerator } from "@/components/tools/dev/glassmorphism-generator";
import { BoxShadowGenerator } from "@/components/tools/dev/box-shadow-generator";
import { ColorContrastCheckerTool } from "@/components/tools/dev/color-contrast-checker";
import { HtmlEntityEncoderTool } from "@/components/tools/dev/html-entity-encoder";
import { JwtDecoderTool } from "@/components/tools/dev/jwt-decoder";
import { MorseCodeConverterTool } from "@/components/tools/dev/morse-code-converter";
import { RomanNumeralConverterTool } from "@/components/tools/dev/roman-numeral-converter";
import { XmlFormatterTool } from "@/components/tools/dev/xml-formatter";
import { SqlFormatterTool } from "@/components/tools/dev/sql-formatter";
import { SvgCodePreviewer } from "@/components/tools/dev/svg-code-previewer";
import { RegexTesterTool } from "@/components/tools/dev/regex-tester";
import { UrlEncoderTool } from "@/components/tools/dev/url-encoder";
import { UuidHashGenerator } from "@/components/tools/dev/uuid-hash";

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
