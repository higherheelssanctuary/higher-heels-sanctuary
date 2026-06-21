import Link from "next/link";

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}


export default function Footer() {
  return (
    <footer className="border-t border-[#FF1E3C]/20 shadow-[0_-1px_30px_rgba(255,30,60,0.08)] bg-[#0A0A0A] py-12 px-5 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" aria-label="Inicio">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.jpg"
                alt="Higher Heels Sanctuary"
                className="h-20 w-auto"
                style={{ mixBlendMode: "screen" }}
              />
            </Link>
            <p className="text-[#666666] text-sm mt-1 text-center md:text-left">
              Centro de Madrid · Abierto 24/7
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Pie de página" className="flex flex-col items-center md:items-start gap-2">
            <p
              className="text-[#F5F5F5]/40 text-xs tracking-widest mb-1"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              NAVEGACIÓN
            </p>
            {[
              { href: "/#salas", label: "Salas" },
              { href: "/#nosotros", label: "Nosotros" },
              { href: "/#reseñas", label: "Reseñas" },
              { href: "/booking", label: "Reservas" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#666666] hover:text-[#FF1E3C] transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <p
              className="text-[#F5F5F5]/40 text-xs tracking-widest"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              SÍGUENOS
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="flex items-center justify-center w-11 h-11 text-[#666666] hover:text-[#FF1E3C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C] rounded-sm"
                aria-label="Instagram de Higher Heels Sanctuary"
                rel="noopener noreferrer"
              >
                <InstagramIcon size={22} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#1A1A1A] text-center">
          <p className="text-[#666666] text-xs tracking-wide">
            © 2026 Higher Heels Sanctuary. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
