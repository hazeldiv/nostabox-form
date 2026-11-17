import { getSupabase } from "@/lib/supabase";
import type { OrderFilters, OrderList, OrderRecord, OrderStats, OrderStatus } from "@/lib/orders";

function adminKey(): string {
  const key = process.env.SUPABASE_ADMIN_KEY;

  if (!key) throw new Error("SUPABASE_ADMIN_KEY belum diset.");

  return key;
}

type Envelope<T> = { ok: boolean; error?: string } & T;

function unwrap<T>(data: unknown): T {
  const result = data as Envelope<T> | null;

  if (!result || !result.ok) {
    throw new Error(result?.error ?? "Permintaan ke Supabase gagal.");
  }

  return result as T;
}

export async function listOrders(filters: OrderFilters): Promise<OrderList> {
  const { data, error } = await getSupabase().rpc("admin_orders", {
    p_key: adminKey(),
    p_search: filters.search,
    p_metode: filters.metode,
    p_status: filters.status,
    p_sort: filters.sort,
    p_limit: filters.perPage,
    p_offset: (filters.page - 1) * filters.perPage,
  });

  if (error) throw new Error(error.message);

  const result = unwrap<{ rows: OrderRecord[]; count: number }>(data);

  return { rows: result.rows, count: Number(result.count) };
}

export async function listAllOrders(filters: OrderFilters): Promise<OrderRecord[]> {
  const { data, error } = await getSupabase().rpc("admin_orders", {
    p_key: adminKey(),
    p_search: filters.search,
    p_metode: filters.metode,
    p_status: filters.status,
    p_sort: filters.sort,
    p_limit: 5000,
    p_offset: 0,
  });

  if (error) throw new Error(error.message);

  return unwrap<{ rows: OrderRecord[] }>(data).rows;
}

export async function getStats(): Promise<OrderStats> {
  const { data, error } = await getSupabase().rpc("admin_stats", { p_key: adminKey() });

  if (error) throw new Error(error.message);

  const result = unwrap<{
    orders: number;
    pcs: number;
    revenue: number;
    pending: number;
    without_proof: number;
  }>(data);

  return {
    orders: Number(result.orders),
    pcs: Number(result.pcs),
    revenue: Number(result.revenue),
    pending: Number(result.pending),
    withoutProof: Number(result.without_proof),
  };
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { data, error } = await getSupabase().rpc("admin_set_status", {
    p_key: adminKey(),
    p_id: id,
    p_status: status,
  });

  if (error) throw new Error(error.message);

  unwrap<{ status: string }>(data);
}

export async function deleteOrder(id: string): Promise<void> {
  const { data, error } = await getSupabase().rpc("admin_delete_order", {
    p_key: adminKey(),
    p_id: id,
  });

  if (error) throw new Error(error.message);

  unwrap<{ order_id: string }>(data);
}

export type NewOrder = {
  orderId: string;
  nama: string;
  whatsapp: string;
  metode: string;
  alamat: string;
  catatan: string;
  total: number;
  totalPcs: number;
  items: Array<{
    tekstur: string;
    warna: string;
    warnaLainnya: string;
    aroma: string;
    jumlah: number;
    subtotal: number;
  }>;
  proofData: string | null;
};

export async function insertOrder(order: NewOrder): Promise<void> {
  const { data, error } = await getSupabase().rpc("submit_order", {
    p: {
      order_id: order.orderId,
      nama: order.nama,
      whatsapp: order.whatsapp,
      metode: order.metode,
      alamat: order.alamat,
      catatan: order.catatan,
      total: order.total,
      total_pcs: order.totalPcs,
      items: order.items,
      proof_data: order.proofData,
    },
  });

  if (error) throw new Error(error.message);

  unwrap<{ id: string }>(data);
}
