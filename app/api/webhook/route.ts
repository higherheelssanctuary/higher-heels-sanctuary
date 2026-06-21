import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getPinForHour(date: string, time: string): string {
  const hour = time.split(":")[0].padStart(2, "0");
  const input = `${date}-${hour}`;
  const hmac = crypto.createHmac("sha256", process.env.PIN_SECRET ?? "fallback");
  hmac.update(input);
  const hex = hmac.digest("hex");
  const pin = (parseInt(hex.substring(0, 8), 16) % 9000) + 1000;
  return pin.toString();
}

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

    const pin = getPinForHour(intent.metadata.date, intent.metadata.time);

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
      pin,
    };

    console.log("✅ Prenotazione confermata:", booking);

    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      }).catch(err => console.error("Sheets error:", err));
    }
  }

  return NextResponse.json({ received: true });
}
