"use client";

import { motion, type Easing } from "framer-motion";

const EASE: Easing = "easeOut";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease: EASE },
});

const paragraphs = [
  "Higher Heels Sanctuary nace de una idea simple: las bailarinas merecen un espacio propio.",
  "Somos el único lugar en Madrid donde puedes alquilar una sala completa para ti sola — o con quien tú elijas — y entrenar sin miradas, sin esperas, sin distracciones. Solo tú, la barra, y la libertad de crear contenido sin límites.",
  "Tres salas. Tres atmósferas. Una sola obsesión: que cada sesión se sienta como una performance.",
  "Abierto 24 horas, 7 días a la semana. En pleno centro de Madrid.",
];

const historyParagraphs = [
  "El pole dance hunde sus raíces en tradiciones milenarias. El Mallakhamb indio, practicado por guerreros hace más de 800 años, y el poste chino, disciplina circense de fuerza extrema, son sus antepasados directos.",
  "A finales del siglo XX, el pole dance evolucionó hasta convertirse en una expresión artística completa: fuerza, flexibilidad, sensualidad y narrativa corporal en una sola disciplina.",
  "Hoy es deporte, arte y reivindicación. En Higher Heels Sanctuary lo celebramos en todas sus formas — desde el entrenamiento técnico hasta la performance más íntima.",
];

export default function About() {
  return (
    <section
      id="nosotros"
      className="bg-[#0A0A0A] py-20 md:py-32 px-5 md:px-12"
      aria-label="Sobre nosotros"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
        {/* Left — Our Sanctuary */}
        <div>
          <motion.p
            {...fadeUp(0)}
            className="text-xs tracking-widest text-[#FF1E3C] mb-3"
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            QUIÉNES SOMOS
          </motion.p>

          <motion.h2
            {...fadeUp(0.1)}
            className="text-4xl md:text-5xl text-[#F5F5F5] leading-tight"
            style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.02em" }}
          >
            NUESTRO SANTUARIO
          </motion.h2>

          {/* Decorative neon line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-5 mb-8 h-[2px] w-16 bg-[#FF1E3C] shadow-[0_0_12px_rgba(255,30,60,0.8)]"
            style={{ transformOrigin: "left" }}
            aria-hidden="true"
          />

          <div className="space-y-5">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                {...fadeUp(0.15 + i * 0.12)}
                className="text-[#F5F5F5]/80 leading-relaxed text-base md:text-lg"
              >
                {p}
              </motion.p>
            ))}
          </div>

          {/* Stats row */}
          <motion.div
            {...fadeUp(0.6)}
            className="mt-10 flex gap-8 flex-wrap"
          >
            {[
              { value: "3", label: "Salas únicas" },
              { value: "24/7", label: "Siempre abierto" },
              { value: "100%", label: "Privacidad total" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span
                  className="text-3xl text-[#FF1E3C] text-shadow-neon"
                  style={{ fontFamily: "var(--font-bebas-neue)" }}
                >
                  {stat.value}
                </span>
                <span className="text-xs text-[#666666] tracking-wide mt-0.5">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — History */}
        <div>
          <motion.p
            {...fadeUp(0.1)}
            className="text-xs tracking-widest text-[#FF1E3C] mb-3"
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            ORÍGENES
          </motion.p>

          <motion.h2
            {...fadeUp(0.15)}
            className="text-4xl md:text-5xl text-[#F5F5F5] leading-tight"
            style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.02em" }}
          >
            DE RITUAL
            <br />A ARTE
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="mt-5 mb-8 h-[2px] w-16 bg-[#FF1E3C] shadow-[0_0_12px_rgba(255,30,60,0.8)]"
            style={{ transformOrigin: "left" }}
            aria-hidden="true"
          />

          <div className="space-y-5">
            {historyParagraphs.map((p, i) => (
              <motion.p
                key={i}
                {...fadeUp(0.2 + i * 0.12)}
                className="text-[#F5F5F5]/80 leading-relaxed text-base md:text-lg"
              >
                {p}
              </motion.p>
            ))}
          </div>

          {/* Timeline decoration */}
          <motion.div
            {...fadeUp(0.55)}
            className="mt-10 flex flex-col gap-4"
          >
            {[
              { year: "+800 años", label: "Raíces del Mallakhamb indio" },
              { year: "Siglo XX", label: "Evolución como arte y disciplina" },
              { year: "Hoy", label: "Deporte, arte y empoderamiento" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span
                  className="text-[#FF1E3C] text-sm w-20 flex-shrink-0"
                  style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.04em" }}
                >
                  {item.year}
                </span>
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#FF1E3C] shadow-[0_0_8px_rgba(255,30,60,0.8)]" aria-hidden="true" />
                <span className="text-[#F5F5F5]/60 text-sm">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
