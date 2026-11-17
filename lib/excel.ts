import ExcelJS from "exceljs";

import { PRODUCT } from "@/lib/config";
import { formatWhatsapp } from "@/lib/format";
import { STATUS_LABEL, type OrderRecord } from "@/lib/orders";

function itemSummary(order: OrderRecord): string {
  return order.items
    .map((item) => {
      const color =
        item.warna === "Lainnya" && item.warnaLainnya ? `Lainnya (${item.warnaLainnya})` : item.warna;

      return `${item.jumlah}x ${item.tekstur} · ${color} · ${item.aroma}`;
    })
    .join("\n");
}

function wibDate(value: string): string {
  const date = new Date(value);
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  return `${wib.toISOString().slice(0, 10)} ${wib.toISOString().slice(11, 16)}`;
}

export async function buildOrderWorkbook(orders: OrderRecord[]): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Nostabox";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Orders", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Date (WIB)", key: "created_at", width: 18 },
    { header: "Order ID", key: "order_id", width: 18 },
    { header: "Name", key: "nama", width: 24 },
    { header: "WhatsApp", key: "whatsapp", width: 18 },
    { header: "Items", key: "items", width: 46 },
    { header: "Total Pcs", key: "total_pcs", width: 11 },
    { header: "Total", key: "total", width: 14 },
    { header: "Method", key: "metode", width: 12 },
    { header: "Address", key: "alamat", width: 36 },
    { header: "Notes", key: "catatan", width: 30 },
    { header: "Payment Proof", key: "proof", width: 14 },
    { header: "Status", key: "status", width: 12 },
  ];

  const header = sheet.getRow(1);
  header.font = { bold: true, size: 11 };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3EFE6" } };
  header.alignment = { vertical: "middle" };
  header.height = 22;

  orders.forEach((order) => {
    const row = sheet.addRow({
      created_at: wibDate(order.created_at),
      order_id: order.order_id,
      nama: order.nama,
      whatsapp: formatWhatsapp(order.whatsapp),
      items: itemSummary(order),
      total_pcs: order.total_pcs,
      total: order.total,
      metode: order.metode,
      alamat: order.alamat ?? "",
      catatan: order.catatan ?? "",
      proof: order.proof_data ? "Yes" : "Missing",
      status: STATUS_LABEL[order.status],
    });

    row.getCell("total").numFmt = '"Rp"#,##0';
    row.alignment = { vertical: "top", wrapText: true };
    row.height = Math.max(18, order.items.length * 15);
  });

  const totalPcs = orders.reduce((sum, order) => sum + order.total_pcs, 0);
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  sheet.addRow({});
  const summary = sheet.addRow({
    nama: "TOTAL",
    total_pcs: totalPcs,
    total: revenue,
  });
  summary.font = { bold: true };
  summary.getCell("total").numFmt = '"Rp"#,##0';

  const info = workbook.addWorksheet("Summary");
  info.columns = [
    { header: "Item", key: "label", width: 26 },
    { header: "Value", key: "value", width: 30 },
  ];
  info.getRow(1).font = { bold: true };
  info.addRows([
    { label: "Exported", value: wibDate(new Date().toISOString()) },
    { label: "Total orders", value: orders.length },
    { label: "Total pcs", value: totalPcs },
    { label: "Total revenue", value: revenue },
    { label: "Price per pcs", value: PRODUCT.price },
    { label: "Awaiting payment", value: orders.filter((order) => order.status === "baru").length },
    { label: "Without payment proof", value: orders.filter((order) => !order.proof_data).length },
  ]);
  info.getCell("B4").numFmt = '"Rp"#,##0';
  info.getCell("B6").numFmt = '"Rp"#,##0';

  const buffer = await workbook.xlsx.writeBuffer();

  return new Blob([buffer as unknown as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
