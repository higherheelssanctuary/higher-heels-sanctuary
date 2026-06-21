"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface NeonButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  size?: "md" | "lg" | "xl";
  fullWidthMobile?: boolean;
  className?: string;
  type?: "button" | "submit";
  ariaLabel?: string;
}

export default function NeonButton({
  href,
  onClick,
  children,
  variant = "solid",
  size = "lg",
  fullWidthMobile = false,
  className,
  type = "button",
  ariaLabel,
}: NeonButtonProps) {
  const base =
    "inline-flex items-center justify-center font-heading tracking-widest transition-all duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] min-h-[48px]";

  const sizes = {
    md: "text-base px-6 h-12",
    lg: "text-lg px-8 h-14",
    xl: "text-xl md:text-2xl px-10 h-16 md:h-20",
  };

  const variants = {
    solid:
      "bg-[#FF1E3C] text-white shadow-[0_0_40px_rgba(255,30,60,0.8)] hover:shadow-[0_0_60px_rgba(255,30,60,1)] hover:scale-105 active:scale-95",
    outline:
      "border border-[#FF1E3C] text-[#FF1E3C] hover:bg-[#FF1E3C] hover:text-white active:scale-95",
  };

  const widthClass = fullWidthMobile
    ? "w-full md:w-auto max-w-sm mx-auto md:mx-0"
    : "";

  const classes = cn(base, sizes[size], variants[variant], widthClass, className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
