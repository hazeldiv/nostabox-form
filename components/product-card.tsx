import { PRODUCT } from "@/lib/config";
import { formatRupiah } from "@/lib/format";

const facts = [
  { label: "Harga", value: formatRupiah(PRODUCT.price), suffix: "/ pcs" },
  { label: "Ukuran", value: PRODUCT.size, suffix: "container" },
  { label: "Add on", value: "Clay · Floam", suffix: "" },
];

export function ProductCard() {
  return (
    <section
      aria-label="Detail produk"
      className="mt-8 rounded-card border border-line bg-surface p-5 sm:mt-10 sm:p-6"
    >
      <dl className="divide-y divide-line sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:text-center">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0 sm:block sm:px-2 sm:py-0"
          >
            <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              {fact.label}
            </dt>
            <dd className="mt-0 inline-flex items-baseline gap-1.5 whitespace-nowrap font-heading text-[16px] leading-tight text-ink sm:mt-1.5 sm:text-[17px]">
              <span>{fact.value}</span>
              {fact.suffix ? (
                <span className="font-body text-[12px] font-normal text-muted">{fact.suffix}</span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
