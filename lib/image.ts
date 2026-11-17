import { PAYMENT_PROOF_LIMITS } from "@/lib/config";
import type { PaymentProof } from "@/lib/schema";

const MAX_DIMENSION = 1600;
const QUALITY_STEPS = [0.82, 0.7, 0.6, 0.5];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak bisa dibaca. Coba file lain."));
    };

    image.src = url;
  });
}

export async function preparePaymentProof(file: File): Promise<PaymentProof> {
  if (!(PAYMENT_PROOF_LIMITS.accept as readonly string[]).includes(file.type)) {
    throw new Error("Format harus JPG, PNG, atau WebP.");
  }

  if (file.size > PAYMENT_PROOF_LIMITS.maxBytes) {
    throw new Error(`Ukuran file maksimal ${PAYMENT_PROOF_LIMITS.maxMb} MB.`);
  }

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Browser tidak mendukung pemrosesan gambar.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let dataUrl = canvas.toDataURL("image/jpeg", QUALITY_STEPS[0]!);

  for (const quality of QUALITY_STEPS.slice(1)) {
    if (dataUrl.length <= PAYMENT_PROOF_LIMITS.maxDataUrlLength) break;

    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (dataUrl.length > PAYMENT_PROOF_LIMITS.maxDataUrlLength) {
    throw new Error("Gambar terlalu besar setelah dikompres. Coba foto lain.");
  }

  return {
    name: file.name.slice(0, 160) || "bukti-transfer.jpg",
    mimeType: "image/jpeg",
    dataUrl,
  };
}
