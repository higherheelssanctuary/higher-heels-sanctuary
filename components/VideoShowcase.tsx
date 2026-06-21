"use client";

import { motion } from "framer-motion";

export default function VideoShowcase() {
  return (
    <section
      className="relative bg-[#0A0A0A] py-16 md:py-24 px-5 md:px-12"
      aria-label="Vídeo del espacio"
    >
      {/* Subtle top separator */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(255,30,60,0.3), transparent)" }}
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="text-xs tracking-widest text-[#FF1E3C]/70 mb-2"
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            EL ESPACIO
          </p>
          <h2
            className="text-4xl md:text-5xl text-[#F5F5F5] tracking-wide"
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            VIVE EL SANTUARIO
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#F5F5F5]/50 max-w-md mx-auto">
            Tres salas únicas. Una atmósfera diseñada para crear sin límites.
          </p>
        </motion.div>

        {/* Video placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative w-full rounded-2xl overflow-hidden"
          style={{
            aspectRatio: "16/9",
            background: "#111",
            border: "1px solid rgba(255,30,60,0.2)",
            boxShadow: "0 0 60px rgba(255,30,60,0.08), 0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Placeholder background — replace with <video> or iframe */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(255,30,60,0.07) 0%, rgba(10,10,10,0) 70%), #0d0d0d",
            }}
          />

          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#FF1E3C 1px, transparent 1px), linear-gradient(90deg, #FF1E3C 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
            aria-hidden="true"
          />

          {/* Play button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div
              className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-2"
              style={{
                borderColor: "rgba(255,30,60,0.5)",
                background: "rgba(255,30,60,0.1)",
                boxShadow: "0 0 30px rgba(255,30,60,0.2)",
              }}
            >
              {/* Triangle play icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 5.5l12 6.5-12 6.5V5.5z" fill="#FF1E3C" />
              </svg>
            </div>
            <p
              className="text-[#F5F5F5]/30 text-xs tracking-widest"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              PRÓXIMAMENTE · VÍDEO DEL ESPACIO
            </p>
          </div>

          {/* Corner labels */}
          <div
            className="absolute top-4 left-4 text-[10px] tracking-widest text-[#FF1E3C]/30"
            style={{ fontFamily: "var(--font-bebas-neue)" }}
            aria-hidden="true"
          >
            HIGHER HEELS SANCTUARY
          </div>
          <div
            className="absolute bottom-4 right-4 text-[10px] tracking-widest text-[#F5F5F5]/20"
            style={{ fontFamily: "var(--font-bebas-neue)" }}
            aria-hidden="true"
          >
            MADRID · 4K
          </div>
        </motion.div>
      </div>

      {/* Subtle bottom separator */}
      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(255,30,60,0.15), transparent)" }}
        aria-hidden="true"
      />
    </section>
  );
}
