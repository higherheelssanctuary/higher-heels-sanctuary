"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm({
  total,
  accent,
  onSuccess,
}: {
  total: number;
  accent: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Error al enviar");
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Error al procesar el pago");
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { email: "auto" } },
        }}
      />

      {error && (
        <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
      )}

      <div className="flex items-center justify-center gap-5 my-5 text-[#F5F5F5]/20 text-xs">
        {["Stripe Secure", "SSL 256-bit", "Cancelación 24h"].map((t) => (
          <span key={t} className="flex items-center gap-1">
            <Lock size={10} /> {t}
          </span>
        ))}
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full h-14 text-white text-lg tracking-widest transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{
          fontFamily: "var(--font-bebas-neue)",
          letterSpacing: "0.12em",
          background: accent,
          boxShadow: loading ? "none" : `0 0 40px ${accent}80`,
        }}
      >
        {loading ? "PROCESANDO..." : `CONFIRMAR Y PAGAR · ${total}€`}
      </button>
    </form>
  );
}

export default function StripePaymentForm({
  clientSecret,
  total,
  accent,
  onSuccess,
}: {
  clientSecret: string;
  total: number;
  accent: string;
  onSuccess: () => void;
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#FF1E3C",
            colorBackground: "#111111",
            colorText: "#f5f5f5",
            colorTextSecondary: "rgba(245,245,245,0.5)",
            colorDanger: "#ef4444",
            borderRadius: "8px",
            fontSizeBase: "14px",
          },
          rules: {
            ".Input": {
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "none",
            },
            ".Input:focus": {
              border: "1px solid #FF1E3C",
              boxShadow: "0 0 0 1px #FF1E3C",
            },
            ".Tab": {
              border: "1px solid rgba(255,255,255,0.08)",
            },
            ".Tab--selected": {
              border: "1px solid #FF1E3C",
              boxShadow: "0 0 0 1px #FF1E3C",
            },
          },
        },
      }}
    >
      <CheckoutForm total={total} accent={accent} onSuccess={onSuccess} />
    </Elements>
  );
}
