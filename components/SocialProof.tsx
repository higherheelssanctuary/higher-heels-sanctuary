"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NeonButton from "./NeonButton";

type Room = {
  id: string;
  tab: string;
  title: string;
  ctaName: string;
  description: string;
  badge: string;
  features: string[];
  accent: string;
  envClass: string;
  image: string;
  light: boolean;
  ctaClass: string;
};

const rooms: Room[] = [
  {
    id: "dark",
    tab: "SENSUAL",
    title: "SALA SENSUAL",
    ctaName: "SENSUAL",
    description:
      "Aquí no vienes solo a entrenar. Vienes a sentir. Un refugio para conectar con tu sensualidad, explorarte y vivir el pole como nació: auténtico y sin miedo.",
    badge: "OSCURA · ÍNTIMA · CINEMATOGRÁFICA",
    features: [
      "Círculo LED en el suelo",
      "Insonorización",
      "Iluminación dual",
      "Sala domotizada",
    ],
    accent: "#FF1E3C",
    envClass: "room-env-dark",
    image: "/images/rooms/sensual-portrait.png",
    light: false,
    ctaClass: "",
  },
  {
    id: "clean",
    tab: "ÁUREA",
    title: "SALA ÁUREA",
    ctaName: "ÁUREA",
    description:
      "Una sala que cambia contigo. Juega con la luz y crea tu propia atmósfera. Aquí no hay un único escenario, sino infinitas posibilidades. Cada movimiento. Cada vídeo. Con tu áurea.",
    badge: "LUMINOSA · FUNCIONAL · ACCESIBLE",
    features: [
      "Diseño LED exclusivo",
      "Insonorización",
      "Sala domotizada",
    ],
    accent: "#8B0000",
    envClass: "room-env-clean",
    image: "/images/rooms/clean-soft-portrait.png",
    light: true,
    ctaClass:
      "!bg-[#8B0000] !text-white !shadow-[0_0_30px_rgba(139,0,0,0.5)] hover:!shadow-[0_0_50px_rgba(139,0,0,0.85)]",
  },
  {
    id: "moon",
    tab: "ARES",
    title: "SALA ARES",
    ctaName: "ARES",
    description:
      "Un espacio para desafiar la gravedad. Explora distintas disciplinas aéreas, descubre nuevas sensaciones y rompe tus propios límites.",
    badge: "ARTÍSTICA · EMOCIONAL · ÚNICA",
    features: [
      "Escultura LED de Marte",
      "Iluminación dual",
      "Pole aéreo / telas / aro",
      "Insonorización",
      "Sala domotizada",
    ],
    accent: "#8CA0FF",
    envClass: "room-env-moon",
    image: "/images/rooms/moonlight-portrait.png",
    light: false,
    ctaClass:
      "!bg-[#8CA0FF] !text-[#0A0A0A] !shadow-[0_0_30px_rgba(140,160,255,0.5)] hover:!shadow-[0_0_50px_rgba(140,160,255,0.85)]",
  },
];

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

export default function SocialProof() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const room = rooms[current];

  const goTo = useCallback((idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(wrapIndex(idx, rooms.length));
  }, []);

  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);

  const textColor = room.light ? "#1A1A1A" : "#F5F5F5";
  const textMuted = room.light ? "rgba(26,26,26,0.65)" : "rgba(245,245,245,0.6)";
  const dotInactive = room.light ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.2)";

  const cardVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section
      id="salas"
      className="relative overflow-hidden"
      aria-label="Nuestras salas"
    >
      {/* Crossfading atmosphere background */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={room.id + "-bg"}
          className={`absolute inset-0 ${room.envClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          aria-hidden="true"
        />
      </AnimatePresence>

      <div className="relative z-10 py-20 md:py-28 px-5 md:px-12">
        {/* Section eyebrow */}
        <div className="text-center mb-8 md:mb-10">
          <p
            className="text-xs tracking-[0.3em] mb-3"
            style={{
              fontFamily: "var(--font-bebas-neue)",
              color: room.accent,
            }}
          >
            TRES SALAS · TRES MUNDOS
          </p>
          <h2
            className="text-3xl md:text-5xl tracking-wide transition-colors duration-700"
            style={{ fontFamily: "var(--font-bebas-neue)", color: textColor }}
          >
            ELIGE TU ATMÓSFERA
          </h2>
        </div>

        {/* Room-name tabs */}
        <div
          className="flex justify-center gap-6 md:gap-10 mb-10 md:mb-12"
          role="tablist"
          aria-label="Seleccionar sala"
        >
          {rooms.map((r, i) => {
            const active = i === current;
            return (
              <button
                key={r.id}
                role="tab"
                aria-selected={active}
                onClick={() => goTo(i, i > current ? 1 : -1)}
                className="relative pb-2 text-sm md:text-base tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{
                  fontFamily: "var(--font-bebas-neue)",
                  color: active ? room.accent : textMuted,
                  opacity: active ? 1 : 0.7,
                }}
              >
                {r.tab}
                {active && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full"
                    style={{
                      background: room.accent,
                      boxShadow: `0 0 12px ${room.accent}`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Carousel: arrows flank the phone-format card */}
        <div
          className="relative flex items-center justify-center gap-3 md:gap-8"
          role="region"
          aria-roledescription="carousel"
          aria-label="Carrusel de salas"
        >
          {/* Prev */}
          <button
            onClick={prev}
            aria-label="Sala anterior"
            className="flex-shrink-0 z-20 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full border transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C]"
            style={{
              borderColor: `${room.accent}60`,
              color: room.accent,
              background: `${room.accent}12`,
            }}
          >
            <ChevronLeft size={22} />
          </button>

          {/* Featured card */}
          <div className="w-full max-w-[360px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.article
                key={room.id}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                aria-live="polite"
                aria-label={`Sala activa: ${room.title}`}
              >
                {/* 3:4 image with badge pill overlay */}
                <div
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl"
                  style={{
                    boxShadow: `0 0 60px ${room.accent}40, 0 20px 60px rgba(0,0,0,0.5)`,
                    border: `1px solid ${room.accent}33`,
                  }}
                >
                  {/* gradient placeholder shown behind the photo */}
                  <div
                    className={`absolute inset-0 ${room.envClass}`}
                    aria-hidden="true"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={room.image}
                    alt={`${room.title} — sala de pole dance en Madrid`}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.opacity = "0";
                    }}
                  />
                  {/* subtle top-down scrim for pill legibility */}
                  <div
                    className="absolute inset-x-0 top-0 h-24 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.45), transparent)",
                    }}
                    aria-hidden="true"
                  />
                  {/* badge pill */}
                  <span
                    className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] md:text-xs tracking-widest px-4 py-1.5 rounded-full backdrop-blur-sm"
                    style={{
                      fontFamily: "var(--font-bebas-neue)",
                      color: room.accent,
                      background: "rgba(10,10,10,0.55)",
                      border: `1px solid ${room.accent}55`,
                    }}
                  >
                    {room.badge}
                  </span>
                </div>

                {/* Info stacked underneath */}
                <div className="mt-6">
                  <h3
                    className="text-2xl md:text-3xl tracking-wide"
                    style={{
                      fontFamily: "var(--font-bebas-neue)",
                      color: textColor,
                    }}
                  >
                    {room.title}
                  </h3>

                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: textMuted }}
                  >
                    {room.description}
                  </p>

                  {/* 2-column feature list */}
                  <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                    {room.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs"
                        style={{ color: textColor }}
                      >
                        <span
                          className="mt-1 inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: room.accent,
                            boxShadow: `0 0 8px ${room.accent}`,
                          }}
                          aria-hidden="true"
                        />
                        <span style={{ opacity: 0.85 }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-6">
                    <NeonButton
                      href="/booking"
                      size="md"
                      className={`w-full ${room.ctaClass}`}
                      ariaLabel={`Reservar sala ${room.ctaName}`}
                    >
                      RESERVAR {room.ctaName}
                    </NeonButton>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Next */}
          <button
            onClick={next}
            aria-label="Sala siguiente"
            className="flex-shrink-0 z-20 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full border transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C]"
            style={{
              borderColor: `${room.accent}60`,
              color: room.accent,
              background: `${room.accent}12`,
            }}
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-10">
          {rooms.map((r, i) => (
            <button
              key={r.id}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`Ir a ${r.tab}`}
              aria-current={i === current}
              className="transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C]"
              style={{
                width: i === current ? "28px" : "8px",
                height: "8px",
                background: i === current ? room.accent : dotInactive,
                boxShadow: i === current ? `0 0 12px ${room.accent}` : "none",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
