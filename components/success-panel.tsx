"use client";

import { useEffect, useRef } from "react";

import { Check } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { CONTACT, CUSTOM_COLOR, PAYMENT, PRODUCT } from "@/lib/config";
import { formatRupiah, formatWhatsapp, lineTotal, whatsappHref } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/schema";

type SuccessPanelProps = {
  order: Order;
  orderId: string;
  total: number;
  onReset: () => void;
};

function itemColor(item: OrderItem): string {
  if (item.warna === CUSTOM_COLOR && item.warnaLainnya) return `Lainnya — ${item.warnaLainnya}`;

  return item.warna;
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2.5">
      <dt className="shrink-0 text-[13px] text-muted">{label}</dt>
      <dd className="text-right text-[14px] font-semibold text-ink">{value}</dd>
    </div>
  );
}

export function SuccessPanel({ order, orderId, total, onReset }: SuccessPanelProps) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ block: "center" });
  }, []);

  const firstName = order.nama.split(" ")[0] ?? order.nama;

  return (
    <section
      ref={panelRef}
      aria-live="polite"
      className="reveal mt-6 rounded-card border border-line bg-surface p-6 sm:mt-8 sm:p-8"
    >
      <div className="flex items-start gap-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success/10 text-success">
          <Check aria-hidden className="size-5" strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="text-[22px]">Pesanan diterima!</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
            Terima kasih, {firstName}. Bukti transfermu sudah masuk dan akan diverifikasi admin.
            Pesananmu segera masuk antrean produksi.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-control border border-line bg-bg px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Nomor pesanan
          </p>
          <p className="font-heading text-[16px] tabular-nums text-ink">{orderId}</p>
        </div>
        <CopyButton value={orderId} />
      </div>

      <div className="mt-5 rounded-control border border-line p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
          Rincian pesanan
        </p>
        <ul className="mt-3 space-y-3">
          {order.items.map((item, index) => (
            <li key={index} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold leading-snug text-ink">
                  {item.tekstur} · {itemColor(item)} · {item.aroma}
                </p>
                <p className="mt-0.5 text-[12px] tabular-nums text-muted">
                  {item.jumlah} pcs × {formatRupiah(PRODUCT.price)}
                </p>
              </div>
              <p className="shrink-0 text-[14px] font-semibold tabular-nums text-ink">
                {formatRupiah(lineTotal(item.jumlah))}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3">
          <span className="text-[13px] text-muted">Total</span>
          <span className="font-heading text-[20px] leading-none tabular-nums text-ink">
            {formatRupiah(total)}
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-control border border-line p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
          Pembayaran · Transfer {PAYMENT.bank}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Pastikan nominal transfer sesuai {formatRupiah(total)}. Jika ada kekurangan, admin akan
          menghubungi kamu.
        </p>
        <div className="mt-3 rounded-control bg-bg px-3.5 py-3">
          <dl>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Bank
              </dt>
              <dd className="text-[13px] font-semibold text-ink">{PAYMENT.bank}</dd>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between gap-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Atas nama
              </dt>
              <dd className="text-right text-[13px] font-semibold text-ink">
                {PAYMENT.accountName}
              </dd>
            </div>
          </dl>
          <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-line pt-2.5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                No. rekening
              </p>
              <p className="font-heading text-[18px] tabular-nums text-ink">
                {PAYMENT.accountNumber}
              </p>
            </div>
            <CopyButton value={PAYMENT.accountNumber} label="Salin" />
          </div>
        </div>
      </div>

      <dl className="mt-5 divide-y divide-line border-t border-line text-[14px]">
        <RecapRow label="Nama" value={order.nama} />
        <RecapRow label="WhatsApp" value={formatWhatsapp(order.whatsapp)} />
        <RecapRow label="Metode" value={order.metode === "Delivery" ? "Delivery" : "Pickup"} />
        {order.metode === "Delivery" && order.alamat ? (
          <RecapRow label="Alamat" value={order.alamat} />
        ) : null}
        {order.catatan ? <RecapRow label="Catatan" value={order.catatan} /> : null}
        <RecapRow label="Bukti transfer" value="Sudah diunggah" />
      </dl>

      <p className="mt-3 rounded-control border border-success/25 bg-success/5 px-3.5 py-2.5 text-[13px] leading-relaxed text-success">
        Bukti transfer kamu sudah kami terima. Admin akan memverifikasi pembayaran ini.
      </p>

      <p className="mt-4 text-[13px] leading-relaxed text-muted">
        Ada pertanyaan? Hubungi{" "}
        <a
          href={whatsappHref(
            `Halo ${CONTACT.name}, saya sudah mengisi form pre-order Nostabox Slime dengan nomor pesanan ${orderId}.`,
          )}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-ink underline decoration-line underline-offset-2 transition-colors duration-200 hover:decoration-ink"
        >
          {CONTACT.name} · {CONTACT.phoneDisplay}
        </a>
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-control border border-line px-5 text-[14px] font-semibold text-ink transition-colors duration-200 hover:border-line-strong hover:bg-bg"
      >
        Isi pesanan lain
      </button>
    </section>
  );
}
