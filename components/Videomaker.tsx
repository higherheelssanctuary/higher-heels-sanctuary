"use client";

import { motion, type Easing } from "framer-motion";

const EASE: Easing = "easeOut";

const WHATSAPP_URL =
  "https://wa.me/34639408904?text=" +
  encodeURIComponent(
    "Hola Alfonso, te escribo desde Higher Heels Sanctuary para info sobre fotos y vídeos."
  );

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease: EASE },
});

const reasons = [
  "Entiendo tu lenguaje. Sé lo que hay detrás de un movimiento, un giro o una transición, y me anticipo para captarlo en el segundo exacto.",
  "Subo de nivel tu imagen. Fotos y vídeos pensados para potenciar tu marca, inspirar a tu comunidad y que te sientas orgullosa de lo que logras.",
  "Vas a descubrir partes de ti que no sabías ni que existían.",
];

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Videomaker() {
  return (
    <section
      id="foto-video"
      className="bg-[#0A0A0A] py-20 md:py-32 px-5 md:px-12"
      aria-label="Foto y vídeo profesional con Alfonso"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-12 md:mb-16 text-center md:text-left">
          <motion.p
            {...fadeUp(0)}
            className="text-xs tracking-widest text-[#FF1E3C] mb-3"
            style={{ fontFamily: "var(--font-bebas-neue)" }}
          >
            FOTO &amp; VÍDEO PROFESIONAL
          </motion.p>
          <motion.h2
            {...fadeUp(0.1)}
            className="text-4xl md:text-6xl text-[#F5F5F5] leading-tight"
            style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.02em" }}
          >
            TE MERECES UNA PELÍCULA
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-5 h-[2px] w-16 bg-[#FF1E3C] shadow-[0_0_12px_rgba(255,30,60,0.8)] mx-auto md:mx-0"
            style={{ transformOrigin: "center" }}
            aria-hidden="true"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Photo */}
          <motion.div {...fadeUp(0.15)} className="md:sticky md:top-24">
            <div
              className="relative aspect-square w-full overflow-hidden rounded-2xl"
              style={{
                border: "1px solid rgba(255,30,60,0.25)",
                boxShadow: "0 0 60px rgba(255,30,60,0.15), 0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/alfonso.jpg"
                alt="Alfonso — videomaker y fotógrafo de Higher Heels Sanctuary"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-x-0 bottom-0 p-5 pt-16 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,10,10,0.9), transparent)",
                }}
              >
                <p
                  className="text-2xl text-[#F5F5F5] leading-none"
                  style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.04em" }}
                >
                  ALFONSO
                </p>
                <p className="text-xs text-[#FF1E3C] tracking-widest mt-1">
                  VIDEOMAKER &amp; FOTÓGRAFO · POLE COMMUNITY
                </p>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <div>
            <motion.p
              {...fadeUp(0.2)}
              className="text-[#F5F5F5]/80 leading-relaxed text-base md:text-lg"
            >
              Llevo toda una vida contando historias, pero descubrí que mi verdadera
              pasión está detrás de la lente, retratando la fuerza, la elegancia y esa
              intensidad que pones en cada segundo de tu coreo. Lo que voy a hacer es
              convertir tu entrenamiento en cine.
            </motion.p>
            <motion.p
              {...fadeUp(0.28)}
              className="mt-4 text-[#F5F5F5]/80 leading-relaxed text-base md:text-lg"
            >
              Sé lo que cuesta cada figura y el sudor que hay detrás; yo también
              pertenezco al mundo del pole. Mi misión en Higher Heels es devolverte ese
              esfuerzo multiplicado: quiero que, al verte, no solo veas técnica, sino que
              te veas como la artista que eres.
            </motion.p>

            {/* Reasons */}
            <motion.p
              {...fadeUp(0.34)}
              className="mt-8 text-lg text-[#F5F5F5]"
              style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.04em" }}
            >
              ¿POR QUÉ TRABAJAR CONMIGO?
            </motion.p>
            <ul className="mt-4 space-y-3">
              {reasons.map((r, i) => (
                <motion.li
                  key={i}
                  {...fadeUp(0.4 + i * 0.08)}
                  className="flex items-start gap-3 text-[#F5F5F5]/75 text-sm md:text-base leading-relaxed"
                >
                  <span
                    className="mt-2 inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#FF1E3C]"
                    style={{ boxShadow: "0 0 8px rgba(255,30,60,0.8)" }}
                    aria-hidden="true"
                  />
                  <span>{r}</span>
                </motion.li>
              ))}
            </ul>

            {/* Tagline */}
            <motion.p
              {...fadeUp(0.6)}
              className="mt-8 text-xl md:text-2xl text-[#FF1E3C] text-shadow-neon"
              style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.03em" }}
            >
              Tú pones la magia en la barra; yo pongo el cine.
            </motion.p>

            {/* Booking note + WhatsApp CTA */}
            <motion.div
              {...fadeUp(0.68)}
              className="mt-8 rounded-2xl border border-[#FF1E3C]/15 bg-[#111111] p-6"
            >
              <p className="text-[#F5F5F5]/70 text-sm md:text-base leading-relaxed">
                La reserva de las sesiones y los servicios de foto y vídeo se gestionan
                directamente con Alfonso. Para hablar con él y organizarlo todo, escríbele
                por WhatsApp.
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2.5 h-13 w-full sm:w-auto px-8 py-3.5 rounded-sm text-white text-lg transition-all hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
                style={{
                  fontFamily: "var(--font-bebas-neue)",
                  letterSpacing: "0.1em",
                  background: "#25D366",
                  boxShadow: "0 0 30px rgba(37,211,102,0.45)",
                }}
                aria-label="Escríbele a Alfonso por WhatsApp (+34 639 40 89 04)"
              >
                <WhatsAppIcon size={20} />
                ESCRÍBELE POR WHATSAPP
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
