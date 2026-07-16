import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendConfirmationEmail } from "@/lib/email";

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
      pin: "", // filled by the Nuki cron ~3h before the session
    };

    // Save to the database (customer + booking) — powers real availability
    try {
      const email = intent.receipt_email ?? "";
      let customerId: number | null = null;
      if (email) {
        const c = await sql`
          insert into customers (email) values (${email})
          on conflict (email) do update set email = excluded.email
          returning id`;
        customerId = c[0].id as number;
      }
      const slotDate = intent.metadata.slotDate;
      const slotTime = intent.metadata.time;
      if (slotDate && slotTime) {
        const durHours = Number(intent.metadata.duration) || 1;
        // Interpret "YYYY-MM-DD HH:MM" as Madrid local time (DST-safe) → timestamptz
        const naive = `${slotDate} ${slotTime}:00`;
        await sql`
          insert into bookings
            (customer_id, room_id, slot_start, slot_end, source, amount_paid, stripe_payment_intent, status)
          values (
            ${customerId},
            ${intent.metadata.room},
            (${naive})::timestamp at time zone 'Europe/Madrid',
            ((${naive})::timestamp at time zone 'Europe/Madrid') + (${durHours} || ' hours')::interval,
            'single', ${intent.amount / 100}, ${intent.id}, 'confirmed'
          )
          on conflict (room_id, slot_start) do nothing`;
      }
    } catch (err) {
      console.error("DB write error:", err);
    }

    // Google Sheets — handle 302 redirect manually to keep POST method
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const sheetsBody = JSON.stringify(booking);
        const sheetsHeaders = { "Content-Type": "application/json" };
        const r1 = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: "POST", headers: sheetsHeaders, body: sheetsBody, redirect: "manual",
        });
        const target = r1.status === 302 ? r1.headers.get("location") : null;
        await fetch(target ?? process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: "POST", headers: sheetsHeaders, body: sheetsBody,
        });
      } catch (err) {
        console.error("Sheets error:", err);
      }
    }

    // Confirmation email (no PIN — the access code is emailed by the Nuki cron
    // a few hours before the session, once it exists on the lock).
    await sendConfirmationEmail(booking.customer_email, {
      room: booking.room,
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      paymentLabel: "Importe pagado",
      paymentValue: `${booking.amount}€`,
    });
  }

  return NextResponse.json({ received: true });
}
