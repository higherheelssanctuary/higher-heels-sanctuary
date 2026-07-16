import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Only these plan ids can be bought; the price + kind come from Stripe, never
// from the client, so the amount can't be tampered with.
const PLAN_IDS = new Set([
  "esencia", "ritual", "elite", // bonos (one-time)
  "plata", "oro", "platino",    // membresías (monthly)
]);

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();
    if (!plan || !PLAN_IDS.has(plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    // Resolve the price from its stable lookup_key (same id in test and live).
    const prices = await stripe.prices.list({
      lookup_keys: [`hhs_${plan}`],
      active: true,
      expand: ["data.product"],
    });
    const price = prices.data[0];
    if (!price) {
      return NextResponse.json({ error: "Precio no encontrado" }, { status: 404 });
    }

    const isSubscription = !!price.recurring;
    const origin =
      request.headers.get("origin") ??
      new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: price.id, quantity: 1 }],
      // Checkout always collects the email — we need it to deliver the code.
      customer_creation: isSubscription ? undefined : "always",
      success_url: `${origin}/booking?compra=ok&plan=${plan}`,
      cancel_url: `${origin}/booking?compra=cancel`,
      allow_promotion_codes: true,
      locale: "es",
      metadata: {
        plan_id: plan,
        kind: (price.metadata?.kind as string) ?? "",
        entradas: (price.metadata?.entradas as string) ?? "",
      },
      // Carry the same metadata onto the subscription so monthly renewals know
      // which plan to top up.
      ...(isSubscription
        ? {
            subscription_data: {
              metadata: {
                plan_id: plan,
                entradas: (price.metadata?.entradas as string) ?? "",
              },
            },
          }
        : {}),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Error al iniciar el pago" }, { status: 500 });
  }
}
