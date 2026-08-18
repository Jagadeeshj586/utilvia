"use client";

import { PasswordGenerator } from "@/components/tools/generators/password-generator";
import { QrCodeGenerator } from "@/components/tools/other/qr-code-generator";
import { SignatureMaker } from "@/components/tools/other/signature-maker";

function MissingTool({ slug }: { slug: string }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--hairline)] bg-surface-soft px-6 py-8 text-center text-sm text-muted-foreground">
      No workspace for “{slug}” yet.
    </p>
  );
}

export function OtherRouter({ slug }: { slug: string }) {
  switch (slug) {
    case "qr-code-generator":
      return <QrCodeGenerator />;
    case "signature-maker":
      return <SignatureMaker />;
    case "password-generator":
      return <PasswordGenerator />;
    default:
      return <MissingTool slug={slug} />;
  }
}
