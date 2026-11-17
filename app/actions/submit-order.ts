"use server";

import { randomBytes } from "node:crypto";

import { headers } from "next/headers";

import { CUSTOM_COLOR } from "@/lib/config";
import { lineTotal, orderTotal } from "@/lib/format";
import { insertOrder } from "@/lib/orders-api";
import { orderSchema, type OrderDraft } from "@/lib/schema";

export type SubmitOrderResult =
  | { status: "success"; orderId: string; total: number }
  | { status: "error"; message: string };

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

const recentRequests = new Map<string, number[]>();

function generateOrderId(now: Date): string {
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const stamp = wib.toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = randomBytes(2).toString("hex").toUpperCase();

  return `NB-${stamp}-${suffix}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (recentRequests.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    recentRequests.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  recentRequests.set(key, timestamps);

  return false;
}

async function resolveClientKey(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");

  if (forwarded) return forwarded.split(",")[0]!.trim();

  return headerList.get("x-real-ip") ?? "local";
}

export async function submitOrder(input: OrderDraft): Promise<SubmitOrderResult> {
  const parsed = orderSchema.safeParse(input);

  if (!parsed.success) {
    return { status: "error", message: "Data pesanan belum lengkap. Periksa kembali isian kamu." };
  }

  const order = parsed.data;
  const now = new Date();
  const orderId = generateOrderId(now);
  const total = orderTotal(order.items.map((item) => item.jumlah));

  if (order.website) {
    return { status: "success", orderId, total };
  }

  if (isRateLimited(await resolveClientKey())) {
    return {
      status: "error",
      message: "Terlalu banyak percobaan. Tunggu sebentar lalu kirim ulang pesananmu.",
    };
  }

  try {
    await insertOrder({
      orderId,
      nama: order.nama,
      whatsapp: order.whatsapp,
      metode: order.metode,
      alamat: order.metode === "Delivery" ? order.alamat ?? "" : "",
      catatan: order.catatan ?? "",
      total,
      totalPcs: order.items.reduce((sum, item) => sum + item.jumlah, 0),
      items: order.items.map((item) => ({
        tekstur: item.tekstur,
        warna: item.warna,
        warnaLainnya: item.warna === CUSTOM_COLOR ? item.warnaLainnya ?? "" : "",
        aroma: item.aroma,
        jumlah: item.jumlah,
        subtotal: lineTotal(item.jumlah),
      })),
      proofData: order.bukti?.dataUrl ?? null,
    });
  } catch (error) {
    console.error("[submit-order]", error);

    return {
      status: "error",
      message: "Pesanan belum tersimpan. Coba kirim ulang, atau hubungi admin Nostabox.",
    };
  }

  return { status: "success", orderId, total };
}
