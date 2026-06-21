"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { href: "/#salas", label: "Salas" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#reseñas", label: "Reseñas" },
  { href: "/login", label: "Iniciar Sesión" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 h-16 flex items-center px-5 md:px-8 transition-all duration-300 ${
          scrolled
            ? "bg-[#1A1A1A]/80 backdrop-blur-md shadow-[0_1px_0_rgba(255,30,60,0.15)]"
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center group" aria-label="Higher Heels Sanctuary — inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.jpg"
            alt="Higher Heels Sanctuary"
            className="h-12 w-auto"
            style={{ mixBlendMode: "screen" }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 ml-12" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#F5F5F5]/70 hover:text-[#FF1E3C] transition-colors text-sm tracking-wide focus-visible:outline-none focus-visible:text-[#FF1E3C]"
              style={{ fontFamily: "var(--font-bebas-neue)", fontSize: "1rem", letterSpacing: "0.08em" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex ml-auto">
          <Link
            href="/booking"
            className="flex items-center justify-center h-10 px-6 bg-[#FF1E3C] text-white text-sm tracking-widest shadow-[0_0_20px_rgba(255,30,60,0.6)] hover:shadow-[0_0_35px_rgba(255,30,60,0.9)] hover:scale-105 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
            style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.12em" }}
          >
            RESERVAR AHORA
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="ml-auto md:hidden flex items-center justify-center w-11 h-11 text-[#F5F5F5] hover:text-[#FF1E3C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C] rounded-sm"
          aria-label="Abrir menú de navegación"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <Menu size={26} />
        </button>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
