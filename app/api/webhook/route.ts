import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;

    const booking = {
      id: intent.id,
      room: intent.metadata.room,
      date: intent.metadata.date,
      time: intent.metadata.time,
      duration: intent.metadata.duration,
      amount: intent.amount / 100,
      currency: intent.currency.toUpperCase(),
      customer_email: intent.receipt_email ?? "",
      confirmed_at: new Date().toISOString(),
    };

    console.log("✅ Prenotazione confermata:", booking);

    // TODO: scrivere su Google Sheets
    // TODO: inviare email di conferma
    // TODO: generare PIN TTLock
  }

  return NextResponse.json({ received: true });
}
