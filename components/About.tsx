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
  "Higher Heels Sanctuary nace de una idea simple: crear el espacio que siempre habíamos querido para entrenar.",
  "Aquí no alquilas una barra. Reservas un escenario completamente privado que puedes modificar a tu gusto.",
  "Cada una de nuestras salas está insonorizada, es totalmente independiente y cuenta con un sistema domótico que te permite controlar desde una tablet la iluminación, la música y la climatización. Tú decides el ambiente. Nosotros ponemos el escenario.",
  "Tres salas con identidades diferentes. Una misma filosofía: ofrecer un lugar donde entrenar, crear contenido y expresarte con total libertad.",
  "24 horas al día. 7 días a la semana. Sin límites.",
];

const historyParagraphs = [
  "El pole dance es mucho más que un deporte o una disciplina artística. Es una forma de expresión con una historia que merece ser conocida y respetada.",
  "Durante los años 80 y 90, especialmente en ciudades como Atlanta, Houston y Nueva Orleans, las bailarinas de striptease, y en particular las strippers negras, revolucionaron esta disciplina. Desarrollaron movimientos, transiciones, técnicas y una forma de interpretar el pole que hoy siguen siendo la base de muchos estilos que practicamos en estudios de todo el mundo.",
  "Con el paso de los años, el pole dance salió de los clubes y se popularizó como deporte y actividad de fitness. Sin embargo, esa evolución vino acompañada de un intento de desvincularlo de sus orígenes para hacerlo más aceptado socialmente. En ese proceso, muchas de las mujeres que construyeron esta disciplina, especialmente las bailarinas negras, dejaron de recibir el reconocimiento que merecían.",
  "En Higher Heels Sanctuary creemos que no se puede entender el pole dance sin reconocer de dónde viene. Honrar su historia no significa que todas las personas que practican pole tengan que compartir ese camino, sino entender que el arte que hoy disfrutamos existe gracias al talento, la creatividad y el trabajo de miles de strippers que transformaron una barra en un lenguaje artístico y sensual.",
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
            LA HISTORIA
            <br />DEL POLE DANCE
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
              { year: "Años 80-90", label: "El nacimiento del pole moderno" },
              { year: "Evolución", label: "Del strip club al estudio" },
              { year: "Legado", label: "Arte, historia y respeto" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span
                  className="text-[#FF1E3C] text-sm w-28 flex-shrink-0"
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
