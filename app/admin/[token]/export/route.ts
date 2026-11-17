import { NextResponse } from "next/server";

import { hasSession, isPanelPath } from "@/lib/admin";
import { buildOrderWorkbook } from "@/lib/excel";
import { parseFilters } from "@/lib/orders";
import { listAllOrders } from "@/lib/orders-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ token: string }>;
};

function fileStamp(): string {
  const wib = new Date(Date.now() + 7 * 60 * 60 * 1000);

  return wib.toISOString().slice(0, 10);
}

export async function GET(request: Request, { params }: RouteContext) {
  const { token } = await params;

  if (!isPanelPath(token) || !(await hasSession())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const filters = parseFilters(Object.fromEntries(url.searchParams));

  try {
    const orders = await listAllOrders(filters);
    const workbook = await buildOrderWorkbook(orders);

    return new NextResponse(workbook, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="nostabox-orders-${fileStamp()}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[export-orders]", error);

    return new NextResponse("Failed to generate the Excel file.", { status: 500 });
  }
}
