
export const CATEGORIES = [
  {
    id: "pdf",
    label: "PDF Tools / Document",
    description: "Compress, merge, split, convert, and stamp PDFs in your browser.",
  },
  {
    id: "image",
    label: "Image Tools",
    description: "Compress, convert, resize, and clean up images without uploading them.",
  },
  {
    id: "text",
    label: "Text & Writing",
    description: "Count, convert, compare, and generate text for writing and cleanup.",
  },
  {
    id: "developer",
    label: "Developer Tools",
    description: "Formatters, encoders, generators, and inspectors for daily engineering work.",
  },
  {
    id: "finance",
    label: "Finance & Tax",
    description: "EMI, GST, income tax, salary, SIP, and everyday money calculators.",
  },
  {
    id: "student",
    label: "Student / General Utilities",
    description: "GPA, BMI, unit conversion, dates, and study helpers.",
  },
  {
    id: "productivity",
    label: "Time & Productivity",
    description: "Timers, breathing, recording, and random helpers that stay out of the way.",
  },
  {
    id: "other",
    label: "Other Utilities",
    description: "QR codes, signatures, passwords, and color palettes.",
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export type ToolBadge = "popular" | "new";
export type ToolStatus = "ready" | "soon";
export type ToolIconName =
  | "FileDown"
  | "Combine"
  | "Scissors"
  | "RotateCw"
  | "FileType"
  | "Table"
  | "FileImage"
  | "ImagePlus"
  | "Lock"
  | "Unlock"
  | "FileOutput"
  | "Eraser"
  | "Stamp"
  | "ListOrdered"
  | "Image"
  | "Scaling"
  | "Crop"
  | "RefreshCcw"
  | "ImageMinus"
  | "FileUp"
  | "Palette"
  | "Pipette"
  | "Aperture"
  | "Percent"
  | "Cake"
  | "Calculator"
  | "Landmark"
  | "Home"
  | "Wallet"
  | "Receipt"
  | "Tag"
  | "Activity"
  | "CalendarDays"
  | "Timer"
  | "Coins"
  | "TrendingUp"
  | "Ruler"
  | "Type"
  | "WholeWord"
  | "CaseSensitive"
  | "AlignLeft"
  | "CopyX"
  | "ArrowUpAZ"
  | "FlipHorizontal"
  | "GitCompare"
  | "Link2"
  | "Replace"
  | "Braces"
  | "BadgeCheck"
  | "Binary"
  | "Hash"
  | "Link"
  | "KeyRound"
  | "Code"
  | "Paintbrush"
  | "Regex"
  | "Clock"
  | "Droplet"
  | "FileJson"
  | "FileSpreadsheet"
  | "Database"
  | "QrCode"
  | "Key"
  | "Dices"
  | "Barcode"
  | "AppWindow"
  | "DatabaseZap"
  | "SwatchBook"
  | "Tags"
  | "AlarmClock"
  | "Hourglass"
  | "ListChecks"
  | "StickyNote"
  | "Mic"
  | "Globe"
  | "Users"
  | "IdCard"
  | "IndianRupee"
  | "Building2"
  | "MapPin"
  | "Car"
  | "Volume2";

export type ToolFaq = { question: string; answer: string };
export type RelatedToolRef = { category: CategoryId; slug: string };


export type ToolDefinition = {
  slug: string;
  category: CategoryId;
  name: string;
  heading?: string;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
  icon: ToolIconName;
  badge?: ToolBadge;
  status: ToolStatus;
  privacy: "local" | "mixed";
  fileUpload: boolean;
  related: RelatedToolRef[];
  metaTitle?: string;
  metaDescription?: string;
  rulesBanner?: string;
  rulesBannerFlag?: string;
  searchText: string;
  about?: { paragraphs: string[]; features?: string[] };
  faqs?: ToolFaq[];
};

type ToolInput = {
  slug: string;
  category: CategoryId;
  name: string;
  heading?: string;
  short: string;
  icon: ToolIconName;
  keywords: string[];
  badge?: ToolBadge;
  privacy?: "local" | "mixed";
  fileUpload?: boolean;
  related?: RelatedToolRef[];
  metaTitle?: string;
  metaDescription?: string;
  longDescription?: string;
  rulesBanner?: string;
  rulesBannerFlag?: string;
  about?: unknown;
};

function tool(input: ToolInput): ToolDefinition {
  const fileUpload = input.fileUpload ?? (input.category === "pdf" || input.category === "image");
  const privacy = input.privacy ?? "local";
  const shortDescription = input.short;
  const longDescription =
    input.longDescription ??
    `${input.short} Runs entirely in your browser — no signup, instant results.`;
  const searchText = [input.name, shortDescription, input.category, "ready", ...input.keywords]
    .join(" ")
    .toLowerCase();

  return {
    slug: input.slug,
    category: input.category,
    name: input.name,
    heading: input.heading,
    shortDescription,
    longDescription,
    keywords: input.keywords,
    icon: input.icon,
    badge: input.badge,
    status: "ready",
    privacy,
    fileUpload,
    related: input.related ?? [],
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    rulesBanner: input.rulesBanner,
    rulesBannerFlag: input.rulesBannerFlag,
    searchText,
  };
}

const RAW: ToolInput[] = [
  {
    slug: "compress-pdf",
    category: "pdf",
    name: "PDF Compress",
    short: "Reduce PDF file size while keeping pages readable.",
    icon: "FileDown",
    keywords: ["pdf compress", "reduce pdf size", "compress pdf"],
    badge: "popular",
  },
  {
    slug: "merge-pdf",
    category: "pdf",
    name: "PDF Merge",
    short: "Combine multiple PDFs into one file, in any order.",
    icon: "Combine",
    keywords: ["merge pdf", "combine pdf", "join pdf"],
    badge: "popular",
  },
  {
    slug: "split-pdf",
    category: "pdf",
    name: "PDF Split",
    short: "Split every page into its own PDF or extract specific pages.",
    icon: "Scissors",
    keywords: ["split pdf", "extract pdf pages"],
  },
  {
    slug: "remove-pdf-password",
    category: "pdf",
    name: "Remove PDF Password",
    short: "Unlock password-protected PDFs when you know the password.",
    icon: "Unlock",
    keywords: ["unlock pdf", "remove pdf password", "decrypt pdf"],
  },
  { slug: "rotate-pdf", category: "pdf", name: "PDF Rotate", short: "Rotate one page or every page left or right.", icon: "RotateCw", keywords: ["rotate pdf", "turn pdf pages"] },
  { slug: "pdf-page-numbers", category: "pdf", name: "PDF Page Numbers", short: "Stamp page numbers on every page before you share.", icon: "ListOrdered", keywords: ["pdf page numbers", "paginate pdf"] },
  { slug: "pdf-watermark", category: "pdf", name: "PDF Watermark", short: "Stamp text across PDF pages locally.", icon: "Stamp", keywords: ["pdf watermark", "stamp pdf"] },
  { slug: "pdf-to-jpg", category: "pdf", name: "PDF to JPG", short: "Render PDF pages as JPG or PNG images.", icon: "FileImage", keywords: ["pdf to jpg", "pdf to png", "pdf to image"], badge: "popular" },
  { slug: "pdf-to-word", category: "pdf", name: "PDF to Word", short: "Extract PDF text into an editable Word-friendly document.", icon: "FileType", keywords: ["pdf to word", "pdf to docx"] },
  { slug: "word-to-pdf", category: "pdf", name: "Word to PDF", short: "Convert a .docx file into a printable PDF.", icon: "FileOutput", keywords: ["word to pdf", "docx to pdf"] },
  { slug: "excel-to-pdf", category: "pdf", name: "Excel to PDF", short: "Turn spreadsheet sheets into a PDF table layout.", icon: "Table", keywords: ["excel to pdf", "xlsx to pdf"] },
  { slug: "ppt-to-pdf", category: "pdf", name: "PPT to PDF", short: "Convert PowerPoint slides into a PDF.", icon: "FileUp", keywords: ["ppt to pdf", "pptx to pdf"] },
  { slug: "image-to-pdf", category: "pdf", name: "Image to PDF", short: "Combine JPG, PNG, or WebP photos into one PDF.", icon: "ImagePlus", keywords: ["image to pdf", "jpg to pdf", "png to pdf"], badge: "new" },
  { slug: "word-to-jpg", category: "pdf", name: "Word to JPG Converter", short: "Render a Word document page as a JPG image.", icon: "FileImage", keywords: ["word to jpg", "docx to image"] },

  { slug: "image-compressor", category: "image", name: "Image Compress", short: "Shrink JPEG, PNG, and WebP with a live size preview.", icon: "Image", keywords: ["compress image", "reduce image size"], badge: "popular" },
  { slug: "image-converter", category: "image", name: "Image Converter", short: "Convert between JPEG, PNG, WebP, and more.", icon: "RefreshCcw", keywords: ["convert image", "jpg to png", "png to jpg"] },
  { slug: "heic-to-jpg", category: "image", name: "HEIC to JPG", short: "Convert iPhone HEIC photos to JPG.", icon: "ImagePlus", keywords: ["heic to jpg", "heif converter"] },
  { slug: "webp-to-jpg", category: "image", name: "WebP to JPG", short: "Convert WebP images to JPEG.", icon: "RefreshCcw", keywords: ["webp to jpg", "webp converter"] },
  {
    slug: "background-remover",
    category: "image",
    name: "Background Remover",
    short: "Remove image backgrounds with on-device AI and download a transparent PNG.",
    icon: "ImageMinus",
    keywords: ["remove background", "transparent png", "bg remove", "cutout"],
    badge: "new",
    privacy: "mixed",
  },
  { slug: "photo-resizer", category: "image", name: "Photo Resizer", short: "Resize or crop photos to exact pixels or ID presets.", icon: "Scaling", keywords: ["resize image", "photo resizer", "passport photo"] },
  {
    slug: "svg-to-png",
    category: "image",
    name: "SVG to PNG",
    metaTitle: "SVG to PNG Converter Online Free — Any Resolution",
    metaDescription:
      "Convert SVG to PNG online free at any resolution. Choose transparent or solid background. No signup, conversion happens in your browser.",
    short: "Upload or paste SVG, choose resolution and background, download PNG in your browser.",
    longDescription:
      "Our free SVG to PNG Converter exports vector graphics as raster PNG at any resolution. Choose 1x, 2x, 4x scale or a custom width, with transparent or solid background. Upload an SVG file or paste SVG code, preview the graphic, and download PNG instantly in your browser.",
    icon: "FileImage",
    keywords: ["svg to png converter", "convert svg to png online free", "svg png export", "svg to png"],
  },
  { slug: "color-palette-extractor", category: "image", name: "Color Palette Extractor", short: "Pull dominant colors from any image.", icon: "Palette", keywords: ["extract colors", "image palette", "eyedropper"] },

  { slug: "word-counter", category: "text", name: "Word Counter", short: "Words, characters, keywords, reading time, and platform limits.", icon: "Type", keywords: ["word counter", "reading time"], badge: "popular" },
  {
    slug: "character-counter",
    category: "text",
    name: "Character Counter",
    metaTitle: "Character Counter — Free Online Tool",
    metaDescription:
      "Count characters, words, sentences, and paragraphs in real time. Private, fast, and free — all in your browser.",
    short: "Count characters, words, sentences, and paragraphs in real time. Private, fast, and free.",
    longDescription:
      "Our free Character Counter counts characters, words, sentences, and paragraphs in real time as you type. Perfect for essays, social media posts, meta descriptions, and SEO content limits. All counting happens in your browser — your text never leaves your device.",
    icon: "WholeWord",
    keywords: [
      "character counter",
      "char count",
      "count characters",
      "character count online",
      "word and character counter",
    ],
  },
  { slug: "case-converter", category: "text", name: "Text Case Converter", short: "Switch text to UPPERCASE, lowercase, Title Case, and more.", icon: "CaseSensitive", keywords: ["case converter", "uppercase", "title case"] },
  { slug: "lorem-ipsum-generator", category: "text", name: "Lorem Ipsum Generator", short: "Generate placeholder paragraphs and lists.", icon: "AlignLeft", keywords: ["lorem ipsum", "dummy text"] },
  {
    slug: "text-diff-checker",
    category: "text",
    name: "Text Diff Checker",
    metaTitle: "Text Diff Checker — Compare Text Online Free",
    metaDescription:
      "Compare two texts and highlight added, removed, and unchanged lines. Split or unified view, line numbers, auto-compare — all in your browser.",
    short: "Compare two texts and highlight added, removed, and unchanged lines.",
    longDescription:
      "Our free Text Diff Checker compares two texts and highlights added, removed, and unchanged lines. Use split view or unified diff format. Auto-compare as you type with 500ms debounce, or click Compare for instant results. Line numbers and color-coded highlights make differences easy to spot.",
    icon: "GitCompare",
    keywords: [
      "text diff",
      "compare text",
      "text diff checker",
      "diff tool",
      "compare two texts",
    ],
  },
  {
    slug: "markdown-to-html",
    category: "text",
    name: "Markdown to HTML",
    metaTitle: "Markdown to HTML Converter – Free Online Tool",
    metaDescription:
      "Convert Markdown to clean HTML online for free. Preview your Markdown, copy generated HTML, and download HTML files instantly.",
    short: "Convert Markdown to HTML with live preview. Copy clean HTML output instantly.",
    longDescription:
      "Convert Markdown to HTML with live preview. Copy clean HTML output instantly. Conversion uses the marked library in your browser — your content stays private on your device.",
    icon: "FileType",
    keywords: ["markdown to html", "md converter", "markdown preview", "html converter", "github markdown"],
  },
  {
    slug: "markdown-table-generator",
    category: "text",
    name: "Markdown Table Generator",
    heading: "Markdown Table Generator — Spreadsheet to GitHub Tables",
    metaTitle: "Markdown Table Generator — Spreadsheet to GitHub Tables",
    metaDescription:
      "Build Markdown tables in a spreadsheet editor. Set rows and columns, align cells, preview, then copy or download .md — all in your browser.",
    short: "Build GitHub-flavored Markdown tables in a spreadsheet editor.",
    longDescription:
      "Create Markdown tables with a spreadsheet-like editor. Add or remove rows and columns, align cells, reorder by dragging, and toggle the header row. Live Markdown and preview update as you type. Copy or download a .md file. Everything stays in your browser.",
    icon: "Table",
    keywords: [
      "markdown table",
      "md table",
      "markdown table generator",
      "github table",
      "gfm table",
      "spreadsheet to markdown",
    ],
    badge: "new",
    related: [
      { category: "text", slug: "markdown-to-html" },
      { category: "developer", slug: "csv-to-json" },
      { category: "developer", slug: "json-to-csv" },
    ],
    about: {
      paragraphs: [
        "Our free Markdown Table Generator turns a spreadsheet grid into GitHub-flavored Markdown tables in your browser.",
        "Edit headers and cells, set left/center/right alignment, add or remove rows and columns, and drag to reorder. Pipes and line breaks are escaped so the table stays valid. Bold, italic, and inline code still work inside cells.",
        "Switch between Editor, Markdown, and Preview. Copy the generated Markdown or download a .md file. Nothing is uploaded.",
      ],
      features: [
        "Spreadsheet editor with add/remove rows and columns",
        "Column alignment and optional header row",
        "Live Markdown output, preview, copy, and .md download",
        "Templates for team lists, comparisons, and schedules",
      ],
    },
  },
  {
    slug: "text-to-speech",
    category: "text",
    name: "Text to Speech",
    metaTitle: "Text to Speech Online Free — Convert Text to Audio",
    metaDescription:
      "Type or paste text and listen with your browser voices. Adjust speed and pitch, then download an MP3.",
    short: "Type or paste text, listen with browser voices, and download MP3 audio.",
    longDescription:
      "Our free Text to Speech tool reads your text aloud using your browser's built-in Web Speech API voices. Adjust speed and pitch, play or stop instantly, and download an MP3 file when you need to save the audio.",
    icon: "Volume2",
    keywords: ["text to speech", "tts", "read aloud", "text to audio", "text to speech online free"],
  },
  { slug: "keyword-density", category: "text", name: "Keyword Density Checker", short: "Analyze keyword frequency and density in your content for SEO.", icon: "Tags", keywords: ["keyword density", "seo keywords", "word frequency"] },

  { slug: "json-formatter", category: "developer", name: "JSON Formatter", short: "Pretty-print, minify, validate, and inspect JSON.", icon: "Braces", keywords: ["json formatter", "json validator"], badge: "popular" },
  { slug: "base64-encoder", category: "developer", name: "Base64 Encoder", short: "Encode or decode Base64 text in your browser.", icon: "Binary", keywords: ["base64 encoder", "base64 decoder"] },
  {
    slug: "url-encoder",
    category: "developer",
    name: "URL Encoder",
    short: "Encode and decode URLs instantly. Convert special characters for safe URL usage.",
    longDescription:
      "Encode and decode URLs instantly. Convert special characters for safe URL usage with Component or Full URI modes. Everything runs in your browser — no data is sent to any server.",
    icon: "Link",
    keywords: ["url encoder", "url decoder", "encode uri", "encodeURIComponent", "percent encoding"],
  },
  {
    slug: "binary-converter",
    category: "developer",
    name: "Binary Converter",
    metaTitle: "Binary Converter — Decimal Hex Octal Free",
    metaDescription:
      "Convert between binary, decimal, hexadecimal, and octal number systems instantly. Real-time conversion with copy buttons — free in your browser.",
    short: "Convert between binary, decimal, hexadecimal, and octal number systems instantly.",
    longDescription:
      "Convert between binary, decimal, hexadecimal, and octal number systems instantly. Type in any base and all four formats update in real time with validation, copy buttons, and quick example numbers.",
    icon: "Binary",
    keywords: [
      "binary converter",
      "hex to decimal",
      "decimal to binary",
      "octal converter",
      "number base converter",
    ],
  },
  {
    slug: "hash-generator",
    category: "developer",
    name: "Hash Generator",
    metaTitle: "Hash Generator — MD5 SHA-256 Free Online",
    metaDescription:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files instantly in your browser. Free, private, and no upload required.",
    short: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly in your browser.",
    longDescription:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files instantly in your browser. All four algorithms run simultaneously with one-click copy — nothing leaves your device.",
    icon: "Hash",
    keywords: [
      "hash generator",
      "md5 generator",
      "sha256 hash",
      "sha512 hash",
      "file hash checker",
    ],
  },
  {
    slug: "csv-to-json",
    category: "developer",
    name: "CSV to JSON Converter",
    metaTitle: "CSV to JSON Converter — Free Online",
    metaDescription:
      "Paste CSV or upload a .csv file for instant JSON conversion. Auto-detect delimiter, header row, table preview — all in your browser.",
    short: "Paste CSV data or upload a file for instant JSON conversion.",
    longDescription:
      "Our free CSV to JSON Converter transforms comma-separated data into formatted JSON instantly. Paste CSV text or upload a .csv file — no server upload required. Auto-detect delimiter, support for comma, semicolon, tab, and pipe separators. Toggle header row and whitespace trimming. Preview results as JSON or HTML table.",
    icon: "FileSpreadsheet",
    keywords: [
      "csv to json",
      "csv converter",
      "convert csv to json",
      "csv to json online",
      "spreadsheet to json",
    ],
    fileUpload: true,
    related: [{ category: "developer", slug: "json-to-csv" }],
  },
  {
    slug: "regex-tester",
    category: "developer",
    name: "Regex Tester",
    metaTitle: "Regex Tester — Free Online Regular Expression Tool",
    metaDescription:
      "Test and debug regular expressions with live match highlighting, gims flags, capture groups, and one-click presets for email, URL, phone, date, and hex color.",
    short: "Test regular expressions with live match highlighting and capture groups.",
    longDescription:
      "Our free Regex Tester lets you write, test, and debug regular expressions with live match highlighting. Supports global, case-insensitive, multiline, and dotall flags. See matches with index positions and capture groups, and load common patterns for email, URL, phone numbers, dates, and hex colors.",
    icon: "Regex",
    keywords: [
      "regex tester",
      "regular expression",
      "regex debugger",
      "regex highlighter",
      "test regex online",
    ],
  },
  {
    slug: "html-entity-encoder",
    category: "developer",
    name: "HTML Entity Encoder/Decoder",
    metaTitle: "HTML Entity Encoder Decoder — Free Online",
    metaDescription:
      "Encode and decode HTML entities instantly. Convert <, >, &, quotes, ©, ®, and € to safe entities and back with a common-entity reference table.",
    short: "Encode and decode HTML entities for safe web content.",
    longDescription:
      "Our free HTML Entity tool encodes and decodes HTML entities instantly. Convert special characters like <, >, &, and quotes to safe HTML entities and back. Real-time conversion as you type with encode and decode modes, plus a reference table of common HTML entities.",
    icon: "Code",
    keywords: [
      "html entity encoder",
      "html entity decoder",
      "html entities",
      "encode html",
      "decode html entities",
    ],
  },
  {
    slug: "jwt-decoder",
    category: "developer",
    name: "JWT Decoder",
    metaTitle: "JWT Decoder — Decode & Verify Signatures Online Free",
    metaDescription:
      "Decode and inspect JWT tokens in your browser. Color-coded header, payload, and signature panels with claim labels, expiry badges, and local signature verification.",
    short: "Decode, inspect, and verify JWT tokens locally with claim labels and expiry badges.",
    longDescription:
      "Our free JWT Decoder inspects JSON Web Tokens with jwt.io-style color-coded header, payload, and signature panels. See claims with expanded labels, expiry badges, and human-readable timestamps. Verify HMAC, RSA, and ECDSA signatures client-side using the Web Crypto API — your secret or public key never leaves your browser.",
    icon: "KeyRound",
    keywords: [
      "jwt decoder",
      "decode jwt",
      "jwt inspector",
      "verify jwt signature",
      "json web token",
    ],
  },
  {
    slug: "xml-formatter",
    category: "developer",
    name: "XML Formatter",
    metaTitle: "XML Formatter & Validator — Free Online",
    metaDescription:
      "Format, beautify, minify, and validate XML data instantly in your browser. Copy formatted output with one click.",
    short: "Format, minify, and validate XML data instantly.",
    longDescription:
      "Our free XML Formatter beautifies, minifies, and validates XML data in your browser. Format mode adds indentation for readability. Minify removes whitespace. Validate checks for syntax errors.",
    icon: "Code",
    keywords: ["xml formatter", "xml beautifier", "xml minify", "xml validator"],
  },
  {
    slug: "sql-formatter",
    category: "developer",
    name: "SQL Formatter",
    metaTitle: "SQL Formatter Online Free — Beautify & Format Queries",
    metaDescription:
      "Beautify SQL with keyword capitalization, indentation, and line breaks. Minify mode included. Runs in your browser.",
    short: "Beautify or minify SQL with keyword capitalization and indentation.",
    longDescription:
      "Our free SQL Formatter beautifies queries with keyword capitalization, indentation, and line breaks before major clauses. Toggle minify mode to collapse SQL to a single line. Runs entirely in your browser — your queries are never uploaded.",
    icon: "Database",
    keywords: ["sql formatter", "beautify sql", "minify sql", "format sql online"],
  },
  { slug: "uuid-generator", category: "developer", name: "UUID Generator", short: "Batch UUID v4 identifiers instantly.", icon: "Hash", keywords: ["uuid generator", "guid"] },
  {
    slug: "cron-expression-generator",
    category: "developer",
    name: "Cron Expression Generator",
    metaTitle: "Cron Expression Generator — 5 and 6 Field Schedules",
    metaDescription:
      "Build, parse, and explain cron expressions. Choose minutes, hours, days, and months, or paste an existing schedule. Supports standard 5-field cron and optional seconds.",
    short: "Build, parse, and explain cron schedules with presets and a field editor.",
    longDescription:
      "Generate valid cron expressions by choosing minutes, hours, day of month, month, and day of week — including every, specific values, ranges, and intervals. Paste an existing expression to parse it. Switch between 5-field standard cron and an optional 6-field format with seconds.",
    icon: "Clock",
    keywords: [
      "cron generator",
      "cron expression",
      "crontab",
      "cron schedule",
      "quartz cron",
    ],
    related: [
      { category: "developer", slug: "unix-timestamp-converter" },
      { category: "developer", slug: "regex-tester" },
    ],
    about: {
      paragraphs: [
        "This generator builds cron schedules from field controls or from a pasted expression. Use every, interval, specific values, or ranges for minutes, hours, day of month, month, and day of week.",
        "Standard 5-field cron is the default. Turn on 6-field mode to include seconds for Quartz-style schedulers. Presets cover common jobs such as every 5 minutes, weekdays at 9:00, and the first of the month.",
        "You get a copyable expression, a plain-language description, and a per-field breakdown. Everything runs in your browser.",
      ],
      features: [
        "Field editor for every, interval, specific, and range values",
        "Paste and parse existing cron expressions",
        "5-field standard syntax and optional 6-field seconds",
        "Presets, live validation, copy, and reset",
      ],
    },
  },
  {
    slug: "subnet-calculator",
    category: "developer",
    name: "Subnet Calculator",
    metaTitle: "Subnet Calculator Online Free — CIDR IP Range Tool",
    metaDescription:
      "Enter a CIDR block to see network address, broadcast, subnet mask, wildcard mask, usable hosts, and binary representations. Convert masks to CIDR prefixes.",
    short: "Compute CIDR network details, usable hosts, and mask conversions.",
    longDescription:
      "Enter an IPv4 CIDR block to see network address, broadcast, subnet mask, wildcard mask, total and usable hosts, usable range, and binary representations. Convert a dotted mask to a CIDR prefix and use the quick-reference table for common sizes.",
    icon: "Globe",
    keywords: [
      "subnet calculator",
      "cidr",
      "ip range",
      "subnet mask",
      "wildcard mask",
    ],
    related: [
      { category: "developer", slug: "ip-address-lookup" },
      { category: "developer", slug: "dns-lookup" },
    ],
    about: {
      paragraphs: [
        "This calculator takes an IPv4 CIDR block such as 192.168.1.0/24 and returns network address, broadcast address, subnet mask, wildcard mask, host counts, and the usable IP range.",
        "Convert a dotted-decimal mask back to a prefix, check whether an address sits inside the block, and tap the quick-reference table to apply common sizes like /24 or /30.",
        "All math runs in your browser. Useful for VPC design, firewall rules, and studying subnetting.",
      ],
      features: [
        "Network, broadcast, mask, wildcard, and usable range",
        "Binary representations of network and mask",
        "Mask-to-CIDR conversion",
        "Quick-reference table for common prefixes",
      ],
    },
  },
  {
    slug: "svg-code-previewer",
    category: "developer",
    name: "SVG Code Previewer",
    metaTitle: "SVG Code Previewer Online Free — Live Preview & Editor",
    metaDescription:
      "Edit SVG markup and see a sanitized live preview. Prettify, copy, or download as .svg. Toggle checker, white, or dark backgrounds.",
    short: "Edit SVG markup and see a sanitized live preview.",
    longDescription:
      "Our free SVG Code Previewer renders SVG markup live as you type or paste — split-pane editor with instant preview. Sanitizes input by stripping script tags, event handlers, and other XSS vectors before rendering. Toggle backgrounds, prettify code, copy, and download as .svg.",
    icon: "Paintbrush",
    keywords: ["svg preview", "svg editor", "svg previewer", "preview svg code", "svg beautify"],
    related: [
      { category: "image", slug: "svg-to-png" },
      { category: "developer", slug: "xml-formatter" },
    ],
    about: {
      paragraphs: [
        "Our free SVG Code Previewer renders SVG markup live as you type or paste — split-pane editor with instant preview, no extra libraries required.",
        "Sanitizes input by stripping script tags, event handlers, and other XSS vectors before rendering. Toggle checker, white, or dark backgrounds, prettify code, copy, and download as .svg.",
        "Ideal for checking Figma or Illustrator exports, debugging broken SVG, and editing colors or dimensions directly in code.",
      ],
      features: [
        "Live split-pane editor and preview",
        "Sanitized rendering (scripts and event handlers stripped)",
        "Checker, white, and dark preview backgrounds",
        "Copy, download .svg, and prettify markup",
      ],
    },
  },
  {
    slug: "unix-timestamp-converter",
    category: "developer",
    name: "Unix Timestamp Converter",
    metaTitle: "Unix Timestamp Converter — Epoch to Date",
    metaDescription:
      "Convert Unix/epoch timestamps to dates and back. Auto-detect seconds or milliseconds, pick a time zone, and see a live current timestamp.",
    short: "Convert Unix timestamps and human dates, with time zones.",
    longDescription:
      "Convert Unix/epoch timestamps to readable dates and times, or convert a date and time back to seconds and milliseconds. Auto-detects timestamp length, supports UTC and local time zones, and can show a live current timestamp.",
    icon: "Clock",
    keywords: [
      "unix timestamp",
      "epoch converter",
      "epoch to date",
      "unix time",
      "milliseconds timestamp",
    ],
    badge: "new",
    related: [
      { category: "developer", slug: "cron-expression-generator" },
      { category: "student", slug: "time-zone-converter" },
      { category: "student", slug: "days-between-dates" },
    ],
    about: {
      paragraphs: [
        "Our free Unix Timestamp Converter turns epoch seconds or milliseconds into a readable date, time, and day of week — and converts dates back to Unix time.",
        "Auto-detects whether a value is in seconds or milliseconds from its length. Choose UTC, your local zone, or any IANA time zone. A live current timestamp is available at the top.",
        "Everything runs in your browser. Timestamps stay on your device — no signup required.",
      ],
      features: [
        "Timestamp → Date and Date → Timestamp in separate sections",
        "Seconds, milliseconds, and automatic length detection",
        "UTC, local, and searchable IANA time zones",
        "Live current Unix time, examples, copy, and reset",
      ],
    },
  },
  {
    slug: "json-to-csv",
    category: "developer",
    name: "JSON to CSV Converter",
    metaTitle: "JSON to CSV Converter — Free Online",
    metaDescription:
      "Paste JSON or upload a .json file and convert it to CSV in your browser. Nested objects flatten, with table preview, copy, and download.",
    short: "Convert JSON arrays and objects to CSV with a live table preview.",
    longDescription:
      "Paste JSON or drop a .json file to convert objects and arrays into CSV. Nested fields flatten into columns, headers are detected automatically, and you can preview, copy, or download the result — all in your browser.",
    icon: "FileSpreadsheet",
    keywords: [
      "json to csv",
      "json to csv converter",
      "convert json to csv",
      "json to csv online free",
      "flatten json csv",
    ],
    badge: "new",
    fileUpload: true,
    related: [
      { category: "developer", slug: "csv-to-json" },
      { category: "developer", slug: "json-formatter" },
    ],
    about: {
      paragraphs: [
        "Our free JSON to CSV Converter turns JSON arrays and objects into CSV you can copy or download. Nested objects flatten into dotted column names.",
        "Paste JSON or drop a .json file. Conversion runs as you type, with a table preview, row and column counts, and a download file name you can edit.",
        "Everything stays in your browser. Your JSON is never uploaded to Utilvia servers.",
      ],
      features: [
        "Paste JSON or drag-and-drop a .json file",
        "Nested flattening with automatic headers",
        "Live CSV text and table preview",
        "Copy, download, reset, and row/column counts",
      ],
    },
  },
  {
    slug: "dns-lookup",
    category: "developer",
    name: "DNS Lookup Tool",
    metaTitle: "DNS Lookup — A, AAAA, MX, TXT, NS, and more",
    metaDescription:
      "Look up A, AAAA, CNAME, MX, NS, TXT, SOA, PTR, SRV, and CAA records over HTTPS. Copy answers, TTL, and priority from a public resolver.",
    short: "Look up A, AAAA, MX, TXT, NS, and other DNS records over HTTPS.",
    longDescription:
      "Query public DNS-over-HTTPS resolvers for a hostname or IP. Choose a record type or fetch all supported types, then copy individual values or the full answer set.",
    icon: "Globe",
    keywords: ["dns lookup", "dig", "mx records", "txt records", "ptr lookup", "dns over https"],
    badge: "new",
    privacy: "mixed",
    related: [
      { category: "developer", slug: "ip-address-lookup" },
      { category: "developer", slug: "subnet-calculator" },
      { category: "developer", slug: "http-status-codes" },
    ],
    about: {
      paragraphs: [
        "Our free DNS Lookup Tool queries A, AAAA, CNAME, MX, NS, TXT, SOA, PTR, SRV, and CAA records for any hostname.",
        "Enter a domain, pick a type (or All records), and look it up. Answers show name, value, priority, TTL, and extra fields such as MX preference or SOA serial. Copy one value or the whole result.",
        "Lookups go through a DNS-over-HTTPS resolver on the server. Only the hostname and type are sent. No API keys are exposed in the browser.",
      ],
      features: [
        "A, AAAA, CNAME, MX, NS, TXT, SOA, PTR, SRV, CAA, and All records",
        "Status, response time, and public-resolver source",
        "Sortable table with copy per row",
        "Domain validation, timeout, and empty-result states",
      ],
    },
  },
  {
    slug: "htaccess-generator",
    category: "developer",
    name: ".htaccess Generator",
    metaTitle: ".htaccess Generator — HTTPS, Caching, GZIP & Security",
    metaDescription:
      "Build Apache .htaccess rules for HTTPS redirects, www handling, caching, GZIP, error pages, IP blocks, and file protection. Copy or download in your browser.",
    short: "Build Apache .htaccess rules for HTTPS, caching, GZIP, and security.",
    longDescription:
      "Toggle HTTPS redirects, www handling, custom error pages, browser caching, GZIP, IP blocks, directory listing, and sensitive-file protection. Live preview updates as you edit. Copy or download .htaccess — Apache only.",
    icon: "FileType",
    keywords: [
      "htaccess",
      "htaccess generator",
      "apache rewrite",
      "force https",
      "gzip htaccess",
      "mod_expires",
    ],
    badge: "new",
    related: [
      { category: "developer", slug: "robots-txt-generator" },
      { category: "developer", slug: "http-status-codes" },
      { category: "developer", slug: "dns-lookup" },
    ],
    about: {
      paragraphs: [
        "Our free .htaccess Generator builds Apache configuration rules with toggles for HTTPS redirect, www handling, custom error pages, browser caching, GZIP, IP blocking, and file protection.",
        "The live preview updates as you toggle rules. Copy to the clipboard or download as .htaccess. Short notes explain what each rule does.",
        "Everything runs in your browser — no signup. .htaccess only works on Apache; Nginx uses server-block configuration instead.",
      ],
      features: [
        "HTTPS 301 redirect and force/remove www",
        "Custom 404, 403, and 500 error pages",
        "Browser caching, GZIP, IP blocks, and file protection",
        "Live preview, copy, download, and reset",
      ],
    },
  },
  {
    slug: "http-status-codes",
    category: "developer",
    name: "HTTP Status Codes Reference",
    heading: "HTTP Status Codes Reference — Quick Developer Guide",
    metaTitle: "HTTP Status Codes Reference — Quick Developer Guide",
    metaDescription:
      "Search HTTP 1xx–5xx status codes with meanings, common causes, and what to do. Copy snippets for 200, 401, 403, 404, and 429 — all in your browser.",
    short: "Search HTTP status codes with practical context, causes, and next steps.",
    longDescription:
      "Searchable quick-reference for HTTP 1xx–5xx codes with practical context, common causes, and what to do.",
    icon: "BadgeCheck",
    keywords: [
      "http status codes",
      "status code",
      "404 not found",
      "401 vs 403",
      "500 internal server error",
      "429 too many requests",
    ],
    badge: "new",
    related: [
      { category: "developer", slug: "dns-lookup" },
      { category: "developer", slug: "jwt-decoder" },
      { category: "developer", slug: "htaccess-generator" },
    ],
    about: {
      paragraphs: [
        "Our free HTTP Status Codes Reference covers 30+ standard 1xx–5xx codes with meaning, when you'll see them, common causes, and what to do next.",
        "Search by code number or keyword, then filter by Informational, Success, Redirect, Client, or Server. Copy the status line, and use snippets for 200, 401, 403, 404, and 429.",
        "Everything runs in your browser. Nothing is sent to a server.",
      ],
      features: [
        "1xx through 5xx with practical developer context",
        "Search by code or keyword plus category filters",
        "Copy status line and fetch snippets",
        "FAQs for 401 vs 403, 301 vs 302, 429, and 422 vs 400",
      ],
    },
  },
  {
    slug: "json-schema-validator",
    category: "developer",
    name: "JSON Schema Validator",
    heading: "JSON Schema Validator",
    metaTitle: "JSON Schema Validator Online Free — Draft 7 & 2020",
    metaDescription:
      "Validate JSON data against a JSON Schema in real time. Human-readable errors, Draft 7 and 2020-12, example schemas, and copyable paths.",
    short: "Validate JSON against a schema in real time with readable errors.",
    longDescription:
      "Validate JSON data against a JSON Schema in real time. Supports Draft 7 and Draft 2020-12, example schemas, format validation, and copyable error paths.",
    icon: "BadgeCheck",
    keywords: [
      "json schema validator",
      "json schema",
      "validate json",
      "draft 7",
      "draft 2020-12",
      "ajv",
    ],
    badge: "new",
    related: [
      { category: "developer", slug: "json-formatter" },
      { category: "developer", slug: "json-to-csv" },
      { category: "developer", slug: "jwt-decoder" },
    ],
    about: {
      paragraphs: [
        "Our free JSON Schema Validator checks JSON data against a schema in real-time with human-readable error messages.",
        "Supports Draft 7 and Draft 2020-12, example schemas, format validation, and copyable error paths.",
        "Runs entirely in your browser using Ajv — your JSON never leaves your device.",
      ],
      features: [
        "Live validation as you type",
        "Draft 7 and Draft 2020-12",
        "Person, product, API, and registration examples",
        "Human-readable errors with copyable paths",
      ],
    },
  },
  {
    slug: "ip-address-lookup",
    category: "developer",
    name: "IP Address Lookup",
    heading: "IP Address Lookup — Find Location & ISP",
    metaTitle: "IP Address Lookup — Find Location & ISP Online Free",
    metaDescription:
      "See your public IP or look up any IPv4 address — country, region, city, ISP, timezone, and coordinates. Free, in your browser.",
    short: "See your public IP or look up any IPv4 — country, city, ISP, timezone.",
    longDescription:
      "See your public IP on page load or look up any IPv4 address — country, region, city, ISP, timezone, and coordinates.",
    icon: "MapPin",
    keywords: [
      "ip lookup",
      "ip address lookup",
      "what is my ip",
      "ip geolocation",
      "isp lookup",
      "whois ip",
    ],
    badge: "new",
    privacy: "mixed",
    related: [
      { category: "developer", slug: "dns-lookup" },
      { category: "developer", slug: "subnet-calculator" },
      { category: "developer", slug: "json-formatter" },
    ],
    about: {
      paragraphs: [
        "Our free IP Address Lookup shows your public IP on page load or lets you look up any IPv4 address — country, region, city, ISP, timezone, and coordinates.",
        "My IP mode detects your public IP via ipify in the browser, then geolocates it through our server — so you see your IP, not the hosting server’s.",
        "Geolocation is approximate based on ISP registration data — not your precise street-level location.",
      ],
      features: [
        "My IP detected in the browser via ipify",
        "Look up any public IPv4 address",
        "Country, region, city, ISP, organization, timezone",
        "Coordinates and copyable results",
      ],
    },
  },
  {
    slug: "robots-txt-generator",
    category: "developer",
    name: "robots.txt Generator",
    metaTitle: "robots.txt Generator — Allow, Disallow, Sitemap",
    metaDescription:
      "Build a valid robots.txt with user-agent rules, Allow/Disallow paths, crawl-delay, and sitemap URLs. Copy or download the file in your browser.",
    short: "Build a robots.txt with user-agent rules, paths, and sitemaps.",
    longDescription:
      "Configure crawler groups, Allow and Disallow paths, optional crawl-delay, and sitemap URLs. The file updates as you type. Copy or download a standards-compliant robots.txt — no signup.",
    icon: "Tags",
    keywords: ["robots.txt", "robots txt generator", "disallow", "user-agent", "sitemap", "crawler"],
    badge: "new",
    related: [
      { category: "developer", slug: "htaccess-generator" },
      { category: "developer", slug: "dns-lookup" },
      { category: "developer", slug: "http-status-codes" },
    ],
    about: {
      paragraphs: [
        "Our free robots.txt Generator builds a crawler policy from user-agent groups, Allow and Disallow paths, optional crawl-delay, and sitemap URLs.",
        "Start from Allow all, Block all, Block folders, or an SEO-friendly default. Add more crawlers, edit paths, and watch the file update. Copy or download robots.txt when it looks right.",
        "Everything runs in your browser. The generator uses widely supported directives only — no Host or Noindex lines.",
      ],
      features: [
        "Multiple user-agent groups with Allow and Disallow",
        "SEO, allow-all, block-all, and folder presets",
        "Optional sitemap URLs and crawl-delay",
        "Live preview, validation, copy, download, and reset",
      ],
    },
  },
  {
    slug: "css-gradient-generator",
    category: "developer",
    name: "CSS Gradient Generator",
    metaTitle: "CSS Gradient Generator — Linear, Radial & Conic",
    metaDescription:
      "Design linear, radial, and conic CSS gradients with multiple color stops, opacity, and live preview. Copy HEX, RGB, or HSL CSS in your browser.",
    short: "Design linear, radial, and conic gradients and copy CSS.",
    longDescription:
      "Build linear, radial, and conic CSS gradients with draggable color stops, opacity, and angle controls. Preview live, switch HEX/RGB/HSL, and copy ready-to-paste CSS — all in your browser.",
    icon: "Paintbrush",
    keywords: [
      "css gradient",
      "gradient generator",
      "linear gradient",
      "radial gradient",
      "conic gradient",
      "css background gradient",
    ],
    badge: "new",
    related: [
      { category: "developer", slug: "color-picker" },
      { category: "developer", slug: "color-palette-generator" },
      { category: "developer", slug: "box-shadow-generator" },
    ],
    about: {
      paragraphs: [
        "Our free CSS Gradient Generator lets you design linear, radial, and conic gradients with multiple color stops, then copy the CSS.",
        "Drag stops on the visual bar, pick colors, set opacity and position, and switch HEX, RGB, or HSL. The preview and code update as you edit. Presets give you a Utilvia-flavored starting point.",
        "Everything runs in your browser. Colors and CSS stay on your device — no signup required.",
      ],
      features: [
        "Linear, radial, and conic gradients, including repeating",
        "Draggable color stops with opacity and position",
        "HEX, RGB, and HSL output with a live preview",
        "Copy CSS, reset, adjustable preview size, and presets",
      ],
    },
  },
  {
    slug: "glassmorphism-generator",
    category: "developer",
    name: "Glassmorphism CSS Generator",
    metaTitle: "Glassmorphism CSS Generator — Frosted Glass CSS & Tailwind",
    metaDescription:
      "Generate frosted-glass CSS with live preview. Copy pure CSS, Tailwind classes, or CSS variables. Firefox fallback included. Runs in your browser.",
    short: "Tune frosted-glass CSS and copy CSS, Tailwind, or variables.",
    longDescription:
      "Adjust blur, transparency, saturation, tint, radius, border, and shadow with a live preview. Copy pure CSS, Tailwind classes, or CSS variables — including a Firefox fallback. Six presets and gradient, photo, and dark backgrounds.",
    icon: "Aperture",
    keywords: [
      "glassmorphism",
      "frosted glass css",
      "backdrop-filter",
      "glass css generator",
      "tailwind glassmorphism",
    ],
    badge: "new",
    related: [
      { category: "developer", slug: "css-gradient-generator" },
      { category: "developer", slug: "box-shadow-generator" },
      { category: "developer", slug: "color-picker" },
    ],
    about: {
      paragraphs: [
        "Our free Glassmorphism CSS Generator creates frosted-glass UI effects with a live preview and three export formats — pure CSS, Tailwind classes, and CSS variables.",
        "Adjust blur, transparency, saturation, color tint, border radius, border, and shadow. Six presets plus gradient, photo, and dark preview backgrounds help you see the effect on different scenes.",
        "A Firefox @supports fallback is included automatically. Everything runs in your browser. Colors and CSS stay on your device — no signup required.",
      ],
      features: [
        "Live preview with gradient, photo, and dark backgrounds",
        "Blur, transparency, saturation, tint, radius, border, and shadow",
        "Pure CSS, Tailwind, and CSS variable export",
        "Firefox @supports fallback, presets, copy, and reset",
      ],
    },
  },
  {
    slug: "box-shadow-generator",
    category: "developer",
    name: "CSS Box Shadow Generator",
    metaTitle: "CSS Box Shadow Generator — Multiple Layers, Live Preview",
    metaDescription:
      "Create CSS box-shadows with offset, blur, spread, color, opacity, and inset layers. Live preview, HEX/RGB/HSL, copy, and download — in your browser.",
    short: "Build layered box-shadow CSS with a live preview and copy-ready code.",
    longDescription:
      "Tune horizontal and vertical offset, blur, spread, color, opacity, and inset vs outer shadows. Stack multiple layers, pick a preset, and copy or download formatted CSS. HEX, RGB, and HSL supported. Preview updates as you edit.",
    icon: "AppWindow",
    keywords: [
      "box shadow generator",
      "css box-shadow",
      "box shadow css",
      "inset shadow",
      "css shadow generator",
      "multiple box shadows",
    ],
    badge: "new",
    related: [
      { category: "developer", slug: "css-gradient-generator" },
      { category: "developer", slug: "glassmorphism-generator" },
      { category: "developer", slug: "color-picker" },
    ],
    about: {
      paragraphs: [
        "Our free CSS Box Shadow Generator lets you design one or more box-shadow layers visually, then copy formatted CSS.",
        "Adjust offset, blur, spread, color, and opacity with sliders and numeric fields. Switch inset or outer, stack up to eight layers, and reorder them. Presets give you a Utilvia-flavored starting point. HEX, RGB, and HSL are supported.",
        "The live preview uses the same box-shadow value as the snippet. Copy or download the CSS. Everything runs in your browser — colors and code stay on your device.",
      ],
      features: [
        "Offset, blur, spread, color, opacity, and inset controls",
        "Multiple layers with add, remove, and reorder",
        "HEX, RGB, and HSL output with a live preview",
        "Presets, copy CSS, download, and reset",
      ],
    },
  },
  {
    slug: "favicon-generator",
    category: "developer",
    name: "Favicon Generator",
    short: "Upload an image and get favicon.ico, PNG sizes, and HTML link tags.",
    longDescription:
      "Upload a square image and get favicon.ico, standard PNG sizes (16, 32, 180, 192, 512), and ready-to-paste HTML link tags. Preview how your icon looks in a browser tab, then download everything as a ZIP.",
    icon: "AppWindow",
    keywords: ["favicon generator", "favicon.ico", "apple touch icon", "pwa icon", "favicon png"],
    fileUpload: true,
  },
  {
    slug: "color-picker",
    category: "developer",
    name: "Color Picker",
    metaTitle: "Color Picker – Pick, Convert & Analyze Colors Online",
    metaDescription:
      "Free online color picker and color converter. Pick colors, convert HEX, RGB, HSL, HSV and CMYK values, generate palettes, check contrast, and extract colors from images.",
    short: "Pick, convert, analyze, and export colors with palettes, contrast checks, and image sampling.",
    longDescription:
      "Pick colors visually, convert between HEX, RGB, HSL, HSV, and CMYK, generate palettes and gradients, check WCAG contrast, extract colors from images, and share selections via URL — all locally in your browser.",
    icon: "Pipette",
    keywords: [
      "color picker",
      "hex to rgb",
      "rgb to hex",
      "hsl converter",
      "color contrast checker",
      "palette generator",
      "gradient generator",
      "image color picker",
    ],
  },
  {
    slug: "color-contrast-checker",
    category: "developer",
    name: "Color Contrast Checker",
    metaTitle: "Color Contrast Checker — WCAG Free Online",
    metaDescription:
      "Check WCAG contrast ratios between foreground and background colors. See live preview plus AA/AAA pass-fail badges for normal and large text.",
    short: "Check WCAG contrast between two colors with live preview and AA/AAA badges.",
    longDescription:
      "Our free Color Contrast Checker calculates WCAG contrast ratios between foreground and background colors. Test AA and AAA compliance for normal and large text. Pick colors with native color pickers or enter hex values, swap colors instantly, and see a live text preview with pass/fail badges for each WCAG level.",
    icon: "Droplet",
    keywords: [
      "color contrast checker",
      "wcag contrast",
      "contrast ratio",
      "accessibility contrast",
      "aa aaa contrast",
    ],
    related: [
      { category: "developer", slug: "color-picker" },
      { category: "developer", slug: "color-palette-generator" },
      { category: "developer", slug: "css-gradient-generator" },
    ],
  },
  {
    slug: "color-palette-generator",
    category: "developer",
    name: "Color Palette Generator",
    heading: "Color Palette Generator — Tailwind Scale from Any Hex",
    metaTitle: "Color Palette Generator — Tailwind Scale from Any Hex",
    metaDescription:
      "Generate a complete Tailwind 50–950 color scale from your brand hex. Copy tailwind.config.js or CSS variables with WCAG contrast badges.",
    short: "Generate a Tailwind 50–950 scale from any hex color.",
    longDescription:
      "Create a complete Tailwind CSS 50–950 color scale from any hex using HSL tint and shade generation. Copy tailwind.config.js or CSS variables. Each shade includes a WCAG AA badge for white or black text.",
    icon: "SwatchBook",
    keywords: [
      "color palette generator",
      "tailwind colors",
      "tailwind color scale",
      "css variables",
      "hex to palette",
      "wcag color contrast",
    ],
    badge: "new",
    related: [
      { category: "developer", slug: "color-picker" },
      { category: "developer", slug: "color-contrast-checker" },
      { category: "developer", slug: "css-gradient-generator" },
    ],
    about: {
      paragraphs: [
        "Our free Color Palette Generator creates a complete Tailwind CSS 50–950 color scale from any hex input using HSL-based tint and shade generation.",
        "Copy tailwind.config.js or CSS custom properties. Each shade includes a WCAG AA contrast badge showing whether white or black text passes.",
        "No signup — it runs entirely in your browser. Designed for developers who need brand colors that work across Tailwind utility classes.",
      ],
      features: [
        "Eleven-stop 50–950 scale with your hex at 500",
        "HEX, RGB, and HSL display for every shade",
        "Tailwind config and CSS variable export",
        "WCAG AA white or black text badge on each stop",
      ],
    },
  },
  {
    slug: "aspect-ratio-calculator",
    category: "developer",
    name: "Aspect Ratio Calculator",
    metaTitle: "Aspect Ratio Calculator – Calculate & Resize Dimensions",
    metaDescription:
      "Free aspect ratio calculator to calculate ratios, resize images, and find proportional dimensions for photos, videos, social media, and displays.",
    short: "Calculate, simplify, and resize dimensions while maintaining the correct aspect ratio.",
    longDescription:
      "Calculate, simplify, and resize dimensions while maintaining the correct aspect ratio. Enter width and height to get simplified ratios, scale to new dimensions, pick common presets, and preview proportions instantly — all in your browser.",
    icon: "Ruler",
    keywords: [
      "aspect ratio calculator",
      "16:9 calculator",
      "resize aspect ratio",
      "image dimensions",
      "video aspect ratio",
      "4:3",
      "9:16",
    ],
  },
  { slug: "device-browser-info", category: "developer", name: "Device & Browser Info", short: "See viewport, user agent, and device details.", icon: "AppWindow", keywords: ["user agent", "device info"] },
  {
    slug: "morse-code-converter",
    category: "developer",
    name: "Morse Code Converter",
    metaTitle: "Morse Code Converter — Free Online Translator",
    metaDescription:
      "Convert text to Morse code and back with instant translation. Includes alphabet reference for letters, numbers, and punctuation.",
    short: "Convert text to Morse code and decode Morse back to text instantly.",
    longDescription:
      "Our free Morse Code Converter translates text to Morse code and decodes Morse back to text instantly. Includes a collapsible Morse alphabet reference for letters A–Z, digits 0–9, and common punctuation. Copy output with one click.",
    icon: "Binary",
    keywords: ["morse code", "morse code converter", "morse translator", "text to morse"],
  },
  {
    slug: "roman-numeral-converter",
    category: "developer",
    name: "Roman Numeral Converter",
    metaTitle: "Roman Numeral Converter — Number to Roman & Back",
    metaDescription:
      "Convert numbers to Roman numerals or Roman numerals to numbers instantly. Supports standard notation from 1 to 3999.",
    short: "Convert numbers to Roman numerals or Roman numerals to numbers instantly.",
    longDescription:
      "Our free Roman Numeral Converter converts numbers to Roman numerals and Roman numerals back to numbers instantly. Supports the standard 1–3999 range with proper subtractive notation (IV, IX, etc.) and validates Roman input with round-trip checking.",
    icon: "Hash",
    keywords: ["roman numerals", "roman numeral converter", "number to roman", "roman to number"],
    about: {
      paragraphs: [
        "Our free Roman Numeral Converter converts numbers to Roman numerals and Roman numerals back to numbers instantly. Supports the standard 1–3999 range.",
        "Uses proper subtractive notation (IV for 4, IX for 9, etc.) and validates Roman input with round-trip checking to reject invalid combinations.",
        "Useful for students, writers, and anyone decoding movie sequels, clock faces, outlines, or formal document numbering.",
      ],
      features: [
        "Number → Roman and Roman → Number modes",
        "Standard range 1–3999 with subtractive notation",
        "Live conversion and one-click copy",
        "Quick Roman numeral reference table",
      ],
    },
  },

  { slug: "age-calculator", category: "finance", name: "Age Calculator", short: "Exact age as of today or any cutoff date, plus totals.", icon: "Cake", keywords: ["age calculator", "date of birth"], badge: "new" },
  { slug: "emi-calculator", category: "finance", name: "EMI Calculator", short: "Calculate EMI, total interest, and amortization charts.", icon: "Calculator", keywords: ["emi calculator", "loan emi"], badge: "popular" },
  { slug: "gst-calculator", category: "finance", name: "GST Calculator", short: "Add or remove GST with CGST/SGST split at Indian rates.", icon: "Receipt", keywords: ["gst calculator", "india gst"], badge: "new" },
  { slug: "salary-hike-calculator", category: "finance", name: "Salary Hike Calculator", short: "Convert hike % to new salary, or reverse from a target CTC.", icon: "TrendingUp", keywords: ["salary hike", "increment calculator"] },
  { slug: "ctc-to-in-hand-salary", category: "finance", name: "CTC to In-Hand Salary", short: "In-hand from CTC with 50/20/30 split, PF, PT, and new-regime tax.", icon: "Wallet", keywords: ["in-hand salary", "ctc calculator"], badge: "popular" },
  { slug: "fd-calculator", category: "finance", name: "FD Calculator", short: "FD maturity, EAR, and growth chart with years or months.", icon: "Landmark", keywords: ["fd calculator", "fixed deposit"] },
  { slug: "section-44ada-calculator", category: "finance", name: "Section 44ADA Freelancer Tax Calculator", short: "Estimate presumptive tax for Indian freelancers.", icon: "Receipt", keywords: ["44ada", "freelancer tax"] },
  {
    slug: "sip-calculator",
    category: "finance",
    name: "SIP Calculator",
    short: "Calculate your estimated SIP returns, total investment and future value using our easy-to-use SIP calculator.",
    longDescription:
      "Estimate SIP maturity, total invested amount, and potential returns from monthly contributions. Figures are illustrative and not guaranteed. Actual mutual fund returns may differ.",
    icon: "TrendingUp",
    keywords: [
      "sip calculator",
      "SIP return calculator",
      "mutual fund SIP calculator",
      "SIP investment calculator",
      "SIP maturity calculator",
      "SIP calculator India",
      "monthly SIP calculator",
      "step up SIP calculator",
    ],
    metaTitle: "SIP Calculator – Calculate SIP Returns & Future Value",
    metaDescription: "Calculate your estimated SIP returns, total investment and future value using our easy-to-use SIP calculator.",
    badge: "popular",
    related: [
      { category: "finance", slug: "fd-calculator" },
      { category: "finance", slug: "ppf-calculator" },
      { category: "finance", slug: "emi-calculator" },
    ],
  },
  { slug: "notice-period-calculator", category: "finance", name: "Notice Period Calculator", short: "Last working day, calendar, working-days mode, and buyout.", icon: "CalendarDays", keywords: ["notice period", "last working day"] },
  { slug: "percentage-calculator", category: "finance", name: "Percentage Calculator", short: "X% of Y, X is % of Y, % change, and add/subtract %.", icon: "Percent", keywords: ["percentage calculator"], badge: "popular" },
  { slug: "income-tax-calculator", category: "finance", name: "Income Tax Calculator", short: "Estimate Indian income tax for FY 2025-26.", icon: "Receipt", keywords: ["income tax calculator", "itr"] },
  { slug: "old-vs-new-tax-regime", category: "finance", name: "Old vs New Tax Regime Comparison", short: "Compare old and new Indian tax regimes side by side.", icon: "GitCompare", keywords: ["old vs new regime", "tax regime"] },
  { slug: "tip-calculator", category: "finance", name: "Tip Calculator", short: "Split a bill and calculate tip per person.", icon: "Coins", keywords: ["tip calculator", "bill split"] },
  {
    slug: "discount-calculator",
    category: "finance",
    name: "Discount Calculator",
    metaTitle: "Discount Calculator — Find Sale Price Free",
    metaDescription:
      "Calculate discount amount, percentage off, and final sale price instantly. Three modes for shopping, sales, and price comparison.",
    short: "Calculate discount amount, percentage off, and final sale price instantly.",
    longDescription:
      "Calculate discount amount, percentage off, and final sale price instantly. Use % Off, Find %, or Original Price mode with quick preset buttons — all in your browser.",
    icon: "Tag",
    keywords: [
      "discount calculator",
      "sale price calculator",
      "percent off calculator",
      "find discount percentage",
      "original price calculator",
    ],
  },
  { slug: "hra-calculator", category: "finance", name: "HRA Calculator", short: "Estimate HRA exemption for Indian salaried employees.", icon: "Home", keywords: ["hra calculator", "hra exemption"] },
  {
    slug: "epf-calculator",
    category: "finance",
    name: "EPF Calculator",
    metaTitle: "EPF Calculator — Provident Fund Maturity Free",
    metaDescription:
      "Estimate Employee Provident Fund maturity with employee 12% and employer 3.67% EPF contributions, monthly compounding, salary increments, and year-by-year balance.",
    short: "Estimate EPF maturity with employee and employer contributions and year-by-year growth.",
    longDescription:
      "Our free EPF Calculator estimates Employee Provident Fund maturity based on basic salary, current balance, age, and interest rate. Includes employee 12% contribution and employer 3.67% EPF portion with monthly compounding and annual salary increments.",
    icon: "Landmark",
    keywords: [
      "epf calculator",
      "provident fund calculator",
      "pf maturity calculator",
      "epf maturity",
      "employee provident fund",
    ],
  },
  {
    slug: "ppf-calculator",
    category: "finance",
    name: "PPF Calculator",
    metaTitle: "PPF Calculator India 2026 — Maturity, Interest & Returns Free",
    metaDescription:
      "Calculate Public Provident Fund maturity with year-by-year breakdown, withdrawal rules, and loan eligibility at 7.1% rate.",
    short: "Calculate PPF maturity with year-by-year breakdown, withdrawal rules, and loan eligibility.",
    longDescription:
      "Our free PPF Calculator projects maturity value, total interest earned, and a year-by-year balance table for Public Provident Fund accounts in India. Includes partial withdrawal eligibility (from year 7), loan against PPF rules (years 3–6), and 5-year extension block simulation for tenures beyond 15 years.",
    icon: "Landmark",
    keywords: [
      "ppf calculator",
      "ppf calculator india",
      "public provident fund calculator",
      "ppf maturity calculator",
      "ppf interest calculator",
    ],
  },
  {
    slug: "gratuity-calculator",
    category: "finance",
    name: "Gratuity Calculator",
    metaTitle: "Gratuity Calculator — Free Online India",
    metaDescription:
      "Calculate gratuity amount on retirement or resignation as per Payment of Gratuity Act. Enter salary and years of service.",
    short: "Calculate gratuity on retirement or resignation as per Payment of Gratuity Act.",
    longDescription:
      "Our free Gratuity Calculator computes gratuity amount as per Payment of Gratuity Act 1972 formula for covered establishments. Enter last drawn salary (Basic + DA) and years of service. See formula used, rounded years, and tax-free limit applied.",
    icon: "Wallet",
    keywords: ["gratuity calculator", "gratuity calculator india", "payment of gratuity", "gratuity formula"],
  },
  {
    slug: "lta-calculator",
    category: "finance",
    name: "LTA Calculator",
    metaTitle: "LTA Calculator — Leave Travel Allowance Free",
    metaDescription:
      "Calculate LTA tax exemption for your annual Leave Travel Allowance. See exempt vs taxable amount under Old Tax Regime rules.",
    short: "Calculate LTA tax exemption from LTA received and actual travel expense.",
    longDescription:
      "Our free LTA Calculator computes Leave Travel Allowance tax exemption as per Indian income tax rules. Enter annual LTA received and actual eligible travel expenses to see exempt and taxable amounts for the current 2026–2029 block period.",
    icon: "Globe",
    keywords: ["lta calculator", "leave travel allowance", "lta exemption", "lta tax"],
  },
  {
    slug: "hourly-to-salary-calculator",
    category: "finance",
    name: "Hourly to Salary Calculator",
    metaTitle: "Hourly to Salary Calculator — Free Online",
    metaDescription:
      "Convert hourly wage to annual, monthly, or weekly salary instantly. Also convert salary to hourly with custom hours and weeks.",
    short: "Convert hourly wage to daily, weekly, monthly, and annual salary — or reverse.",
    longDescription:
      "Our free Hourly to Salary Calculator converts hourly wage to daily, weekly, bi-weekly, monthly, and annual salary. Also works in reverse — enter annual salary to get the equivalent hourly rate. Customize hours per week and weeks per year. Supports USD and INR.",
    icon: "Timer",
    keywords: ["hourly to salary", "salary to hourly", "hourly wage calculator", "annual salary calculator"],
  },
  {
    slug: "inflation-calculator",
    category: "finance",
    name: "Inflation Calculator",
    metaTitle: "Inflation Calculator — Free Online Value Calculator",
    metaDescription:
      "Calculate the value of money over time adjusted for inflation. Future and past value modes with purchasing power loss.",
    short: "Calculate future or past value of money adjusted for inflation.",
    longDescription:
      "Our free Inflation Calculator shows how inflation affects money value over time with future and past value modes. Pre-fills average inflation rates for India (6.5%) and US (3.2%) based on currency. Shows purchasing power loss visually.",
    icon: "TrendingUp",
    keywords: ["inflation calculator", "purchasing power", "future value inflation", "past value"],
  },
  {
    slug: "paycheck-calculator",
    category: "finance",
    name: "Paycheck Calculator",
    metaTitle: "Paycheck Calculator Free — Take-Home Pay by Country",
    metaDescription:
      "Estimate take-home pay for the US, India, UK, Canada, Australia, and UAE with country-specific tax, social contributions, and payroll deductions.",
    short: "Estimate take-home pay using each country’s tax, social, and payroll rules.",
    longDescription:
      "Our free Paycheck Calculator estimates take-home pay for the United States, India, United Kingdom, Canada, Australia, and the UAE. Each country applies its own income-tax brackets, social contributions, and typical deductions — US 2026 federal/FICA, India FY 2025-26 new regime with EPF/ESI, UK PAYE and National Insurance, Canada federal/CPP/EI, Australia PAYG and Medicare levy, and untaxed UAE salary. Enter annual or hourly pay, choose frequency, and see net pay per period plus an annual breakdown.",
    icon: "Wallet",
    keywords: [
      "paycheck calculator",
      "take home pay calculator",
      "salary calculator after tax",
      "us paycheck calculator",
      "india salary calculator",
      "uk take home pay",
    ],
    badge: "popular",
    about: {
      paragraphs: [
        "Our free Paycheck Calculator estimates take-home pay using the tax, social-contribution, and payroll rules of the country you select.",
        "Supported countries include the United States (2026 federal brackets and FICA), India (FY 2025-26 new regime, EPF, ESI, professional tax), the United Kingdom (PAYE and Class 1 NI), Canada (federal tax, CPP, EI, and simplified provincial tax), Australia (PAYG and Medicare levy), and the UAE (no personal income tax on salary).",
        "Enter annual salary or hourly wages, pick pay frequency, and add optional retirement or benefit deductions. Results show net take-home for your pay period plus an annual breakdown. Estimates only — not tax advice.",
      ],
      features: [
        "Country selector with local tax and social-contribution rules",
        "US 2026 federal brackets, FICA, and simplified state tax",
        "India new-regime tax, EPF, ESI, and professional tax",
        "UK PAYE, Scottish bands, Canada CPP/EI, Australia Medicare levy, UAE zero tax",
      ],
    },
  },
  {
    slug: "mortgage-calculator",
    category: "finance",
    name: "Mortgage Calculator",
    metaTitle: "Mortgage Calculator Free — US, India, UK, Canada, Australia, UAE",
    metaDescription:
      "Calculate monthly mortgage payments for the US, India, UK, Canada, Australia, and UAE. See principal, interest, LTV, and extra costs in local currency.",
    short: "Estimate monthly home-loan payments, LTV, and extra costs for six countries.",
    longDescription:
      "Our free Mortgage Calculator estimates monthly principal and interest from property price, down payment, rate, and term. Pick the United States, India, the United Kingdom, Canada, Australia, or the UAE to switch currency, labels, and local extras such as HOA, processing charges, or DLD fees.",
    icon: "Home",
    keywords: [
      "mortgage calculator",
      "home loan calculator",
      "EMI calculator",
      "monthly mortgage payment",
      "loan to value",
      "down payment calculator",
    ],
    badge: "new",
    related: [
      { category: "finance", slug: "emi-calculator" },
      { category: "finance", slug: "loan-eligibility-calculator" },
      { category: "finance", slug: "paycheck-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Mortgage Calculator estimates monthly principal and interest from property price, down payment, interest rate, and term — then adds country-specific extras such as property tax, HOA, processing charges, or DLD fees.",
        "Choose the United States, India, the United Kingdom, Canada, Australia, or the UAE. Labels, currency, number formatting, and extra fields update immediately. Down payment can be entered as an amount or a percent; loan amount stays in sync.",
        "Results include monthly payment, principal and interest, additional costs, total interest, total amount paid, and loan-to-value, plus a principal vs interest chart and an optional amortization schedule. Figures are estimates, not a loan offer.",
      ],
      features: [
        "Country selector for US, India, UK, Canada, Australia, and UAE",
        "Local currency, terminology, and extra-cost fields",
        "Monthly payment, LTV, total interest, and total amount paid",
        "Principal vs interest chart and optional amortization schedule",
      ],
    },
  },
  {
    slug: "w2-vs-1099",
    category: "finance",
    name: "W-2 vs 1099 Tax Calculator",
    metaTitle: "W-2 vs 1099 & Employee vs Contractor Tax Calculator",
    metaDescription:
      "Compare employee vs contractor take-home in the US, India, UK, Canada, Australia, and UAE. Estimates for income tax, social contributions, and net pay.",
    short: "Compare employee vs contractor take-home with country-specific tax rules.",
    longDescription:
      "Compare employment and self-employment take-home using local tax rules. The United States uses W-2 vs 1099 terminology; other countries switch to employee vs self-employed, contractor, sole trader, or freelancer labels, currency, and contributions.",
    icon: "GitCompare",
    keywords: [
      "w2 vs 1099",
      "employee vs contractor",
      "self employed tax",
      "1099 calculator",
      "sole trader vs employee",
    ],
    badge: "new",
    related: [
      { category: "finance", slug: "paycheck-calculator" },
      { category: "finance", slug: "self-employment-tax" },
      { category: "finance", slug: "income-tax-calculator" },
    ],
    about: {
      paragraphs: [
        "This calculator compares take-home from traditional employment versus contracting. In the United States that is W-2 vs 1099. Elsewhere it uses employee vs self-employed, independent professional, sole trader, or freelancer labels.",
        "Pick a country to update currency, deductions, social contributions, and filing options. Enter the same gross income for both sides, then add expenses, benefits, and retirement contributions where they apply.",
        "Results show estimated income tax, employee or self-employment contributions, deductions, employer-paid costs, net annual and monthly income, effective rates, and the gap between options. Estimates only — not tax advice.",
      ],
      features: [
        "Country selector for US, India, UK, Canada, Australia, and UAE",
        "Local terminology, currency, and tax categories",
        "Side-by-side net pay, effective rates, and employer costs",
        "Optional comparison chart",
      ],
    },
  },
  {
    slug: "self-employment-tax",
    category: "finance",
    name: "Self-Employment Tax Calculator",
    metaTitle: "Self-Employment Tax Calculator — US, India, UK, Canada, Australia, UAE",
    metaDescription:
      "Estimate self-employment tax, income tax, and social contributions for freelancers and sole traders in the US, India, UK, Canada, Australia, and UAE.",
    short: "Estimate self-employment tax and take-home with country-specific rules.",
    longDescription:
      "Estimate income tax and self-employment or social contributions from freelance, contractor, sole-trader, or professional income. Currency, labels, deductions, and contribution rules update with the selected country.",
    icon: "Receipt",
    keywords: [
      "self employment tax",
      "se tax",
      "freelancer tax",
      "sole trader tax",
      "class 4 ni",
      "cpp self employed",
    ],
    badge: "new",
    related: [
      { category: "finance", slug: "w2-vs-1099" },
      { category: "finance", slug: "paycheck-calculator" },
      { category: "finance", slug: "income-tax-calculator" },
    ],
    about: {
      paragraphs: [
        "This calculator estimates tax and social contributions on self-employment income. In the United States that is self-employment tax (Social Security and Medicare) plus income tax. Other countries switch to local labels such as Class 4 National Insurance, CPP, Medicare levy, or UAE corporate tax.",
        "Choose a country to update currency, filing options, and contribution rules. Enter gross self-employment income, business expenses, other deductions, and retirement or pension contributions.",
        "Results show estimated income tax, self-employment or social contributions, total deductions, net annual and monthly income, effective rate, and a breakdown chart. Estimates only — not tax advice.",
      ],
      features: [
        "Country selector for US, India, UK, Canada, Australia, and UAE",
        "Local terminology, currency, and contribution rules",
        "Net income, effective rate, and tax breakdown",
        "Optional retirement / pension deductions",
      ],
    },
  },
  {
    slug: "loan-eligibility-calculator",
    category: "finance",
    name: "Loan Eligibility Calculator",
    metaTitle: "Loan Eligibility Calculator — US, India, UK, Canada, Australia, UAE",
    metaDescription:
      "Estimate eligible loan amount, monthly payment, and DTI, FOIR, TDS, or DBR for the US, India, UK, Canada, Australia, and UAE. Planning estimates only.",
    short: "Estimate eligible loan amount, monthly payment, and debt ratio by country.",
    longDescription:
      "Our free Loan Eligibility Calculator estimates how much you may be able to borrow from income, existing debts, term, and rate. Pick the United States, India, the United Kingdom, Canada, Australia, or the UAE to switch currency, terminology, credit-score scales, and eligibility rules such as DTI, FOIR, TDS, or DBR.",
    icon: "Landmark",
    keywords: [
      "loan eligibility calculator",
      "how much loan can I get",
      "FOIR calculator",
      "DTI calculator",
      "debt to income",
      "home loan eligibility",
    ],
    badge: "new",
    related: [
      { category: "finance", slug: "mortgage-calculator" },
      { category: "finance", slug: "emi-calculator" },
      { category: "finance", slug: "paycheck-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Loan Eligibility Calculator estimates eligible loan amount, monthly payment, and a country-specific debt ratio from your income, existing obligations, term, and rate.",
        "Choose the United States, India, the United Kingdom, Canada, Australia, or the UAE. Labels, currency, employment types, credit-score scales, and rules such as DTI, FOIR, TDS, or DBR update immediately. Home loans can include a down payment and, in Canada or Australia, a qualifying-rate buffer.",
        "Results show Eligible, May Be Eligible, or Not Eligible plus the factors that drove the estimate. Figures are planning estimates — not a pre-approval or credit decision.",
      ],
      features: [
        "Country selector for US, India, UK, Canada, Australia, and UAE",
        "Local currency, terminology, and eligibility caps",
        "Eligible amount, monthly payment, debt ratio, and estimated rate",
        "Personal, home, and auto loan types with credit and LTV checks",
      ],
    },
  },
  {
    slug: "labour-code-2026-salary",
    category: "finance",
    name: "New Labour Code 2026 Salary Calculator",
    metaTitle: "New Labour Code 2026 Salary Calculator (India & payroll)",
    metaDescription:
      "Estimate take-home salary under India’s Labour Code 2026 wage definition, or switch to US, UK, Canada, Australia, or UAE payroll rules. PF, ESI, tax, and employer cost.",
    short: "Estimate take-home under India’s Labour Code 2026, or country payroll rules.",
    longDescription:
      "Model India’s Code on Wages 50% wage floor, EPF Scheme 2026, ESI, gratuity, and income tax — or switch country to use US FICA, UK PAYE, Canada CPP/EI, Australia Super, or UAE salary rules. Employee deductions and employer contributions are shown separately.",
    icon: "Users",
    keywords: [
      "labour code 2026 salary calculator",
      "new labour code 2026",
      "50% basic wage",
      "code on wages",
      "EPF scheme 2026",
      "wage code salary",
      "CTC to in hand 2026",
    ],
    badge: "new",
    related: [
      { category: "finance", slug: "paycheck-calculator" },
      { category: "finance", slug: "ctc-to-in-hand-salary" },
      { category: "finance", slug: "epf-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free New Labour Code 2026 Salary Calculator estimates statutory wages, employee and employer contributions, income tax, take-home, and employer cost from annual CTC and salary components.",
        "India applies the Labour Codes in force from 21 November 2025, including the 50% wage floor and EPF Scheme 2026. Choose the United States, United Kingdom, Canada, Australia, or the UAE to switch to that country’s payroll framework instead.",
        "Results distinguish deductions from your pay versus employer contributions that raise CTC. Figures are estimates and may vary with laws, employer policy, location, and individual circumstances.",
      ],
      features: [
        "Country selector for India, US, UK, Canada, Australia, and UAE",
        "India Labour Code 2026 wage floor, PF ceiling, ESI, and gratuity",
        "Employee deductions vs employer contributions, shown separately",
        "Take-home, monthly pay, employer cost, and a salary-breakdown chart",
      ],
    },
  },
  {
    slug: "currency-converter",
    category: "finance",
    name: "Currency Converter",
    metaTitle: "Currency Converter — Live Exchange Rates",
    metaDescription:
      "Convert between 50+ currencies with live mid-market rates, flags, and searchable codes. Swap USD, INR, EUR, AED, and more in your browser.",
    short: "Convert currencies with live mid-market rates, flags, and search.",
    longDescription:
      "Convert an amount between global currencies using regularly updated mid-market rates. Search by country or ISO code, swap with one click, and copy the result. Rates are approximate and may differ from banks.",
    icon: "IndianRupee",
    keywords: [
      "currency converter",
      "usd to inr",
      "exchange rate",
      "eur to usd",
      "live currency conversion",
    ],
    badge: "new",
    privacy: "mixed",
    related: [
      { category: "finance", slug: "crypto-price-tracker" },
      { category: "finance", slug: "paycheck-calculator" },
      { category: "finance", slug: "mortgage-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Currency Converter turns an amount from one currency into another using mid-market exchange rates.",
        "Search USD, INR, EUR, GBP, AED, and dozens more by name or code. Popular pairs, inverse rates, and the provider’s last update time are shown with the result.",
        "Only the from-currency code is sent to the rate API. Your amount stays in the browser. Rates are approximate and can differ from banks or card networks.",
      ],
      features: [
        "Searchable From and To currency lists with flags",
        "Live conversion, swap, and popular pairs",
        "Inverse rate and last-updated time",
        "Copy result, reset, and refresh rates",
      ],
    },
  },
  {
    slug: "crypto-price-tracker",
    category: "finance",
    name: "Crypto Price Tracker",
    metaTitle: "Crypto Price Tracker — Live Bitcoin, ETH, SOL, XRP",
    metaDescription:
      "Track Bitcoin, Ethereum, Solana, XRP, and the top 50 coins with near-real-time prices, 24h change, market cap, volume, and a 7-day chart. USD, EUR, GBP, INR, and AED.",
    short: "Track top crypto prices with 24h stats, search, and auto-refresh.",
    longDescription:
      "Watch near-real-time prices for Bitcoin, Ethereum, Solana, XRP, and other major coins. Search by name or ticker, switch fiat currency, and auto-refresh on a 15–60 second interval. Market data is approximate and may differ from exchanges.",
    icon: "TrendingUp",
    keywords: [
      "crypto price tracker",
      "bitcoin price",
      "ethereum price",
      "solana",
      "xrp",
      "live crypto prices",
    ],
    badge: "new",
    privacy: "mixed",
    related: [
      { category: "finance", slug: "currency-converter" },
      { category: "finance", slug: "sip-calculator" },
      { category: "finance", slug: "cagr-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Crypto Price Tracker shows near-real-time prices for the top 50 coins by market cap, including Bitcoin, Ethereum, Solana, and XRP.",
        "Search by name or ticker, quote in USD, EUR, GBP, INR, or AED, and auto-refresh every 15, 30, or 60 seconds. Select a coin for rank, 24-hour high/low, market cap, volume, and a 7-day sparkline.",
        "Only the quote currency is sent to the market API. There is no wallet connection. Prices are approximate and can differ from an exchange at trade time.",
      ],
      features: [
        "Top 50 coins with logos, price, and 24h change",
        "Search, fiat switcher, and popular-coin chips",
        "7-day sparkline for the selected coin",
        "Configurable auto-refresh with pause when the tab is hidden",
      ],
    },
  },
  {
    slug: "capital-gains-tax",
    category: "finance",
    name: "Capital Gains Tax Calculator – India",
    metaTitle: "Capital Gains Tax Calculator India — STCG & LTCG",
    metaDescription:
      "Estimate Indian short-term and long-term capital gains tax on listed equity, mutual funds, property, gold, and other assets. AY 2026–27 rates, cess, and holding-period classification.",
    short: "Estimate Indian STCG and LTCG on equity, funds, property, gold, and other assets.",
    longDescription:
      "Enter asset type, purchase and sale details, and optional exemptions. The calculator classifies STCG vs LTCG, applies AY 2026–27 special rates where relevant, adds health and education cess, and shows estimated tax and net gain after tax.",
    icon: "Receipt",
    keywords: [
      "capital gains tax calculator",
      "stcg calculator",
      "ltcg calculator",
      "india capital gains",
      "equity capital gains tax",
      "property ltcg",
    ],
    badge: "new",
    related: [
      { category: "finance", slug: "income-tax-calculator" },
      { category: "finance", slug: "gst-calculator" },
      { category: "finance", slug: "sip-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Capital Gains Tax Calculator estimates Indian STCG and LTCG on listed equity, equity mutual funds, other securities, property, gold, and other assets.",
        "Pick an asset, enter purchase and sale dates and amounts, then calculate. Holding period is classified automatically. Listed equity uses 20% STCG and 12.5% LTCG above ₹1.25 lakh for AY 2026–27. Property acquired before 23 July 2024 can compare 12.5% without indexation and 20% with indexation.",
        "Rates, holding periods, cess, and CII values live in a rules file so they can be updated when the law changes. Figures are planning estimates, not tax advice. Everything runs in your browser.",
      ],
      features: [
        "STCG vs LTCG from asset type and holding period",
        "Special 111A / 112A rates for listed equity and equity funds",
        "Property indexation choice where still allowed",
        "Cess, exemptions, breakdown, and net gain after tax",
      ],
    },
  },
  {
    slug: "rd-calculator",
    category: "finance",
    name: "RD Calculator",
    metaTitle: "RD Calculator India — Recurring Deposit Maturity",
    metaDescription:
      "Estimate Indian recurring deposit maturity from monthly deposit, tenure, interest rate, and compounding. See principal vs interest and a month-by-month schedule.",
    short: "Estimate recurring deposit maturity, interest, and a month-by-month schedule.",
    longDescription:
      "Enter a monthly RD installment, annual rate, and tenure in years or months. Choose compounding and a bank-style calculation method. See deposited amount, interest, maturity, and an optional deposit schedule — estimates only.",
    icon: "Landmark",
    keywords: [
      "rd calculator",
      "recurring deposit calculator",
      "rd maturity calculator",
      "rd interest calculator",
      "recurring deposit india",
    ],
    badge: "new",
    rulesBanner: "Based on Indian banking RD rules \u2014 quarterly compounding, TDS thresholds",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "fd-calculator" },
      { category: "finance", slug: "sip-calculator" },
      { category: "finance", slug: "ppf-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free RD Calculator estimates the maturity value of an Indian recurring deposit from monthly installment, tenure, interest rate, and compounding frequency.",
        "Choose quarterly compounding (the usual bank convention), monthly, or yearly. Switch between the standard installment formula and a model that credits interest only at compounding dates. Results update as you type. Open the optional month-by-month schedule to see each deposit.",
        "Figures are planning estimates. Actual maturity can vary by bank, rounding, rate reset, and TDS. Everything runs in your browser.",
      ],
      features: [
        "Monthly deposit, rate, and tenure in years or months",
        "Configurable compounding and calculation method",
        "Principal vs interest breakdown",
        "Year-by-year growth and optional monthly schedule",
      ],
    },
  },
  {
    slug: "nps-calculator",
    category: "finance",
    name: "NPS Calculator",
    metaTitle: "NPS Calculator India — Pension & Corpus Estimate",
    metaDescription:
      "Estimate NPS retirement corpus, lump-sum withdrawal, monthly pension, and 80CCD tax savings. Year-by-year growth, in your browser.",
    short: "Estimate NPS corpus, lump sum, monthly pension, and 80CCD tax savings.",
    longDescription:
      "Enter age, monthly contribution, current corpus, expected return, contribution step-up, and annuity mix. See estimated corpus, lump sum, pension, and a year-by-year table — planning estimates based on PFRDA NPS rules.",
    icon: "Landmark",
    keywords: [
      "nps calculator",
      "nps calculator india",
      "national pension system",
      "nps pension",
      "80ccd",
      "nps corpus",
    ],
    badge: "new",
    rulesBanner: "Based on PFRDA NPS guidelines \u2014 FY 2026\u201327, 80CCD tax benefits",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "ppf-calculator" },
      { category: "finance", slug: "epf-calculator" },
      { category: "finance", slug: "sip-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free NPS Calculator projects National Pension System corpus at retirement, lump-sum withdrawal, monthly pension, and Section 80CCD tax savings.",
        "Adjust current age, retirement age, monthly contribution, existing corpus, expected return, contribution increase, annuity percentage, and annuity rate. Results update as you type. Open the year-by-year table and optional corpus chart to see growth.",
        "Assumptions live in a rules file so contribution limits, annuity minima, and 80CCD caps can be updated when PFRDA or tax law changes. Figures are planning estimates, not guaranteed returns. Everything runs in your browser.",
      ],
      features: [
        "Age, contribution, return, and annuity workflow",
        "Lump-sum vs annuity split and estimated monthly pension",
        "Contributions vs returns chart and year-by-year projection",
        "80CCD old-regime tax illustration and new-regime note",
      ],
    },
  },
  {
    slug: "401k-calculator",
    category: "finance",
    name: "401(k) Calculator 2026",
    metaTitle: "401(k) Calculator 2026 — Retirement Savings Projector",
    metaDescription:
      "Project 401(k) balance at retirement with 2026 IRS limits, employer match, catch-up, and Traditional vs Roth tax notes. Year-by-year growth in your browser.",
    short: "Project 401(k) growth with 2026 IRS limits, employer match, and Roth vs Traditional.",
    longDescription:
      "Enter age, salary, deferral, employer match, and return assumptions. 2026 IRS elective, catch-up, and annual-additions limits apply automatically. See estimated balance, income, and a year-by-year table — planning estimates only.",
    icon: "TrendingUp",
    keywords: [
      "401k calculator",
      "401(k) calculator",
      "401k calculator 2026",
      "employer match",
      "roth 401k",
      "catch-up contribution",
    ],
    badge: "new",
    rulesBanner: "Based on 2026 IRS 401(k) contribution limits",
    rulesBannerFlag: "🇺🇸",
    related: [
      { category: "finance", slug: "paycheck-calculator" },
      { category: "finance", slug: "401k-vs-roth-ira" },
      { category: "finance", slug: "hsa-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free 401(k) Calculator projects retirement balance with 2026 IRS contribution limits applied by age — including SECURE 2.0 super catch-up for ages 60–63.",
        "Set salary, employee deferral as a percent or dollar amount, employer match, salary growth, and expected return. Compare Traditional and Roth tax treatment. Results update as you type, with a contribution vs growth chart and year-by-year table.",
        "Limits live in a rules file so elective deferrals, catch-up, and the annual additions cap can be updated when the IRS publishes new COLAs. Figures are planning estimates, not guaranteed returns. Everything runs in your browser.",
      ],
      features: [
        "Personal details, contributions, match, and assumptions workflow",
        "2026 elective, catch-up, super catch-up, and 415(c) caps",
        "Employer match, Traditional vs Roth illustration, and 4% rule income",
        "Contribution vs growth chart and year-by-year projection",
      ],
    },
  },
  {
    slug: "leave-encashment-calculator",
    category: "finance",
    name: "Leave Encashment Calculator",
    metaTitle: "Leave Encashment Calculator India — Tax Exemption 2026",
    metaDescription:
      "Calculate leave encashment for private and government formulas, with Budget 2023 ₹25 lakh retirement exemption, tax payable, and net amount after tax.",
    short: "Estimate leave encashment, tax exemption, and net amount after tax.",
    longDescription:
      "Enter monthly basic salary and leave days. Choose during-service or retirement, private (÷26) or government (÷300), and a tax slab. See encashment, exemption, tax, and net after tax — planning estimates only.",
    icon: "CalendarDays",
    keywords: [
      "leave encashment calculator",
      "leave encashment calculator india",
      "leave encashment tax exemption",
      "el encashment calculator",
      "25 lakh leave encashment",
    ],
    badge: "new",
    rulesBanner: "Based on Indian Income Tax rules \u2014 Budget 2023 \u20b925L exemption",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "gratuity-calculator" },
      { category: "finance", slug: "lta-calculator" },
      { category: "finance", slug: "income-tax-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Leave Encashment Calculator computes encashment for private and government sector formulas, with tax exemption under Budget 2023’s ₹25 lakh limit.",
        "Choose during-service (fully taxable) vs retirement or resignation (partially exempt). See the exemption breakdown, tax at your slab, and net amount after tax. Results update as you type.",
        "Limits live in a rules file so the statutory exemption and day-basis formulas can be updated when tax law changes. Figures are planning estimates. Confirm the calculation basis with your employer HR policy. Everything runs in your browser.",
      ],
      features: [
        "Private ÷26 and government ÷300 formulas",
        "During-service vs retirement / resignation tax treatment",
        "Budget 2023 ₹25 lakh exemption breakdown",
        "Tax payable and net amount after tax, with copy",
      ],
    },
  },
  {
    slug: "cagr-calculator",
    category: "finance",
    name: "CAGR Calculator",
    metaTitle: "CAGR Calculator India — Compound Annual Growth Rate",
    metaDescription:
      "Calculate CAGR, future value, or required growth rate. Compare absolute vs annualised returns, Rule of 72, and inflation-adjusted real CAGR.",
    short: "Find CAGR, future value, or the rate needed to reach a target.",
    longDescription:
      "Enter start value, end value or expected rate, and years. See CAGR, absolute return, real CAGR after inflation, and Rule of 72 doubling time. Compare against Indian FD, PPF, and Nifty 50 benchmarks — planning estimates only.",
    icon: "TrendingUp",
    keywords: [
      "cagr calculator",
      "cagr calculator india",
      "compound annual growth rate",
      "required cagr",
      "absolute return vs cagr",
      "rule of 72",
    ],
    badge: "new",
    rulesBanner: "Based on Indian investment return benchmarks \u2014 FY 2026-27",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "sip-calculator" },
      { category: "finance", slug: "fd-calculator" },
      { category: "finance", slug: "inflation-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free CAGR Calculator computes compound annual growth rate in three modes — find CAGR from initial and final values, project future value from an expected rate, or calculate the required CAGR to reach a target.",
        "See absolute return vs CAGR, real CAGR after inflation, Rule of 72 doubling time, and India investment benchmarks (FD, PPF, Nifty 50). Future-value mode includes an optional year-by-year table.",
        "Inflation and benchmark bands live in a rules file so they can be updated without changing the UI. CAGR is for lump-sum start and end values, not SIPs. Figures are planning estimates. Everything runs in your browser.",
      ],
      features: [
        "Find CAGR, future value, or required rate",
        "Absolute return vs annualised CAGR",
        "Inflation-adjusted real CAGR and Rule of 72",
        "India benchmarks and a year-by-year growth table",
      ],
    },
  },
  {
    slug: "ssy-calculator",
    category: "finance",
    name: "SSY Calculator",
    heading: "SSY Calculator — Sukanya Samriddhi Yojana Returns",
    metaTitle: "SSY Calculator — Sukanya Samriddhi Yojana Returns",
    metaDescription:
      "Calculate SSY maturity amount, interest earned, partial withdrawal at 18, and year-by-year growth at the current 8.2% rate.",
    short: "Project Sukanya Samriddhi Yojana maturity.",
    longDescription:
      "Calculate SSY maturity amount, interest earned, partial withdrawal at 18, and year-by-year growth at the current 8.2% rate.",
    icon: "Users",
    keywords: ["ssy calculator", "sukanya", "sukanya samriddhi yojana"],
  },
  {
    slug: "advance-tax-calculator",
    category: "finance",
    name: "Advance Tax Calculator",
    heading: "Advance Tax Calculator India FY 2026-27",
    metaTitle: "Advance Tax Calculator India FY 2026-27 — Due Dates",
    metaDescription:
      "Calculate advance tax liability, eligibility, and the June, September, December, and March installment schedule. New and old regime, with Section 44ADA single payment.",
    short: "Estimate FY 2026-27 advance tax and the four installment due dates.",
    longDescription:
      "Enter estimated annual income, income type, TDS, and tax regime. See total tax, whether advance tax is required, and amounts due on 15 June, 15 September, 15 December, and 15 March — planning estimates only.",
    icon: "CalendarDays",
    keywords: [
      "advance tax calculator",
      "advance tax calculator india",
      "advance tax due dates",
      "section 234b",
      "section 44ada advance tax",
    ],
    badge: "new",
    rulesBanner: "Based on Indian Income Tax rules \u2014 Advance tax FY 2026-27",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "income-tax-calculator" },
      { category: "finance", slug: "old-vs-new-tax-regime" },
      { category: "finance", slug: "section-44ada-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Advance Tax Calculator computes estimated tax liability and the four-instalment schedule for FY 2026-27 — 15 June (15%), 15 September (45%), 15 December (75%), and 15 March (100%).",
        "Handles salaried employees with additional income, business/freelancers, and Section 44ADA’s single March payment. See eligibility after TDS and a Section 234B/234C interest warning.",
        "Slabs, rebate limits, and due dates live in a rules file so they can be updated when the law changes. Figures are planning estimates. Confirm with a CA before paying. Everything runs in your browser.",
      ],
      features: [
        "New and old regime tax with 4% cess",
        "Salaried, business, and Section 44ADA modes",
        "Eligibility check after TDS",
        "Installment amounts with copy on each due date",
      ],
    },
  },
  {
    slug: "professional-tax-calculator",
    category: "finance",
    name: "Professional Tax Calculator",
    heading: "Professional Tax Calculator India — All States 2026",
    metaTitle: "Professional Tax Calculator India — All States 2026",
    metaDescription:
      "Calculate state-wise professional tax for all 18 PT-levying states. Maharashtra women's exemption and February quirk included.",
    short: "Calculate state-wise professional tax for all 18 PT-levying Indian states.",
    longDescription:
      "Compute monthly and annual professional tax for all 18 Indian states that levy PT, including Maharashtra women’s exemption and the February ₹300 adjustment. See Section 16(iii) income-tax saving at a 30% bracket.",
    icon: "Building2",
    keywords: [
      "professional tax",
      "pt calculator",
      "professional tax calculator india",
      "maharashtra professional tax",
      "karnataka professional tax",
      "section 16(iii)",
    ],
    badge: "new",
    rulesBanner: "Based on Indian state Professional Tax slabs \u2014 FY 2026-27",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "income-tax-calculator" },
      { category: "finance", slug: "ctc-to-in-hand-salary" },
      { category: "finance", slug: "advance-tax-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Professional Tax Calculator computes state-wise PT for all 18 Indian states that levy professional tax, with Maharashtra women’s exemption and February ₹300 quirk.",
        "Shows monthly PT, annual PT, February adjustment, and Section 16(iii) income tax saving estimate at 30% bracket.",
        "No signup — it runs entirely in your browser. Your salary data stays private.",
      ],
      features: [
        "All 18 PT-levying state slabs for FY 2026-27",
        "Maharashtra women’s exemption and February ₹300 adjustment",
        "Section 16(iii) tax-saving estimate at 31.2%",
        "Copy annual PT and a no-PT state option",
      ],
    },
  },
  {
    slug: "pay-stub-generator",
    category: "finance",
    name: "Pay Stub Generator",
    heading: "Pay Stub Generator — US, India, UK, Canada, Australia, UAE",
    metaTitle: "Pay Stub Generator — US, India, UK, Canada, Australia, UAE",
    metaDescription:
      "Create a sample pay stub for the United States, India, the UK, Canada, Australia, or the UAE. Local currency, taxes, and contributions, then print or download a PDF in your browser.",
    short: "Create a sample pay stub with country-specific payroll estimates.",
    longDescription:
      "Choose a country, enter employer and employee details, then add earnings and deductions. Currency, labels, taxes, and social contributions follow local payroll estimates. Preview live, print, or download a PDF. Sample documents only — not official payslips.",
    icon: "FileType",
    keywords: [
      "pay stub",
      "payslip generator",
      "salary slip",
      "paycheck stub",
      "earnings statement",
      "free pay stub generator",
      "india salary slip",
      "uk payslip",
    ],
    badge: "new",
    rulesBanner: "Sample payroll estimates for the US, India, UK, Canada, Australia, and UAE \u2014 not official payslips",
    related: [
      { category: "finance", slug: "paycheck-calculator" },
      { category: "finance", slug: "401k-calculator" },
      { category: "finance", slug: "professional-tax-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Pay Stub Generator creates sample pay stubs for the United States, India, the United Kingdom, Canada, Australia, and the UAE — entirely in your browser.",
        "Pick a country to switch currency, document title, earnings categories, and estimated taxes or contributions (US FICA, India EPF/ESI/professional tax, UK PAYE and NI, Canada CPP/EI, Australia PAYG and Medicare levy, UAE with no personal income tax).",
        "Preview live, print, or download a PDF. Documents are labeled as sample/estimated payroll records, not official payslips. Close the tab to clear all data.",
      ],
      features: [
        "Six-country payroll estimates with local currency and labels",
        "Employer, employee, pay frequency, earnings, bonuses, and deductions",
        "Year-to-date totals, live net pay, and editable tax lines",
        "Print and download PDF in the browser — nothing is uploaded",
      ],
    },
  },
  {
    slug: "401k-vs-roth-ira",
    category: "finance",
    name: "401k vs Roth IRA Calculator",
    heading: "401k vs Roth IRA Calculator 2026",
    metaTitle: "401k vs Roth IRA Calculator 2026 — Which Is Better?",
    metaDescription:
      "Compare Traditional 401k, Roth 401k, and Roth IRA side by side. See tax savings today, future balance, withdrawal tax, and which wins at your current vs retirement tax brackets.",
    short: "Compare Traditional 401k, Roth 401k, and Roth IRA with a tax-bracket verdict.",
    longDescription:
      "Compare Traditional 401k, Roth 401k, and Roth IRA side by side. See which wins based on your current vs retirement tax brackets.",
    icon: "GitCompare",
    keywords: [
      "401k vs roth ira",
      "roth 401k vs traditional",
      "roth ira calculator",
      "401k vs roth",
      "traditional vs roth 2026",
    ],
    badge: "new",
    rulesBanner: "Based on 2026 IRS rules \u2014 Traditional vs Roth comparison",
    rulesBannerFlag: "🇺🇸",
    related: [
      { category: "finance", slug: "401k-calculator" },
      { category: "finance", slug: "paycheck-calculator" },
      { category: "finance", slug: "hsa-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free 401k vs Roth IRA Calculator compares Traditional 401k, Roth 401k, and Roth IRA side by side — showing tax savings today, future balance, withdrawal taxes, and net retirement money.",
        "A dynamic verdict box tells you whether Roth or Traditional wins based on your current vs retirement tax bracket. It also highlights the Roth 401k no-RMD benefit since SECURE 2.0 (2024).",
        "No signup, runs entirely in your browser — your financial data stays private.",
      ],
      features: [
        "Traditional 401k, Roth 401k, and Roth IRA in one table",
        "Federal bracket plus state tax combined rate",
        "Live verdict from current vs retirement brackets",
        "Roth IRA income limits and no-RMD notes for 2026",
      ],
    },
  },
  {
    slug: "bonus-calculator-india",
    category: "finance",
    name: "Bonus Calculator India",
    heading: "Bonus Calculator India — Payment of Bonus Act",
    metaTitle: "Bonus Calculator India — Payment of Bonus Act 2026",
    metaDescription:
      "Calculate statutory bonus under the Payment of Bonus Act with ₹7,000 wage ceiling, ₹21,000 eligibility, and 8.33%–20% rates. Prorate by months worked.",
    short: "Estimate statutory bonus with wage ceiling, eligibility, and min/max rates.",
    longDescription:
      "Calculate statutory bonus with ₹7,000 wage ceiling, eligibility check, and minimum 8.33% / maximum 20% rates.",
    icon: "Coins",
    keywords: [
      "bonus calculator india",
      "payment of bonus act",
      "statutory bonus",
      "ex gratia bonus",
      "7000 bonus ceiling",
    ],
    badge: "new",
    rulesBanner: "Based on Payment of Bonus Act, 1965 (amended 2015)",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "esi-calculator" },
      { category: "finance", slug: "professional-tax-calculator" },
      { category: "finance", slug: "gratuity-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Bonus Calculator computes statutory bonus under the Payment of Bonus Act, 1965 — with eligibility check, ₹7,000 wage ceiling, and minimum 8.33% / maximum 20% rates shown simultaneously.",
        "It prorates bonus for part-year employees and distinguishes statutory bonus from ex-gratia payments for salaries above ₹21,000/month.",
        "No signup, runs entirely in your browser — your salary data stays private.",
      ],
      features: [
        "Eligibility check at the ₹21,000 monthly threshold",
        "₹7,000 wage ceiling applied automatically",
        "Minimum 8.33% and maximum 20% shown together",
        "Part-year proration from 1 to 12 months",
      ],
    },
  },
  {
    slug: "esi-calculator",
    category: "finance",
    name: "ESI Calculator India",
    heading: "ESI Calculator India — Employee State Insurance",
    metaTitle: "ESI Calculator India — Employee State Insurance 2026",
    metaDescription:
      "Calculate ESI contributions — employee 0.75% and employer 3.25%. Check the ₹21,000 wage ceiling, disabled-employee ₹25,000 limit, and estimated take-home impact.",
    short: "Calculate employee and employer ESI with eligibility and take-home impact.",
    longDescription:
      "Calculate ESI contributions — employee 0.75% and employer 3.25%. Check ₹21,000 eligibility and understand ESI benefits.",
    icon: "Activity",
    keywords: [
      "esi calculator",
      "esi calculator india",
      "employee state insurance",
      "esic contribution",
      "esi 21000",
    ],
    badge: "new",
    rulesBanner: "Based on ESIC guidelines \u2014 FY 2026-27 contribution rates",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "bonus-calculator-india" },
      { category: "finance", slug: "professional-tax-calculator" },
      { category: "finance", slug: "epf-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free ESI Calculator computes Employee State Insurance contributions — employee 0.75% and employer 3.25% of gross wages — with eligibility check for the ₹21,000 wage ceiling.",
        "It shows monthly and annual contributions, estimated net take-home impact, and explains ESI medical and social security benefits.",
        "No signup, runs entirely in your browser — your salary data stays private.",
      ],
      features: [
        "Employee 0.75% and employer 3.25% on gross wages",
        "₹21,000 ceiling, or ₹25,000 for disabled employees",
        "Monthly and annual contribution split",
        "Estimated take-home after ESI, professional tax, and EPF",
      ],
    },
  },
  {
    slug: "swp-calculator",
    category: "finance",
    name: "SWP Calculator",
    heading: "SWP Calculator — Systematic Withdrawal Plan",
    metaTitle: "SWP Calculator — Systematic Withdrawal Plan Returns India",
    metaDescription:
      "See how long a mutual fund corpus lasts with monthly SWP withdrawals, or how much corpus you need for a target income. Year-by-year table, chart, and FD comparison.",
    short: "Project how long a corpus lasts with SWP, or how much corpus you need.",
    longDescription:
      "Calculate how long your corpus lasts with monthly SWP withdrawals, or how much corpus you need for target monthly income.",
    icon: "TrendingUp",
    keywords: [
      "swp calculator",
      "systematic withdrawal plan",
      "swp vs fd",
      "corpus needed",
      "retirement withdrawal",
    ],
    badge: "new",
    rulesBanner: "Based on Indian mutual fund SWP conventions \u2014 illustrative returns",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "sip-calculator" },
      { category: "finance", slug: "fd-calculator" },
      { category: "finance", slug: "emi-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free SWP Calculator has two modes — how long your corpus lasts with monthly withdrawals, or how much corpus you need for a target monthly income over a set period.",
        "It shows a year-by-year depletion table, corpus chart, FD comparison insight, and capital gains tax notes for equity vs debt fund withdrawals.",
        "No signup, runs entirely in your browser — your financial data stays private.",
      ],
      features: [
        "How-long and corpus-needed modes",
        "Self-sustaining check when returns cover withdrawals",
        "Year-by-year table and corpus chart",
        "FD comparison and equity/debt tax notes",
      ],
    },
  },
  {
    slug: "dividend-yield-calculator",
    category: "finance",
    name: "Dividend Yield Calculator",
    heading: "Dividend Yield Calculator India",
    metaTitle: "Dividend Yield Calculator India — Stocks & Portfolio",
    metaDescription:
      "Calculate current yield, yield on cost, annual dividend income, TDS impact, and compare with FD returns. Portfolio mode for up to 5 holdings.",
    short: "Current yield, yield on cost, TDS, and FD comparison for Indian stocks.",
    longDescription:
      "Calculate current yield, yield on cost, annual dividend income, TDS impact, and compare with FD returns.",
    icon: "Percent",
    keywords: [
      "dividend yield calculator",
      "yield on cost",
      "dividend tds",
      "portfolio dividend",
      "dividend vs fd",
    ],
    badge: "new",
    rulesBanner: "Based on Indian dividend tax rules \u2014 TDS @ 10% above \u20b95,000/company",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "swp-calculator" },
      { category: "finance", slug: "fd-calculator" },
      { category: "finance", slug: "gst-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free Dividend Yield Calculator shows current yield and yield on cost for Indian stocks — with portfolio mode for up to 5 holdings.",
        "Calculates annual dividend income, monthly income estimate, 10% TDS above ₹5,000 threshold, and compares returns with a 7% FD benchmark.",
        "No signup, runs entirely in your browser — your financial data stays private.",
      ],
      features: [
        "Current yield and yield on cost",
        "Portfolio mode for up to 5 stocks",
        "TDS check above ₹5,000 per company",
        "FD comparison at 7%",
      ],
    },
  },
  {
    slug: "gst-threshold-checker",
    category: "finance",
    name: "GST Threshold Checker",
    heading: "GST Registration Checker for Freelancers",
    metaTitle: "GST Registration Checker for Freelancers India 2026",
    metaDescription:
      "Do you need GST registration? Check the ₹20 lakh threshold, special category states, inter-state supply, and export rules for FY 2026-27.",
    short: "Check if GST registration is mandatory for freelancers in India.",
    longDescription:
      "Do you need GST registration? Check ₹20 lakh threshold, special states, inter-state, and export rules.",
    icon: "BadgeCheck",
    keywords: [
      "gst threshold",
      "gst registration",
      "gst freelancer",
      "gst 20 lakh",
      "special category state gst",
    ],
    badge: "new",
    rulesBanner: "Based on GST registration thresholds \u2014 FY 2026-27",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "gst-calculator" },
      { category: "finance", slug: "dividend-yield-calculator" },
      { category: "finance", slug: "salary-hike-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free GST Threshold Checker answers the most common freelancer question: do I need GST registration?",
        "Handles services vs goods thresholds, special category states (₹10L), inter-state mandatory registration, and export turnover rules for FY 2026-27.",
        "No signup, runs entirely in your browser.",
      ],
      features: [
        "₹20L / ₹40L / ₹10L thresholds by supply and state",
        "Inter-state supply treated as mandatory",
        "Export and overseas IT service flags",
        "Voluntary registration note when below threshold",
      ],
    },
  },
  {
    slug: "hsa-calculator",
    category: "finance",
    name: "HSA Calculator 2026",
    heading: "HSA Calculator 2026",
    metaTitle: "HSA Calculator 2026 — Health Savings Account Tax Savings",
    metaDescription:
      "Calculate 2026 HSA contribution limits, federal and state tax savings, effective cost, and projected retirement balance with the triple tax advantage.",
    short: "Calculate HSA contribution limits, tax savings, and projected retirement balance.",
    longDescription:
      "Calculate 2026 IRS HSA contribution limits, federal and state tax savings, effective cost, and projected HSA balance at retirement with the triple tax advantage.",
    icon: "Activity",
    keywords: [
      "hsa calculator",
      "hsa calculator 2026",
      "health savings account",
      "hsa contribution limit",
      "hsa tax savings",
      "hsa catch-up",
    ],
    badge: "new",
    rulesBanner: "Based on 2026 IRS HSA contribution limits",
    rulesBannerFlag: "🇺🇸",
    related: [
      { category: "finance", slug: "401k-calculator" },
      { category: "finance", slug: "401k-vs-roth-ira" },
      { category: "finance", slug: "paycheck-calculator" },
    ],
    about: {
      paragraphs: [
        "Our free HSA Calculator computes 2026 IRS contribution limits, federal and state tax savings, effective cost, and projected HSA balance at retirement.",
        "Shows the triple tax advantage clearly — tax-free contributions, growth, and qualified medical withdrawals.",
        "No signup, runs entirely in your browser — your financial data stays private.",
      ],
      features: [
        "2026 IRS limits with age 55+ catch-up",
        "Federal and state tax savings plus effective cost",
        "Retirement projection to age 65",
        "HDHP required reminder and CA/NJ state-tax note",
      ],
    },
  },
  {
    slug: "rent-receipt-generator",
    category: "finance",
    name: "Rent Receipt Generator",
    heading: "Rent Receipt Generator",
    metaTitle: "Rent Receipt Generator — Create & Download Rent Receipt PDF Free",
    metaDescription:
      "Generate professional rent receipts for HRA claims. Download a PDF for one month or the whole year instantly — free, in your browser.",
    short: "Generate professional rent receipts for HRA claims. Download PDF for one or multiple months instantly.",
    longDescription:
      "Generate professional rent receipts for HRA claims. Download a print-ready PDF for one month or every selected month. Client-side only — rent amounts and landlord details never leave your browser.",
    icon: "Receipt",
    keywords: [
      "rent receipt",
      "rent receipt generator",
      "hra receipt",
      "rent receipt pdf",
      "landlord receipt",
      "hra exemption receipt",
    ],
    badge: "new",
    rulesBanner: "Built for Indian HRA claims under Section 10(13A)",
    rulesBannerFlag: "🇮🇳",
    related: [
      { category: "finance", slug: "hra-calculator" },
      { category: "finance", slug: "ctc-to-in-hand-salary" },
      { category: "finance", slug: "pay-stub-generator" },
    ],
    about: {
      paragraphs: [
        "Our free Rent Receipt Generator creates professional receipts for HRA exemption and landlord records.",
        "Built for salaried employees in India claiming HRA under Section 10(13A). Generate one month or bulk January–December before the March ITR deadline.",
        "PDFs are built in your browser. Rent amounts and landlord details are never uploaded.",
      ],
      features: [
        "Live paper preview with receipt number, date, stamp, and signature line",
        "One month or all twelve months in a single PDF",
        "Cash, Bank Transfer, UPI, and Cheque payment modes",
        "Optional landlord PAN with a ₹1 lakh annual-rent reminder",
      ],
    },
  },

  { slug: "cgpa-to-percentage", category: "student", name: "CGPA to Percentage", short: "VTU, CBSE, and 4-point conversion, including reverse.", icon: "Percent", keywords: ["cgpa to percentage"] },
  {
    slug: "gpa-calculator",
    category: "student",
    name: "GPA Calculator",
    metaTitle: "GPA Calculator Free — Calculate Your 4.0 Scale GPA",
    metaDescription:
      "Add courses with letter grades and credit hours to calculate weighted GPA on the standard US 4.0 scale. Free, instant, in your browser.",
    short: "Add courses with letter grades and credit hours to calculate weighted GPA on the 4.0 scale.",
    longDescription:
      "Our free GPA Calculator computes weighted GPA on the standard US 4.0 scale. Add courses with letter grades and credit hours to get your cumulative GPA instantly. Supports the full grade-point mapping from A (4.0) through F (0.0), including plus/minus grades.",
    icon: "Calculator",
    keywords: ["gpa calculator", "weighted gpa", "4.0 scale gpa", "college gpa calculator"],
    about: {
      paragraphs: [
        "Our free GPA Calculator computes weighted GPA on the standard US 4.0 scale. Add courses with letter grades and credit hours to get your cumulative GPA instantly.",
        "Supports the full standard grade-point mapping from A (4.0) through F (0.0), including plus/minus grades. Add or remove course rows dynamically as you plan semesters or track cumulative progress.",
        "Ideal for US college students tracking semester or cumulative GPA, scholarship requirements, and what-if grade scenarios — all calculated locally in your browser.",
      ],
      features: [
        "Standard US 4.0 letter-grade scale with plus/minus grades",
        "Weighted GPA based on credit hours",
        "Add or remove courses dynamically",
        "Live total grade points and credit-hour summary",
      ],
    },
  },
  { slug: "bmi-calculator", category: "student", name: "BMI Calculator", short: "Calculate body mass index from height and weight.", icon: "Activity", keywords: ["bmi calculator"] },
  {
    slug: "calorie-deficit-calculator",
    category: "student",
    name: "Calorie Deficit Calculator",
    metaTitle: "Calorie Deficit Calculator Free — Find Your Daily Target",
    metaDescription:
      "Calculate BMR, maintenance calories (TDEE), and a daily target using the Mifflin-St Jeor formula. Metric and imperial supported.",
    short: "Calculate BMR, maintenance calories (TDEE), and a daily target using the Mifflin-St Jeor formula.",
    longDescription:
      "Our free Calorie Deficit Calculator estimates BMR and TDEE using the Mifflin-St Jeor formula, then shows a daily calorie target based on your goal. Supports metric and imperial units, five activity levels, and four goal options from maintenance to aggressive deficit.",
    icon: "Activity",
    keywords: [
      "calorie deficit calculator",
      "tdee calculator",
      "bmr calculator",
      "calorie deficit",
      "maintenance calories",
    ],
  },
  {
    slug: "compound-interest",
    category: "student",
    name: "Compound Interest Calculator",
    metaTitle: "Compound Interest Calculator Free — Growth & SIP Projection",
    metaDescription:
      "Calculate how investments grow with compound interest. Enter principal, rate, years, compounding frequency, and optional monthly contributions for a year-by-year breakdown.",
    short: "Project investment growth with compounding and optional monthly contributions.",
    longDescription:
      "Our free Compound Interest Calculator shows how investments grow over time with compounding. Enter principal, annual rate, years, compounding frequency, and optional monthly contributions. See final amount, total interest earned, total contributions, and a year-by-year growth table. Supports annual, semi-annual, quarterly, monthly, and daily compounding.",
    icon: "TrendingUp",
    keywords: [
      "compound interest calculator",
      "compound interest",
      "investment growth calculator",
      "sip compound interest",
      "fd compound interest",
    ],
  },
  {
    slug: "unit-converter",
    category: "student",
    name: "Unit Converter",
    short: "Convert length, weight, temperature, area, volume, speed, and data units instantly.",
    longDescription:
      "Convert length, weight, temperature, area, volume, speed, and data units with real-time results. Switch categories, swap from/to units, and see every equivalent conversion at once - all in your browser.",
    icon: "Ruler",
    keywords: [
      "unit converter",
      "metric imperial",
      "km to miles",
      "kg to lbs",
      "celsius to fahrenheit",
      "sq ft to sq m",
      "data converter",
    ],
  },
  {
    slug: "time-zone-converter",
    category: "student",
    name: "Time Zone Converter",
    metaTitle: "Time Zone Converter – Convert Time Between Time Zones",
    metaDescription:
      "Convert date and time between global time zones with accurate UTC offsets and daylight saving time support.",
    short: "Convert date and time between cities and time zones with DST-aware IANA rules.",
    longDescription:
      "Convert time between cities and time zones using real IANA identifiers. Select a source date and time, compare multiple destinations, swap zones, and see UTC offsets that update for daylight saving transitions.",
    icon: "Globe",
    keywords: [
      "time zone converter",
      "world clock",
      "convert ist to est",
      "timezone converter",
      "utc offset",
      "daylight saving time",
    ],
  },
  {
    slug: "days-between-dates",
    category: "student",
    name: "Days Between Dates",
    metaTitle: "Days Between Dates Calculator — Free Date Difference Tool",
    metaDescription:
      "Calculate the exact number of days between two dates, with a years/months/days breakdown and relative-to-today framing.",
    short: "Calculate exact days between two dates, with calendar breakdown and countdown framing.",
    longDescription:
      "Our free Days Between Dates Calculator finds the exact number of calendar days between any two dates, with a years/months/days breakdown. Uses end date minus start date — the start date is not counted as a full elapsed day. Leap years are handled automatically.",
    icon: "CalendarDays",
    keywords: ["days between dates", "date difference", "date calculator", "countdown calculator"],
    about: {
      paragraphs: [
        "Our free Days Between Dates Calculator finds the exact number of calendar days between any two dates, with a years/months/days breakdown.",
        "Uses end date minus start date — the start date is not counted as a full elapsed day. Leap years are handled automatically through actual calendar dates.",
        "Also shows a relative framing to today — days from now or days ago — useful for countdowns, contract durations, and planning.",
      ],
      features: [
        "Exact calendar day count between two dates",
        "Years / months / days breakdown",
        "Relative-to-today countdown or elapsed framing",
        "Leap years handled automatically",
      ],
    },
  },
  {
    slug: "leap-year-checker",
    category: "student",
    name: "Leap Year Checker",
    metaTitle: "Leap Year Checker — Is This Year a Leap Year?",
    metaDescription:
      "Enter any year to see if it's a leap year, with the exact rule explained plus next and previous leap years.",
    short: "Enter any year to see if it's a leap year, with the rule explained plus next and previous leap years.",
    longDescription:
      "Our free Leap Year Checker tells you instantly whether any year is a leap year, with a clear explanation of which rule applies. Covers the full three-part rule: divisible by 4, except century years, except those divisible by 400. Also shows the next and previous leap years.",
    icon: "CalendarDays",
    keywords: ["leap year", "leap year checker", "is leap year", "february 29"],
    about: {
      paragraphs: [
        "Our free Leap Year Checker tells you instantly whether any year is a leap year, with a clear explanation of which rule applies.",
        "Covers the full three-part rule: divisible by 4, except century years, except those divisible by 400. Also shows the next and previous leap years.",
        "Useful for calendar questions, trivia, date calculations, and understanding why 1900 was not a leap year but 2000 was.",
      ],
      features: [
        "Instant leap / not-leap result",
        "Clear explanation of the rule that applied",
        "Previous and next leap year shortcuts",
        "Full Gregorian century-year handling",
      ],
    },
  },
  {
    slug: "number-to-words",
    category: "student",
    name: "Number to Words",
    metaTitle: "Number to Words Converter — Free Online",
    metaDescription:
      "Convert numbers to words in English with Indian or International number systems. Perfect for cheques, invoices, and formal documents.",
    short: "Convert numbers to words in English with Indian or International number systems.",
    longDescription:
      "Convert numbers to words in English using Indian (crore, lakh) or International (billion, million) systems. Live comma formatting, optional Rupees/Dollars suffix, and one-click copy — all in your browser.",
    icon: "Type",
    keywords: [
      "number to words",
      "amount in words",
      "rupees in words",
      "cheque amount in words",
      "lakh crore converter",
    ],
  },

  {
    slug: "pomodoro-timer",
    category: "productivity",
    name: "Pomodoro Timer",
    metaTitle: "Pomodoro Timer – Free Online Focus Timer",
    metaDescription:
      "A simple and customizable Pomodoro timer to help you focus, take breaks, and get more done. Auto-start, sound, notifications, and local stats.",
    short: "Focus better with customizable Pomodoro sessions, breaks, and daily stats.",
    longDescription:
      "Focus better. Work smarter. Run classic Pomodoro cycles with custom focus/break lengths, auto-start, sound, desktop notifications, keyboard shortcuts, and today's focus stats — all saved locally in your browser.",
    icon: "Timer",
    keywords: [
      "pomodoro timer",
      "focus timer",
      "pomodoro technique",
      "productivity timer",
      "study timer",
    ],
  },
  { slug: "stopwatch", category: "productivity", name: "Stopwatch", short: "A simple stopwatch with lap times.", icon: "AlarmClock", keywords: ["stopwatch", "lap timer"] },
  {
    slug: "box-breathing-timer",
    category: "productivity",
    name: "Box Breathing Timer",
    metaTitle: "Box Breathing Timer Online — 4-4-4-4 Guided Exercise",
    metaDescription:
      "Follow the animated square through inhale, hold, exhale, and hold. Adjust timing or try the 4-7-8 preset — free in your browser.",
    short: "Follow an animated 4-4-4-4 square, count rounds, or switch to 4-7-8.",
    longDescription:
      "Follow the marker around the square through inhale, hold, exhale, and hold. Use the classic 4-4-4-4 box pattern or the 4-7-8 preset, adjust each side from 3–8 seconds, and track completed rounds.",
    icon: "Hourglass",
    keywords: [
      "box breathing",
      "breathing timer",
      "4-4-4-4",
      "4-7-8 breathing",
      "navy seal breathing",
    ],
    related: [
      { category: "productivity", slug: "pomodoro-timer" },
      { category: "productivity", slug: "stopwatch" },
    ],
    about: {
      paragraphs: [
        "This timer guides you through box breathing with a moving marker on a square: inhale, hold, exhale, hold. The center shows the current phase and seconds remaining.",
        "Keep the default 4-4-4-4 pattern, switch to the 4-7-8 preset, or set each side between 3 and 8 seconds. Start, pause, and reset as needed — completed rounds are counted for you.",
        "Everything runs in your browser. This is a practice aid, not medical advice.",
      ],
      features: [
        "Animated square with inhale, hold, exhale, and hold cues",
        "4-4-4-4 box pattern and 4-7-8 preset",
        "Adjustable phase timing from 3–8 seconds",
        "Round counter, pause, reset, and keyboard shortcuts",
      ],
    },
  },
  {
    slug: "audio-recorder",
    category: "productivity",
    name: "Audio Recorder",
    metaTitle: "Online Audio Recorder Free — Record from Browser",
    metaDescription:
      "Record audio from your microphone, pause and resume, then download sessions as WebM. Nothing is uploaded — it stays in your browser.",
    short: "Record, pause, play back, and download microphone audio as WebM.",
    longDescription:
      "Our free Online Audio Recorder captures microphone input directly in your browser using the MediaRecorder API — record, pause, resume, play back, and download. Recordings stay on your device. Sessions are in-memory only and lost on page close.",
    icon: "Mic",
    keywords: ["audio recorder", "voice recorder", "microphone recorder", "webm recorder", "browser recorder"],
    related: [
      { category: "productivity", slug: "pomodoro-timer" },
      { category: "productivity", slug: "stopwatch" },
    ],
    about: {
      paragraphs: [
        "Our free Online Audio Recorder captures microphone input directly in your browser using the MediaRecorder API — record, pause, resume, play back, and download.",
        "Recordings stay entirely on your device. Nothing is uploaded to any server. Session recordings are in-memory only and lost on page close.",
        "Downloads as WebM audio when the browser supports it — a modern open format. Includes a live timer and visual recording indicator.",
      ],
      features: [
        "Record, pause, and resume from the microphone",
        "Live timer and recording indicator",
        "Play back sessions before downloading",
        "WebM download (M4A fallback in Safari)",
      ],
    },
  },
  {
    slug: "random-number-generator",
    category: "productivity",
    name: "Random Number Generator",
    metaTitle: "Random Number Generator — Free Online",
    metaDescription:
      "Generate random numbers, lists, UUIDs, and dice rolls instantly. Customize min, max, count, and uniqueness — all in your browser.",
    short: "Generate random numbers, lists, UUIDs, and dice rolls instantly.",
    longDescription:
      "Generate random numbers, lists, UUIDs, and dice rolls instantly. Pick Single, List, UUID, or Dice mode, customize min, max, count, and uniqueness, then copy results with one click — everything runs locally in your browser.",
    icon: "Dices",
    keywords: [
      "random number generator",
      "random number",
      "rng",
      "dice roller",
      "uuid generator",
      "random list",
    ],
  },

  {
    slug: "qr-code-generator",
    category: "other",
    name: "QR Code Generator",
    short: "Create styled QR codes for URLs, Wi-Fi, vCards, events, and more.",
    icon: "QrCode",
    keywords: ["qr code generator", "qr maker", "wifi qr", "vcard qr", "styled qr"],
    badge: "popular",
  },
  { slug: "signature-maker", category: "other", name: "Signature Maker", short: "Draw, type, or upload a signature and download PNG or JPG.", icon: "Stamp", keywords: ["signature maker", "e signature"] },
  {
    slug: "password-generator",
    category: "other",
    name: "Password Generator",
    short: "Generate secure random passwords or memorable passphrases with a strength meter.",
    longDescription:
      "Generate secure random passwords or memorable passphrases with a real-time strength meter. Customize length, character types, minimum numbers and symbols, or switch to a word-based passphrase. Everything runs in your browser.",
    icon: "Key",
    keywords: [
      "password generator",
      "strong password",
      "random password",
      "passphrase generator",
      "secure password generator",
    ],
    metaTitle: "Password Generator - Create Strong Secure Passwords | Utilvia",
    metaDescription:
      "Generate strong random passwords or passphrases in your browser. Customize length, symbols, and exclusions. Nothing is uploaded or stored.",
    badge: "popular",
    fileUpload: false,
    related: [
      { category: "other", slug: "qr-code-generator" },
      { category: "developer", slug: "uuid-generator" },
      { category: "developer", slug: "hash-generator" },
    ],
  },
];

function attachRelated(list: ToolDefinition[]): ToolDefinition[] {
  return list.map((item) => {
    if (item.related.length) return item;
    const siblings = list.filter((other) => other.category === item.category && other.slug !== item.slug);
    return {
      ...item,
      related: siblings.slice(0, 3).map((other) => ({ category: other.category, slug: other.slug })),
    };
  });
}

export const TOOLS: ToolDefinition[] = attachRelated(RAW.map(tool));

export function getAllTools() {
  return TOOLS;
}

export function getReadyTools() {
  return TOOLS.filter((item) => item.status === "ready");
}

export function getPopularTools() {
  return TOOLS.filter((item) => item.badge === "popular");
}

export function getNewTools() {
  return TOOLS.filter((item) => item.badge === "new");
}

export function getCategory(id: string) {
  return CATEGORIES.find((category) => category.id === id);
}

export function getToolsByCategory(category: string) {
  return TOOLS.filter((item) => item.category === category);
}

export function getTool(category: string, slug: string) {
  return TOOLS.find((item) => item.category === category && item.slug === slug);
}

export function categoryHref(id: string) {
  return `/category/${id}`;
}

export function toolHref(toolRef: Pick<ToolDefinition, "category" | "slug">) {
  return `/tools/${toolRef.category}/${toolRef.slug}`;
}

export function toolId(toolRef: Pick<ToolDefinition, "category" | "slug">) {
  return `${toolRef.category}/${toolRef.slug}`;
}

export function searchTools(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return TOOLS;

  return TOOLS.filter((item) => item.searchText.includes(q)).sort((a, b) => {
    const aName = a.name.toLowerCase().startsWith(q) ? 0 : 1;
    const bName = b.name.toLowerCase().startsWith(q) ? 0 : 1;
    return aName - bName || a.name.localeCompare(b.name);
  });
}

export function getRelatedTools(item: ToolDefinition) {
  return item.related
    .map((ref) => getTool(ref.category, ref.slug))
    .filter((found): found is ToolDefinition => Boolean(found));
}
