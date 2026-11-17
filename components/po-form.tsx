"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";

import { AlertCircle, Loader2, Plus, Send } from "lucide-react";

import { submitOrder } from "@/app/actions/submit-order";
import { CopyButton } from "@/components/copy-button";
import { FieldGroup, TextAreaField, TextField } from "@/components/field";
import { FormSection } from "@/components/form-section";
import { OrderItemCard } from "@/components/order-item-card";
import { OptionGroup } from "@/components/option-group";
import { PaymentProofField } from "@/components/payment-proof-field";
import { SuccessPanel } from "@/components/success-panel";
import { cn } from "@/lib/cn";
import {
  DELIVERY_METHODS,
  ORDER_LIMITS,
  PAYMENT,
  PICKUP_LOCATION,
  type Method,
} from "@/lib/config";
import { formatRupiah, orderTotal } from "@/lib/format";
import {
  createItem,
  emptyOrder,
  fieldIdFromPath,
  flattenErrors,
  orderSchema,
  type ItemDraft,
  type Order,
  type OrderDraft,
} from "@/lib/schema";

type SubmitResult = {
  orderId: string;
  total: number;
  order: Order;
};

function focusField(id: string) {
  const element = document.getElementById(id);

  if (!element) return;

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.focus();
    return;
  }

  element.querySelector<HTMLElement>("input, textarea, button")?.focus();
}

export function PoForm() {
  const [values, setValues] = useState<OrderDraft>(emptyOrder);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const validation = useMemo(() => orderSchema.safeParse(values), [values]);
  const errors = useMemo(
    () => (validation.success ? {} : flattenErrors(validation.error)),
    [validation],
  );

  const total = orderTotal(values.items.map((item) => item.jumlah));
  const totalPcs = values.items.reduce((sum, item) => sum + item.jumlah, 0);

  function update<K extends keyof OrderDraft>(field: K, value: OrderDraft[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  function updateItem<K extends keyof ItemDraft>(index: number, field: K, value: ItemDraft[K]) {
    setValues((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function markTouched(key: string) {
    setTouched((previous) => (previous[key] ? previous : { ...previous, [key]: true }));
  }

  function errorAt(key: string): string | undefined {
    if (!submitAttempted && !touched[key]) return undefined;

    return errors[key];
  }

  function itemErrorFor(index: number) {
    return (field: keyof ItemDraft) => errorAt(`items.${index}.${field}`);
  }

  function addItem() {
    const nextIndex = values.items.length;

    if (nextIndex >= ORDER_LIMITS.itemMax) return;

    update("items", [...values.items, createItem()]);
    setTouched({});

    window.setTimeout(() => {
      document.getElementById(`item-${nextIndex}`)?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      focusField(`item-${nextIndex}-tekstur`);
    }, 60);
  }

  function removeItem(index: number) {
    if (values.items.length <= 1) return;

    update(
      "items",
      values.items.filter((_, itemIndex) => itemIndex !== index),
    );
    setTouched({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    setFormError(null);

    const honeypot = new FormData(event.currentTarget).get("website");
    const draft: OrderDraft = {
      ...values,
      website: typeof honeypot === "string" ? honeypot : "",
    };

    const parsed = orderSchema.safeParse(draft);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];

      if (firstIssue) {
        const id = fieldIdFromPath(firstIssue.path.map(String).join("."));
        requestAnimationFrame(() => focusField(id));
      }

      return;
    }

    const order = parsed.data;

    startTransition(async () => {
      const response = await submitOrder(draft);

      if (response.status === "success") {
        setResult({ orderId: response.orderId, total: response.total, order });
        return;
      }

      setFormError(response.message);
    });
  }

  function handleReset() {
    setValues({ ...emptyOrder, items: [createItem()] });
    setTouched({});
    setSubmitAttempted(false);
    setFormError(null);
    setResult(null);

    requestAnimationFrame(() => {
      focusField("nama");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (result) {
    return (
      <SuccessPanel
        order={result.order}
        orderId={result.orderId}
        total={result.total}
        onReset={handleReset}
      />
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-busy={isPending}
      className="relative mt-6 rounded-card border border-line bg-surface px-5 pt-6 sm:mt-8 sm:px-8 sm:pt-8 sm:pb-8"
    >
      <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="space-y-7">
        <FormSection
          step={1}
          title="Data pemesan"
          description="Dipakai untuk konfirmasi total pembayaran dan info pengiriman."
        >
          <TextField
            id="nama"
            label="Nama lengkap"
            placeholder="Nama kamu"
            autoComplete="name"
            maxLength={ORDER_LIMITS.namaMax}
            value={values.nama}
            onChange={(event) => update("nama", event.target.value)}
            onBlur={() => markTouched("nama")}
            error={errorAt("nama")}
          />
          <TextField
            id="whatsapp"
            label="Nomor WhatsApp aktif"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0812 3456 7890"
            hint="Kami hubungi lewat WhatsApp untuk konfirmasi pesanan."
            value={values.whatsapp}
            onChange={(event) => update("whatsapp", event.target.value)}
            onBlur={() => markTouched("whatsapp")}
            error={errorAt("whatsapp")}
          />
        </FormSection>

        <FormSection
          step={2}
          title="Detail pesanan"
          description="Tiap item punya spesifikasi sendiri, tambahkan item baru untuk varian berbeda."
        >
          <div className="space-y-3">
            {values.items.map((item, index) => (
              <OrderItemCard
                key={index}
                index={index}
                item={item}
                canRemove={values.items.length > 1}
                errorFor={itemErrorFor(index)}
                onChange={(field, value) => updateItem(index, field, value)}
                onBlur={(field) => markTouched(`items.${index}.${field}`)}
                onRemove={() => removeItem(index)}
              />
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={addItem}
              disabled={values.items.length >= ORDER_LIMITS.itemMax}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-control border border-dashed border-line-strong py-3 text-[14px] font-semibold text-ink-soft transition-colors duration-200 hover:border-ink hover:bg-bg hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line-strong disabled:hover:bg-transparent"
            >
              <Plus aria-hidden className="size-4" strokeWidth={2.5} />
              Tambah item lain
            </button>
            <p className="mt-2 text-center text-[12px] text-muted">
              {values.items.length >= ORDER_LIMITS.itemMax
                ? `Maksimal ${ORDER_LIMITS.itemMax} item per pesanan.`
                : "Tiap item dihitung terpisah. Jumlah maksimal 99 pcs per item."}
            </p>
          </div>

          <TextAreaField
            id="catatan"
            label="Catatan tambahan"
            optional
            placeholder="Contoh: minta warna pastel, packing kado, atau instruksi lain"
            maxLength={ORDER_LIMITS.catatanMax}
            value={values.catatan}
            onChange={(event) => update("catatan", event.target.value)}
            onBlur={() => markTouched("catatan")}
            error={errorAt("catatan")}
            hint="Request khusus seperti kepekatan warna (pastel/cerah) atau catatan pengiriman."
          />
        </FormSection>

        <FormSection
          step={3}
          title="Pengiriman"
          description={`Pickup di ${PICKUP_LOCATION}, atau delivery dengan ongkir ditanggung pembeli.`}
        >
          <FieldGroup id="metode" legend="Metode" error={errorAt("metode")}>
            <OptionGroup<Method>
              name="metode"
              layout="cards"
              options={DELIVERY_METHODS}
              value={values.metode}
              onChange={(value) => {
                update("metode", value);

                if (value !== "Delivery") update("alamat", "");

                markTouched("metode");
              }}
              onBlur={() => markTouched("metode")}
              invalid={Boolean(errorAt("metode"))}
              describedBy={errorAt("metode") ? "metode-error" : undefined}
            />
          </FieldGroup>

          <p className="rounded-control border border-line bg-bg px-3.5 py-3 text-[13px] leading-relaxed text-muted">
            <span className="font-semibold text-ink-soft">Pickup:</span> ambil langsung di{" "}
            {PICKUP_LOCATION}, jadwal dikonfirmasi admin.<br />
            <span className="font-semibold text-ink-soft">Delivery:</span> ongkos kirim sepenuhnya
            ditanggung pembeli.
          </p>

          {values.metode === "Delivery" ? (
            <div className="reveal">
              <TextAreaField
                id="alamat"
                label="Alamat lengkap"
                placeholder="Jalan, nomor rumah, kelurahan, kota, kode pos"
                maxLength={ORDER_LIMITS.alamatMax}
                hint="Sertakan patokan agar kurir mudah menemukan lokasi."
                value={values.alamat}
                onChange={(event) => update("alamat", event.target.value)}
                onBlur={() => markTouched("alamat")}
                error={errorAt("alamat")}
              />
            </div>
          ) : null}
        </FormSection>

        <FormSection
          step={4}
          title="Pembayaran"
          description="Transfer sesuai total pesanan, lalu upload bukti transfernya. Bukti pembayaran wajib diisi."
        >
          <div className="rounded-control border border-line bg-bg px-3.5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              Transfer {PAYMENT.bank}
            </p>
            <div className="mt-1 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-heading text-[18px] leading-tight tabular-nums text-ink">
                  {PAYMENT.accountNumber}
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                  a.n. {PAYMENT.accountName}
                </p>
              </div>
              <CopyButton value={PAYMENT.accountNumber} />
            </div>
            <p className="mt-2 border-t border-line pt-2 text-[12px] leading-relaxed text-muted">
              Nominal: <span className="font-semibold text-ink">{formatRupiah(total)}</span> untuk{" "}
              {totalPcs} pcs.
            </p>
          </div>

          <PaymentProofField
            id="bukti"
            value={values.bukti}
            error={errorAt("bukti")}
            onChange={(value) => update("bukti", value)}
          />
        </FormSection>
      </div>

      <div
        className={cn(
          "sticky bottom-0 z-10 -mx-5 mt-8 border-t border-line bg-surface px-5 py-3",
          "pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_18px_-14px_rgba(20,20,20,0.25)]",
          "sm:static sm:mx-0 sm:mt-7 sm:border-t sm:bg-transparent sm:px-0 sm:pt-6 sm:pb-0 sm:shadow-none",
        )}
      >
        {formError ? (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-control border border-danger/30 bg-danger/5 px-3.5 py-3 text-[13px] font-semibold leading-relaxed text-danger"
          >
            <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} />
            <span>{formError}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Total</p>
            <p className="whitespace-nowrap font-heading text-[21px] leading-none tabular-nums text-ink sm:text-[24px]">
              {formatRupiah(total)}
            </p>
            <p className="mt-1.5 truncate text-[12px] text-muted tabular-nums">
              {totalPcs} pcs · {values.items.length} item
            </p>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control bg-ink px-3.5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-ink-soft disabled:cursor-wait disabled:opacity-70 sm:min-w-[164px] sm:px-5 sm:text-[15px]"
            aria-label={isPending ? "Mengirim pesanan" : "Kirim pesanan"}
          >
            {isPending ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <Send aria-hidden className="size-4" />
            )}
            {isPending ? (
              "Mengirim..."
            ) : (
              <>
                Kirim<span className="hidden sm:inline"> Pesanan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
