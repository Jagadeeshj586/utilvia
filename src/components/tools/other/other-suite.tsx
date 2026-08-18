"use client";

import dynamic from "next/dynamic";


const PasswordGenerator = dynamic(() => import("@/components/tools/generators/password-generator").then((m) => m.PasswordGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const QrCodeGenerator = dynamic(() => import("@/components/tools/other/qr-code-generator").then((m) => m.QrCodeGenerator), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });
const SignatureMaker = dynamic(() => import("@/components/tools/other/signature-maker").then((m) => m.SignatureMaker), { loading: () => <div className='h-40 animate-pulse rounded-lg bg-surface-card' aria-hidden /> });

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
