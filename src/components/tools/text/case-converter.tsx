"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
function toCamelCase(value: string) {
  const parts = value.toLowerCase().match(/[a-z0-9]+/gi) ?? [];
  return parts.map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))).join("");
}
function toSnakeCase(value: string) {
  return (value.match(/[a-z0-9]+/gi) ?? []).map((part) => part.toLowerCase()).join("_");
}
function toKebabCase(value: string) {
  return (value.match(/[a-z0-9]+/gi) ?? []).map((part) => part.toLowerCase()).join("-");
}

export function CaseConverter() {
  const [text, setText] = useState("");

  const apply = (next: string) => setText(next);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="case-text">Text</Label>
        <Textarea id="case-text" value={text} onChange={(e) => setText(e.target.value)} className="mt-2 min-h-[200px]" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => apply(text.toUpperCase())}>UPPERCASE</Button>
        <Button type="button" variant="outline" onClick={() => apply(text.toLowerCase())}>lowercase</Button>
        <Button type="button" variant="outline" onClick={() => apply(toTitleCase(text))}>Title Case</Button>
        <Button type="button" variant="outline" onClick={() => apply(toCamelCase(text))}>camelCase</Button>
        <Button type="button" variant="outline" onClick={() => apply(toSnakeCase(text))}>snake_case</Button>
        <Button type="button" variant="outline" onClick={() => apply(toKebabCase(text))}>kebab-case</Button>
        <Button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            toast.success("Copied");
          }}
        >
          Copy
        </Button>
      </div>
    </div>
  );
}
