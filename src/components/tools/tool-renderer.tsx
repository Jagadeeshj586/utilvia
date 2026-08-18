"use client";

import dynamic from "next/dynamic";
import { ComingSoon } from "@/components/tools/coming-soon";
import { getTool } from "@/lib/tools/catalog";

function ToolLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading workspace">
      <div className="h-10 w-1/3 animate-pulse rounded-md bg-surface-card" />
      <div className="h-40 animate-pulse rounded-lg bg-surface-card" />
      <div className="h-10 w-1/4 animate-pulse rounded-md bg-surface-card" />
    </div>
  );
}

const ImageCompress = dynamic(
  () => import("@/components/tools/image/image-compress").then((m) => m.ImageCompress),
  { ssr: false, loading: ToolLoading },
);
const BackgroundRemover = dynamic(
  () => import("@/components/tools/image/background-remover").then((m) => m.BackgroundRemover),
  { ssr: false, loading: ToolLoading },
);
const PdfMerge = dynamic(
  () => import("@/components/tools/pdf/pdf-merge").then((m) => m.PdfMerge),
  { ssr: false, loading: ToolLoading },
);
const PdfSplit = dynamic(
  () => import("@/components/tools/pdf/pdf-split").then((m) => m.PdfSplit),
  { ssr: false, loading: ToolLoading },
);
const PdfCompress = dynamic(
  () => import("@/components/tools/pdf/pdf-compress").then((m) => m.PdfCompress),
  { ssr: false, loading: ToolLoading },
);
const PdfToImage = dynamic(
  () => import("@/components/tools/pdf/pdf-to-image").then((m) => m.PdfToImage),
  { ssr: false, loading: ToolLoading },
);
const PdfExtrasRouter = dynamic(
  () => import("@/components/tools/pdf/pdf-extras").then((m) => m.PdfExtrasRouter),
  { ssr: false, loading: ToolLoading },
);
const ImageExtrasRouter = dynamic(
  () => import("@/components/tools/image/image-extras").then((m) => m.ImageExtrasRouter),
  { ssr: false, loading: ToolLoading },
);
const TextRouter = dynamic(
  () => import("@/components/tools/text/text-suite").then((m) => m.TextRouter),
  { ssr: false, loading: ToolLoading },
);
const DevRouter = dynamic(
  () => import("@/components/tools/dev/dev-suite").then((m) => m.DevRouter),
  { ssr: false, loading: ToolLoading },
);
const FinanceRouter = dynamic(
  () => import("@/components/tools/finance/finance-router").then((m) => m.FinanceRouter),
  { ssr: false, loading: ToolLoading },
);
const StudentRouter = dynamic(
  () => import("@/components/tools/student/student-router").then((m) => m.StudentRouter),
  { ssr: false, loading: ToolLoading },
);
const ProductivityRouter = dynamic(
  () => import("@/components/tools/productivity/productivity-suite").then((m) => m.ProductivityRouter),
  { ssr: false, loading: ToolLoading },
);
const OtherRouter = dynamic(
  () => import("@/components/tools/other/other-suite").then((m) => m.OtherRouter),
  { ssr: false, loading: ToolLoading },
);

export function ToolRenderer({ category, slug }: { category: string; slug: string }) {
  const tool = getTool(category, slug);
  const key = `${category}/${slug}`;

  if (category === "finance") return <FinanceRouter slug={slug} />;
  if (category === "student") return <StudentRouter slug={slug} />;
  if (category === "text") return <TextRouter slug={slug} />;
  if (category === "developer") return <DevRouter slug={slug} />;
  if (category === "productivity") return <ProductivityRouter slug={slug} />;
  if (category === "other") return <OtherRouter slug={slug} />;

  switch (key) {
    case "image/image-compressor":
      return <ImageCompress />;
    case "image/background-remover":
      return <BackgroundRemover />;
    case "image/image-cropper":
    case "image/image-converter":
    case "image/heic-to-jpg":
    case "image/webp-to-jpg":
    case "image/photo-resizer":
    case "image/svg-to-png":
    case "image/color-palette-extractor":
      return <ImageExtrasRouter slug={slug === "image-cropper" ? "photo-resizer" : slug} />;
    case "pdf/merge-pdf":
      return <PdfMerge />;
    case "pdf/split-pdf":
      return <PdfSplit />;
    case "pdf/compress-pdf":
      return <PdfCompress />;
    case "pdf/pdf-to-jpg":
      return <PdfToImage format="image/jpeg" />;
    case "pdf/pdf-to-png":
      return <PdfToImage format="image/png" />;
    case "pdf/remove-pdf-password":
    case "pdf/rotate-pdf":
    case "pdf/pdf-page-numbers":
    case "pdf/pdf-watermark":
    case "pdf/image-to-pdf":
    case "pdf/jpg-to-pdf":
    case "pdf/pdf-to-word":
    case "pdf/word-to-pdf":
    case "pdf/excel-to-pdf":
    case "pdf/ppt-to-pdf":
    case "pdf/word-to-jpg":
      return <PdfExtrasRouter slug={slug} />;
    default:
      return tool ? (
        <ComingSoon tool={tool} />
      ) : (
        <div className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-[var(--muted-ink)]">
          This tool is not available yet.
        </div>
      );
  }
}
