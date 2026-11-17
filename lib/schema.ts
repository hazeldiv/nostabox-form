import { z } from "zod";

import {
  COLOR_VALUES,
  CUSTOM_COLOR,
  METHOD_VALUES,
  ORDER_LIMITS,
  PAYMENT_PROOF_LIMITS,
  SCENTS,
  TEXTURE_VALUES,
  type Color,
  type Method,
  type Scent,
  type Texture,
} from "@/lib/config";
import { normalizeWhatsapp } from "@/lib/format";

const WHATSAPP_PATTERN = /^\+628[0-9]{7,11}$/;

const orderItemSchema = z
  .object({
    tekstur: z.enum(TEXTURE_VALUES, "Pilih salah satu add on."),
    warna: z.enum(COLOR_VALUES, "Pilih salah satu warna slime."),
    warnaLainnya: z
      .string()
      .trim()
      .max(ORDER_LIMITS.customColorMax, `Maksimal ${ORDER_LIMITS.customColorMax} karakter.`)
      .optional(),
    aroma: z.enum(SCENTS, "Pilih salah satu aroma slime."),
    jumlah: z
      .number("Jumlah pesanan wajib berupa angka.")
      .int("Jumlah pesanan harus bilangan bulat.")
      .min(1, "Minimal 1 pcs.")
      .max(ORDER_LIMITS.jumlahMax, `Maksimal ${ORDER_LIMITS.jumlahMax} pcs per item.`),
  })
  .superRefine((item, ctx) => {
    if (item.warna === CUSTOM_COLOR && !item.warnaLainnya) {
      ctx.addIssue({
        code: "custom",
        path: ["warnaLainnya"],
        message: "Sebutkan kombinasi warna yang diinginkan.",
      });
    }
  });

const paymentProofSchema = z.object({
  name: z.string().trim().min(1, "Nama file tidak valid.").max(160),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  dataUrl: z
    .string()
    .max(PAYMENT_PROOF_LIMITS.maxDataUrlLength, "Ukuran bukti pembayaran terlalu besar.")
    .refine((value) => value.startsWith("data:image/"), "Format bukti pembayaran tidak valid."),
});

export type PaymentProof = z.infer<typeof paymentProofSchema>;

export const orderSchema = z
  .object({
    nama: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(ORDER_LIMITS.namaMax, `Nama maksimal ${ORDER_LIMITS.namaMax} karakter.`),
    whatsapp: z
      .string()
      .transform(normalizeWhatsapp)
      .refine((value) => WHATSAPP_PATTERN.test(value), {
        message: "Masukkan nomor WhatsApp aktif, contoh 0812 3456 7890.",
      }),
    items: z
      .array(orderItemSchema)
      .min(1, "Tambahkan minimal satu item pesanan.")
      .max(ORDER_LIMITS.itemMax, `Maksimal ${ORDER_LIMITS.itemMax} item per pesanan.`),
    catatan: z
      .string()
      .trim()
      .max(ORDER_LIMITS.catatanMax, `Catatan maksimal ${ORDER_LIMITS.catatanMax} karakter.`)
      .optional(),
    metode: z.enum(METHOD_VALUES, "Pilih metode pengambilan atau pengiriman."),
    alamat: z
      .string()
      .trim()
      .max(ORDER_LIMITS.alamatMax, `Alamat maksimal ${ORDER_LIMITS.alamatMax} karakter.`)
      .optional(),
    bukti: paymentProofSchema.nullish(),
    website: z.string().optional(),
  })
  .superRefine((order, ctx) => {
    if (order.metode === "Delivery" && (order.alamat ?? "").length < ORDER_LIMITS.alamatMin) {
      ctx.addIssue({
        code: "custom",
        path: ["alamat"],
        message: "Isi alamat lengkap beserta patokan, minimal 15 karakter.",
      });
    }
  });

export type Order = z.output<typeof orderSchema>;
export type OrderItem = Order["items"][number];

export type ItemDraft = {
  tekstur?: Texture;
  warna?: Color;
  warnaLainnya: string;
  aroma?: Scent;
  jumlah: number;
};

export type OrderDraft = {
  nama: string;
  whatsapp: string;
  items: ItemDraft[];
  catatan: string;
  metode?: Method;
  alamat: string;
  bukti: PaymentProof | null;
  website: string;
};

export function createItem(): ItemDraft {
  return {
    tekstur: undefined,
    warna: undefined,
    warnaLainnya: "",
    aroma: undefined,
    jumlah: 1,
  };
}

export const emptyOrder: OrderDraft = {
  nama: "",
  whatsapp: "",
  items: [createItem()],
  catatan: "",
  metode: undefined,
  alamat: "",
  bukti: null,
  website: "",
};

export function flattenErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");

    if (!(key in errors)) errors[key] = issue.message;
  }

  return errors;
}

export function fieldIdFromPath(path: string): string {
  return path.replace(/^items\.(\d+)\./, "item-$1-");
}
