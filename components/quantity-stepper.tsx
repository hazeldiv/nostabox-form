"use client";

import { useState } from "react";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/cn";
import { ORDER_LIMITS } from "@/lib/config";

type QuantityStepperProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
  describedBy?: string;
};

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 1;

  return Math.min(Math.max(Math.trunc(value), 1), ORDER_LIMITS.jumlahMax);
}

export function QuantityStepper({
  id,
  value,
  onChange,
  invalid,
  describedBy,
}: QuantityStepperProps) {
  const [draft, setDraft] = useState(() => String(value));

  function commit(next: number) {
    const clamped = clamp(next);
    setDraft(String(clamped));
    onChange(clamped);
  }

  return (
    <div
      className={cn(
        "flex w-full max-w-[190px] items-center gap-1 rounded-control border bg-surface p-1 transition-colors duration-200",
        invalid ? "border-danger/50" : "border-line focus-within:border-ink",
      )}
    >
      <button
        type="button"
        onClick={() => commit(value - 1)}
        disabled={value <= 1}
        aria-label="Kurangi jumlah"
        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-[9px] text-ink transition-colors duration-200 hover:bg-bg disabled:cursor-not-allowed disabled:text-line-strong disabled:hover:bg-transparent"
      >
        <Minus aria-hidden className="size-4" strokeWidth={2.5} />
      </button>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={draft}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 2);
          setDraft(digits);

          if (digits) onChange(clamp(Number(digits)));
        }}
        onBlur={() => commit(Number(draft))}
        aria-describedby={describedBy}
        aria-invalid={invalid ? true : undefined}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-center font-heading text-[17px] tabular-nums text-ink outline-none"
      />
      <button
        type="button"
        onClick={() => commit(value + 1)}
        disabled={value >= ORDER_LIMITS.jumlahMax}
        aria-label="Tambah jumlah"
        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-[9px] text-ink transition-colors duration-200 hover:bg-bg disabled:cursor-not-allowed disabled:text-line-strong disabled:hover:bg-transparent"
      >
        <Plus aria-hidden className="size-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
