import { Star } from "lucide-react";

interface ReviewCardProps {
  text: string;
  name: string;
  subtitle: string;
}

export default function ReviewCard({ text, name, subtitle }: ReviewCardProps) {
  return (
    <article className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 border border-[#FF1E3C]/10 hover:border-[#FF1E3C]/40 transition-all duration-300 flex flex-col h-full">
      {/* Stars */}
      <div className="flex items-center gap-1 mb-4" aria-label="5 estrellas" role="img">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className="fill-[#FF1E3C] text-[#FF1E3C]"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Review text */}
      <blockquote className="text-[#F5F5F5]/85 leading-relaxed italic text-base flex-1">
        &ldquo;{text}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="mt-6 flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FF1E3C]/20 text-[#FF1E3C] text-sm flex-shrink-0"
          style={{ fontFamily: "var(--font-bebas-neue)" }}
          aria-hidden="true"
        >
          {name.charAt(0)}
        </div>
        <div>
          <p
            className="text-[#FF1E3C] text-lg leading-tight"
            style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.04em" }}
          >
            {name}
          </p>
          <p className="text-[#666666] text-sm">{subtitle}</p>
        </div>
      </div>
    </article>
  );
}
