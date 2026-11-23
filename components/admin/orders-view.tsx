"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Check, Copy, ImageOff, MessageCircle, Store, Trash2, Truck, X } from "lucide-react";

import { updateOrderStatus, removeOrder } from "@/app/actions/admin-orders";
import { cn } from "@/lib/cn";
import {
  customerWhatsappHref,
  formatAroma,
  formatRupiah,
  formatWhatsappLocal,
  formatWibDateTime,
} from "@/lib/format";
import {
  ORDER_STATUSES,
  STATUS_LABEL,
  type OrderRecord,
  type OrderStatus,
} from "@/lib/orders";

const STATUS_STYLE: Record<OrderStatus, string> = {
  baru: "border-line bg-bg text-ink-soft",
  dibayar: "border-success/25 bg-success/10 text-success",
  selesai: "border-ink bg-ink text-white",
};

type OrdersViewProps = {
  rows: OrderRecord[];
};

function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]",
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function itemLine(order: OrderRecord): string {
  return order.items
    .map((item) => {
      const color =
        item.warna === "Lainnya" && item.warnaLainnya ? `Lainnya (${item.warnaLainnya})` : item.warna;

      return [`${item.jumlah}× ${item.tekstur}`, color, formatAroma(item.aroma)]
        .filter(Boolean)
        .join(" · ");
    })
    .join(" • ");
}

export function OrdersView({ rows }: OrdersViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, OrderStatus>>({});
  const [removed, setRemoved] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const closeRef = useRef<HTMLButtonElement>(null);

  const visibleRows = useMemo(
    () => rows.filter((row) => !removed.includes(row.id)),
    [rows, removed],
  );

  const selected = useMemo(
    () => visibleRows.find((row) => row.id === selectedId) ?? null,
    [visibleRows, selectedId],
  );

  const statusOf = (order: OrderRecord): OrderStatus => overrides[order.id] ?? order.status;

  useEffect(() => {
    if (!selected) return;

    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedId(null);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 2600);

    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    setConfirmDelete(false);
  }, [selectedId]);

  function changeStatus(order: OrderRecord, next: OrderStatus) {
    const previous = statusOf(order);

    if (previous === next) return;

    setOverrides((current) => ({ ...current, [order.id]: next }));

    startTransition(async () => {
      const result = await updateOrderStatus(order.id, next);

      if (result.ok) {
        setToast(`${order.order_id} → ${STATUS_LABEL[next]}`);
        return;
      }

      setOverrides((current) => ({ ...current, [order.id]: previous }));
      setToast(result.message);
    });
  }

  function removeSelected(order: OrderRecord) {
    startTransition(async () => {
      const result = await removeOrder(order.id);

      if (!result.ok) {
        setToast(result.message);
        return;
      }

      setRemoved((current) => [...current, order.id]);
      setSelectedId(null);
      setToast(`${order.order_id} deleted`);
    });
  }

  async function copyOrderId(orderId: string) {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
    } catch {
      setToast("Failed to copy order ID.");
    }
  }

  if (visibleRows.length === 0) {
    return (
      <div className="mt-4 rounded-card border border-line bg-surface px-6 py-14 text-center">
        <p className="font-heading text-[18px] text-ink">No orders yet</p>
        <p className="mx-auto mt-2 max-w-[38ch] text-[13px] leading-relaxed text-muted">
          Orders submitted through the form will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 hidden overflow-hidden rounded-card border border-line bg-surface lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-bg/60">
              {["Date", "Order", "WhatsApp", "Items", "Total", "Method", "Proof", "Status"].map(
                (label) => (
                  <th
                    key={label}
                    scope="col"
                    className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted"
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelectedId(order.id)}
                className="cursor-pointer border-b border-line/70 transition-colors duration-150 last:border-b-0 hover:bg-bg/70"
              >
                <td className="px-3.5 py-3 align-top text-[12px] whitespace-nowrap text-muted">
                  {formatWibDateTime(order.created_at)}
                </td>
                <td className="px-3.5 py-3 align-top">
                  <p className="text-[14px] font-semibold text-ink">{order.nama}</p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-muted">{order.order_id}</p>
                </td>
                <td className="px-3.5 py-3 align-top text-[13px] tabular-nums whitespace-nowrap text-ink-soft">
                  {formatWhatsappLocal(order.whatsapp)}
                </td>
                <td className="max-w-[240px] px-3.5 py-3 align-top text-[12px] leading-snug text-muted">
                  <span className="line-clamp-2">{itemLine(order)}</span>
                </td>
                <td className="px-3.5 py-3 align-top text-[13px] font-semibold tabular-nums whitespace-nowrap text-ink">
                  {formatRupiah(order.total)}
                </td>
                <td className="px-3.5 py-3 align-top">
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
                    {order.metode === "Delivery" ? (
                      <Truck aria-hidden className="size-3.5" strokeWidth={2.5} />
                    ) : (
                      <Store aria-hidden className="size-3.5" strokeWidth={2.5} />
                    )}
                    {order.metode}
                  </span>
                </td>
                <td className="px-3.5 py-3 align-top">
                  {order.proof_data ? (
                    <img
                      src={order.proof_data}
                      alt={`Payment proof for ${order.order_id}`}
                      className="size-10 rounded-[7px] border border-line object-cover"
                    />
                  ) : (
                    <span className="text-[12px] text-muted">—</span>
                  )}
                </td>
                <td className="px-3.5 py-3 align-top">
                  <StatusPill status={statusOf(order)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 space-y-2.5 lg:hidden">
        {visibleRows.map((order) => (
          <li key={order.id}>
            <button
              type="button"
              onClick={() => setSelectedId(order.id)}
              className="w-full cursor-pointer rounded-card border border-line bg-surface p-3.5 text-left transition-colors duration-150 hover:border-line-strong"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-ink">{order.nama}</p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-muted">
                    {order.order_id} · {formatWibDateTime(order.created_at)}
                  </p>
                </div>
                <StatusPill status={statusOf(order)} />
              </div>

              <div className="mt-2.5 flex items-center gap-3">
                {order.proof_data ? (
                  <img
                    src={order.proof_data}
                    alt={`Payment proof for ${order.order_id}`}
                    className="size-12 shrink-0 rounded-[8px] border border-line object-cover"
                  />
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-[8px] border border-dashed border-line text-muted">
                    <ImageOff aria-hidden className="size-4" strokeWidth={2.5} />
                  </span>
                )}
                <p className="line-clamp-2 min-w-0 flex-1 text-[12px] leading-snug text-muted">
                  {itemLine(order)}
                </p>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
                  {order.metode === "Delivery" ? (
                    <Truck aria-hidden className="size-3.5" strokeWidth={2.5} />
                  ) : (
                    <Store aria-hidden className="size-3.5" strokeWidth={2.5} />
                  )}
                  {order.metode} · {order.total_pcs} pcs
                </span>
                <span className="font-heading text-[16px] tabular-nums text-ink">
                  {formatRupiah(order.total)}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close details"
            onClick={() => setSelectedId(null)}
            className="absolute inset-0 cursor-pointer bg-ink/35 backdrop-blur-[2px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            className="relative flex h-full w-full max-w-[540px] flex-col overflow-y-auto border-l border-line bg-surface shadow-[-24px_0_60px_-30px_rgba(20,20,20,0.45)]"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-surface px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <h2 id="detail-title" className="truncate text-[19px] leading-tight">
                  {selected.nama}
                </h2>
                <p className="mt-0.5 text-[12px] tabular-nums text-muted">{selected.order_id}</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label="Close order details"
                className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-line text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink"
              >
                <X aria-hidden className="size-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 px-4 py-4 sm:px-5">
              <fieldset>
                <legend className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  Order status
                </legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {ORDER_STATUSES.map((status) => {
                    const active = statusOf(selected) === status;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => changeStatus(selected, status)}
                        disabled={isPending}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-control border text-[13px] font-semibold transition-colors duration-200 disabled:cursor-wait",
                          active
                            ? "border-ink bg-ink text-white"
                            : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink",
                        )}
                      >
                        {active ? <Check aria-hidden className="size-3.5" strokeWidth={3} /> : null}
                        {STATUS_LABEL[status]}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-control border border-line bg-bg px-3.5 py-3">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    Date
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-semibold text-ink">
                    {formatWibDateTime(selected.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    Method
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-semibold text-ink">{selected.metode}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    Total
                  </dt>
                  <dd className="mt-0.5 font-heading text-[16px] tabular-nums text-ink">
                    {formatRupiah(selected.total)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    Quantity
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-semibold tabular-nums text-ink">
                    {selected.total_pcs} pcs · {selected.items.length}{" "}
                    {selected.items.length === 1 ? "item" : "items"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  Order items
                </p>
                <ul className="mt-2 space-y-2">
                  {selected.items.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start justify-between gap-3 rounded-control border border-line px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold leading-snug text-ink">
                          {[
                            item.tekstur,
                            item.warna === "Lainnya" && item.warnaLainnya
                              ? `Lainnya (${item.warnaLainnya})`
                              : item.warna,
                            formatAroma(item.aroma),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <p className="mt-0.5 text-[11px] tabular-nums text-muted">
                          {item.jumlah} pcs
                        </p>
                      </div>
                      <span className="shrink-0 text-[13px] font-semibold tabular-nums text-ink">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between gap-3 rounded-control border border-line px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                      WhatsApp
                    </p>
                    <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-ink">
                      {formatWhatsappLocal(selected.whatsapp)}
                    </p>
                  </div>
                  <a
                    href={customerWhatsappHref(selected.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 text-[12px] font-semibold text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink"
                  >
                    <MessageCircle aria-hidden className="size-3.5" strokeWidth={2.5} />
                    Chat
                  </a>
                </div>

                {selected.metode === "Delivery" && selected.alamat ? (
                  <div className="rounded-control border border-line px-3.5 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                      Address
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink">{selected.alamat}</p>
                  </div>
                ) : null}

                {selected.catatan ? (
                  <div className="rounded-control border border-line px-3.5 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                      Notes
                    </p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink">{selected.catatan}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  Payment proof
                </p>
                {selected.proof_data ? (
                  <a
                    href={selected.proof_data}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block cursor-pointer overflow-hidden rounded-control border border-line"
                  >
                    <img
                      src={selected.proof_data}
                      alt={`Payment proof for ${selected.order_id}`}
                      className="max-h-[420px] w-full bg-bg object-contain"
                    />
                  </a>
                ) : (
                  <p className="mt-2 rounded-control border border-dashed border-line px-3.5 py-6 text-center text-[13px] text-muted">
                    The customer has not uploaded payment proof yet.
                  </p>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 space-y-2 border-t border-line bg-surface px-4 py-3 sm:px-5">
              {confirmDelete ? (
                <div className="rounded-control border border-danger/30 bg-danger/5 px-3.5 py-3">
                  <p className="text-[13px] font-semibold leading-relaxed text-danger">
                    Delete order {selected.order_id}? This cannot be undone.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      disabled={isPending}
                      className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-control border border-line bg-surface text-[13px] font-semibold text-ink transition-colors duration-200 hover:border-line-strong disabled:cursor-wait disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSelected(selected)}
                      disabled={isPending}
                      className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-control bg-danger text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-danger/90 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Trash2 aria-hidden className="size-3.5" strokeWidth={2.5} />
                      {isPending ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyOrderId(selected.order_id)}
                  className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control border border-line text-[13px] font-semibold text-ink transition-colors duration-200 hover:border-line-strong hover:bg-bg"
                >
                  {copied ? (
                    <Check aria-hidden className="size-4" strokeWidth={2.5} />
                  ) : (
                    <Copy aria-hidden className="size-4" strokeWidth={2.5} />
                  )}
                  {copied ? "Order ID copied" : "Copy order ID"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={isPending || confirmDelete}
                  aria-label={`Delete order ${selected.order_id}`}
                  className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-line px-3.5 text-[13px] font-semibold text-muted transition-colors duration-200 hover:border-danger/40 hover:bg-danger/5 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 aria-hidden className="size-4" strokeWidth={2.5} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4"
      >
        {toast ? (
          <p className="reveal rounded-full border border-ink bg-ink px-4 py-2.5 text-[12px] font-semibold text-white shadow-lg">
            {toast}
          </p>
        ) : null}
      </div>
    </>
  );
}
