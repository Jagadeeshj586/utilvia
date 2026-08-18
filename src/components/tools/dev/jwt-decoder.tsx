"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEMO_JWT,
  DEMO_JWT_SECRET,
  claimRows,
  getJwtExpiryStatus,
  isAsymmetricAlgorithm,
  isHmacAlgorithm,
  parseJwt,
  splitJwtToken,
  type JwtVerificationResult,
  verifyJwtSignature,
} from "@/lib/jwt/decode";
import { cn } from "@/lib/utils";

async function copyValue(value: string, label: string) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
  } catch {
    toast.error("Could not copy to clipboard.");
  }
}

function JwtHighlightedInput({
  token,
  onChange,
}: {
  token: string;
  onChange: (value: string) => void;
}) {
  const { headerPart, payloadPart, signaturePart } = splitJwtToken(token);

  return (
    <div className="relative">
      <pre
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 min-h-[140px] overflow-hidden whitespace-pre-wrap break-all rounded-lg border border-transparent bg-transparent p-3 font-mono text-sm leading-relaxed"
      >
        <span className="text-coral">{headerPart}</span>
        {payloadPart ? <span className="text-ink">.</span> : null}
        <span className="text-[var(--accent-amber)]">{payloadPart}</span>
        {signaturePart ? <span className="text-ink">.</span> : null}
        <span className="text-teal">{signaturePart}</span>
      </pre>
      <Textarea
        id="jwt-token-input"
        value={token}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="relative min-h-[140px] resize-y bg-transparent font-mono text-sm leading-relaxed text-transparent caret-ink"
        aria-label="Encoded JWT token"
      />
    </div>
  );
}

function ClaimTable({ rows }: { rows: ReturnType<typeof claimRows> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[240px] text-left text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-[var(--hairline)] last:border-0">
              <td className="px-3 py-2.5 align-top font-mono text-ink">
                <div>{row.key}</div>
                {row.label ? <div className="mt-0.5 text-xs text-muted-foreground">{row.label}</div> : null}
              </td>
              <td className="px-3 py-2.5 align-top font-mono text-[var(--body)]">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Panel({
  title,
  titleClassName,
  copyValueText,
  children,
}: {
  title: string;
  titleClassName: string;
  copyValueText?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--hairline)] bg-surface-soft p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className={cn("text-xs font-semibold tracking-[0.18em]", titleClassName)}>{title}</h3>
        {copyValueText ? (
          <Button type="button" variant="outline" size="sm" className="min-h-9" onClick={() => copyValue(copyValueText, title)}>
            <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Copy
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function VerificationStatus({ result }: { result: JwtVerificationResult }) {
  if (result.status === "idle" || result.status === "needs-key") {
    return (
      <p className="text-sm text-[var(--accent-amber)]">
        Add a secret or public key to verify the signature.
      </p>
    );
  }
  if (result.status === "verified") {
    return <p className="text-sm font-medium text-teal">Signature Verified</p>;
  }
  if (result.status === "invalid") {
    return <p className="text-sm font-medium text-destructive">Signature Invalid</p>;
  }
  if (result.status === "unsupported") {
    return <p className="text-sm text-muted-foreground">Signature verification is not supported for {result.algorithm}.</p>;
  }
  return <p className="text-sm text-destructive">{result.message}</p>;
}

export function JwtDecoderTool() {
  const [token, setToken] = useState(DEMO_JWT);
  const [secret, setSecret] = useState(DEMO_JWT_SECRET);
  const [secretIsBase64, setSecretIsBase64] = useState(false);
  const [verification, setVerification] = useState<JwtVerificationResult>({ status: "idle" });

  const parsed = useMemo(() => parseJwt(token), [token]);
  const expiry = useMemo(
    () => (parsed.ok ? getJwtExpiryStatus(parsed.payload) : { state: "none" as const }),
    [parsed],
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!parsed.ok || !parsed.algorithm || !parsed.signaturePart) {
        setVerification({ status: "idle" });
        return;
      }
      if (!secret.trim()) {
        setVerification({ status: "needs-key", algorithm: parsed.algorithm });
        return;
      }
      const result = await verifyJwtSignature(parsed, secret, { secretIsBase64 });
      if (!cancelled) setVerification(result);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [parsed, secret, secretIsBase64]);

  const headerJson = parsed.ok ? JSON.stringify(parsed.header, null, 2) : "";
  const payloadJson = parsed.ok ? JSON.stringify(parsed.payload, null, 2) : "";
  const algorithm = parsed.ok ? parsed.algorithm : null;
  const usesPublicKey = isAsymmetricAlgorithm(algorithm);
  const usesSecret = isHmacAlgorithm(algorithm);

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Encoded JWT</h2>
            <p className="mt-1 text-sm text-[var(--body)]">
              Paste a token to decode header, payload, and signature with jwt.io-style color coding.
            </p>
          </div>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => copyValue(token, "Token")}>
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            Copy token
          </Button>
        </div>

        <JwtHighlightedInput token={token} onChange={setToken} />

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span><span className="font-medium text-coral">Header</span></span>
          <span><span className="font-medium text-[var(--accent-amber)]">Payload</span></span>
          <span><span className="font-medium text-teal">Signature</span></span>
        </div>

        {!parsed.ok ? <p className="text-sm text-destructive">{parsed.error}</p> : null}
      </section>

      {parsed.ok ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="HEADER" titleClassName="text-coral" copyValueText={headerJson}>
            <ClaimTable rows={claimRows(parsed.header)} />
          </Panel>

          <Panel title="PAYLOAD" titleClassName="text-[var(--accent-amber)]" copyValueText={payloadJson}>
            {expiry.state === "valid" ? (
              <div className="mb-3 rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-teal">
                Token Valid — {expiry.relativeLabel}
              </div>
            ) : null}
            {expiry.state === "expired" ? (
              <div className="mb-3 rounded-lg border border-[var(--accent-amber)]/40 bg-[var(--accent-amber)]/10 px-3 py-2 text-sm text-[var(--body-strong)]">
                Token Expired — {expiry.absoluteLabel}
              </div>
            ) : null}
            {expiry.state !== "none" ? (
              <p className="mb-3 text-sm text-muted-foreground">Expires: {expiry.absoluteLabel}</p>
            ) : null}
            <ClaimTable rows={claimRows(parsed.payload)} />
          </Panel>

          <Panel title="SIGNATURE" titleClassName="text-teal" copyValueText={parsed.signaturePart}>
            <p className="break-all font-mono text-sm text-[var(--body)]">{parsed.signaturePart || "No signature segment"}</p>
          </Panel>

          <section className="rounded-xl border border-[var(--hairline)] bg-surface-card p-4 sm:p-5 xl:col-span-2">
            <h3 className="font-display text-lg font-semibold text-ink">
              Verify Signature{algorithm ? ` (${algorithm})` : ""}
            </h3>

            <div className="mt-4 space-y-3">
              {usesSecret ? (
                <>
                  <div>
                    <Label htmlFor="jwt-secret">HMAC secret</Label>
                    <Input
                      id="jwt-secret"
                      value={secret}
                      onChange={(event) => setSecret(event.target.value)}
                      placeholder="Enter your HMAC secret"
                      className="mt-1 min-h-11 font-mono text-sm"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[var(--body)]">
                    <input
                      type="checkbox"
                      checked={secretIsBase64}
                      onChange={(event) => setSecretIsBase64(event.target.checked)}
                      className="h-4 w-4 rounded border-[var(--hairline)]"
                    />
                    Secret (base64 encoded)
                  </label>
                </>
              ) : usesPublicKey ? (
                <div>
                  <Label htmlFor="jwt-public-key">Public key (PEM)</Label>
                  <Textarea
                    id="jwt-public-key"
                    value={secret}
                    onChange={(event) => setSecret(event.target.value)}
                    placeholder="-----BEGIN PUBLIC KEY-----"
                    className="mt-1 min-h-[120px] font-mono text-sm"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add a supported signing algorithm in the header to enable verification.
                </p>
              )}

              <VerificationStatus result={verification} />
              <p className="text-sm text-muted-foreground">
                Verification is done in your browser — your secret never leaves this page.
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
