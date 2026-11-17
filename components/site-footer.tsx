import { CONTACT, PAYMENT, PICKUP_LOCATION } from "@/lib/config";
import { whatsappHref } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-line pt-5 text-center sm:mt-14">
      <p className="text-[12px] text-muted">Nostabox · Slime handmade dalam kemasan 200 ml</p>
      <p className="mt-2 text-[12px] text-muted">
        Contact person:{" "}
        <a
          href={whatsappHref(`Halo ${CONTACT.name}, saya mau tanya soal pre-order Nostabox Slime.`)}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-ink underline decoration-line underline-offset-2 transition-colors duration-200 hover:decoration-ink"
        >
          {CONTACT.name} · {CONTACT.phoneDisplay}
        </a>
      </p>
      <p className="mt-1 text-[12px] text-muted">
        Pickup di {PICKUP_LOCATION} · Pembayaran transfer {PAYMENT.bank}
      </p>
    </footer>
  );
}
