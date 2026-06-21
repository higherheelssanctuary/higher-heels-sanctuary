import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Iniciar Sesión · Higher Heels Sanctuary",
  description: "Sistema de login en construcción.",
};

export default function LoginPage() {
  return (
    <section className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-5 text-center">
      {/* Diamond */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 60 60"
        fill="none"
        className="mb-8 opacity-80"
        aria-hidden="true"
      >
        <polygon
          points="30,4 56,30 30,56 4,30"
          stroke="#FF1E3C"
          strokeWidth="2"
          fill="none"
          style={{ filter: "drop-shadow(0 0 10px rgba(255,30,60,0.9))" }}
        />
      </svg>

      <p
        className="text-xs tracking-widest text-[#FF1E3C] mb-3"
        style={{ fontFamily: "var(--font-bebas-neue)" }}
      >
        MUY PRONTO
      </p>

      <h1
        className="text-5xl md:text-7xl text-[#F5F5F5] leading-none"
        style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.02em" }}
      >
        INICIAR SESIÓN
      </h1>

      <p className="mt-6 text-[#F5F5F5]/60 text-base md:text-lg max-w-md leading-relaxed">
        Próximamente
      </p>

      <Link
        href="/"
        className="mt-10 flex items-center justify-center h-12 px-8 border border-[#FF1E3C] text-[#FF1E3C] text-base tracking-widest hover:bg-[#FF1E3C] hover:text-white transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C]"
        style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.12em" }}
      >
        VOLVER AL INICIO
      </Link>
    </section>
  );
}
