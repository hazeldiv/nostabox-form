"use client";

import { useEffect, useState } from "react";

import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/cn";

type CopyButtonProps = {
  value: string;
  label?: string;
  compact?: boolean;
};

export function CopyButton({ value, label = "Salin", compact = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface font-semibold text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink",
        compact ? "h-9 px-3 text-[12px]" : "h-11 px-3.5 text-[12px]",
      )}
    >
      {copied ? (
        <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
      ) : (
        <Copy aria-hidden className="size-3.5" strokeWidth={2.5} />
      )}
      {copied ? "Tersalin" : label}
    </button>
  );
}
