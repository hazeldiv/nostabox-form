import { PoForm } from "@/components/po-form";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[640px] px-5 pb-12 sm:px-6 pt-5 sm:pb-20">
      <SiteHeader />
      <ProductCard />
      <PoForm />
      <SiteFooter />
    </main>
  );
}
