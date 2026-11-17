import Image from "next/image";

import { MessageCircle } from "lucide-react";

import logo from "@/public/logo.png";

import { CONTACT, PRODUCT } from "@/lib/config";
import { whatsappHref } from "@/lib/format";

export function SiteHeader() {
  return (
    <header className="flex flex-col items-center text-center">
      <Image
        src={logo}
        alt={PRODUCT.name}
        priority
        sizes="200px"
        className="h-[280px] w-[280px] object-contain mix-blend-multiply"
      />
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-muted sm:text-[11px]">
        {PRODUCT.eyebrow}
      </p>
      <h1 className="mt-4 text-[32px] leading-[1.1] sm:text-[42px]">{PRODUCT.tagline}</h1>
      <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-muted sm:text-base">
        Slime handmade yang dibuat satu per satu sesuai pesananmu. Pilih add on, warna, dan
        aroma.
      </p>
      <a
        href={whatsappHref(`Halo ${CONTACT.name}, saya mau tanya soal pre-order Nostabox Slime.`)}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[12px] font-semibold text-ink-soft transition-colors duration-200 hover:border-line-strong hover:text-ink"
      >
        <MessageCircle aria-hidden className="size-3.5" strokeWidth={2.5} />
        Contact person: {CONTACT.name} · {CONTACT.phoneDisplay}
      </a>
    </header>
  );
}
