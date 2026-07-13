import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { amount, room, date, time, duration, slotDate } = await request.json();

    if (!amount || amount < 0.5) {
      return NextResponse.json({ error: "Importe inválido" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // céntimos
      currency: "eur",
      metadata: { room, date, time, duration: String(duration), slotDate: slotDate ?? "" },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: "Error al crear el pago" }, { status: 500 });
  }
}
