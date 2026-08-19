import { SITE } from "@/lib/site";

export type ToolHowToStep = {
  step: string;
  text: string;
};

export type ToolFaqItem = {
  question: string;
  answer: string;
};

export type ToolSchemaCategory = "UtilitiesApplication" | "FinanceApplication" | "DeveloperApplication";

export type ToolSeoRecord = {
  slug: string;
  category: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  schemaCategory: ToolSchemaCategory;
  howToSteps: ToolHowToStep[];
  faqs: ToolFaqItem[];
};

export type ToolSeoSource = {
  slug: string;
  category: string;
  name: string;
  heading?: string;
  shortDescription: string;
  keywords: string[];
  metaTitle?: string;
  metaDescription?: string;
  fileUpload?: boolean;
  privacy?: "local" | "mixed";
  badge?: "popular" | "new";
  faqs?: ToolFaqItem[];
};

export function toolSeoKey(category: string, slug: string) {
  return `${category}/${slug}`;
}

export function schemaCategoryFor(category: string): ToolSchemaCategory {
  if (category === "finance") return "FinanceApplication";
  if (category === "developer") return "DeveloperApplication";
  return "UtilitiesApplication";
}

function defaultHowTo(name: string, fileUpload: boolean): ToolHowToStep[] {
  if (fileUpload) {
    return [
      { step: "Open the tool", text: `Go to ${name} on ${SITE.name}. The editor loads in your browser — no install or account.` },
      { step: "Add your file", text: "Choose a file from your device. Processing stays on this page whenever the tool runs locally." },
      { step: "Adjust the options", text: "Set quality, size, or other options. Preview the result before you download." },
      { step: "Download the result", text: "Save the output to your device. Close the tab when you are done — nothing is kept on a server queue." },
    ];
  }

  return [
    { step: "Open the tool", text: `Go to ${name} on ${SITE.name}. It runs instantly in your browser.` },
    { step: "Enter your values", text: "Fill in the fields. Results update as you type — no signup required." },
    { step: "Review the output", text: "Check totals, breakdowns, or formatted text before you copy or save." },
    { step: "Copy or export", text: "Copy the result or download a file. Your inputs stay on this device." },
  ];
}

function clipDescription(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= 160) return compact;
  return `${compact.slice(0, 157).trimEnd()}...`;
}

function defaultTitle(name: string) {
  return `${name} Online – Free & In-Browser | ${SITE.name}`;
}

export const TOOL_SEO: Record<string, ToolSeoRecord> = {
  "pdf/compress-pdf": {
    slug: "compress-pdf",
    category: "pdf",
    title: "Compress PDF Online – Free In-Browser PDF Reducer | Utilvia",
    h1: "Compress PDF Online",
    description:
      "Compress PDF files in your browser. Shrink size for email and uploads with no signup and no server upload. Free, private, and instant.",
    keywords: [
      "compress pdf",
      "compress pdf online",
      "reduce pdf size",
      "pdf compressor",
      "shrink pdf",
      "in browser pdf compress",
    ],
    schemaCategory: "UtilitiesApplication",
    howToSteps: [
      { step: "Open Compress PDF", text: "Open the Compress PDF tool on Utilvia. It loads in your browser with no install." },
      { step: "Choose a PDF", text: "Select a PDF from your device. The file is read locally and is not uploaded to a Utilvia server." },
      { step: "Pick a compression level", text: "Choose Low, Medium, or High compression and preview the new file size." },
      { step: "Download the smaller PDF", text: "Save the compressed PDF to your device. Close the tab when you are finished." },
    ],
    faqs: [
      {
        question: "Is this PDF compressor free?",
        answer: "Yes. Compress PDF on Utilvia is free to use in your browser. No account is required.",
      },
      {
        question: "Does Compress PDF upload my file?",
        answer: "No. Compression runs in your browser. Your PDF stays on your device for the whole workflow.",
      },
      {
        question: "Will compressing a PDF reduce quality?",
        answer:
          "Medium compression keeps pages readable for most documents. Use Low if you need maximum clarity, or High for the smallest file.",
      },
      {
        question: "What PDF size can I compress?",
        answer:
          "The tool is built for everyday documents and typical email attachments. Very large scanned books may take longer because work happens on your device.",
      },
    ],
  },
  "finance/emi-calculator": {
    slug: "emi-calculator",
    category: "finance",
    title: "EMI Calculator Online – Free Loan EMI & Interest Tool | Utilvia",
    h1: "EMI Calculator Online",
    description:
      "Calculate EMI, total interest, and an amortization schedule in your browser. Free loan EMI calculator with no signup. Numbers stay on your device.",
    keywords: [
      "emi calculator",
      "loan emi calculator",
      "emi calculator online",
      "home loan emi",
      "personal loan emi",
      "amortization calculator",
    ],
    schemaCategory: "FinanceApplication",
    howToSteps: [
      { step: "Open the EMI Calculator", text: "Open EMI Calculator on Utilvia. It runs instantly in your browser." },
      { step: "Enter loan details", text: "Add principal, annual interest rate, and tenure in months or years." },
      { step: "Review EMI and interest", text: "See monthly EMI, total interest, and total payable. Use the chart for the amortization view." },
      { step: "Copy or screenshot the result", text: "Save the numbers you need. Nothing is stored on a Utilvia server." },
    ],
    faqs: [
      {
        question: "How is EMI calculated?",
        answer:
          "EMI uses the standard reducing-balance formula from principal, interest rate, and tenure. The tool shows monthly EMI plus total interest.",
      },
      {
        question: "Can I use this for home loans and personal loans?",
        answer:
          "Yes. Enter any principal, rate, and tenure. It works for home, car, and personal loans as an estimate, not a bank quote.",
      },
      {
        question: "Does the EMI calculator store my numbers?",
        answer: "No. Values stay in this browser tab. Close the page and they are gone.",
      },
      {
        question: "Is this EMI calculator free?",
        answer: "Yes. It is free, with no signup, and runs in your browser on Utilvia.",
      },
    ],
  },
  "image/image-compressor": {
    slug: "image-compressor",
    category: "image",
    title: "Compress Image Online – Free In-Browser Image Reducer | Utilvia",
    h1: "Compress Image Online",
    description:
      "Compress JPEG, PNG, and WebP in your browser. Shrink image size with a live preview. No signup and no upload to a server.",
    keywords: [
      "compress image",
      "image compressor",
      "compress jpeg",
      "reduce image size",
      "compress png online",
      "in browser image compressor",
    ],
    schemaCategory: "UtilitiesApplication",
    howToSteps: [
      { step: "Open Image Compress", text: "Open the Image Compress tool on Utilvia. It works in your browser with no install." },
      { step: "Add an image", text: "Choose a JPEG, PNG, or WebP from your device. The file is not uploaded to a Utilvia server." },
      { step: "Set quality", text: "Adjust compression and watch the live size preview until the file is small enough." },
      { step: "Download the compressed image", text: "Save the result to your device. Close the tab when you are done." },
    ],
    faqs: [
      {
        question: "Which image formats can I compress?",
        answer: "JPEG, PNG, and WebP are supported. Pick a file and the tool shows original size versus compressed size.",
      },
      {
        question: "Does image compression upload my photo?",
        answer: "No. Compression runs in your browser. Your image stays on this device.",
      },
      {
        question: "Will compressing an image make it look worse?",
        answer: "Lower quality saves more space. Use the live preview to keep a balance between size and clarity.",
      },
      {
        question: "Is the image compressor free?",
        answer: "Yes. It is free on Utilvia, with no signup.",
      },
    ],
  },
};

export function getToolSeo(tool: ToolSeoSource): ToolSeoRecord {
  const key = toolSeoKey(tool.category, tool.slug);
  const explicit = TOOL_SEO[key];
  if (explicit) return explicit;

  const fileUpload = Boolean(tool.fileUpload);
  const faqs =
    tool.faqs && tool.faqs.length > 0
      ? tool.faqs
      : [
          {
            question: `Is ${tool.name} free?`,
            answer: `Yes. ${tool.name} on ${SITE.name} is free to use in your browser. No account is required.`,
          },
          {
            question: "Is my data private?",
            answer:
              tool.privacy === "mixed"
                ? "Some steps may use a network request. Avoid sensitive files if you are unsure. Local-first tools keep work on your device."
                : "Yes. Processing runs locally in your browser whenever possible. Your files are not stored on a Utilvia server.",
          },
          {
            question: "Do I need to sign up?",
            answer: "No. Open the tool and use it. There is no login wall.",
          },
        ];

  return {
    slug: tool.slug,
    category: tool.category,
    title: tool.metaTitle ?? defaultTitle(tool.name),
    h1: tool.heading ?? `${tool.name} Online`,
    description: clipDescription(tool.metaDescription ?? tool.shortDescription),
    keywords: tool.keywords,
    schemaCategory: schemaCategoryFor(tool.category),
    howToSteps: defaultHowTo(tool.name, fileUpload),
    faqs,
  };
}

export function isHighIntentTool(tool: { badge?: string; slug: string; category: string }) {
  if (tool.badge === "popular") return true;
  return Boolean(TOOL_SEO[toolSeoKey(tool.category, tool.slug)]);
}
