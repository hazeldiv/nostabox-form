"use client";

import { Trash2 } from "lucide-react";

import { FieldError, FieldGroup, FieldLabel, TextField } from "@/components/field";
import { CustomOptionIcon, OptionGroup, type Option } from "@/components/option-group";
import { QuantityStepper } from "@/components/quantity-stepper";
import { cn } from "@/lib/cn";
import {
  COLOR_SWATCHES,
  CUSTOM_COLOR,
  ORDER_LIMITS,
  TEXTURES,
  type Color,
  type Texture,
} from "@/lib/config";
import { formatRupiah, lineTotal } from "@/lib/format";
import type { ItemDraft } from "@/lib/schema";

const colorOptions: ReadonlyArray<Option<Color>> = [
  ...COLOR_SWATCHES.map((color) => ({
    value: color.value,
    label: color.value,
    swatch: color.swatch,
  })),
  // { value: CUSTOM_COLOR, label: "Lainnya", icon: <CustomOptionIcon /> },
];

type OrderItemCardProps = {
  index: number;
  item: ItemDraft;
  canRemove: boolean;
  errorFor: (field: keyof ItemDraft) => string | undefined;
  onChange: <K extends keyof ItemDraft>(field: K, value: ItemDraft[K]) => void;
  onBlur: (field: keyof ItemDraft) => void;
  onRemove: () => void;
};

export function OrderItemCard({
  index,
  item,
  canRemove,
  errorFor,
  onChange,
  onBlur,
  onRemove,
}: OrderItemCardProps) {
  const prefix = `item-${index}`;
  item.tekstur = TEXTURES[0].value

  function describedBy(field: keyof ItemDraft): string | undefined {
    return errorFor(field) ? `${prefix}-${field}-error` : undefined;
  }

  return (
    <div id={prefix} className="rounded-card border border-line bg-bg p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-heading text-[15px] text-ink">Item {index + 1}</p>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold text-muted transition-colors duration-200 hover:bg-surface hover:text-danger"
          >
            <Trash2 aria-hidden className="size-3.5" strokeWidth={2.5} />
            Hapus
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-5">
        <FieldGroup id={`${prefix}-tekstur`} legend="Add on" error={errorFor("tekstur")} className="hidden">
          <OptionGroup<Texture>
            name={`${prefix}-tekstur`}
            layout="cards"
            options={TEXTURES}
            value={item.tekstur}
            onChange={(value) => {
              onChange("tekstur", value);
              onBlur("tekstur");
            }}
            onBlur={() => onBlur("tekstur")}
            invalid={Boolean(errorFor("tekstur"))}
            describedBy={describedBy("tekstur")}
          />
        </FieldGroup>

        <FieldGroup id={`${prefix}-warna`} legend="Warna" error={errorFor("warna")}>
          <OptionGroup<Color>
            name={`${prefix}-warna`}
            layout="chips"
            options={colorOptions}
            value={item.warna}
            onChange={(value) => {
              onChange("warna", value);
              if (value !== CUSTOM_COLOR) onChange("warnaLainnya", "");
              onBlur("warna");
            }}
            onBlur={() => onBlur("warna")}
            invalid={Boolean(errorFor("warna"))}
            describedBy={describedBy("warna")}
          />
          {item.warna === CUSTOM_COLOR ? (
            <div className="reveal mt-3">
              <TextField
                id={`${prefix}-warnaLainnya`}
                label="Kombinasi warna"
                placeholder="Contoh: merah + biru, pastel"
                maxLength={ORDER_LIMITS.customColorMax}
                hint="Kombinasi dari 4 warna dasar, hasil menyesuaikan produksi."
                value={item.warnaLainnya}
                onChange={(event) => onChange("warnaLainnya", event.target.value)}
                onBlur={() => onBlur("warnaLainnya")}
                error={errorFor("warnaLainnya")}
              />
            </div>
          ) : null}
        </FieldGroup>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <FieldLabel htmlFor={`${prefix}-jumlah`}>Jumlah</FieldLabel>
            <span className="font-heading text-[14px] tabular-nums text-muted">
              = {formatRupiah(lineTotal(item.jumlah))}
            </span>
          </div>
          <div className={cn("mt-2.5")}>
            <QuantityStepper
              id={`${prefix}-jumlah`}
              value={item.jumlah}
              onChange={(value) => onChange("jumlah", value)}
              invalid={Boolean(errorFor("jumlah"))}
              describedBy={describedBy("jumlah")}
            />
          </div>
          {errorFor("jumlah") ? (
            <FieldError id={`${prefix}-jumlah-error`}>{errorFor("jumlah")}</FieldError>
          ) : null}
        </div>
      </div>
    </div>
  );
}
