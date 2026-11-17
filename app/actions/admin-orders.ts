"use server";

import { revalidatePath } from "next/cache";

import { hasSession, panelPath } from "@/lib/admin";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { deleteOrder, setOrderStatus } from "@/lib/orders-api";

export type StatusUpdateResult = { ok: true } | { ok: false; message: string };
export type DeleteResult = { ok: true } | { ok: false; message: string };

function isStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export async function updateOrderStatus(
  id: string,
  status: string,
): Promise<StatusUpdateResult> {
  if (!(await hasSession())) {
    return { ok: false, message: "Admin session expired. Please sign in again." };
  }

  if (!isStatus(status)) {
    return { ok: false, message: "Invalid status." };
  }

  try {
    await setOrderStatus(id, status);
    revalidatePath(`/admin/${panelPath()}`);

    return { ok: true };
  } catch (error) {
    console.error("[update-order-status]", error);

    return { ok: false, message: "Failed to update status." };
  }
}

export async function removeOrder(id: string): Promise<DeleteResult> {
  if (!(await hasSession())) {
    return { ok: false, message: "Admin session expired. Please sign in again." };
  }

  if (!id) {
    return { ok: false, message: "Invalid order." };
  }

  try {
    await deleteOrder(id);
    revalidatePath(`/admin/${panelPath()}`);

    return { ok: true };
  } catch (error) {
    console.error("[remove-order]", error);

    return { ok: false, message: "Failed to delete the order." };
  }
}
