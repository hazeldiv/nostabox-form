"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { ImagePlus, Loader2, X } from "lucide-react";

import { FieldError, FieldLabel } from "@/components/field";
import { cn } from "@/lib/cn";
import { PAYMENT_PROOF_LIMITS } from "@/lib/config";
import { preparePaymentProof } from "@/lib/image";
import type { PaymentProof } from "@/lib/schema";

type PaymentProofFieldProps = {
  id: string;
  value: PaymentProof | null;
  error?: string;
  onChange: (value: PaymentProof | null) => void;
};

export function PaymentProofField({ id, value, error, onChange }: PaymentProofFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const message = localError ?? error;

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setLocalError(null);
    setIsProcessing(true);

    try {
      const proof = await preparePaymentProof(file);
      onChange(proof);
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : "Gagal memproses gambar.");
      onChange(null);
    } finally {
      setIsProcessing(false);

      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
  }

  return (
    <div>
      <FieldLabel htmlFor={id}>Bukti pembayaran</FieldLabel>
      <p id={`${id}-hint`} className="mt-1 text-[13px] leading-relaxed text-muted">
        Unggah screenshot bukti transfer ({PAYMENT_PROOF_LIMITS.maxMb} MB maks) agar pesanan bisa
        diproses.
      </p>

      <div className="mt-2.5">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={PAYMENT_PROOF_LIMITS.acceptAttribute}
          onChange={handleInput}
          aria-describedby={message ? `${id}-hint ${id}-error` : `${id}-hint`}
          aria-invalid={message ? true : undefined}
          className="sr-only"
        />

        {value ? (
          <div className="flex items-center gap-3 rounded-control border border-line bg-surface p-2.5">
            <img
              src={value.dataUrl}
              alt="Pratinjau bukti pembayaran"
              className="size-14 shrink-0 rounded-[8px] border border-line object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">{value.name}</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {Math.max(1, Math.round((value.dataUrl.length * 3) / 4 / 1024))} KB · siap dikirim
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setLocalError(null);
              }}
              aria-label="Hapus bukti pembayaran"
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-[9px] text-muted transition-colors duration-200 hover:bg-bg hover:text-danger"
            >
              <X aria-hidden className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <label
            htmlFor={id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-control border border-dashed px-3.5 py-3.5 transition-colors duration-200",
              message
                ? "border-danger/50 hover:border-danger/70"
                : "border-line-strong hover:border-ink hover:bg-bg",
            )}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg text-ink-soft">
              {isProcessing ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <ImagePlus aria-hidden className="size-4" strokeWidth={2.5} />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-ink">
                {isProcessing ? "Memproses gambar..." : "Pilih foto bukti transfer"}
              </span>
              <span className="mt-0.5 block text-[12px] text-muted">
                JPG, PNG, atau WebP · maks {PAYMENT_PROOF_LIMITS.maxMb} MB
              </span>
            </span>
          </label>
        )}
      </div>

      {message ? <FieldError id={`${id}-error`}>{message}</FieldError> : null}
    </div>
  );
}
