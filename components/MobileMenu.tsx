"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect } from "react";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/#salas", label: "Salas" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#reseñas", label: "Reseñas" },
  { href: "/login", label: "Iniciar Sesión" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col px-8 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="flex items-center justify-center w-12 h-12 text-[#F5F5F5] hover:text-[#FF1E3C] transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C]"
              aria-label="Cerrar menú"
            >
              <X size={28} />
            </button>
          </div>

          {/* Logo wordmark */}
          <div className="mt-8 mb-12">
            <p
              className="text-[#FF1E3C] text-shadow-neon"
              style={{
                fontFamily: "var(--font-great-vibes)",
                fontSize: "2.5rem",
                lineHeight: 1.1,
              }}
            >
              Higher Heels
            </p>
            <p
              className="text-[#F5F5F5]/60 tracking-[0.3em] text-xs mt-1"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              SANCTUARY
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 flex-1">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block text-3xl py-4 border-b border-[#1A1A1A] text-[#F5F5F5] hover:text-[#FF1E3C] transition-colors focus-visible:outline-none focus-visible:text-[#FF1E3C]"
                  style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.05em" }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.3 }}
            className="mt-8"
          >
            <Link
              href="/booking"
              onClick={onClose}
              className="flex items-center justify-center w-full h-14 bg-[#FF1E3C] text-white text-xl tracking-widest shadow-[0_0_40px_rgba(255,30,60,0.8)] hover:shadow-[0_0_60px_rgba(255,30,60,1)] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
              style={{ fontFamily: "var(--font-bebas-neue)" }}
            >
              RESERVAR AHORA
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
