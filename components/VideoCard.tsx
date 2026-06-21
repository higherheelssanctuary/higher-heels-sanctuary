"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";

interface VideoCardProps {
  title: string;
  subtitle: string;
  videoSrc: string;
  posterSrc: string;
  isActive: boolean;
  theme: "dark" | "clean" | "moon";
  isPeek?: boolean;
}

const themeStyles = {
  dark: {
    titleColor: "text-[#FF1E3C]",
    borderColor: "border-[#FF1E3C]/40",
    buttonBorder: "border-[#FF1E3C] text-[#FF1E3C] hover:bg-[#FF1E3C] hover:text-white",
    badgeBg: "bg-[#FF1E3C]/10 text-[#FF1E3C]",
  },
  clean: {
    titleColor: "text-[#8B0000]",
    borderColor: "border-[#8B0000]/30",
    buttonBorder: "border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white",
    badgeBg: "bg-[#8B0000]/10 text-[#8B0000]",
  },
  moon: {
    titleColor: "text-[#8CA0FF]",
    borderColor: "border-[#8CA0FF]/40",
    buttonBorder: "border-[#8CA0FF] text-[#8CA0FF] hover:bg-[#8CA0FF] hover:text-[#080B14]",
    badgeBg: "bg-[#8CA0FF]/10 text-[#8CA0FF]",
  },
};

export default function VideoCard({
  title,
  subtitle,
  videoSrc,
  posterSrc,
  isActive,
  theme,
  isPeek = false,
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ts = themeStyles[theme];

  // Only play video when card is active
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  // IntersectionObserver for lazy autoplay on mobile
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isActive) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isActive]);

  const textColor = theme === "clean" ? "text-[#1A1A1A]" : "text-[#F5F5F5]";
  const subtitleColor = theme === "clean" ? "text-[#444444]" : "text-[#F5F5F5]/60";

  return (
    <article className="flex flex-col w-full" aria-label={`Sala: ${title}`}>
      {/* Title — hidden in peek mode */}
      {!isPeek && (
        <h3
          className={`mb-3 text-xl md:text-2xl tracking-wide ${ts.titleColor}`}
          style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.05em" }}
        >
          {title}
        </h3>
      )}

      {/* Video */}
      <div
        className={`relative rounded-2xl overflow-hidden border ${ts.borderColor} aspect-[9/16] shadow-lg`}
        style={{
          boxShadow:
            theme === "dark"
              ? "0 0 30px rgba(255,30,60,0.15)"
              : theme === "moon"
              ? "0 0 30px rgba(140,160,255,0.15)"
              : "0 4px 30px rgba(0,0,0,0.12)",
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          playsInline
          muted
          loop
          preload="metadata"
          className="w-full h-full object-cover"
          aria-label={`Vídeo de la ${title}`}
          controls={false}
        />
        {/* Gradient overlay bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Subtitle — hidden in peek mode */}
      {!isPeek && (
        <p className={`mt-3 text-sm leading-snug ${subtitleColor}`}>{subtitle}</p>
      )}

      {/* CTA — hidden in peek mode */}
      {!isPeek && <Link
        href="/booking"
        className={`mt-4 flex items-center justify-center w-full h-12 border text-sm tracking-widest transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C] ${ts.buttonBorder}`}
        style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.12em" }}
        aria-label={`Reservar ${title}`}
      >
        RESERVAR ESTA SALA
      </Link>}
    </article>
  );
}
