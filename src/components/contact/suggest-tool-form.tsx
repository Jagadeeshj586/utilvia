"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/lib/site";

export function SuggestToolForm() {
  const [name, setName] = useState("");
  const [useCase, setUseCase] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const toolName = name.trim();
    const details = useCase.trim();
    if (!toolName || !details) {
      toast.error("Please fill in the tool name and use case.");
      return;
    }

    const subject = `Tool request: ${toolName}`;
    const body = [`Tool name: ${toolName}`, "", "Use case:", details, "", `Reply email: ${email.trim() || "not provided"}`].join("\n");
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
    toast.success("Thanks - your request is ready to send.");
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-[var(--hairline)] bg-surface-card px-4 py-5 text-center">
        <h2 className="font-sans text-lg font-medium">Request ready</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--body)]">
          Your email app should open with the request. If it does not, write to{" "}
          <a className="font-medium text-primary hover:underline" href={`mailto:${SITE.email}`}>
            {SITE.email}
          </a>
          .
        </p>
        <Button type="button" variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-[var(--hairline)] bg-surface-card p-4 sm:p-5">
      <h2 className="font-sans text-lg font-medium">Request a New Tool</h2>
      <div className="mt-6 space-y-6">
        <div>
          <Label htmlFor="tool-name">Tool name</Label>
          <Input
            id="tool-name"
            name="toolName"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Excel to PDF"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="use-case">Use case</Label>
          <Textarea
            id="use-case"
            name="useCase"
            required
            value={useCase}
            onChange={(event) => setUseCase(event.target.value)}
            placeholder="How would you use this tool?"
            className="mt-2 min-h-[140px]"
          />
        </div>
        <div>
          <Label htmlFor="reply-email">Email (optional)</Label>
          <Input
            id="reply-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="your@email.com"
            className="mt-2"
          />
        </div>
        <Button type="submit" className="w-full">
          Submit Request
        </Button>
      </div>
    </form>
  );
}

export function GeneralContactCard() {
  return (
    <section className="mt-8">
      <h2 className="font-sans text-lg font-medium">General Contact</h2>
      <a
        href={`mailto:${SITE.email}`}
        className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--hairline)] bg-surface-card px-4 py-3 text-sm text-[var(--body)] transition-colors duration-150 hover:border-primary hover:text-ink"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-canvas text-primary">
          <Mail className="h-5 w-5" />
        </span>
        {SITE.email}
      </a>
    </section>
  );
}
