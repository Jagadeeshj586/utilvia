"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { PdfFileDrop } from "@/components/tools/pdf/pdf-file-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unlockPdf } from "@/lib/pdf/unlock";

export function PdfUnlock() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlock = async () => {
    if (!file) return;
    if (!password.trim()) {
      setError("Please enter the PDF password.");
      setDone(false);
      return;
    }
    setBusy(true);
    setDone(false);
    setError(null);
    try {
      await unlockPdf(file, password);
      setDone(true);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(message === "Incorrect password" ? "❌ Wrong password. Please try again." : "Unlock failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PdfFileDrop
        file={file}
        onFile={(next) => {
          setFile(next);
          setError(null);
          setDone(false);
        }}
        onError={(next) => {
          setError(next);
          setDone(false);
        }}
      />

      {file ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="pdf-password">PDF Password</Label>
            <div className="relative">
              <Input
                id="pdf-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                  setDone(false);
                }}
                placeholder="Enter PDF password"
                autoComplete="off"
                className="pr-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-ink)] transition-colors hover:text-ink"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--hairline)] bg-surface-card px-4 py-3 text-xs leading-relaxed text-[var(--body)]">
            <p className="font-medium text-ink">💡 Common bank PDF passwords</p>
            <p className="mt-2">SBI: Date of birth (DDMMYYYY)</p>
            <p>HDFC: DOB + last 4 digits of account</p>
            <p>ICICI: DOB (DDMMYYYY)</p>
          </div>

          <Button onClick={unlock} disabled={busy || !password.trim()} className="w-full py-4 text-base">
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Unlocking PDF...
              </>
            ) : (
              "Unlock PDF"
            )}
          </Button>
        </>
      ) : null}

      {done ? (
        <div className="rounded-xl border border-[var(--accent-teal)]/30 bg-[var(--accent-teal)]/10 px-4 py-3 text-center text-sm text-[var(--accent-teal)]">
          ✅ PDF unlocked! Downloading...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  );
}
