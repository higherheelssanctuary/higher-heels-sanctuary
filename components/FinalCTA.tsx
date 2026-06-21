"use client";

import { motion, type Easing } from "framer-motion";

const EASE_IN_OUT: Easing = "easeInOut";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section
      className="relative bg-[#0A0A0A] py-24 md:py-40 px-5 md:px-12 overflow-hidden"
      aria-label="Reserva tu sala"
    >
      {/* Radial neon glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(255,30,60,0.18) 0%, rgba(139,0,0,0.06) 40%, transparent 70%)",
        }}
      />

      {/* Extra glow layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: EASE_IN_OUT }}
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,30,60,0.12) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Diamond icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-6"
          aria-hidden="true"
        >
          <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
            <polygon
              points="30,4 56,30 30,56 4,30"
              stroke="#FF1E3C"
              strokeWidth="2"
              fill="none"
              style={{ filter: "drop-shadow(0 0 8px rgba(255,30,60,0.9))" }}
            />
          </svg>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-8xl text-[#F5F5F5] leading-none"
          style={{
            fontFamily: "var(--font-bebas-neue)",
            letterSpacing: "0.02em",
            textShadow: "0 0 40px rgba(255,30,60,0.3)",
          }}
        >
          TU SALA
          <br />
          <span className="text-shadow-neon text-[#FF1E3C]">TE ESPERA</span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 text-[#F5F5F5]/80 text-lg md:text-xl max-w-2xl leading-relaxed"
        >
          Reserva ahora y descubre qué se siente tener un escenario sólo para ti.{" "}
          <span className="text-[#FF1E3C]">24 horas. 7 días.</span> En el corazón de Madrid.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 w-full flex justify-center"
        >
          <Link
            href="/booking"
            className="flex items-center justify-center w-full max-w-sm md:w-auto h-16 md:h-20 px-12 bg-[#FF1E3C] text-white text-xl md:text-2xl tracking-widest rounded-full shadow-[0_0_40px_rgba(255,30,60,0.8)] hover:shadow-[0_0_70px_rgba(255,30,60,1)] hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0A0A0A]"
            style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.15em" }}
          >
            RESERVAR AHORA
          </Link>
        </motion.div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-6 text-[#666666] text-sm text-center leading-relaxed"
        >
          Cancelación gratuita hasta 24h antes · Sin cuotas mensuales · Sólo pagas por lo que usas
        </motion.p>
      </div>
    </section>
  );
}
