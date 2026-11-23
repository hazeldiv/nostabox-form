"use server";

import { randomBytes } from "node:crypto";

import { headers } from "next/headers";

import { CUSTOM_COLOR, SCENT_PLACEHOLDER } from "@/lib/config";
import { lineTotal, orderTotal } from "@/lib/format";
import { insertOrder } from "@/lib/orders-api";
import { createRateLimiter } from "@/lib/rate-limit";
import { orderSchema, type OrderDraft } from "@/lib/schema";

export type SubmitOrderResult =
  | { status: "success"; orderId: string; total: number }
  | { status: "error"; message: string };

const burstLimiter = createRateLimiter(5, 60_000);

function generateOrderId(now: Date): string {
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const stamp = wib.toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = randomBytes(2).toString("hex").toUpperCase();

  return `NB-${stamp}-${suffix}`;
}

async function resolveClientIp(): Promise<string> {
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
  const proof = order.bukti;

  if (!proof) {
    return { status: "error", message: "Upload bukti pembayaran terlebih dahulu." };
  }

  const now = new Date();
  const orderId = generateOrderId(now);
  const total = orderTotal(order.items.map((item) => item.jumlah));

  if (order.website) {
    return { status: "success", orderId, total };
  }

  const ip = await resolveClientIp();

  if (!burstLimiter.consume(ip)) {
    return {
      status: "error",
      message: "Terlalu banyak percobaan. Tunggu sebentar lalu kirim ulang pesananmu.",
    };
  }

  try {
    await insertOrder({
      orderId,
      ip,
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
        aroma: SCENT_PLACEHOLDER,
        jumlah: item.jumlah,
        subtotal: lineTotal(item.jumlah),
      })),
      proofData: proof.dataUrl,
    });
  } catch (error) {
    console.error("[submit-order]", error);

    if (error instanceof Error && error.message === "rate_limited") {
      return {
        status: "error",
        message: "Terlalu banyak percobaan. Tunggu sebentar lalu kirim ulang pesananmu.",
      };
    }

    return {
      status: "error",
      message: "Pesanan belum tersimpan. Coba kirim ulang, atau hubungi admin Nostabox.",
    };
  }

  return { status: "success", orderId, total };
}
