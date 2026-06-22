import type { Metadata } from "next";
import { Inter, Bebas_Neue, Great_Vibes, Dancing_Script } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
  preload: true,
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
  preload: true,
});

const dancingScript = Dancing_Script({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://higherheelssanctuary.com"),
  title: "Higher Heels Sanctuary · Pole Dance Privado en Madrid · 24/7",
  description:
    "El único santuario de pole dance privado en Madrid. Tres salas con identidad propia, abiertas 24 horas, 7 días a la semana. Solo tú, la barra y la libertad.",
  keywords: [
    "pole dance madrid",
    "estudio pole dance privado",
    "alquiler sala pole dance",
    "higher heels",
    "madrid 24/7",
  ],
  openGraph: {
    title: "Higher Heels Sanctuary · Pole Dance Privado en Madrid · 24/7",
    description:
      "El único santuario de pole dance privado en Madrid. Tres salas únicas abiertas 24/7. Reserva la tuya.",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Higher Heels Sanctuary — Pole Dance Privado en Madrid",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Higher Heels Sanctuary · Pole Dance Privado en Madrid",
    description:
      "El único santuario de pole dance privado en Madrid. Tres salas únicas abiertas 24/7.",
    images: ["/images/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${bebasNeue.variable} ${greatVibes.variable} ${dancingScript.variable}`}
    >
      <body className="bg-[#0A0A0A] text-[#F5F5F5] antialiased overflow-x-hidden">
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
