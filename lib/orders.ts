export const ORDER_STATUSES = ["baru", "dibayar", "selesai"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  baru: "New",
  dibayar: "Paid",
  selesai: "Done",
};

export type OrderItemRecord = {
  tekstur: string;
  warna: string;
  warnaLainnya?: string;
  aroma: string;
  jumlah: number;
  subtotal: number;
};

export type OrderRecord = {
  id: string;
  order_id: string;
  created_at: string;
  nama: string;
  whatsapp: string;
  metode: "Pickup" | "Delivery";
  alamat: string | null;
  catatan: string | null;
  total: number;
  total_pcs: number;
  items: OrderItemRecord[];
  proof_data: string | null;
  status: OrderStatus;
};

export type OrderFilters = {
  search: string;
  metode: string;
  status: string;
  sort: "newest" | "oldest";
  page: number;
  perPage: number;
};

export type OrderStats = {
  orders: number;
  pcs: number;
  revenue: number;
  pending: number;
  withoutProof: number;
};

export type OrderList = {
  rows: OrderRecord[];
  count: number;
};

export function parseFilters(params: Record<string, string | string[] | undefined>): OrderFilters {
  const read = (key: string): string => {
    const value = params[key];
    const single = Array.isArray(value) ? value[0] : value;

    return (single ?? "").trim();
  };

  const page = Number(read("page"));
  const sort = read("sort") === "oldest" ? "oldest" : "newest";

  return {
    search: read("q").slice(0, 80),
    metode: read("metode") === "Delivery" || read("metode") === "Pickup" ? read("metode") : "",
    status: read("status") === "baru" || read("status") === "dibayar" || read("status") === "selesai"
      ? read("status")
      : "",
    sort,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    perPage: 25,
  };
}

export function hasActiveFilters(filters: OrderFilters): boolean {
  return Boolean(filters.search || filters.metode || filters.status || filters.sort === "oldest");
}

export function filtersToQuery(filters: OrderFilters): string {
  const query = new URLSearchParams();

  if (filters.search) query.set("q", filters.search);
  if (filters.metode) query.set("metode", filters.metode);
  if (filters.status) query.set("status", filters.status);
  if (filters.sort === "oldest") query.set("sort", "oldest");
  if (filters.page > 1) query.set("page", String(filters.page));

  return query.toString();
}
