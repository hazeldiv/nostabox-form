export const PRODUCT = {
  name: "Nostabox Slime",
  price: 25000,
  size: "200 ml",
  tagline: "A little box of happy things.",
  eyebrow: "Pre-Order Slime by Nostabox",
} as const;

export const TEXTURE_VALUES = ["Clay Slime", "Floam Slime"] as const;
export type Texture = (typeof TEXTURE_VALUES)[number];

export const TEXTURES: ReadonlyArray<{
  value: Texture;
  label: string;
  description: string;
}> = [
  {
    value: "Clay Slime",
    label: "Clay Slime",
    description: "Soft dan creamy, campuran air-dry clay.",
  },
  {
    value: "Floam Slime",
    label: "Floam Slime",
    description: "Berbutir renyah, campuran styrofoam balls.",
  },
];

export const COLOR_VALUES = ["Merah", "Biru", "Kuning", "Hijau", "Lainnya"] as const;
export type Color = (typeof COLOR_VALUES)[number];
export type BaseColor = Exclude<Color, "Lainnya">;

export const CUSTOM_COLOR: Color = "Lainnya";

export const COLOR_SWATCHES: ReadonlyArray<{ value: BaseColor; swatch: string }> = [
  { value: "Merah", swatch: "#e4685a" },
  { value: "Biru", swatch: "#6fa8dc" },
  { value: "Kuning", swatch: "#efc44b" },
  { value: "Hijau", swatch: "#7fb77e" },
];

export const SCENT_PLACEHOLDER = "-";

export const METHOD_VALUES = ["Pickup", "Delivery"] as const;
export type Method = (typeof METHOD_VALUES)[number];

export const PICKUP_LOCATION = "Binus Anggrek";

export const DELIVERY_METHODS: ReadonlyArray<{
  value: Method;
  label: string;
  description: string;
}> = [
  {
    value: "Pickup",
    label: "Pickup",
    description: `Ambil di ${PICKUP_LOCATION}`,
  },
  {
    value: "Delivery",
    label: "Delivery",
    description: "Dikirim ke alamat",
  },
];

export const PAYMENT = {
  bank: "BCA",
  accountNumber: "5272200301",
  accountName: "Mathilda Rafaella Christy Nugroho",
} as const;

export const CONTACT = {
  name: "Fella",
  phoneDisplay: "0815 1942 4395",
  phoneE164: "6281519424395",
} as const;

export const PAYMENT_PROOF_LIMITS = {
  maxBytes: 5 * 1024 * 1024,
  maxMb: 5,
  maxDataUrlLength: 2_500_000,
  accept: ["image/jpeg", "image/png", "image/webp"] as const,
  acceptAttribute: "image/jpeg,image/png,image/webp",
} as const;

export const ORDER_LIMITS = {
  namaMax: 80,
  catatanMax: 500,
  alamatMax: 500,
  alamatMin: 15,
  customColorMax: 60,
  jumlahMax: 99,
  itemMax: 10,
} as const;
