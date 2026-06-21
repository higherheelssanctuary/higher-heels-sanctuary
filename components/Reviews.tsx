"use client";

import { motion } from "framer-motion";
import ReviewCard from "./ReviewCard";

const reviews = [
  {
    text: "Por fin un sitio donde puedo entrenar a las 3 de la mañana sin que nadie me mire raro. La sala roja es una locura, parece un set de cine.",
    name: "Lucía M.",
    subtitle: "Bailarina · Cliente desde 2024",
  },
  {
    text: "Reservé la Moonlight Room para grabar contenido y salí con material para tres meses. Cada rincón está pensado para la cámara.",
    name: "Andrea V.",
    subtitle: "Creadora de contenido",
  },
  {
    text: "El concepto de privacidad total cambia todo. Vengo con mi pareja, ponemos nuestra música, y es nuestro espacio. Increíble.",
    name: "Carla R.",
    subtitle: "Cliente habitual",
  },
  {
    text: "Las salas están impecables, las barras profesionales, y la iluminación dual es una genialidad. Nivel internacional en Madrid.",
    name: "Patricia D.",
    subtitle: "Instructora de pole",
  },
  {
    text: "Vengo dos veces por semana y nunca me canso. Cada sala tiene su propia personalidad. La Dark Sensual es mi favorita.",
    name: "Sofía L.",
    subtitle: "Bailarina",
  },
  {
    text: "Encontrar un estudio abierto 24/7 en pleno centro de Madrid es un milagro. Ahora es mi segundo hogar.",
    name: "Marta G.",
    subtitle: "Cliente desde 2024",
  },
];

export default function Reviews() {
  return (
    <section
      id="reseñas"
      className="bg-[#0A0A0A] py-20 md:py-32 px-5 md:px-12"
      style={{
        background:
          "linear-gradient(to bottom, #0A0A0A 0%, #111111 50%, #0A0A0A 100%)",
      }}
      aria-label="Reseñas de clientes"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl text-[#F5F5F5]"
            style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.02em" }}
          >
            LO QUE DICEN ELLAS
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 text-[#666666] text-base md:text-lg"
          >
            Reseñas verificadas de nuestra comunidad
          </motion.p>
        </div>

        {/* Mobile: horizontal snap scroll */}
        <div
          className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 pb-4 -mx-5 px-5"
          role="list"
          aria-label="Reseñas de clientes"
          style={{ scrollbarWidth: "none" }}
        >
          {reviews.map((review, i) => (
            <div
              key={i}
              className="snap-center min-w-[85%] flex-shrink-0"
              role="listitem"
            >
              <ReviewCard {...review} />
            </div>
          ))}
        </div>

        {/* Desktop: 3 column grid, 2 rows */}
        <div
          className="hidden md:grid grid-cols-3 gap-6"
          role="list"
          aria-label="Reseñas de clientes"
        >
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              role="listitem"
            >
              <ReviewCard {...review} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
