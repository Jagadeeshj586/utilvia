export type ToolAbout = {
  paragraphs: string[];
  features?: string[];
};

export type ToolFaq = { question: string; answer: string };

type ToolContentInput = {
  slug: string;
  name: string;
  short: string;
  category: string;
  longDescription?: string;
  fileUpload?: boolean;
  privacy?: "local" | "mixed";
};

function contentKey(input: ToolContentInput) {
  return `${input.category}/${input.slug}`;
}

const ABOUT_BY_KEY: Record<string, ToolAbout> = {
  "pdf/compress-pdf": {
    paragraphs: [
      "Our free PDF Compress helps you reduce PDF file size while keeping pages readable. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "PDF Compress processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Three compression levels (Low, Medium, High)",
      "Shows original size, new size, and percent saved",
      "Supports PDFs up to 50MB",
    ],
  },
  "pdf/merge-pdf": {
    paragraphs: [
      "Our free PDF Merge helps you combine multiple PDFs into one file, in any order. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "PDF Merge processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Merge unlimited PDFs in custom order",
      "Drag to reorder before combining",
      "Single combined download",
    ],
  },
  "pdf/split-pdf": {
    paragraphs: [
      "Our free PDF Split helps you split every page into its own PDF or extract specific pages. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "PDF Split processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Split all pages or extract specific ranges",
      "Download individual pages or a ZIP bundle",
      "Supports page syntax like 1, 3, 5-7",
    ],
  },
  "pdf/remove-pdf-password": {
    paragraphs: [
      "Our free Remove PDF Password helps you unlock password-protected PDFs when you know the password. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "Remove PDF Password processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "pdf/rotate-pdf": {
    paragraphs: [
      "Our free PDF Rotate helps you rotate one page or every page left or right. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "PDF Rotate processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "pdf/pdf-page-numbers": {
    paragraphs: [
      "Our free PDF Page Numbers helps you stamp page numbers on every page before you share. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "PDF Page Numbers processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "pdf/pdf-watermark": {
    paragraphs: [
      "Our free PDF Watermark helps you stamp text across PDF pages locally. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "PDF Watermark processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "pdf/pdf-to-jpg": {
    paragraphs: [
      "Our free PDF to JPG helps you render PDF pages as JPG or PNG images. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "PDF to JPG processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "pdf/pdf-to-word": {
    paragraphs: [
      "Our free PDF to Word helps you extract PDF text into an editable Word-friendly document. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "PDF to Word processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "pdf/word-to-pdf": {
    paragraphs: [
      "Our free Word to PDF helps you convert a .docx file into a printable PDF. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "Word to PDF processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "pdf/excel-to-pdf": {
    paragraphs: [
      "Our free Excel to PDF helps you turn spreadsheet sheets into a PDF table layout. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "Excel to PDF processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "pdf/ppt-to-pdf": {
    paragraphs: [
      "Our free PPT to PDF helps you convert PowerPoint slides into a PDF. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "PPT to PDF processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "pdf/image-to-pdf": {
    paragraphs: [
      "Our free Image to PDF helps you combine JPG, PNG, or WebP photos into one PDF. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "Image to PDF processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "pdf/word-to-jpg": {
    paragraphs: [
      "Our free Word to JPG Converter helps you render a Word document page as a JPG image. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "Word to JPG Converter processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for anyone who shares contracts, invoices, reports, or scanned documents by email or upload portals. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Browser-based processing with no signup",
      "Download results instantly",
      "Works on desktop and mobile",
    ],
  },
  "image/image-compressor": {
    paragraphs: [
      "Our free Image Compress helps you shrink JPEG, PNG, and WebP with a live size preview. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "Image Compress processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for designers, marketers, developers, and anyone optimizing photos for web, social media, or print. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Local processing keeps photos private",
      "Instant preview before download",
      "No watermarks on exports",
    ],
  },
  "image/image-converter": {
    paragraphs: [
      "Our free Image Converter helps you convert between JPEG, PNG, WebP, and more. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "Image Converter processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for designers, marketers, developers, and anyone optimizing photos for web, social media, or print. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Local processing keeps photos private",
      "Instant preview before download",
      "No watermarks on exports",
    ],
  },
  "image/heic-to-jpg": {
    paragraphs: [
      "Our free HEIC to JPG helps you convert iPhone HEIC photos to JPG. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "HEIC to JPG processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for designers, marketers, developers, and anyone optimizing photos for web, social media, or print. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Local processing keeps photos private",
      "Instant preview before download",
      "No watermarks on exports",
    ],
  },
  "image/webp-to-jpg": {
    paragraphs: [
      "Our free WebP to JPG helps you convert WebP images to JPEG. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "WebP to JPG processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for designers, marketers, developers, and anyone optimizing photos for web, social media, or print. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Local processing keeps photos private",
      "Instant preview before download",
      "No watermarks on exports",
    ],
  },
  "image/background-remover": {
    paragraphs: [
      "Our free Background Remover helps you remove image backgrounds with on-device AI and download a transparent PNG. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "Background Remover processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for designers, marketers, developers, and anyone optimizing photos for web, social media, or print. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Local processing keeps photos private",
      "Instant preview before download",
      "No watermarks on exports",
    ],
  },
  "image/photo-resizer": {
    paragraphs: [
      "Our free Photo Resizer helps you resize or crop photos to exact pixels or ID presets. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "Photo Resizer processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for designers, marketers, developers, and anyone optimizing photos for web, social media, or print. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Local processing keeps photos private",
      "Instant preview before download",
      "No watermarks on exports",
    ],
  },
  "image/svg-to-png": {
    paragraphs: [
      "Our free SVG to PNG Converter exports vector graphics as raster PNG at any resolution. Choose 1x, 2x, 4x scale or a custom width, with transparent or solid background. Upload an SVG file or paste SVG code, preview the graphic, and download PNG instantly in your browser.",
      "SVG to PNG processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for designers, marketers, developers, and anyone optimizing photos for web, social media, or print. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Export at 1x, 2x, 4x, or custom width",
      "Transparent or solid background",
      "Upload a file or paste SVG code",
    ],
  },
  "image/color-palette-extractor": {
    paragraphs: [
      "Our free Color Palette Extractor helps you pull dominant colors from any image. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "Color Palette Extractor processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for designers, marketers, developers, and anyone optimizing photos for web, social media, or print. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Local processing keeps photos private",
      "Instant preview before download",
      "No watermarks on exports",
    ],
  },
  "text/word-counter": {
    paragraphs: [
      "Our free Word Counter helps you words, characters, keywords, reading time, and platform limits. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Word Counter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for writers, editors, students, SEO specialists, and content creators who work with words daily. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Real-time results as you type",
      "One-click copy for output",
      "No character limits for local tools",
    ],
  },
  "text/character-counter": {
    paragraphs: [
      "Our free Character Counter counts characters, words, sentences, and paragraphs in real time as you type. Perfect for essays, social media posts, meta descriptions, and SEO content limits. All counting happens in your browser — your text never leaves your device.",
      "All processing for Character Counter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for writers, editors, students, SEO specialists, and content creators who work with words daily. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Real-time results as you type",
      "One-click copy for output",
      "No character limits for local tools",
    ],
  },
  "text/case-converter": {
    paragraphs: [
      "Our free Text Case Converter helps you switch text to UPPERCASE, lowercase, Title Case, and more. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Text Case Converter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for writers, editors, students, SEO specialists, and content creators who work with words daily. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Real-time results as you type",
      "One-click copy for output",
      "No character limits for local tools",
    ],
  },
  "text/lorem-ipsum-generator": {
    paragraphs: [
      "Our free Lorem Ipsum Generator helps you generate placeholder paragraphs and lists. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Lorem Ipsum Generator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for writers, editors, students, SEO specialists, and content creators who work with words daily. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Real-time results as you type",
      "One-click copy for output",
      "No character limits for local tools",
    ],
  },
  "text/text-diff-checker": {
    paragraphs: [
      "Our free Text Diff Checker compares two texts and highlights added, removed, and unchanged lines. Use split view or unified diff format. Auto-compare as you type with 500ms debounce, or click Compare for instant results. Line numbers and color-coded highlights make differences easy to spot.",
      "All processing for Text Diff Checker happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for writers, editors, students, SEO specialists, and content creators who work with words daily. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Real-time results as you type",
      "One-click copy for output",
      "No character limits for local tools",
    ],
  },
  "text/markdown-to-html": {
    paragraphs: [
      "Convert Markdown to HTML with live preview. Copy clean HTML output instantly. Conversion uses the marked library in your browser — your content stays private on your device.",
      "All processing for Markdown to HTML happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for writers, editors, students, SEO specialists, and content creators who work with words daily. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Real-time results as you type",
      "One-click copy for output",
      "No character limits for local tools",
    ],
  },
  "text/markdown-table-generator": {
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
  "text/text-to-speech": {
    paragraphs: [
      "Our free Text to Speech tool reads your text aloud using your browser's built-in Web Speech API voices. Adjust speed and pitch, play or stop instantly, and download an MP3 file when you need to save the audio.",
      "All processing for Text to Speech happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for writers, editors, students, SEO specialists, and content creators who work with words daily. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Listen with browser voices instantly",
      "Adjust speed and pitch",
      "Download MP3 when you need a file",
    ],
  },
  "text/keyword-density": {
    paragraphs: [
      "Our free Keyword Density Checker helps you analyze keyword frequency and density in your content for SEO. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Keyword Density Checker happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for writers, editors, students, SEO specialists, and content creators who work with words daily. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Real-time results as you type",
      "One-click copy for output",
      "No character limits for local tools",
    ],
  },
  "developer/json-formatter": {
    paragraphs: [
      "Our free JSON Formatter helps you pretty-print, minify, validate, and inspect JSON. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for JSON Formatter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Pretty-print, minify, and validate JSON",
      "Syntax error highlighting",
      "Tree view for nested objects",
    ],
  },
  "developer/base64-encoder": {
    paragraphs: [
      "Our free Base64 Encoder helps you encode or decode Base64 text in your browser. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Base64 Encoder happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/url-encoder": {
    paragraphs: [
      "Encode and decode URLs instantly. Convert special characters for safe URL usage with Component or Full URI modes. Everything runs in your browser — no data is sent to any server.",
      "All processing for URL Encoder happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/binary-converter": {
    paragraphs: [
      "Convert between binary, decimal, hexadecimal, and octal number systems instantly. Type in any base and all four formats update in real time with validation, copy buttons, and quick example numbers.",
      "All processing for Binary Converter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/hash-generator": {
    paragraphs: [
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files instantly in your browser. All four algorithms run simultaneously with one-click copy — nothing leaves your device.",
      "All processing for Hash Generator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/csv-to-json": {
    paragraphs: [
      "Our free CSV to JSON Converter transforms comma-separated data into formatted JSON instantly. Paste CSV text or upload a .csv file — no server upload required. Auto-detect delimiter, support for comma, semicolon, tab, and pipe separators. Toggle header row and whitespace trimming. Preview results as JSON or HTML table.",
      "CSV to JSON Converter processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/regex-tester": {
    paragraphs: [
      "Our free Regex Tester lets you write, test, and debug regular expressions with live match highlighting. Supports global, case-insensitive, multiline, and dotall flags. See matches with index positions and capture groups, and load common patterns for email, URL, phone numbers, dates, and hex colors.",
      "All processing for Regex Tester happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/html-entity-encoder": {
    paragraphs: [
      "Our free HTML Entity tool encodes and decodes HTML entities instantly. Convert special characters like <, >, &, and quotes to safe HTML entities and back. Real-time conversion as you type with encode and decode modes, plus a reference table of common HTML entities.",
      "All processing for HTML Entity Encoder/Decoder happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/jwt-decoder": {
    paragraphs: [
      "Our free JWT Decoder inspects JSON Web Tokens with jwt.io-style color-coded header, payload, and signature panels. See claims with expanded labels, expiry badges, and human-readable timestamps. Verify HMAC, RSA, and ECDSA signatures client-side using the Web Crypto API — your secret or public key never leaves your browser.",
      "All processing for JWT Decoder happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/xml-formatter": {
    paragraphs: [
      "Our free XML Formatter beautifies, minifies, and validates XML data in your browser. Format mode adds indentation for readability. Minify removes whitespace. Validate checks for syntax errors.",
      "All processing for XML Formatter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/sql-formatter": {
    paragraphs: [
      "Our free SQL Formatter beautifies queries with keyword capitalization, indentation, and line breaks before major clauses. Toggle minify mode to collapse SQL to a single line. Runs entirely in your browser — your queries are never uploaded.",
      "All processing for SQL Formatter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/uuid-generator": {
    paragraphs: [
      "Our free UUID Generator helps you batch UUID v4 identifiers instantly. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for UUID Generator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Generate 1–100 UUID v4 values at once",
      "Toggle uppercase and hyphen formatting",
      "One-click copy for single or all UUIDs",
    ],
  },
  "developer/cron-expression-generator": {
    paragraphs: [
      "Build a cron schedule by choosing minutes, hours, day of month, month, and day of week — or paste an expression to parse it into fields.",
      "Use every, specific values, ranges, and intervals. Switch between standard 5-field cron and an optional 6-field format with seconds.",
      "Copy the expression, read a plain-language description, and inspect each field. Everything runs in your browser.",
    ],
    features: [
      "Field editor with every, interval, specific, and range modes",
      "Paste and parse existing cron expressions",
      "5-field and optional 6-field (seconds) syntax",
      "Presets, live validation, copy, and reset",
    ],
  },
  "developer/subnet-calculator": {
    paragraphs: [
      "Enter a CIDR block to see network address, broadcast, subnet mask, wildcard mask, usable hosts, and binary representations.",
      "Convert a dotted-decimal mask to a CIDR prefix, check whether an IP sits in the block, and use the quick-reference table for common sizes.",
      "All calculations run in your browser. Nothing is uploaded.",
    ],
    features: [
      "Network, broadcast, mask, wildcard, and usable range",
      "Binary network and mask views",
      "Mask-to-CIDR conversion",
      "Quick-reference table for common prefixes",
    ],
  },
  "developer/svg-code-previewer": {
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
  "developer/unix-timestamp-converter": {
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
  "developer/json-to-csv": {
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
  "developer/dns-lookup": {
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
  "developer/htaccess-generator": {
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
  "developer/http-status-codes": {
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
  "developer/json-schema-validator": {
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
  "developer/ip-address-lookup": {
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
  "developer/robots-txt-generator": {
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
  "developer/css-gradient-generator": {
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
  "developer/glassmorphism-generator": {
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
  "developer/box-shadow-generator": {
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
  "developer/favicon-generator": {
    paragraphs: [
      "Upload a square image and get favicon.ico, standard PNG sizes (16, 32, 180, 192, 512), and ready-to-paste HTML link tags. Preview how your icon looks in a browser tab, then download everything as a ZIP.",
      "Favicon Generator processes files locally in your browser. Your documents and images are not uploaded to Utilvia servers — they stay on your device throughout the workflow.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/color-picker": {
    paragraphs: [
      "Pick colors visually, convert between HEX, RGB, HSL, HSV, and CMYK, generate palettes and gradients, check WCAG contrast, extract colors from images, and share selections via URL — all locally in your browser.",
      "All processing for Color Picker happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/color-contrast-checker": {
    paragraphs: [
      "Our free Color Contrast Checker calculates WCAG contrast ratios between foreground and background colors. Test AA and AAA compliance for normal and large text. Pick colors with native color pickers or enter hex values, swap colors instantly, and see a live text preview with pass/fail badges for each WCAG level.",
      "All processing for Color Contrast Checker happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/color-palette-generator": {
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
  "developer/aspect-ratio-calculator": {
    paragraphs: [
      "Calculate, simplify, and resize dimensions while maintaining the correct aspect ratio. Enter width and height to get simplified ratios, scale to new dimensions, pick common presets, and preview proportions instantly — all in your browser.",
      "All processing for Aspect Ratio Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/device-browser-info": {
    paragraphs: [
      "Our free Device & Browser Info helps you see viewport, user agent, and device details. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Device & Browser Info happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/morse-code-converter": {
    paragraphs: [
      "Our free Morse Code Converter translates text to Morse code and decodes Morse back to text instantly. Includes a collapsible Morse alphabet reference for letters A–Z, digits 0–9, and common punctuation. Copy output with one click.",
      "All processing for Morse Code Converter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "developer/roman-numeral-converter": {
    paragraphs: [
      "Our free Roman Numeral Converter helps you convert numbers to Roman numerals and back. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Roman Numeral Converter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for software engineers, web developers, DevOps teams, and technical professionals building and debugging applications. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Runs locally with Web Crypto and browser APIs",
      "Copy output with one click",
      "No API keys or accounts needed",
    ],
  },
  "finance/age-calculator": {
    paragraphs: [
      "Our free Age Calculator helps you exact age as of today or any cutoff date, plus totals. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Age Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/emi-calculator": {
    paragraphs: [
      "Our free EMI Calculator helps you calculate EMI, total interest, and amortization charts. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for EMI Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Monthly EMI with total interest",
      "Amortization schedule and chart",
      "Adjust principal, rate, and tenure",
    ],
  },
  "finance/gst-calculator": {
    paragraphs: [
      "Our free GST Calculator helps you add or remove GST with CGST/SGST split at Indian rates. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for GST Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Add or remove GST at Indian rates",
      "CGST/SGST split shown",
      "Quick rate presets",
    ],
  },
  "finance/salary-hike-calculator": {
    paragraphs: [
      "Our free Salary Hike Calculator helps you convert hike % to new salary, or reverse from a target CTC. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Salary Hike Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/ctc-to-in-hand-salary": {
    paragraphs: [
      "Our free CTC to In-Hand Salary helps you in-hand from CTC with 50/20/30 split, PF, PT, and new-regime tax. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for CTC to In-Hand Salary happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/fd-calculator": {
    paragraphs: [
      "Our free FD Calculator helps you fD maturity, EAR, and growth chart with years or months. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for FD Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/section-44ada-calculator": {
    paragraphs: [
      "Our free Section 44ADA Freelancer Tax Calculator helps you estimate presumptive tax for Indian freelancers. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Section 44ADA Freelancer Tax Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/sip-calculator": {
    paragraphs: [
      "Estimate SIP maturity, total invested amount, and potential returns from monthly contributions. Figures are illustrative and not guaranteed. Actual mutual fund returns may differ.",
      "All processing for SIP Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/notice-period-calculator": {
    paragraphs: [
      "Our free Notice Period Calculator helps you last working day, calendar, working-days mode, and buyout. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Notice Period Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/percentage-calculator": {
    paragraphs: [
      "Our free Percentage Calculator helps you x% of Y, X is % of Y, % change, and add/subtract %. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Percentage Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/income-tax-calculator": {
    paragraphs: [
      "Our free Income Tax Calculator helps you estimate Indian income tax for FY 2025-26. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Income Tax Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/old-vs-new-tax-regime": {
    paragraphs: [
      "Our free Old vs New Tax Regime Comparison helps you compare old and new Indian tax regimes side by side. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Old vs New Tax Regime Comparison happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/tip-calculator": {
    paragraphs: [
      "Our free Tip Calculator helps you split a bill and calculate tip per person. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Tip Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/discount-calculator": {
    paragraphs: [
      "Calculate discount amount, percentage off, and final sale price instantly. Use % Off, Find %, or Original Price mode with quick preset buttons — all in your browser.",
      "All processing for Discount Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/hra-calculator": {
    paragraphs: [
      "Our free HRA Calculator helps you estimate HRA exemption for Indian salaried employees. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for HRA Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/epf-calculator": {
    paragraphs: [
      "Our free EPF Calculator estimates Employee Provident Fund maturity based on basic salary, current balance, age, and interest rate. Includes employee 12% contribution and employer 3.67% EPF portion with monthly compounding and annual salary increments.",
      "All processing for EPF Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/ppf-calculator": {
    paragraphs: [
      "Our free PPF Calculator projects maturity value, total interest earned, and a year-by-year balance table for Public Provident Fund accounts in India. Includes partial withdrawal eligibility (from year 7), loan against PPF rules (years 3–6), and 5-year extension block simulation for tenures beyond 15 years.",
      "All processing for PPF Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/gratuity-calculator": {
    paragraphs: [
      "Our free Gratuity Calculator computes gratuity amount as per Payment of Gratuity Act 1972 formula for covered establishments. Enter last drawn salary (Basic + DA) and years of service. See formula used, rounded years, and tax-free limit applied.",
      "All processing for Gratuity Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/lta-calculator": {
    paragraphs: [
      "Our free LTA Calculator computes Leave Travel Allowance tax exemption as per Indian income tax rules. Enter annual LTA received and actual eligible travel expenses to see exempt and taxable amounts for the current 2026–2029 block period.",
      "All processing for LTA Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/hourly-to-salary-calculator": {
    paragraphs: [
      "Our free Hourly to Salary Calculator converts hourly wage to daily, weekly, bi-weekly, monthly, and annual salary. Also works in reverse — enter annual salary to get the equivalent hourly rate. Customize hours per week and weeks per year. Supports USD and INR.",
      "All processing for Hourly to Salary Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/inflation-calculator": {
    paragraphs: [
      "Our free Inflation Calculator shows how inflation affects money value over time with future and past value modes. Pre-fills average inflation rates for India (6.5%) and US (3.2%) based on currency. Shows purchasing power loss visually.",
      "All processing for Inflation Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/paycheck-calculator": {
    paragraphs: [
      "Our free Paycheck Calculator estimates take-home pay using the tax, social-contribution, and payroll rules of the country you select.",
      "Supported countries include the United States, India, United Kingdom, Canada, Australia, and the UAE — each with local brackets, deductions, and contributions such as FICA, EPF/ESI, National Insurance, CPP/EI, or the Medicare levy.",
      "Enter annual or hourly pay, choose frequency, and add optional retirement or benefit deductions. Estimates only — not tax advice.",
    ],
    features: [
      "Country selector with local tax and payroll rules",
      "US, India, UK, Canada, Australia, and UAE engines",
      "Annual or hourly input with weekly to annual frequencies",
      "Optional retirement, health, and other deductions",
    ],
  },
  "finance/mortgage-calculator": {
    paragraphs: [
      "Our free Mortgage Calculator estimates monthly principal and interest from property price, down payment, rate, and term. Pick a country to switch currency, labels, and local extras such as HOA, processing charges, or DLD fees.",
      "All processing happens locally in your browser. Your figures are never uploaded, so you can model a purchase without creating an account.",
      "Use it to compare down payments, loan terms, and the impact of taxes, insurance, and fees on the total monthly housing payment.",
    ],
    features: [
      "Country selector for US, India, UK, Canada, Australia, and UAE",
      "Local currency, terminology, and extra-cost fields",
      "Monthly payment, LTV, and total interest",
      "Principal vs interest chart and optional amortization schedule",
    ],
  },
  "finance/w2-vs-1099": {
    paragraphs: [
      "Compare employment and self-employment take-home using local tax rules. The United States uses W-2 vs 1099; other countries switch to employee vs contractor, sole trader, or freelancer labels.",
      "All processing happens in your browser. Figures are simplified estimates — not professional tax advice.",
      "Enter the same gross income for both options, then add expenses, benefits, and retirement contributions to see the net gap.",
    ],
    features: [
      "Country selector for US, India, UK, Canada, Australia, and UAE",
      "Local terminology, currency, and contributions",
      "Side-by-side net pay and effective tax rates",
      "Employer / business-paid cost estimates",
    ],
  },
  "finance/self-employment-tax": {
    paragraphs: [
      "Estimate income tax and self-employment or social contributions for freelancers, contractors, sole traders, and independent professionals.",
      "Pick a country to update currency, deductions, and contribution rules. The United States uses self-employment tax; other countries use local equivalents.",
      "All processing happens in your browser. Figures are simplified estimates — not professional tax advice.",
    ],
    features: [
      "Country selector for US, India, UK, Canada, Australia, and UAE",
      "Local terminology, currency, and contribution rules",
      "Net income, effective rate, and a visual breakdown",
      "Expenses, other deductions, and retirement contributions",
    ],
  },
  "finance/loan-eligibility-calculator": {
    paragraphs: [
      "Our free Loan Eligibility Calculator estimates eligible loan amount, monthly payment, and a country-specific debt ratio from your income, existing obligations, term, and rate.",
      "Choose the United States, India, the United Kingdom, Canada, Australia, or the UAE. Labels, currency, employment types, credit-score scales, and rules such as DTI, FOIR, TDS, or DBR update immediately.",
      "Results are planning estimates — not a pre-approval, sanction letter, or credit decision.",
    ],
    features: [
      "Country selector for US, India, UK, Canada, Australia, and UAE",
      "Local currency, terminology, and eligibility caps",
      "Eligible amount, monthly payment, debt ratio, and estimated rate",
      "Personal, home, and auto loan types with credit and LTV checks",
    ],
  },
  "finance/labour-code-2026-salary": {
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
  "finance/currency-converter": {
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
  "finance/crypto-price-tracker": {
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
  "finance/capital-gains-tax": {
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
  "finance/rd-calculator": {
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
  "finance/nps-calculator": {
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
  "finance/401k-calculator": {
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
  "finance/leave-encashment-calculator": {
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
  "finance/cagr-calculator": {
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
  "finance/ssy-calculator": {
    paragraphs: [
      "Our free SSY Calculator helps you project Sukanya Samriddhi Yojana maturity. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for SSY Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for salaried employees, freelancers, business owners, investors, and anyone planning loans, taxes, or savings in India and abroad. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Instant calculations as you adjust inputs",
      "Clear breakdown of results",
      "Useful for planning and what-if scenarios",
    ],
  },
  "finance/advance-tax-calculator": {
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
  "finance/professional-tax-calculator": {
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
  "finance/pay-stub-generator": {
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
  "finance/401k-vs-roth-ira": {
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
  "finance/bonus-calculator-india": {
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
  "finance/esi-calculator": {
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
  "finance/swp-calculator": {
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
  "finance/dividend-yield-calculator": {
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
  "finance/gst-threshold-checker": {
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
  "finance/hsa-calculator": {
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
  "finance/rent-receipt-generator": {
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
  "student/cgpa-to-percentage": {
    paragraphs: [
      "Our free CGPA to Percentage helps you vTU, CBSE, and 4-point conversion, including reverse. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for CGPA to Percentage happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for students, teachers, health-conscious individuals, and learners who need quick academic and everyday calculations. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Simple inputs with instant answers",
      "Works on phone and desktop",
      "No registration required",
    ],
  },
  "student/gpa-calculator": {
    paragraphs: [
      "Our free GPA Calculator helps you calculate GPA from credit hours and grades. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for GPA Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for students, teachers, health-conscious individuals, and learners who need quick academic and everyday calculations. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Simple inputs with instant answers",
      "Works on phone and desktop",
      "No registration required",
    ],
  },
  "student/bmi-calculator": {
    paragraphs: [
      "Our free BMI Calculator helps you calculate body mass index from height and weight. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for BMI Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for students, teachers, health-conscious individuals, and learners who need quick academic and everyday calculations. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Simple inputs with instant answers",
      "Works on phone and desktop",
      "No registration required",
    ],
  },
  "student/calorie-deficit-calculator": {
    paragraphs: [
      "Our free Calorie Deficit Calculator estimates BMR and TDEE using the Mifflin-St Jeor formula, then shows a daily calorie target based on your goal. Supports metric and imperial units, five activity levels, and four goal options from maintenance to aggressive deficit.",
      "All processing for Calorie Deficit Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for students, teachers, health-conscious individuals, and learners who need quick academic and everyday calculations. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Simple inputs with instant answers",
      "Works on phone and desktop",
      "No registration required",
    ],
  },
  "student/compound-interest": {
    paragraphs: [
      "Our free Compound Interest Calculator shows how investments grow over time with compounding. Enter principal, annual rate, years, compounding frequency, and optional monthly contributions. See final amount, total interest earned, total contributions, and a year-by-year growth table. Supports annual, semi-annual, quarterly, monthly, and daily compounding.",
      "All processing for Compound Interest Calculator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for students, teachers, health-conscious individuals, and learners who need quick academic and everyday calculations. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Simple inputs with instant answers",
      "Works on phone and desktop",
      "No registration required",
    ],
  },
  "student/unit-converter": {
    paragraphs: [
      "Convert length, weight, temperature, area, volume, speed, and data units with real-time results. Switch categories, swap from/to units, and see every equivalent conversion at once - all in your browser.",
      "All processing for Unit Converter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for students, teachers, health-conscious individuals, and learners who need quick academic and everyday calculations. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Simple inputs with instant answers",
      "Works on phone and desktop",
      "No registration required",
    ],
  },
  "student/time-zone-converter": {
    paragraphs: [
      "Convert time between cities and time zones using real IANA identifiers. Select a source date and time, compare multiple destinations, swap zones, and see UTC offsets that update for daylight saving transitions.",
      "All processing for Time Zone Converter happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for students, teachers, health-conscious individuals, and learners who need quick academic and everyday calculations. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Simple inputs with instant answers",
      "Works on phone and desktop",
      "No registration required",
    ],
  },
  "student/days-between-dates": {
    paragraphs: [
      "Our free Days Between Dates helps you count days, weeks, and months between two dates. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Days Between Dates happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for students, teachers, health-conscious individuals, and learners who need quick academic and everyday calculations. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Simple inputs with instant answers",
      "Works on phone and desktop",
      "No registration required",
    ],
  },
  "student/leap-year-checker": {
    paragraphs: [
      "Our free Leap Year Checker helps you check whether a year is a leap year. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Leap Year Checker happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for students, teachers, health-conscious individuals, and learners who need quick academic and everyday calculations. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Simple inputs with instant answers",
      "Works on phone and desktop",
      "No registration required",
    ],
  },
  "student/number-to-words": {
    paragraphs: [
      "Convert numbers to words in English using Indian (crore, lakh) or International (billion, million) systems. Live comma formatting, optional Rupees/Dollars suffix, and one-click copy — all in your browser.",
      "All processing for Number to Words happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for students, teachers, health-conscious individuals, and learners who need quick academic and everyday calculations. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Simple inputs with instant answers",
      "Works on phone and desktop",
      "No registration required",
    ],
  },
  "productivity/pomodoro-timer": {
    paragraphs: [
      "Focus better. Work smarter. Run classic Pomodoro cycles with custom focus/break lengths, auto-start, sound, desktop notifications, keyboard shortcuts, and today's focus stats — all saved locally in your browser.",
      "All processing for Pomodoro Timer happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for remote workers, students, creators, and anyone who wants focused work sessions and simple daily utilities. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Custom focus and break durations",
      "Auto-start and sound notifications",
      "Daily focus stats saved locally",
    ],
  },
  "productivity/stopwatch": {
    paragraphs: [
      "Our free Stopwatch helps you a simple stopwatch with lap times. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Stopwatch happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for remote workers, students, creators, and anyone who wants focused work sessions and simple daily utilities. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Lightweight and distraction-free",
      "Saved locally where settings apply",
      "Free with no account",
    ],
  },
  "productivity/box-breathing-timer": {
    paragraphs: [
      "Follow the animated square through inhale, hold, exhale, and hold. The marker travels each side while the center shows the phase and countdown.",
      "Use 4-4-4-4 box breathing or the 4-7-8 preset, or set each phase from 3–8 seconds. Start, pause, reset, and track completed rounds — all in your browser.",
      "Box breathing is a simple way to slow down before a meeting, during stress, or as a short focus reset. This timer is a practice aid, not medical advice.",
    ],
    features: [
      "Animated square with a moving inhale / hold / exhale cue",
      "4-4-4-4 pattern and 4-7-8 preset",
      "Phase timing from 3–8 seconds",
      "Round counter with start, pause, and reset",
    ],
  },
  "productivity/audio-recorder": {
    paragraphs: [
      "Our free Online Audio Recorder captures microphone input directly in your browser using the MediaRecorder API — record, pause, resume, play back, and download.",
      "Recordings stay entirely on your device. Nothing is uploaded to any server. Session recordings are in-memory only and lost on page close.",
      "Downloads as WebM audio when the browser supports it. Includes a live timer and visual recording indicator.",
    ],
    features: [
      "Record, pause, and resume from the microphone",
      "Live timer and recording indicator",
      "Play back sessions before downloading",
      "WebM download (M4A fallback in Safari)",
    ],
  },
  "productivity/random-number-generator": {
    paragraphs: [
      "Generate random numbers, lists, UUIDs, and dice rolls instantly. Pick Single, List, UUID, or Dice mode, customize min, max, count, and uniqueness, then copy results with one click — everything runs locally in your browser.",
      "All processing for Random Number Generator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for remote workers, students, creators, and anyone who wants focused work sessions and simple daily utilities. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Lightweight and distraction-free",
      "Saved locally where settings apply",
      "Free with no account",
    ],
  },
  "other/qr-code-generator": {
    paragraphs: [
      "Our free QR Code Generator helps you create styled QR codes for URLs, Wi-Fi, vCards, events, and more. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for QR Code Generator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for professionals, small business owners, and everyday users who need quick creative and security utilities. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "URL, Wi-Fi, vCard, event, and more content types",
      "Customize colors, dots, and corners",
      "Download PNG, SVG, or JPEG",
    ],
  },
  "other/signature-maker": {
    paragraphs: [
      "Our free Signature Maker helps you draw, type, or upload a signature and download PNG or JPG. Everything runs in your browser for instant results — no signup, no waiting in a queue.",
      "All processing for Signature Maker happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for professionals, small business owners, and everyday users who need quick creative and security utilities. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Fast results in your browser",
      "Easy copy or download",
      "Free with no signup",
    ],
  },
  "other/password-generator": {
    paragraphs: [
      "Generate secure random passwords or memorable passphrases with a real-time strength meter. Customize length, character types, minimum numbers and symbols, or switch to a word-based passphrase. Everything runs in your browser.",
      "All processing for Password Generator happens locally in your browser. Your data is never sent to a server, making it suitable for sensitive text, tokens, financial figures, and personal information.",
      "This tool is useful for professionals, small business owners, and everyday users who need quick creative and security utilities. Use it whenever you need a fast, reliable result without installing software or creating an account.",
    ],
    features: [
      "Random passwords or memorable passphrases",
      "Real-time strength meter",
      "Customize length, symbols, and exclusions",
    ],
  },
};

const EXTRA_FAQS_BY_KEY: Record<string, ToolFaq[]> = {
  "pdf/compress-pdf": [
    { question: "Will compression reduce PDF quality?", answer: "Higher compression may reduce image quality inside the PDF. Use Low or Medium for documents where clarity matters most." },
    { question: "Is PDF Compress safe for confidential documents?", answer: "Yes. PDF Compress processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. PDF Compress is free to use with no signup or login required." },
  ],
  "pdf/merge-pdf": [
    { question: "What is PDF Merge used for?", answer: "Combine multiple PDFs into one file, in any order. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is PDF Merge safe for confidential documents?", answer: "Yes. PDF Merge processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. PDF Merge is free to use with no signup or login required." },
  ],
  "pdf/split-pdf": [
    { question: "What is PDF Split used for?", answer: "Split every page into its own PDF or extract specific pages. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is PDF Split safe for confidential documents?", answer: "Yes. PDF Split processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. PDF Split is free to use with no signup or login required." },
  ],
  "pdf/remove-pdf-password": [
    { question: "What is Remove PDF Password used for?", answer: "Unlock password-protected PDFs when you know the password. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is Remove PDF Password safe for confidential documents?", answer: "Yes. Remove PDF Password processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. Remove PDF Password is free to use with no signup or login required." },
  ],
  "pdf/rotate-pdf": [
    { question: "What is PDF Rotate used for?", answer: "Rotate one page or every page left or right. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is PDF Rotate safe for confidential documents?", answer: "Yes. PDF Rotate processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. PDF Rotate is free to use with no signup or login required." },
  ],
  "pdf/pdf-page-numbers": [
    { question: "What is PDF Page Numbers used for?", answer: "Stamp page numbers on every page before you share. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is PDF Page Numbers safe for confidential documents?", answer: "Yes. PDF Page Numbers processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. PDF Page Numbers is free to use with no signup or login required." },
  ],
  "pdf/pdf-watermark": [
    { question: "What is PDF Watermark used for?", answer: "Stamp text across PDF pages locally. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is PDF Watermark safe for confidential documents?", answer: "Yes. PDF Watermark processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. PDF Watermark is free to use with no signup or login required." },
  ],
  "pdf/pdf-to-jpg": [
    { question: "What is PDF to JPG used for?", answer: "Render PDF pages as JPG or PNG images. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is PDF to JPG safe for confidential documents?", answer: "Yes. PDF to JPG processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. PDF to JPG is free to use with no signup or login required." },
  ],
  "pdf/pdf-to-word": [
    { question: "What is PDF to Word used for?", answer: "Extract PDF text into an editable Word-friendly document. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is PDF to Word safe for confidential documents?", answer: "Yes. PDF to Word processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. PDF to Word is free to use with no signup or login required." },
  ],
  "pdf/word-to-pdf": [
    { question: "What is Word to PDF used for?", answer: "Convert a .docx file into a printable PDF. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is Word to PDF safe for confidential documents?", answer: "Yes. Word to PDF processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. Word to PDF is free to use with no signup or login required." },
  ],
  "pdf/excel-to-pdf": [
    { question: "What is Excel to PDF used for?", answer: "Turn spreadsheet sheets into a PDF table layout. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is Excel to PDF safe for confidential documents?", answer: "Yes. Excel to PDF processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. Excel to PDF is free to use with no signup or login required." },
  ],
  "pdf/ppt-to-pdf": [
    { question: "What is PPT to PDF used for?", answer: "Convert PowerPoint slides into a PDF. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is PPT to PDF safe for confidential documents?", answer: "Yes. PPT to PDF processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. PPT to PDF is free to use with no signup or login required." },
  ],
  "pdf/image-to-pdf": [
    { question: "What is Image to PDF used for?", answer: "Combine JPG, PNG, or WebP photos into one PDF. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is Image to PDF safe for confidential documents?", answer: "Yes. Image to PDF processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. Image to PDF is free to use with no signup or login required." },
  ],
  "pdf/word-to-jpg": [
    { question: "What is Word to JPG Converter used for?", answer: "Render a Word document page as a JPG image. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is Word to JPG Converter safe for confidential documents?", answer: "Yes. Word to JPG Converter processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. Word to JPG Converter is free to use with no signup or login required." },
  ],
  "image/image-compressor": [
    { question: "What is Image Compress used for?", answer: "Shrink JPEG, PNG, and WebP with a live size preview. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is Image Compress safe for confidential documents?", answer: "Yes. Image Compress processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. Image Compress is free to use with no signup or login required." },
  ],
  "image/image-converter": [
    { question: "What is Image Converter used for?", answer: "Convert between JPEG, PNG, WebP, and more. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is Image Converter safe for confidential documents?", answer: "Yes. Image Converter processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. Image Converter is free to use with no signup or login required." },
  ],
  "image/heic-to-jpg": [
    { question: "What is HEIC to JPG used for?", answer: "Convert iPhone HEIC photos to JPG. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is HEIC to JPG safe for confidential documents?", answer: "Yes. HEIC to JPG processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. HEIC to JPG is free to use with no signup or login required." },
  ],
  "image/webp-to-jpg": [
    { question: "What is WebP to JPG used for?", answer: "Convert WebP images to JPEG. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is WebP to JPG safe for confidential documents?", answer: "Yes. WebP to JPG processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. WebP to JPG is free to use with no signup or login required." },
  ],
  "image/background-remover": [
    { question: "Does background removal work offline?", answer: "The AI model loads on first use and then runs on-device. An initial download is required; after that, processing works without uploading your photo." },
    { question: "Is Background Remover safe for confidential documents?", answer: "Yes. Background Remover processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. Background Remover is free to use with no signup or login required." },
  ],
  "image/photo-resizer": [
    { question: "What is Photo Resizer used for?", answer: "Resize or crop photos to exact pixels or ID presets. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is Photo Resizer safe for confidential documents?", answer: "Yes. Photo Resizer processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. Photo Resizer is free to use with no signup or login required." },
  ],
  "image/color-palette-extractor": [
    { question: "What is Color Palette Extractor used for?", answer: "Pull dominant colors from any image. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is Color Palette Extractor safe for confidential documents?", answer: "Yes. Color Palette Extractor processes files locally in your browser. Your files are not uploaded to Utilvia servers." },
    { question: "What file size limits apply?", answer: "Most PDF and image tools support files up to 50MB. Very large files may be slower depending on your device." },
    { question: "Do I need to create an account?", answer: "No. Color Palette Extractor is free to use with no signup or login required." },
  ],
  "text/word-counter": [
    { question: "What is Word Counter used for?", answer: "Words, characters, keywords, reading time, and platform limits. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Word Counter?", answer: "Yes. Word Counter runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Word Counter is free to use with no signup or login required." },
    { question: "Can I use Word Counter on mobile?", answer: "Yes. Word Counter works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "text/case-converter": [
    { question: "What is Text Case Converter used for?", answer: "Switch text to UPPERCASE, lowercase, Title Case, and more. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Text Case Converter?", answer: "Yes. Text Case Converter runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Text Case Converter is free to use with no signup or login required." },
    { question: "Can I use Text Case Converter on mobile?", answer: "Yes. Text Case Converter works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "text/lorem-ipsum-generator": [
    { question: "What is Lorem Ipsum Generator used for?", answer: "Generate placeholder paragraphs and lists. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Lorem Ipsum Generator?", answer: "Yes. Lorem Ipsum Generator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Lorem Ipsum Generator is free to use with no signup or login required." },
    { question: "Can I use Lorem Ipsum Generator on mobile?", answer: "Yes. Lorem Ipsum Generator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "text/markdown-table-generator": [
    {
      question: "How do I create a Markdown table?",
      answer:
        "Pick a template or set the number of rows and columns, then type in the spreadsheet. The Markdown updates as you type. Copy it into GitHub, Notion, or any Markdown file.",
    },
    {
      question: "Can I align columns left, center, or right?",
      answer:
        "Yes. Use the alignment buttons on each column. That writes :---, :---:, or ---: in the separator row, which GitHub-flavored Markdown understands.",
    },
    {
      question: "What happens to pipes and line breaks in a cell?",
      answer:
        "Pipes are escaped as \\| so they do not split columns. Line breaks become <br> so they render inside the cell. Bold, italic, code, and links are left as Markdown.",
    },
    {
      question: "Is a header row required?",
      answer:
        "GitHub-flavored Markdown still needs a header line, but you can turn the header off. The generator then emits empty header cells and treats every spreadsheet row as data.",
    },
    {
      question: "Does my table leave the browser?",
      answer: "No. Editing, preview, copy, and download all run on your device. Close the tab to clear the grid.",
    },
  ],
  "text/keyword-density": [
    { question: "What is Keyword Density Checker used for?", answer: "Analyze keyword frequency and density in your content for SEO. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Keyword Density Checker?", answer: "Yes. Keyword Density Checker runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Keyword Density Checker is free to use with no signup or login required." },
    { question: "Can I use Keyword Density Checker on mobile?", answer: "Yes. Keyword Density Checker works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "developer/json-formatter": [
    { question: "What is JSON Formatter used for?", answer: "Pretty-print, minify, validate, and inspect JSON. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using JSON Formatter?", answer: "Yes. JSON Formatter runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. JSON Formatter is free to use with no signup or login required." },
    { question: "Can I use JSON Formatter on mobile?", answer: "Yes. JSON Formatter works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "developer/base64-encoder": [
    { question: "What is Base64 Encoder used for?", answer: "Encode or decode Base64 text in your browser. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Base64 Encoder?", answer: "Yes. Base64 Encoder runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Base64 Encoder is free to use with no signup or login required." },
    { question: "Can I use Base64 Encoder on mobile?", answer: "Yes. Base64 Encoder works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "developer/uuid-generator": [
    { question: "Can two UUIDs ever be the same?", answer: "UUID v4 values are random 122-bit numbers. Collision is theoretically possible but practically negligible for normal use." },
    { question: "Is my data private when using UUID Generator?", answer: "Yes. UUID Generator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. UUID Generator is free to use with no signup or login required." },
    { question: "Can I use UUID Generator on mobile?", answer: "Yes. UUID Generator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "developer/cron-expression-generator": [
    {
      question: "What is a cron expression?",
      answer:
        "A cron expression is a compact schedule. The standard 5-field form is minute, hour, day of month, month, and day of week.",
    },
    {
      question: "When should I use the 6-field format?",
      answer:
        "Use 6 fields when the scheduler supports seconds. The extra field comes first: second minute hour day-of-month month day-of-week.",
    },
    {
      question: "What happens if day of month and day of week are both set?",
      answer:
        "In standard cron the job runs when either field matches (OR, not AND). Leave one as every (*) unless you want that behavior.",
    },
    { question: "Is my data private when using Cron Expression Generator?", answer: "Yes. The generator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. It is free to use with no signup or login required." },
  ],
  "developer/subnet-calculator": [
    {
      question: "What does /24 mean in an IP address like 192.168.1.0/24?",
      answer:
        "The /24 prefix means the first 24 bits are the network. That is a 255.255.255.0 mask with 256 addresses and 254 usable hosts.",
    },
    {
      question: "Why are 2 addresses subtracted from the total to get usable hosts?",
      answer:
        "The first address is typically the network and the last is broadcast. /31 and /32 do not reserve those two addresses the same way.",
    },
    {
      question: "What's the difference between a subnet mask and a CIDR prefix?",
      answer:
        "They describe the same split. /24 is the count of network bits; 255.255.255.0 is those bits as four octets.",
    },
    { question: "Is my data private when using Subnet Calculator?", answer: "Yes. The calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. It is free to use with no signup or login required." },
  ],
  "developer/svg-code-previewer": [
    {
      question: "What is SVG and why is it used for web icons?",
      answer:
        "SVG is a vector format. Icons stay sharp at any size and the markup can be edited, colored, and inlined in HTML.",
    },
    {
      question: "Can I edit SVG colors and sizes without an image editor?",
      answer:
        "Yes. Change fill, stroke, width, height, or viewBox in the code and the preview updates immediately.",
    },
    {
      question: "Is it safe to paste SVG code from the internet into a previewer?",
      answer:
        "This tool strips script tags, event handlers, and javascript: URLs before rendering. Still treat untrusted files with care — sanitizing reduces XSS risk, it does not make every file harmless.",
    },
    {
      question: "How is SVG different from PNG?",
      answer:
        "PNG is a raster image of pixels. SVG describes shapes, so it scales without blur and usually has a smaller file size for icons.",
    },
    { question: "Is SVG code previewer free?", answer: "Yes. It runs in your browser with no signup. Markup stays on your device." },
  ],
  "developer/unix-timestamp-converter": [
    {
      question: "What is a Unix timestamp?",
      answer:
        "A Unix timestamp (epoch time) is the number of seconds — or milliseconds — since 1 January 1970 00:00:00 UTC, not counting leap seconds.",
    },
    {
      question: "How do I know if a timestamp is in seconds or milliseconds?",
      answer:
        "Seconds are usually 10 digits around the present day (about 1.7 billion). Milliseconds are usually 13 digits. Auto mode uses length: values of 1e11 or more are treated as milliseconds.",
    },
    {
      question: "Does the converter use my time zone?",
      answer:
        "Yes. Pick UTC, your local zone, or any IANA time zone. The same instant is shown as a local date and time in that zone, including daylight saving offsets.",
    },
    {
      question: "Can I convert a date back to epoch time?",
      answer:
        "Yes. Enter a date, time, and time zone in the Date → Timestamp section. The result is the Unix time in both seconds and milliseconds.",
    },
    {
      question: "Is the Unix Timestamp Converter free?",
      answer: "Yes. It runs in your browser with no signup. Values stay on your device.",
    },
  ],
  "developer/json-to-csv": [
    {
      question: "How do I convert JSON to CSV?",
      answer:
        "Paste JSON or drop a .json file. Arrays of objects become rows. Nested fields flatten into dotted column names, and CSV updates as you type.",
    },
    {
      question: "How are nested objects and arrays handled?",
      answer:
        "Nested objects become columns like location.city. Arrays of primitives are joined with \"; \". Arrays of objects stay as a JSON string in one cell so the table does not explode into extra columns.",
    },
    {
      question: "What JSON shapes are supported?",
      answer:
        "An array of objects, a single object, an array of values, or a wrapper such as { \"data\": [ ... ] } with one array. Missing keys become empty cells.",
    },
    {
      question: "Is my JSON uploaded to a server?",
      answer: "No. Parsing and conversion run entirely in your browser. Your data never leaves your device.",
    },
    {
      question: "Is the JSON to CSV converter free?",
      answer: "Yes. It is free to use with no signup required.",
    },
  ],
  "developer/dns-lookup": [
    {
      question: "Which DNS record types can I look up?",
      answer:
        "A, AAAA, CNAME, MX, NS, TXT, SOA, PTR, SRV, and CAA. Choose All records to query every supported type in one pass.",
    },
    {
      question: "How does the lookup work?",
      answer:
        "The hostname is sent to a DNS-over-HTTPS resolver (Cloudflare, with Google Public DNS as fallback). The browser never talks to the resolver directly, and no API keys are shipped to the client.",
    },
    {
      question: "Can I reverse-lookup an IP address?",
      answer:
        "Yes. Paste an IPv4 or IPv6 address and choose PTR (or All records). The tool converts it to an in-addr.arpa or ip6.arpa name first.",
    },
    {
      question: "Why are there no records for a type?",
      answer:
        "The name may exist but have no records of that type (NODATA), or the name may not exist (NXDOMAIN). The status line tells you which.",
    },
    {
      question: "Is this the same as dig on my computer?",
      answer:
        "It is a public resolver’s view of the records, not your ISP’s recursive cache. TTLs and answers can differ slightly from a local dig.",
    },
  ],
  "developer/htaccess-generator": [
    {
      question: "What is an .htaccess file?",
      answer:
        "It is a directory-level Apache config file. You can use it for HTTPS redirects, www canonicalization, custom error pages, browser caching, GZIP, IP blocks, and protecting files like .env — without editing the main server config.",
    },
    {
      question: "Does .htaccess work on Nginx?",
      answer:
        "No. Apache reads .htaccess; Nginx ignores it. On Nginx you would put the same ideas in a server block. This generator is for Apache only.",
    },
    {
      question: "How do I redirect HTTP to HTTPS using .htaccess?",
      answer:
        "Turn on Redirect HTTP to HTTPS. The file enables RewriteEngine and 301-redirects any request where HTTPS is off to the same host and path over https://.",
    },
    {
      question: "Will incorrect .htaccess rules break my site?",
      answer:
        "Yes, a bad rule can cause a 500 error or a redirect loop. Keep a backup, upload the file to your document root, and test HTTPS, www, and a few pages. If the site fails, rename or remove .htaccess to recover.",
    },
    {
      question: "Is this generator free?",
      answer: "Yes. It runs in your browser with no signup. Rules stay on your device.",
    },
  ],
  "developer/http-status-codes": [
    {
      question: "What is the difference between HTTP 401 and 403?",
      answer:
        "401 Unauthorized means the client is not authenticated — missing, expired, or invalid credentials. 403 Forbidden means the client is authenticated but not allowed to access that resource. Fix 401 by logging in or refreshing a token; fix 403 by changing roles or permissions.",
    },
    {
      question: "What is the difference between 301 and 302 redirects?",
      answer:
        "301 Moved Permanently tells clients and search engines the new URL is the lasting home — browsers may cache it and SEO signals transfer. 302 Found is temporary; follow Location now, but keep using the original URL later. Use 307/308 when the HTTP method must stay the same.",
    },
    {
      question: "What does HTTP 429 Too Many Requests mean?",
      answer:
        "The client hit a rate limit or quota. Read the Retry-After header if present, then retry with exponential backoff (1s, 2s, 4s, 8s). Slow down loops, cache responses, and avoid hammering login endpoints.",
    },
    {
      question: "When should an API return 422 vs 400?",
      answer:
        "400 Bad Request is for a malformed request — invalid JSON, missing Content-Type, broken query string. 422 Unprocessable Entity is for a well-formed request that fails business rules, such as an invalid email or a negative age. Many APIs still use 400 for both; 422 is clearer for field validation.",
    },
    {
      question: "Is this reference free?",
      answer: "Yes. It runs in your browser with no signup. Nothing is sent to a server.",
    },
  ],
  "developer/json-schema-validator": [
    {
      question: "What is JSON Schema used for?",
      answer:
        "JSON Schema describes and validates the structure of JSON data — used in REST APIs, configuration files, and OpenAPI documentation.",
    },
    {
      question: "What is the difference between Draft 7 and Draft 2020-12?",
      answer:
        "Draft 7 is most widely used and compatible with OpenAPI 3.0. Draft 2020-12 adds $dynamicRef for complex recursive schemas.",
    },
    {
      question: "Why does valid JSON fail schema validation?",
      answer:
        "Syntax-valid JSON can fail if types don't match, required fields are missing, or values are outside allowed ranges.",
    },
    {
      question: "How do I mark a field as required?",
      answer: 'Use the required array at the same level as properties: { "properties": {...}, "required": ["name"] }.',
    },
    {
      question: "Is this validator free?",
      answer: "Yes. It runs in your browser with no signup. Your JSON stays on your device.",
    },
  ],
  "developer/ip-address-lookup": [
    {
      question: "How accurate is IP geolocation?",
      answer:
        "IP geolocation is approximate — typically accurate to country level and often to city level, but not to exact street address. The location shown is based on where your ISP registered the IP block, which may differ from your actual physical location.",
    },
    {
      question: "Why does my IP show a different city than where I am?",
      answer:
        "IP addresses are assigned in blocks to ISPs, and the registered location of that block may be a different city than where you're physically located — especially if your ISP routes traffic through a regional hub.",
    },
    {
      question: "What's the difference between a public and private IP address?",
      answer:
        "Your public IP is visible to the internet and assigned by your ISP. Private IP addresses (like 192.168.x.x) are used within your local network and not visible externally — this tool shows public IPs only.",
    },
    {
      question: "Can I look up my phone's IP address?",
      answer:
        "Yes — visiting this tool on your phone will show your phone's current public IP (assigned by your mobile carrier or WiFi network).",
    },
    {
      question: "Is IP address lookup free?",
      answer: "Yes. It runs in your browser with no signup. Only the IP you look up is sent to the geolocation provider.",
    },
  ],
  "developer/robots-txt-generator": [
    {
      question: "What belongs in robots.txt?",
      answer:
        "User-agent groups with Allow and Disallow paths, optional Crawl-delay, and Sitemap URLs. This generator sticks to those widely supported directives and skips Host, Noindex, and other non-standard lines.",
    },
    {
      question: "Does Google honor Crawl-delay?",
      answer:
        "No. Google ignores Crawl-delay. Bing, Yandex, and some other crawlers still use it. The file stays valid if you include it.",
    },
    {
      question: "Can I use more than one user-agent?",
      answer:
        "Yes. Add a group per crawler (for example * and GPTBot). Matching groups are combined by the crawler. Sitemap lines apply to the whole file, not a single agent.",
    },
    {
      question: "Where should I put the file?",
      answer:
        "Serve it at https://your-domain/robots.txt on the site root. Paths are relative to the host, and Sitemap values must be full URLs.",
    },
    {
      question: "Is this processed on a server?",
      answer: "No. The file is generated in your browser. Nothing is uploaded to Utilvia.",
    },
  ],
  "developer/css-gradient-generator": [
    {
      question: "What CSS gradient types can I generate?",
      answer:
        "Linear, radial, and conic — including repeating variants. Linear blends along an angle, radial from a point, and conic around a center.",
    },
    {
      question: "How do color stops work?",
      answer:
        "Each stop is a color, opacity, and position from 0% to 100%. Drag stops on the bar, or edit them in the list. You can add up to 12 stops and must keep at least two.",
    },
    {
      question: "Can I copy HEX, RGB, or HSL?",
      answer:
        "Yes. Switch the color format to change both the stop fields and the generated CSS. Opacity below 100% uses hex-alpha, rgba(), or hsla().",
    },
    {
      question: "Does the preview match the copied CSS?",
      answer:
        "The live preview uses the same gradient value as the CSS snippet. Paste `background: …` into a stylesheet or inline style.",
    },
    {
      question: "Is the CSS Gradient Generator free?",
      answer: "Yes. It runs in your browser with no signup. Colors and CSS stay on your device.",
    },
  ],
  "developer/glassmorphism-generator": [
    {
      question: "What CSS property creates the glassmorphism effect?",
      answer:
        "backdrop-filter: blur() plus a semi-transparent background. Saturation on the filter makes colors behind the glass look more vivid. A light border and soft shadow finish the frosted-glass look.",
    },
    {
      question: "Does glassmorphism work in Firefox?",
      answer:
        "Firefox still has limited backdrop-filter support in some setups. The Pure CSS export includes an @supports fallback that uses a more opaque background when blur is not available.",
    },
    {
      question: "How do I add glassmorphism in Tailwind CSS?",
      answer:
        "Copy the Tailwind tab. It uses arbitrary values such as backdrop-blur-[12px] and bg-[rgba(...)] so the classes match the preview without a custom plugin.",
    },
    {
      question: "Is glassmorphism bad for performance?",
      answer:
        "Large blurred areas can be expensive to paint. Keep blur moderate, avoid stacking many glass layers, and test on lower-end devices. Prefer this effect on cards, nav bars, and modals rather than full-page backgrounds.",
    },
    {
      question: "Is this generator free?",
      answer: "Yes. It runs in your browser with no signup. Colors and CSS stay on your device.",
    },
  ],
  "developer/box-shadow-generator": [
    {
      question: "What is a CSS box-shadow?",
      answer:
        "box-shadow draws one or more shadows behind or inside an element. Each layer has horizontal and vertical offset, blur, spread, color, and an optional inset keyword.",
    },
    {
      question: "How do multiple shadow layers work?",
      answer:
        "The first layer is drawn on top. Add up to 8 layers for stacked depth — for example a tight contact shadow plus a softer lift. Reorder layers to change which one sits in front.",
    },
    {
      question: "What is the difference between inset and outer shadows?",
      answer:
        "An outer shadow falls outside the box. Inset draws the shadow inside the border, useful for pressed buttons and wells.",
    },
    {
      question: "Can I copy HEX, RGB, or HSL?",
      answer:
        "Yes. Switch the color format to change both the color field and the generated CSS. Opacity below 100% uses 8-digit hex, rgba(), or hsla().",
    },
    {
      question: "Is the Box Shadow Generator free?",
      answer: "Yes. It runs in your browser with no signup. Colors and CSS stay on your device.",
    },
  ],
  "developer/color-palette-generator": [
    { question: "What is a Tailwind color scale?", answer: "A Tailwind color scale is eleven named stops from 50 (near-white) to 950 (near-black). Shade 500 is your brand color. Lighter stops work for backgrounds and borders; darker stops work for hover, text, and high-contrast UI." },
    { question: "How do I add a custom color palette to Tailwind?", answer: "Copy the Tailwind Config output and paste it under theme.extend.colors in tailwind.config.js. You can then use classes such as bg-brand-500, text-brand-700, and border-brand-200." },
    { question: "What is WCAG contrast ratio and why does it matter?", answer: "WCAG AA needs a 4.5:1 contrast ratio for normal text. Each shade shows ✅ B if black text passes on that color, or ✅ W if white text passes." },
    { question: "Can I use this palette in non-Tailwind projects?", answer: "Yes. Switch to CSS Variables and copy --color-brand-50 through --color-brand-950. Those custom properties work in any stylesheet." },
    { question: "Is this generator free?", answer: "Yes. It runs entirely in your browser with no signup. Your brand color never leaves the device." },
  ],
  "developer/device-browser-info": [
    { question: "What is Device & Browser Info used for?", answer: "See viewport, user agent, and device details. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Device & Browser Info?", answer: "Yes. Device & Browser Info runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Device & Browser Info is free to use with no signup or login required." },
    { question: "Can I use Device & Browser Info on mobile?", answer: "Yes. Device & Browser Info works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "developer/roman-numeral-converter": [
    { question: "What is Roman Numeral Converter used for?", answer: "Convert numbers to Roman numerals and back. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Roman Numeral Converter?", answer: "Yes. Roman Numeral Converter runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Roman Numeral Converter is free to use with no signup or login required." },
    { question: "Can I use Roman Numeral Converter on mobile?", answer: "Yes. Roman Numeral Converter works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/age-calculator": [
    { question: "What is Age Calculator used for?", answer: "Exact age as of today or any cutoff date, plus totals. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Age Calculator?", answer: "Yes. Age Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Age Calculator is free to use with no signup or login required." },
    { question: "Can I use Age Calculator on mobile?", answer: "Yes. Age Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/emi-calculator": [
    { question: "What is EMI Calculator used for?", answer: "Calculate EMI, total interest, and amortization charts. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using EMI Calculator?", answer: "Yes. EMI Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. EMI Calculator is free to use with no signup or login required." },
    { question: "Can I use EMI Calculator on mobile?", answer: "Yes. EMI Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/gst-calculator": [
    { question: "What is GST Calculator used for?", answer: "Add or remove GST with CGST/SGST split at Indian rates. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using GST Calculator?", answer: "Yes. GST Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. GST Calculator is free to use with no signup or login required." },
    { question: "Can I use GST Calculator on mobile?", answer: "Yes. GST Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/salary-hike-calculator": [
    { question: "What is Salary Hike Calculator used for?", answer: "Convert hike % to new salary, or reverse from a target CTC. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Salary Hike Calculator?", answer: "Yes. Salary Hike Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Salary Hike Calculator is free to use with no signup or login required." },
    { question: "Can I use Salary Hike Calculator on mobile?", answer: "Yes. Salary Hike Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/ctc-to-in-hand-salary": [
    { question: "What is CTC to In-Hand Salary used for?", answer: "In-hand from CTC with 50/20/30 split, PF, PT, and new-regime tax. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using CTC to In-Hand Salary?", answer: "Yes. CTC to In-Hand Salary runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. CTC to In-Hand Salary is free to use with no signup or login required." },
    { question: "Can I use CTC to In-Hand Salary on mobile?", answer: "Yes. CTC to In-Hand Salary works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/fd-calculator": [
    { question: "What is FD Calculator used for?", answer: "FD maturity, EAR, and growth chart with years or months. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using FD Calculator?", answer: "Yes. FD Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. FD Calculator is free to use with no signup or login required." },
    { question: "Can I use FD Calculator on mobile?", answer: "Yes. FD Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/section-44ada-calculator": [
    { question: "What is Section 44ADA Freelancer Tax Calculator used for?", answer: "Estimate presumptive tax for Indian freelancers. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Section 44ADA Freelancer Tax Calculator?", answer: "Yes. Section 44ADA Freelancer Tax Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Section 44ADA Freelancer Tax Calculator is free to use with no signup or login required." },
    { question: "Can I use Section 44ADA Freelancer Tax Calculator on mobile?", answer: "Yes. Section 44ADA Freelancer Tax Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/notice-period-calculator": [
    { question: "What is Notice Period Calculator used for?", answer: "Last working day, calendar, working-days mode, and buyout. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Notice Period Calculator?", answer: "Yes. Notice Period Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Notice Period Calculator is free to use with no signup or login required." },
    { question: "Can I use Notice Period Calculator on mobile?", answer: "Yes. Notice Period Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/percentage-calculator": [
    { question: "What is Percentage Calculator used for?", answer: "X% of Y, X is % of Y, % change, and add/subtract %. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Percentage Calculator?", answer: "Yes. Percentage Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Percentage Calculator is free to use with no signup or login required." },
    { question: "Can I use Percentage Calculator on mobile?", answer: "Yes. Percentage Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/income-tax-calculator": [
    { question: "What is Income Tax Calculator used for?", answer: "Estimate Indian income tax for FY 2025-26. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Income Tax Calculator?", answer: "Yes. Income Tax Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Income Tax Calculator is free to use with no signup or login required." },
    { question: "Can I use Income Tax Calculator on mobile?", answer: "Yes. Income Tax Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/old-vs-new-tax-regime": [
    { question: "What is Old vs New Tax Regime Comparison used for?", answer: "Compare old and new Indian tax regimes side by side. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Old vs New Tax Regime Comparison?", answer: "Yes. Old vs New Tax Regime Comparison runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Old vs New Tax Regime Comparison is free to use with no signup or login required." },
    { question: "Can I use Old vs New Tax Regime Comparison on mobile?", answer: "Yes. Old vs New Tax Regime Comparison works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/tip-calculator": [
    { question: "What is Tip Calculator used for?", answer: "Split a bill and calculate tip per person. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Tip Calculator?", answer: "Yes. Tip Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Tip Calculator is free to use with no signup or login required." },
    { question: "Can I use Tip Calculator on mobile?", answer: "Yes. Tip Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/hra-calculator": [
    { question: "What is HRA Calculator used for?", answer: "Estimate HRA exemption for Indian salaried employees. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using HRA Calculator?", answer: "Yes. HRA Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. HRA Calculator is free to use with no signup or login required." },
    { question: "Can I use HRA Calculator on mobile?", answer: "Yes. HRA Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/paycheck-calculator": [
    {
      question: "Does the calculator change when I pick another country?",
      answer:
        "Yes. Each country uses its own income-tax brackets, social contributions, and typical payroll deductions — for example US FICA, UK National Insurance, India EPF/ESI, and Canada CPP/EI.",
    },
    {
      question: "Why is my tax bracket different from my effective tax rate?",
      answer:
        "Your marginal bracket is the rate on your last dollar (or rupee/pound) of taxable income. Your effective rate is total tax divided by income, which is usually lower because earlier amounts are taxed in lower bands.",
    },
    {
      question: "Will a raise ever reduce my take-home pay?",
      answer:
        "Crossing into a higher bracket only raises the rate on income above that threshold — it does not re-tax your whole salary at the higher rate. Take-home should still increase with a raise.",
    },
    {
      question: "How accurate are state, province, or professional-tax amounts?",
      answer:
        "Regional tax is a simplified estimate for comparison. Real withholding depends on local brackets, credits, and forms — check official rules for precision. Estimates are not tax advice.",
    },
    {
      question: "Is paycheck calculator free?",
      answer: "Yes. The Utilvia Paycheck Calculator is free with no signup. Estimates run in your browser and are not tax advice.",
    },
  ],
  "finance/mortgage-calculator": [
    {
      question: "Does the calculator change when I pick another country?",
      answer:
        "Yes. Country selection updates currency, number formatting, field labels, loan-term presets, and extra costs such as HOA, processing charges, or DLD fees.",
    },
    {
      question: "How is the monthly mortgage payment calculated?",
      answer:
        "Principal and interest use the standard amortizing-loan formula with monthly payments. Recurring extras are added to the monthly payment; one-time fees are included in total amount paid.",
    },
    { question: "Is my data private when using Mortgage Calculator?", answer: "Yes. Mortgage Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Mortgage Calculator is free to use with no signup or login required." },
    { question: "Can I use Mortgage Calculator on mobile?", answer: "Yes. Mortgage Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/w2-vs-1099": [
    {
      question: "Why do other countries not say W-2 and 1099?",
      answer:
        "W-2 and 1099 are US tax forms. In other countries the same comparison is employee vs self-employed, contractor, sole trader, or freelancer.",
    },
    { question: "Is this tax advice?", answer: "No. Results are simplified estimates for comparison, not professional tax advice." },
    { question: "Is my data private when using W-2 vs 1099 Tax Calculator?", answer: "Yes. The calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. It is free to use with no signup or login required." },
    { question: "Can I use this calculator on mobile?", answer: "Yes. It works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/self-employment-tax": [
    {
      question: "Is US self-employment tax the same as income tax?",
      answer:
        "No. Self-employment tax is Social Security and Medicare on net profit. Income tax is calculated separately using federal brackets and a simplified state estimate.",
    },
    {
      question: "Does the UAE have self-employment tax?",
      answer:
        "There is no federal personal income tax on salary. This estimate applies simplified corporate tax of 0% on the first AED 375,000 of profit and 9% above.",
    },
    { question: "Is this tax advice?", answer: "No. Results are simplified estimates for planning, not professional tax advice." },
    { question: "Is my data private when using Self-Employment Tax Calculator?", answer: "Yes. The calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. It is free to use with no signup or login required." },
    { question: "Can I use this calculator on mobile?", answer: "Yes. It works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/loan-eligibility-calculator": [
    {
      question: "Does the calculator change when I pick another country?",
      answer:
        "Yes. Country selection updates currency, labels (DTI, FOIR, TDS, DBR), credit-score scales, employment types, loan-term presets, and eligibility caps. Canada and Australia also apply a higher qualifying rate on home loans.",
    },
    {
      question: "How is eligible loan amount calculated?",
      answer:
        "The calculator finds the monthly payment you can still take on after existing debts, using that country’s ratio cap and any employment haircut. It then converts that payment into a loan principal at the qualifying interest rate and term.",
    },
    {
      question: "What do Eligible, May Be Eligible, and Not Eligible mean?",
      answer:
        "Eligible means the requested loan sits inside typical planning guidelines. May Be Eligible means at least one factor is in a stretch band (ratio, credit, or LTV). Not Eligible means a hard cap is missed. Lenders still apply their own policy.",
    },
    {
      question: "Is this a loan approval?",
      answer:
        "No. Results are simplified estimates for planning. They are not a pre-approval, sanction letter, or credit decision. Speak with a licensed lender for an offer.",
    },
    { question: "Is the Loan Eligibility Calculator free?", answer: "Yes. It runs entirely in your browser with no signup. Your figures stay on your device." },
  ],
  "finance/labour-code-2026-salary": [
    {
      question: "What is the 50% wage rule under India’s Labour Codes?",
      answer:
        "Under Section 2(y) of the Code on Wages, wages are basic pay, dearness allowance, and retaining allowance. If other allowances exceed 50% of remuneration, the excess is added back to wages for PF, ESI, and gratuity. The Codes took effect on 21 November 2025.",
    },
    {
      question: "Does PF still use a ₹15,000 wage ceiling?",
      answer:
        "Yes in this model. EPF Scheme 2026 keeps a notified monthly wage ceiling of ₹15,000 for mandatory contributions. Amounts above that are voluntary — use “On full statutory wages” to model that choice.",
    },
    {
      question: "What happens when I pick a country other than India?",
      answer:
        "The Labour Code wage floor is not applied. The calculator switches to that country’s payroll framework — for example US FICA, UK PAYE and NI, Canada CPP/EI, Australia Super Guarantee, or UAE’s no personal income tax on salary.",
    },
    {
      question: "Why is take-home different from CTC?",
      answer:
        "Take-home is cash after employee PF/FICA/NI, tax, and other deductions. Employer contributions (PF, ESI, FICA, Super, NI) sit on top of cash pay and raise employer cost without hitting the employee’s bank account.",
    },
    {
      question: "Are these figures a legal determination?",
      answer:
        "No. Results are simplified estimates. Actual pay depends on notified ceilings, state rules, establishment coverage, and your employer’s policy. This is not legal, tax, or payroll advice.",
    },
  ],
  "finance/currency-converter": [
    {
      question: "Where do the exchange rates come from?",
      answer:
        "Mid-market rates are fetched from a public feed (ExchangeRate-API, with Frankfurter as fallback). Banks and card networks add their own spread, so the number you pay can differ.",
    },
    {
      question: "How often are rates updated?",
      answer:
        "The converter refreshes when you change the from-currency or tap Refresh. Quotes are cached for 15 minutes. The last update time from the provider is shown under the result.",
    },
    {
      question: "Can I convert Indian rupees and UAE dirhams?",
      answer:
        "Yes. The list includes INR, AED, and other widely used currencies. Search by country, currency name, or ISO code.",
    },
    {
      question: "Is this the rate my bank will use?",
      answer:
        "No. These are approximate mid-market rates. The rate on a card payment, wire, or cash exchange depends on the provider and the time of the transaction.",
    },
    {
      question: "Does the converter send my amount to a server?",
      answer:
        "No. Only the from-currency code is requested from the rate API. The amount is converted locally in your browser.",
    },
  ],
  "finance/crypto-price-tracker": [
    {
      question: "Where do the crypto prices come from?",
      answer:
        "Near-real-time market data is fetched from CoinGecko (top 50 coins by market cap). Quotes are cached for about 20 seconds so refresh stays within free-tier rate limits. This is not a live exchange feed.",
    },
    {
      question: "How often does the tracker refresh?",
      answer:
        "Auto-refresh defaults to 30 seconds and can be set to 15 or 60. Refresh pauses when the tab is hidden, and a manual Refresh button is always available. If CoinGecko rate-limits the feed, the last snapshot is kept.",
    },
    {
      question: "Can I view prices in INR or AED?",
      answer:
        "Yes. Switch the quote currency between USD, EUR, GBP, INR, and AED. Search by coin name or ticker (BTC, ETH, SOL, XRP, and others in the top 50).",
    },
    {
      question: "Is this financial advice?",
      answer:
        "No. Prices, 24-hour ranges, and market caps are approximate and can differ from an exchange at trade time. Use them for a snapshot, not for placing orders.",
    },
    {
      question: "Does the tracker send my wallet or holdings?",
      answer:
        "No. Only the selected fiat code is requested from the market API. There is no account, wallet connection, or personal portfolio upload.",
    },
  ],
  "finance/capital-gains-tax": [
    {
      question: "What rates does this calculator use?",
      answer:
        "For AY 2026–27, listed equity and equity mutual funds use 20% STCG (Section 111A) and 12.5% LTCG (Section 112A) on gains above ₹1.25 lakh. Other long-term assets generally use 12.5% without indexation. Rates live in a rules file so they can be updated when the law changes.",
    },
    {
      question: "How is short-term vs long-term decided?",
      answer:
        "Listed equity, equity funds, and other listed securities become long-term after more than 12 months. Property, gold, and other assets become long-term after more than 24 months. Held for that period or less is short-term.",
    },
    {
      question: "Does property still get indexation?",
      answer:
        "Indexation is generally not available after 23 July 2024. Resident individuals and HUFs who acquired land or building before that date may still choose 20% with indexation or 12.5% without — this estimate picks the lower tax.",
    },
    {
      question: "Is the ₹1.25 lakh LTCG exemption per sale?",
      answer:
        "No. The Section 112A exemption is ₹1.25 lakh per financial year across all listed-equity and equity-fund long-term gains. Enter other 112A gains already booked this year to reduce the remaining exemption.",
    },
    {
      question: "Are these figures tax advice?",
      answer:
        "No. Results are planning estimates. Actual tax can vary with STT, surcharge, set-off of losses, Sections 54/54F/54EC conditions, taxpayer status, and the applicable year. Confirm with a qualified tax professional or the Income Tax Department.",
    },
  ],
  "finance/rd-calculator": [
    {
      question: "How is RD maturity calculated?",
      answer:
        "The default method is the Indian installment formula with quarterly compounding, which most bank RD calculators use. You can switch to monthly or yearly compounding, or to a model that credits interest only at compounding dates.",
    },
    {
      question: "Why do banks show a slightly different maturity value?",
      answer:
        "Banks may round interest monthly, use a 365-day year, apply a senior-citizen spread, or credit interest on a slightly different day. Treat this result as an estimate.",
    },
    {
      question: "What tenure can I enter?",
      answer: "Most bank RDs run from 6 months to 10 years. Enter tenure in years or months within that range.",
    },
    {
      question: "Is RD interest taxable?",
      answer:
        "Yes. RD interest is added to your income and taxed at your slab rate. Banks may deduct TDS above the applicable threshold. This calculator does not subtract tax.",
    },
    {
      question: "Is this processed on a server?",
      answer: "No. Maturity, interest, and the deposit schedule are calculated in your browser. Nothing is uploaded to Utilvia.",
    },
  ],
  "finance/nps-calculator": [
    {
      question: "What is the minimum monthly contribution to NPS?",
      answer:
        "NPS Tier I typically needs at least ₹500 per contribution and ₹1,000 in a financial year. This calculator defaults to ₹5,000 a month.",
    },
    {
      question: "Can I withdraw the full NPS corpus at retirement?",
      answer:
        "At age 60 or later, at least 40% usually goes to an annuity and up to 60% can be withdrawn as a lump sum. If the corpus is ₹5 lakh or less, a 100% lump-sum exit is allowed. Before 60, the annuity share is typically 80% unless the corpus is very small.",
    },
    {
      question: "Is NPS better than PPF?",
      answer:
        "They serve different jobs. PPF is a 15-year EEE small-savings scheme with a government-set rate. NPS is market-linked, can run to retirement, and pays a pension from the annuity. Many people use both. This calculator does not compare products.",
    },
    {
      question: "Is NPS available under the new tax regime?",
      answer:
        "Your own NPS contribution is not deductible under the new regime. Employer NPS under 80CCD(2) still is. Under the old regime, 80CCD(1) (within the ₹1.5 lakh 80C cap) and extra 80CCD(1B) up to ₹50,000 can apply. Tax figures here are an old-regime illustration at a 30% slab.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Amounts stay on your device.",
    },
  ],
  "finance/401k-calculator": [
    {
      question: "What is the 401(k) contribution limit for 2026?",
      answer:
        "The 2026 employee elective deferral limit is $24,500. Age 50+ catch-up is $8,000. Ages 60–63 can use the higher SECURE 2.0 catch-up of $11,250. The annual additions limit (employee + employer, excluding catch-up) is $72,000.",
    },
    {
      question: "How much should I contribute to my 401(k)?",
      answer:
        "A common starting point is at least enough to capture the full employer match, then work toward the IRS maximum if your budget allows. This calculator shows when you hit the annual limit and how match, salary growth, and returns change the projected balance.",
    },
    {
      question: "What is the employer 401(k) match and why does it matter?",
      answer:
        "Many employers match a percentage of what you defer, up to a share of salary (for example 50% up to 6%). That match is additional compensation. Contributing below the match cap means leaving part of it unclaimed.",
    },
    {
      question: "What is the SECURE 2.0 super catch-up contribution?",
      answer:
        "For ages 60–63, 2026 allows a higher catch-up of $11,250 instead of the regular age-50 catch-up of $8,000. The calculator applies the matching limit automatically in those years.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Salary and balance figures stay on your device.",
    },
  ],
  "finance/leave-encashment-calculator": [
    {
      question: "Is leave encashment taxable in India?",
      answer:
        "Leave encashment during service is fully taxable as income. Leave encashment at retirement or resignation is partially exempt — the exemption is the minimum of the actual amount received, 10 months' salary, or ₹25 lakhs (the limit was raised from ₹3 lakhs to ₹25 lakhs in Budget 2023).",
    },
    {
      question: "How is leave encashment calculated for private sector employees?",
      answer:
        "For private sector employees, leave encashment is typically calculated as: (Monthly Basic Salary ÷ 26 working days) × number of leave days to be encashed. Government employees often use (Basic × 12 ÷ 300) × days. Some companies use 30 days per month — check your HR policy.",
    },
    {
      question: "What is the ₹25 lakh leave encashment exemption?",
      answer:
        "Budget 2023 raised the tax exemption limit for leave encashment at retirement or resignation from ₹3 lakhs to ₹25 lakhs for non-government employees. The exempt amount is the lowest of actual encashment received, 10 months' salary, or that statutory limit.",
    },
    {
      question: "Are casual leaves and sick leaves encashable?",
      answer:
        "Generally, only Earned Leave (EL) or Privilege Leave (PL) is eligible for encashment. Casual Leave (CL) and Sick Leave (SL) typically lapse unused and cannot be encashed, though specific rules depend on your employer's leave policy and applicable state labour laws.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Salary figures stay on your device.",
    },
  ],
  "finance/cagr-calculator": [
    {
      question: "What is a good CAGR in India?",
      answer:
        "For equity mutual funds and stocks, a CAGR of 12–15% or above over 5+ years is generally considered good, as it matches or beats the Nifty 50’s historical long-term average. For fixed income, 7–8% CAGR (PPF/FD range) is typical. Always compare against the relevant benchmark.",
    },
    {
      question: "What is the difference between CAGR and absolute return?",
      answer:
        "Absolute return is the total gain, ignoring time. ₹1 lakh growing to ₹2 lakhs is 100% absolute return whether it took 2 years or 10. CAGR is the annualised rate — 100% in 2 years is about 41.4% CAGR, while 100% in 10 years is about 7.2% CAGR. Use CAGR when comparing investments of different durations.",
    },
    {
      question: "Can I use CAGR for SIP investments?",
      answer:
        "CAGR is for a single lump-sum with one start value and one end value. For SIPs with multiple cash flows, use XIRR, which accounts for different dates and amounts. Most mutual fund platforms show XIRR for SIP portfolios.",
    },
    {
      question: "What is the Rule of 72?",
      answer:
        "Divide 72 by the annual growth rate to estimate years to double. At 12% CAGR, money doubles in 6 years. At 8%, it takes 9 years. At 6% inflation, prices double in 12 years — which is why investments should earn more than inflation.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Amounts stay on your device.",
    },
  ],
  "finance/ssy-calculator": [
    { question: "What is SSY Calculator used for?", answer: "Project Sukanya Samriddhi Yojana maturity. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using SSY Calculator?", answer: "Yes. SSY Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. SSY Calculator is free to use with no signup or login required." },
    { question: "Can I use SSY Calculator on mobile?", answer: "Yes. SSY Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "finance/advance-tax-calculator": [
    {
      question: "Who needs to pay advance tax in India?",
      answer:
        "Advance tax is due when estimated tax liability after TDS exceeds ₹10,000 in a financial year. Salaried people with extra income (rent, capital gains, freelance), businesses, and professionals typically need it. Senior citizens without business income are generally exempt.",
    },
    {
      question: "What are the advance tax due dates for FY 2026-27?",
      answer:
        "Pay at least 15% by 15 June 2026, 45% by 15 September 2026, 75% by 15 December 2026, and 100% by 15 March 2027. Percentages are cumulative. Under Section 44ADA you may pay 100% in a single installment on or before 15 March 2027.",
    },
    {
      question: "What is the penalty for not paying advance tax?",
      answer:
        "Interest under Section 234B is 1% per month on unpaid tax if you miss advance tax. Section 234C adds 1% per month for each quarter you fall short of the cumulative installment. Paying on time avoids both.",
    },
    {
      question: "Do freelancers under Section 44ADA need to pay quarterly advance tax?",
      answer:
        "No. Presumptive professionals under Section 44ADA can pay 100% of advance tax in one installment on or before 15 March. 50% of gross receipts is treated as taxable income. If receipts exceed the 44ADA cap, maintain books and follow the four-installment schedule.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Income figures stay on your device.",
    },
  ],
  "finance/professional-tax-calculator": [
    { question: "What is the maximum Professional Tax in India?", answer: "Article 276 of the Constitution caps professional tax at ₹2,500 per person per year. Maharashtra reaches that cap with ₹200 for eleven months and ₹300 in February." },
    { question: "Which states in India don't have Professional Tax?", answer: "States and UTs without professional tax include Delhi, Uttar Pradesh, Rajasthan, Haryana, Punjab, Uttarakhand, Himachal Pradesh, Goa, Chhattisgarh, Nagaland, Arunachal Pradesh, J&K, and Ladakh." },
    { question: "Why is Maharashtra PT ₹300 in February?", answer: "Maharashtra deducts ₹200 for eleven months (₹2,200) and ₹300 in February so the annual total is exactly ₹2,500, the constitutional maximum." },
    { question: "Are women exempt from Professional Tax in Maharashtra?", answer: "Yes. Women earning up to ₹25,000 per month are exempt in Maharashtra. Above that, the same ₹200 / February ₹300 slab as other employees applies." },
    { question: "Is this calculator free?", answer: "Yes. It runs in your browser with no signup. Salary figures stay on your device." },
  ],
  "finance/pay-stub-generator": [
    {
      question: "Can I use this pay stub for a rental application or visa?",
      answer:
        "This is a sample, estimated payroll document — not an official payslip. Some landlords or agencies may still ask for employer or payroll-provider records. Always check what they require.",
    },
    {
      question: "Do taxes and contributions change when I pick another country?",
      answer:
        "Yes. Each country uses its own currency, pay-stub labels, and payroll estimates: US federal tax and FICA, India new-regime tax with EPF/ESI/professional tax, UK PAYE and National Insurance, Canada federal/CPP/EI plus a provincial estimate, Australia PAYG and Medicare levy, and UAE salary with no personal income tax.",
    },
    {
      question: "How accurate are the tax deductions?",
      answer:
        "Statutory lines are estimates from current public tax tables, annualized from your pay frequency. You can override any line. Real withholding depends on tax codes, benefits, and payroll software. This is not tax advice or an official record.",
    },
    {
      question: "Is my pay information safe to enter here?",
      answer:
        "Yes. Everything runs in your browser. Nothing is uploaded. Close the tab to clear the stub. Only the last four characters of a national ID are stored, and they print with a mask.",
    },
    {
      question: "What is the difference between gross pay and net pay?",
      answer:
        "Gross pay is the sum of earnings for the period (hours × rate, or a fixed amount). Net pay is gross minus estimated taxes, social/pension contributions, and any other deductions you add.",
    },
  ],
  "finance/401k-vs-roth-ira": [
    {
      question: "Should I choose a Traditional 401k or Roth 401k?",
      answer:
        "Choose Traditional if you expect a lower tax rate in retirement — the deduction today is more valuable. Choose Roth if you expect a higher rate later, want tax-free withdrawals, or want to avoid RMDs. If the rates are similar, many people split contributions for tax diversification.",
    },
    {
      question: "What is the 401k contribution limit for 2026?",
      answer:
        "The 2026 employee elective deferral limit is $24,500 if you are under 50. Age 50+ catch-up and the SECURE 2.0 super catch-up for ages 60–63 are extra. This comparison does not cap the 401k amount so you can model any contribution.",
    },
    {
      question: "Does Roth 401k have Required Minimum Distributions?",
      answer:
        "No. SECURE 2.0 eliminated RMDs for designated Roth 401k accounts starting in 2024. Traditional 401k accounts still require RMDs beginning at age 73. Roth IRAs have never had RMDs for the original owner.",
    },
    {
      question: "What is the Roth IRA income limit for 2026?",
      answer:
        "For 2026, direct Roth IRA contributions phase out and end at $168,000 MAGI (single / head of household) and $252,000 (married filing jointly). Above those amounts you may need a Backdoor Roth. The annual IRA contribution limit is $7,500 under 50, or $8,600 at age 50+.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Your numbers stay on your device.",
    },
  ],
  "finance/bonus-calculator-india": [
    {
      question: "Who is eligible for statutory bonus in India?",
      answer:
        "Employees earning up to ₹21,000 per month in establishments covered by the Payment of Bonus Act are eligible, after working at least 30 days in the accounting year. Above that salary, any bonus paid is typically ex-gratia at the employer's discretion.",
    },
    {
      question: "How is bonus calculated under the Payment of Bonus Act?",
      answer:
        "Bonus is 8.33% to 20% of wages for the months worked. Wages for this calculation are capped at ₹7,000 per month. This calculator prorates by employment duration (1–12 months).",
    },
    {
      question: "Why is the bonus calculated on ₹7,000 even if my salary is higher?",
      answer:
        "The Act caps the wage used for bonus at ₹7,000 per month. That ceiling was last revised in 2015. If you earn more, the extra salary does not increase statutory bonus.",
    },
    {
      question: "Is bonus taxable in India?",
      answer:
        "Yes. Statutory bonus is taxable as salary. Your employer typically deducts TDS if applicable. This tool estimates the bonus amount only — not tax.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Your salary stays on your device.",
    },
  ],
  "finance/esi-calculator": [
    {
      question: "What is the ESI contribution rate in India for 2026?",
      answer:
        "For FY 2026-27, the employee contributes 0.75% of gross wages and the employer contributes 3.25% (total 4%). These are the current ESIC rates used in this calculator.",
    },
    {
      question: "What is the ESI wage ceiling for FY 2026-27?",
      answer:
        "ESI applies when monthly gross wages are ₹21,000 or less. For employees with a disability, the ceiling is ₹25,000.",
    },
    {
      question: "Is ESI deducted from Basic or Gross salary?",
      answer:
        "ESI is calculated on gross wages — typically basic, DA, and other cash allowances that form wages under the ESI Act. This calculator uses the monthly gross figure you enter.",
    },
    {
      question: "What happens to my ESI if my salary exceeds ₹21,000 mid-year?",
      answer:
        "Coverage is for a contribution period. If you were covered at the start of the period, ESI usually continues until that period ends even if wages later cross the ceiling. New coverage is not taken if you already earn above the ceiling. Confirm the dates with your employer or ESIC.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Your salary stays on your device.",
    },
  ],
  "finance/swp-calculator": [
    {
      question: "How does SWP work in mutual funds?",
      answer:
        "A systematic withdrawal plan sells fund units on a schedule so you receive a fixed monthly amount. The remaining corpus stays invested and can grow. This calculator models that with a constant return — actual NAV movement will differ.",
    },
    {
      question: "How much corpus do I need for SWP of ₹25,000 per month?",
      answer:
        "It depends on return and how long you need the income. At 8% for 20 years the present-value estimate is about ₹29.9 lakh. To keep the corpus from shrinking, you need enough that monthly return covers ₹25,000 — about ₹37.5 lakh at 8%.",
    },
    {
      question: "Is SWP from mutual funds taxable?",
      answer:
        "Equity funds: the first ₹1,25,000 of long-term gains each year is exempt; gains above that are taxed at 12.5% if held over 12 months, or 20% if held 12 months or less. Debt funds are taxed at your slab rate. This tool does not subtract tax from the corpus path.",
    },
    {
      question: "SWP or FD interest — which is better for retirement income?",
      answer:
        "An FD at 7% pays interest and keeps capital intact, but the monthly amount is usually lower. SWP can pay more if equity returns are higher, at the cost of dipping into corpus and market risk. Use both views here to compare.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Your numbers stay on your device.",
    },
  ],
  "finance/dividend-yield-calculator": [
    {
      question: "How is dividend yield calculated?",
      answer:
        "Dividend Yield = (Annual Dividend Per Share ÷ Current Market Price) × 100. For example, if a stock pays ₹20 annual dividend and trades at ₹400, the yield is 5%. Yield on Cost uses your purchase price instead of the current market price.",
    },
    {
      question: "Is dividend income taxable in India?",
      answer:
        "Yes — dividend income is fully taxable as Income from Other Sources at your applicable income tax slab rate. Companies deduct 10% TDS if the total dividend paid to you from a single company exceeds ₹5,000. NRIs are taxed at 20% TDS.",
    },
    {
      question: "What is a good dividend yield for Indian stocks?",
      answer:
        "A yield of 2–4% is considered healthy for Indian blue-chip stocks. PSU companies often offer 5–8%. Above 8% may be a warning sign — a very high yield can mean the stock price has fallen due to business trouble.",
    },
    {
      question: "What is the difference between dividend yield and dividend payout ratio?",
      answer:
        "Dividend yield compares the dividend to the stock price — useful for investors evaluating income return. Dividend payout ratio compares dividends to the company's earnings — useful for assessing whether the payout is sustainable.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Your numbers stay on your device.",
    },
  ],
  "finance/gst-threshold-checker": [
    {
      question: "What is the GST registration threshold for freelancers in India?",
      answer:
        "For service providers in regular states, GST registration is mandatory when annual aggregate turnover exceeds ₹20 lakhs. For special category states, the threshold is ₹10 lakhs. Goods in regular states use a ₹40 lakh limit.",
    },
    {
      question: "Do IT freelancers who export services need GST registration?",
      answer:
        "If aggregate turnover exceeds ₹20 lakhs, yes. Exports are zero-rated — no GST charged to foreign clients, but registration is needed for LUT. This checker also flags overseas digital/IT work as requiring registration.",
    },
    {
      question: "Is GST mandatory for inter-state supply regardless of turnover?",
      answer: "Yes — any inter-state taxable supply requires GST registration regardless of annual turnover.",
    },
    {
      question: "Can I register for GST voluntarily below ₹20 lakhs?",
      answer: "Yes — voluntary registration allows Input Tax Credit and proper GST invoices for B2B clients.",
    },
    {
      question: "Is this tool free?",
      answer: "Yes. It runs in your browser with no signup. Your numbers stay on your device.",
    },
  ],
  "finance/hsa-calculator": [
    {
      question: "What is the HSA contribution limit for 2026?",
      answer:
        "For 2026, you can contribute up to $4,300 for self-only HDHP coverage or $8,550 for family coverage. Age 55+ adds $1,000 catch-up.",
    },
    {
      question: "Do I need an HDHP to open an HSA?",
      answer:
        "Yes — you must be enrolled in a qualifying High Deductible Health Plan. 2026 minimum deductible: $1,650 individual / $3,300 family.",
    },
    {
      question: "What is the HSA triple tax advantage?",
      answer:
        "Tax-deductible contributions, tax-free growth, and tax-free withdrawals for qualified medical expenses. After 65, withdrawals for any purpose are taxed like a traditional IRA.",
    },
    {
      question: "What happens if I no longer have an HDHP?",
      answer:
        "Existing balance remains yours and grows tax-free. You cannot make new contributions until you re-enroll in a qualifying HDHP.",
    },
    {
      question: "Is this calculator free?",
      answer: "Yes. It runs in your browser with no signup. Your numbers stay on your device.",
    },
  ],
  "finance/rent-receipt-generator": [
    {
      question: "How to make rent receipt for HRA exemption?",
      answer:
        "Enter tenant and landlord details, rent amount, month, and address. Download the PDF receipt and submit to your employer with your HRA declaration form.",
    },
    {
      question: "Is rent receipt mandatory for HRA claim?",
      answer:
        "Yes for rent above ₹3,000/month. Employers and tax authorities require rent receipts as proof of payment for HRA exemption.",
    },
    {
      question: "What details should be in rent receipt India?",
      answer:
        "Tenant name, landlord name, property address, rent amount, month/year, payment mode, receipt number, and landlord signature. PAN is required if annual rent exceeds ₹1 lakh.",
    },
    {
      question: "Do I need landlord PAN for rent receipt?",
      answer:
        "Yes if annual rent paid exceeds ₹1,00,000. Include landlord PAN on the receipt for employer records and tax compliance.",
    },
    {
      question: "How to download rent receipt as PDF?",
      answer:
        "Fill the form, select months, and click Download PDF. Our tool generates a print-ready PDF instantly in your browser.",
    },
  ],
  "student/cgpa-to-percentage": [
    { question: "What is CGPA to Percentage used for?", answer: "VTU, CBSE, and 4-point conversion, including reverse. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using CGPA to Percentage?", answer: "Yes. CGPA to Percentage runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. CGPA to Percentage is free to use with no signup or login required." },
    { question: "Can I use CGPA to Percentage on mobile?", answer: "Yes. CGPA to Percentage works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "student/gpa-calculator": [
    { question: "What is GPA Calculator used for?", answer: "Calculate GPA from credit hours and grades. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using GPA Calculator?", answer: "Yes. GPA Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. GPA Calculator is free to use with no signup or login required." },
    { question: "Can I use GPA Calculator on mobile?", answer: "Yes. GPA Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "student/bmi-calculator": [
    { question: "What is BMI Calculator used for?", answer: "Calculate body mass index from height and weight. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using BMI Calculator?", answer: "Yes. BMI Calculator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. BMI Calculator is free to use with no signup or login required." },
    { question: "Can I use BMI Calculator on mobile?", answer: "Yes. BMI Calculator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "student/days-between-dates": [
    { question: "What is Days Between Dates used for?", answer: "Count days, weeks, and months between two dates. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Days Between Dates?", answer: "Yes. Days Between Dates runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Days Between Dates is free to use with no signup or login required." },
    { question: "Can I use Days Between Dates on mobile?", answer: "Yes. Days Between Dates works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "student/leap-year-checker": [
    { question: "What is Leap Year Checker used for?", answer: "Check whether a year is a leap year. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Leap Year Checker?", answer: "Yes. Leap Year Checker runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Leap Year Checker is free to use with no signup or login required." },
    { question: "Can I use Leap Year Checker on mobile?", answer: "Yes. Leap Year Checker works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "productivity/stopwatch": [
    { question: "What is Stopwatch used for?", answer: "A simple stopwatch with lap times. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Stopwatch?", answer: "Yes. Stopwatch runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Stopwatch is free to use with no signup or login required." },
    { question: "Can I use Stopwatch on mobile?", answer: "Yes. Stopwatch works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "productivity/box-breathing-timer": [
    {
      question: "What is box breathing?",
      answer:
        "Box breathing is a 4-part pattern: inhale, hold, exhale, hold — usually 4 seconds each. Follow the marker around the square to keep an even rhythm.",
    },
    {
      question: "How many rounds of box breathing should I do?",
      answer:
        "Four to six rounds (about 1–2 minutes) is a common start. Stop if you feel lightheaded and return to normal breathing.",
    },
    {
      question: "What's the difference between box breathing and 4-7-8 breathing?",
      answer:
        "Box breathing uses equal sides (4-4-4-4). 4-7-8 uses inhale 4, hold 7, and exhale 8. Use the 4-7-8 preset to switch.",
    },
    {
      question: "Can box breathing help with anxiety?",
      answer:
        "A slow, even pattern can help many people feel calmer. This timer is a practice aid, not medical advice.",
    },
    { question: "Is my data private when using Box Breathing Timer?", answer: "Yes. The timer runs entirely in your browser. Nothing is uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. It is free to use with no signup or login required." },
  ],
  "productivity/audio-recorder": [
    {
      question: "Do I need to install anything to record audio in the browser?",
      answer:
        "No. The recorder uses the browser MediaRecorder API. Allow microphone access when prompted and you can start immediately.",
    },
    {
      question: "Is my recorded audio uploaded anywhere?",
      answer:
        "No. Capture, playback, and download all stay on your device. Sessions are kept in memory and are lost if you close the page.",
    },
    {
      question: "What format does the recording download in?",
      answer:
        "WebM (Opus) in browsers that support it. Safari may download M4A instead. Convert later if you need MP3 or WAV.",
    },
    {
      question: "Why is the browser asking for microphone permission?",
      answer:
        "The page cannot hear your mic until you allow it. Permission stays in the browser; Utilvia never receives the stream.",
    },
    { question: "Is audio recorder free?", answer: "Yes. It runs in your browser with no signup. Recordings stay on your device until you download them." },
  ],
  "other/qr-code-generator": [
    { question: "What is QR Code Generator used for?", answer: "Create styled QR codes for URLs, Wi-Fi, vCards, events, and more. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using QR Code Generator?", answer: "Yes. QR Code Generator runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. QR Code Generator is free to use with no signup or login required." },
    { question: "Can I use QR Code Generator on mobile?", answer: "Yes. QR Code Generator works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
  "other/signature-maker": [
    { question: "What is Signature Maker used for?", answer: "Draw, type, or upload a signature and download PNG or JPG. Use it whenever you need a quick, accurate result without leaving your browser." },
    { question: "Is my data private when using Signature Maker?", answer: "Yes. Signature Maker runs entirely in your browser. Your inputs are never uploaded to Utilvia servers." },
    { question: "Do I need to create an account?", answer: "No. Signature Maker is free to use with no signup or login required." },
    { question: "Can I use Signature Maker on mobile?", answer: "Yes. Signature Maker works in modern mobile browsers on iOS and Android, as well as on desktop." },
  ],
};

export function buildToolAbout(input: ToolContentInput): ToolAbout {
  return ABOUT_BY_KEY[contentKey(input)] ?? {
    paragraphs: [
      input.longDescription ?? `Our free ${input.name} helps you ${input.short.charAt(0).toLowerCase()}${input.short.slice(1).replace(/\.$/, "")}.`,
      "Everything runs in your browser with instant results — no signup required.",
    ],
  };
}

export function buildDefaultFaqs(input: ToolContentInput): ToolFaq[] {
  return EXTRA_FAQS_BY_KEY[contentKey(input)] ?? [
    { question: `What is ${input.name} used for?`, answer: `${input.short} Use it whenever you need a quick result in your browser.` },
    { question: "Is my data private?", answer: "Yes. Processing runs locally in your browser whenever possible." },
    { question: "Do I need an account?", answer: "No signup or login is required." },
  ];
}
