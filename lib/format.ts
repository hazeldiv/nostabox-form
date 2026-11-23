import { CONTACT, PRODUCT, SCENT_PLACEHOLDER } from "@/lib/config";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number): string {
  return rupiah.format(value).replace(/\u00a0/g, " ");
}

export function lineTotal(quantity: number): number {
  return PRODUCT.price * quantity;
}

export function orderTotal(quantities: readonly number[]): number {
  return quantities.reduce((sum, quantity) => sum + lineTotal(quantity), 0);
}

export function normalizeWhatsapp(value: string): string {
  const cleaned = value.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+62")) return cleaned;
  if (cleaned.startsWith("62")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+62${cleaned.slice(1)}`;
  if (cleaned.startsWith("8")) return `+62${cleaned}`;

  return cleaned;
}

export function formatWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("62") ? digits.slice(2) : digits;
  const grouped = local.replace(/^(\d{3})(\d{4})(\d+)$/, "$1-$2-$3");

  return `+62 ${grouped}`;
}

export function formatWhatsappLocal(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  if (digits.startsWith("0")) return digits;
  if (digits.startsWith("8")) return `0${digits}`;

  return digits;
}

export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${CONTACT.phoneE164}`;

  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

const wibDateTime = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function formatWibDateTime(value: string | Date): string {
  return wibDateTime.format(typeof value === "string" ? new Date(value) : value);
}

export function customerWhatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  return `https://wa.me/${digits.startsWith("62") ? digits : `62${digits.replace(/^0/, "")}`}`;
}

export function formatAroma(value: string | null | undefined): string {
  const aroma = (value ?? "").trim();

  return aroma === SCENT_PLACEHOLDER ? "" : aroma;
}
