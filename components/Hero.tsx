"use client";

import { useEffect, useState } from "react";
import { motion, type Easing } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const EASE: Easing = "easeOut";


export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setLoaded(true);
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const fadeDelay = (base: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: loaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { delay: base / 1000, duration: 0.5, ease: EASE },
  });

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden bg-[#0A0A0A]"
      style={{ minHeight: "100svh" }}
      aria-label="Hero — Higher Heels Sanctuary"
    >
      {/* Pole — 3D rotating chrome */}
      <div className="absolute inset-0 z-0 flex items-center justify-center" aria-hidden="true">
        {/* Outer glow */}
        <div
          className="absolute h-full"
          style={{
            width: "18px",
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
        {/* Chrome cylinder — animates background-position to simulate rotation */}
        <div
          className="relative h-full"
          style={{
            width: "9px",
            background:
              "linear-gradient(to right, #080808 0%, #1a1a1a 10%, #444 28%, #c8c8c8 46%, #ffffff 52%, #c8c8c8 58%, #444 72%, #1a1a1a 90%, #080808 100%)",
            backgroundSize: "200% 100%",
            animation: reducedMotion ? "none" : "pole-spin 2.5s linear infinite",
            boxShadow: "0 0 6px rgba(0,0,0,0.9), 0 0 2px rgba(255,255,255,0.1)",
            borderRadius: "4px",
          }}
        />
        {/* Red floor ring glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-52 md:w-80 h-4 rounded-full opacity-70"
          style={{
            background: "radial-gradient(ellipse, rgba(255,30,60,0.9) 0%, transparent 70%)",
            filter: "blur(6px)",
            animation: reducedMotion ? "none" : "pulse_glow 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Ambient conic sweep — disabled on reduced motion */}
      {!reducedMotion && (
        <div
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute inset-[-50%] animate-conic-sweep opacity-[0.06]"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(255,30,60,0.4) 30deg, transparent 60deg, transparent 360deg)",
            }}
          />
        </div>
      )}

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 20%, rgba(10,10,10,0.7) 80%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 md:px-8 max-w-2xl mx-auto w-full">
        {/* Wordmark */}
        <motion.h1
          {...fadeDelay(400)}
          className="animate-flicker text-[#FF1E3C] leading-none"
          style={{
            fontFamily: "var(--font-dancing-script)",
            fontSize: "clamp(4rem, 14vw, 9rem)",
            textShadow:
              "0 0 8px #fff, 0 0 16px #fff, 0 0 32px #FF1E3C, 0 0 64px #FF1E3C, 0 0 120px rgba(255,30,60,0.5)",
          }}
        >
          Higher Heels
        </motion.h1>

        {/* Sanctuary */}
        <motion.p
          {...fadeDelay(1000)}
          className="mt-1 tracking-[0.4em] text-sm md:text-base"
          style={{
            fontFamily: "var(--font-bebas-neue)",
            color: "#FF1E3C",
            textShadow: "0 0 12px rgba(255,30,60,0.6)",
            letterSpacing: "0.45em",
          }}
        >
          SANCTUARY
        </motion.p>

        {/* Subheadline */}
        <motion.p
          {...fadeDelay(2200)}
          className="mt-6 text-[#F5F5F5]/80 text-base md:text-lg max-w-md leading-relaxed"
        >
          El único santuario de pole dance privado en Madrid.
          <br />
          <span className="text-[#FF1E3C]/90 font-medium">Abierto 24/7.</span> Solo tú, la barra, y la libertad de crear sin límites.
        </motion.p>

        {/* CTA */}
        <motion.div
          {...fadeDelay(2600)}
          className="mt-8 w-full flex justify-center"
        >
          <Link
            href="/booking"
            className="flex items-center justify-center w-full max-w-sm md:w-auto h-14 px-10 bg-[#FF1E3C] text-white text-xl tracking-widest shadow-[0_0_40px_rgba(255,30,60,0.8)] hover:shadow-[0_0_60px_rgba(255,30,60,1)] hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
            style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.15em" }}
          >
            RESERVAR AHORA
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          {...fadeDelay(2800)}
          className="mt-12 flex flex-col items-center gap-1 text-[#F5F5F5]/40"
          aria-hidden="true"
        >
          <span
            className="text-xs tracking-widest md:hidden"
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            DESLIZA
          </span>
          <ChevronDown
            size={20}
            className={reducedMotion ? "" : "animate-bounce-slow"}
          />
        </motion.div>
      </div>
    </section>
  );
}
