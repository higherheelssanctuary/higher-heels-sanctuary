"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VideoCard from "./VideoCard";

const rooms = [
  {
    id: "dark",
    theme: "dark" as const,
    title: "SALA DARK SENSUAL",
    subtitle:
      "Para las que entrenan de noche y crean sin límites. Círculo LED rojo en el suelo, proyector de atmósfera y luz escenográfica. La sala más cinematográfica de Madrid.",
    videoSrc: "/videos/reel-1.mp4",
    posterSrc: "/images/poster-1.jpg.svg",
    envClass: "room-env-dark",
    headingColor: "text-[#F5F5F5]",
    subheadColor: "text-[#F5F5F5]/60",
    dotActive: "#FF1E3C",
    dotInactive: "rgba(255,255,255,0.2)",
    accent: "#FF1E3C",
    badge: "OSCURA · ÍNTIMA · CINEMATOGRÁFICA",
    badgeStyle: { color: "#FF1E3C", borderColor: "rgba(255,30,60,0.3)" },
    features: ["Círculo LED rojo en el suelo", "Proyector dinámico", "Iluminación dual", "Barras profesionales"],
  },
  {
    id: "clean",
    theme: "clean" as const,
    title: "SALA CLEAN & SOFT",
    subtitle:
      "Espacio de luz limpia y enfoque total. Paredes blancas, iluminación clara y el legendario teléfono rojo de pared. Para las que quieren verse mejor en cada movimiento.",
    videoSrc: "/videos/reel-2.mp4",
    posterSrc: "/images/poster-2.svg",
    envClass: "room-env-clean",
    headingColor: "text-[#1A1A1A]",
    subheadColor: "text-[#444444]",
    dotActive: "#8B0000",
    dotInactive: "rgba(0,0,0,0.2)",
    accent: "#8B0000",
    badge: "LUMINOSA · FUNCIONAL · ACCESIBLE",
    badgeStyle: { color: "#8B0000", borderColor: "rgba(139,0,0,0.25)" },
    features: ["Paredes blancas", "Luz de entrenamiento", "Teléfono rojo iconic", "Doble espejo"],
  },
  {
    id: "moon",
    theme: "moon" as const,
    title: "SALA MOONLIGHT",
    subtitle:
      "Bajo la luna, cada barra es un escenario. Luna realista retroiluminada, barra aérea y luces de ambiente suave. Arte, fuerza y atmósfera en una sola sesión.",
    videoSrc: "/videos/reel-3.mp4",
    posterSrc: "/images/poster-3.svg",
    envClass: "room-env-moon",
    headingColor: "text-[#F5F5F5]",
    subheadColor: "text-[#D0D8FF]/70",
    dotActive: "#8CA0FF",
    dotInactive: "rgba(255,255,255,0.2)",
    accent: "#8CA0FF",
    badge: "ARTÍSTICA · EMOCIONAL · ÚNICA",
    badgeStyle: { color: "#8CA0FF", borderColor: "rgba(140,160,255,0.3)" },
    features: ["Luna retroiluminada", "Barra aérea", "Atmósfera nocturna", "Tonos fríos suaves"],
  },
];

// Wrap index for infinite loop
function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

export default function SocialProof() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const room = rooms[current];
  const prevIdx = wrapIndex(current - 1, rooms.length);
  const nextIdx = wrapIndex(current + 1, rooms.length);

  const goTo = useCallback(
    (idx: number, dir: number) => {
      setDirection(dir);
      setCurrent(wrapIndex(idx, rooms.length));
    },
    []
  );

  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1, 1), [current, goTo]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    autoTimer.current = setTimeout(() => next(), 5000);
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
  }, [current, isPaused, next]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  // Swipe support
  const touchStart = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0 }),
  };

  return (
    <section
      id="salas"
      className="relative overflow-hidden transition-[background] duration-700 ease-in-out"
      aria-label="Nuestras salas"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated background environment */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={room.id + "-bg"}
          className={`absolute inset-0 ${room.envClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          aria-hidden="true"
        />
      </AnimatePresence>

      {/* Moon decoration for moonlight room */}
      <AnimatePresence>
        {room.id === "moon" && (
          <motion.div
            key="moon-deco"
            className="absolute top-6 right-6 md:top-12 md:right-12 pointer-events-none"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.8 }}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/moon.png"
              alt=""
              width={140}
              height={140}
              className="animate-moon-glow md:w-52 md:h-52 rounded-full object-cover"
              style={{ opacity: 0.92 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Neon floor ring decoration for dark room */}
      <AnimatePresence>
        {room.id === "dark" && (
          <motion.div
            key="dark-ring"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            aria-hidden="true"
          >
            <div
              className="w-48 h-6 md:w-80 md:h-8 rounded-full opacity-40"
              style={{
                background: "radial-gradient(ellipse, rgba(255,30,60,0.8) 0%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 py-20 md:py-32 px-5 md:px-12">
        {/* Section heading */}
        <div className="text-center mb-12 md:mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={room.id + "-heading"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <p
                className="text-xs tracking-widest mb-3 opacity-60"
                style={{
                  fontFamily: "var(--font-bebas-neue)",
                  color: room.accent,
                }}
              >
                VIVE LA EXPERIENCIA
              </p>
              <h2
                className={`text-4xl md:text-6xl tracking-wide ${room.headingColor}`}
                style={{ fontFamily: "var(--font-bebas-neue)" }}
              >
                {room.title}
              </h2>
              <p className={`mt-3 text-sm md:text-base max-w-lg mx-auto leading-relaxed ${room.subheadColor}`}>
                {room.subtitle}
              </p>

              {/* Badge */}
              <div className="flex justify-center mt-4">
                <span
                  className="text-xs tracking-widest px-4 py-1.5 border rounded-full"
                  style={{
                    fontFamily: "var(--font-bebas-neue)",
                    ...room.badgeStyle,
                  }}
                >
                  {room.badge}
                </span>
              </div>

              {/* Features */}
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {room.features.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] tracking-widest px-2 py-0.5 rounded opacity-70"
                    style={{
                      color: room.accent,
                      background: `${room.accent}18`,
                      fontFamily: "var(--font-bebas-neue)",
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel */}
        <div
          className="relative flex items-center justify-center gap-4 md:gap-8"
          role="region"
          aria-label="Carrusel de salas"
          aria-roledescription="carousel"
        >
          {/* Prev button */}
          <button
            onClick={prev}
            className="flex-shrink-0 z-20 flex items-center justify-center w-12 h-12 rounded-full border transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C]"
            style={{
              borderColor: `${room.accent}60`,
              color: room.accent,
              background: `${room.accent}12`,
            }}
            aria-label="Sala anterior"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Cards row — prev (shadow left) + active + next (shadow right) */}
          <div className="relative flex-1 flex items-center justify-center overflow-visible">
            {/* Previous card (peek left) */}
            <div
              className="absolute left-0 w-[28%] md:w-[24%] pointer-events-none select-none overflow-hidden"
              style={{
                transform: "scale(0.85) translateX(-4%)",
                transformOrigin: "right center",
                maskImage: "linear-gradient(to right, transparent 0%, black 70%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 70%)",
                opacity: 0.6,
              }}
              aria-hidden="true"
            >
              <VideoCard
                key={rooms[prevIdx].id + "-prev"}
                {...rooms[prevIdx]}
                isActive={false}
                isPeek={true}
              />
            </div>

            {/* Active card */}
            <div
              className="relative z-10 w-[62%] md:w-[40%] lg:w-[32%]"
              aria-live="polite"
              aria-label={`Sala activa: ${room.title}`}
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={room.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                >
                  <VideoCard {...room} isActive={true} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next card (peek right) */}
            <div
              className="absolute right-0 w-[28%] md:w-[24%] pointer-events-none select-none overflow-hidden"
              style={{
                transform: "scale(0.85) translateX(4%)",
                transformOrigin: "left center",
                maskImage: "linear-gradient(to left, transparent 0%, black 70%)",
                WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 70%)",
                opacity: 0.6,
              }}
              aria-hidden="true"
            >
              <VideoCard
                key={rooms[nextIdx].id + "-next"}
                {...rooms[nextIdx]}
                isActive={false}
                isPeek={true}
              />
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={next}
            className="flex-shrink-0 z-20 flex items-center justify-center w-12 h-12 rounded-full border transition-all hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C]"
            style={{
              borderColor: `${room.accent}60`,
              color: room.accent,
              background: `${room.accent}12`,
            }}
            aria-label="Sala siguiente"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Dots */}
        <div
          className="flex justify-center gap-3 mt-10"
          role="tablist"
          aria-label="Seleccionar sala"
        >
          {rooms.map((r, i) => (
            <button
              key={r.id}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Ir a ${r.title}`}
              className="transition-all duration-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C]"
              style={{
                width: i === current ? "28px" : "8px",
                height: "8px",
                background: i === current ? room.accent : room.dotInactive,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
