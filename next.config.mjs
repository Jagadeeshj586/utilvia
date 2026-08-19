/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.utilvia.net" }],
        destination: "https://utilvia.net/:path*",
        permanent: true,
      },
      { source: "/tools/pdf/compress", destination: "/tools/pdf/compress-pdf", permanent: true },
      { source: "/tools/pdf/merge", destination: "/tools/pdf/merge-pdf", permanent: true },
      { source: "/tools/pdf/split", destination: "/tools/pdf/split-pdf", permanent: true },
      { source: "/tools/pdf/to-image", destination: "/tools/pdf/pdf-to-jpg", permanent: true },
      { source: "/tools/pdf/jpg-to-pdf", destination: "/tools/pdf/image-to-pdf", permanent: true },
      { source: "/tools/pdf/pdf-unlock", destination: "/tools/pdf/remove-pdf-password", permanent: true },
      { source: "/tools/image/compress", destination: "/tools/image/image-compressor", permanent: true },
      { source: "/tools/image/crop", destination: "/tools/image/photo-resizer", permanent: true },
      { source: "/tools/image/image-cropper", destination: "/tools/image/photo-resizer", permanent: true },
      { source: "/tools/svg-to-png", destination: "/tools/image/svg-to-png", permanent: true },
      { source: "/category/calculators", destination: "/category/finance", permanent: true },
      { source: "/category/generators", destination: "/category/other", permanent: true },
      { source: "/category/india", destination: "/category/finance", permanent: true },
      { source: "/tools/calculators/:slug", destination: "/tools/finance/:slug", permanent: true },
      { source: "/tools/generators/password-generator", destination: "/tools/other/password-generator", permanent: true },
      { source: "/tools/generators/qr-code-generator", destination: "/tools/other/qr-code-generator", permanent: true },
      { source: "/tools/generators/lorem-ipsum-generator", destination: "/tools/text/lorem-ipsum-generator", permanent: true },
      { source: "/tools/generators/random-number-generator", destination: "/tools/productivity/random-number-generator", permanent: true },
      { source: "/tools/random-number", destination: "/tools/productivity/random-number-generator", permanent: true },
      { source: "/tools/discount-calculator", destination: "/tools/finance/discount-calculator", permanent: true },
      { source: "/tools/binary-converter", destination: "/tools/developer/binary-converter", permanent: true },
      { source: "/tools/hash-generator", destination: "/tools/developer/hash-generator", permanent: true },
      { source: "/tools/csv-to-json", destination: "/tools/developer/csv-to-json", permanent: true },
      { source: "/tools/regex-tester", destination: "/tools/developer/regex-tester", permanent: true },
      { source: "/tools/html-entity", destination: "/tools/developer/html-entity-encoder", permanent: true },
      { source: "/tools/html-entity-encoder", destination: "/tools/developer/html-entity-encoder", permanent: true },
      { source: "/tools/color-contrast", destination: "/tools/developer/color-contrast-checker", permanent: true },
      { source: "/tools/color-contrast-checker", destination: "/tools/developer/color-contrast-checker", permanent: true },
      { source: "/tools/jwt-decoder", destination: "/tools/developer/jwt-decoder", permanent: true },
      { source: "/tools/morse-code", destination: "/tools/developer/morse-code-converter", permanent: true },
      { source: "/tools/morse-code-converter", destination: "/tools/developer/morse-code-converter", permanent: true },
      { source: "/tools/xml-formatter", destination: "/tools/developer/xml-formatter", permanent: true },
      { source: "/tools/sql-formatter", destination: "/tools/developer/sql-formatter", permanent: true },
      { source: "/tools/epf-calculator", destination: "/tools/finance/epf-calculator", permanent: true },
      { source: "/tools/ppf-calculator", destination: "/tools/finance/ppf-calculator", permanent: true },
      { source: "/tools/gratuity-calculator", destination: "/tools/finance/gratuity-calculator", permanent: true },
      { source: "/tools/lta-calculator", destination: "/tools/finance/lta-calculator", permanent: true },
      { source: "/tools/hourly-to-salary", destination: "/tools/finance/hourly-to-salary-calculator", permanent: true },
      { source: "/tools/hourly-to-salary-calculator", destination: "/tools/finance/hourly-to-salary-calculator", permanent: true },
      { source: "/tools/inflation-calculator", destination: "/tools/finance/inflation-calculator", permanent: true },
      { source: "/tools/text-diff", destination: "/tools/text/text-diff-checker", permanent: true },
      { source: "/tools/text-to-speech", destination: "/tools/text/text-to-speech", permanent: true },
      { source: "/tools/character-counter", destination: "/tools/text/character-counter", permanent: true },
      { source: "/tools/calorie-deficit-calculator", destination: "/tools/student/calorie-deficit-calculator", permanent: true },
      { source: "/tools/compound-interest", destination: "/tools/student/compound-interest", permanent: true },
      { source: "/tools/time-zone-converter", destination: "/tools/student/time-zone-converter", permanent: true },
      { source: "/tools/number-to-words", destination: "/tools/student/number-to-words", permanent: true },
      { source: "/tools/generators/color-palette-generator", destination: "/tools/developer/color-palette-generator", permanent: true },
      { source: "/tools/other/color-palette-generator", destination: "/tools/developer/color-palette-generator", permanent: true },
      { source: "/tools/generators/:slug", destination: "/tools/other/:slug", permanent: true },
      { source: "/tools/india/salary-calculator", destination: "/tools/finance/ctc-to-in-hand-salary", permanent: true },
      { source: "/tools/india/age-calculator-india", destination: "/tools/finance/age-calculator", permanent: true },
      { source: "/tools/india/passport-photo-resizer", destination: "/tools/image/photo-resizer", permanent: true },
      { source: "/tools/india/aadhaar-photo-resizer", destination: "/tools/image/photo-resizer", permanent: true },
      { source: "/tools/india/pan-photo-resizer", destination: "/tools/image/photo-resizer", permanent: true },
      { source: "/tools/finance/emi", destination: "/tools/finance/emi-calculator", permanent: true },
      { source: "/tools/finance/paycheck", destination: "/tools/finance/paycheck-calculator", permanent: true },
      { source: "/tools/dev/json", destination: "/tools/developer/json-formatter", permanent: true },
      { source: "/tools/ip-lookup", destination: "/tools/developer/ip-address-lookup", permanent: true },
      { source: "/tools/developer/ip-lookup", destination: "/tools/developer/ip-address-lookup", permanent: true },
      { source: "/tools/dev/uuid-hash", destination: "/tools/developer/uuid-generator", permanent: true },
      { source: "/tools/productivity/pomodoro", destination: "/tools/productivity/pomodoro-timer", permanent: true },
      { source: "/guides", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
