import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendConfirmationEmail, sendPurchaseEmail } from "@/lib/email";
import { generatePlanCode } from "@/lib/code";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_LABELS: Record<string, string> = {
  esencia: "Bono Esencia", ritual: "Bono Ritual", elite: "Bono Élite",
  plata: "Membresía Plata", oro: "Membresía Oro", platino: "Membresía Platino",
};

// A bono or membership was purchased via Stripe Checkout → create/refill the code.
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const planId = session.metadata?.plan_id;
  const entradas = Number(session.metadata?.entradas) || 0;
  const isSub = session.mode === "subscription";
  if (!planId || !entradas) return;

  const email =
    session.customer_details?.email ?? session.customer_email ?? "";
  const subId = typeof session.subscription === "string" ? session.subscription : null;

  // Upsert customer
  let customerId: number | null = null;
  if (email) {
    const c = await sql`
      insert into customers (email) values (${email})
      on conflict (email) do update set email = excluded.email returning id`;
    customerId = c[0].id as number;
  }

  // For subscriptions, one code per subscription (renewals refill it).
  if (isSub && subId) {
    const existing = (await sql`select code from plan_codes where stripe_subscription_id = ${subId}`) as { code: string }[];
    if (existing.length > 0) return; // already created; renewals handled by invoice.paid
  }

  const code = await generatePlanCode();
  await sql`
    insert into plan_codes
      (code, customer_id, kind, plan_name, total_entries, remaining_entries, status, expires_at, stripe_subscription_id)
    values (
      ${code}, ${customerId}, ${isSub ? "membership" : "bono"}, ${PLAN_LABELS[planId] ?? planId},
      ${entradas}, ${entradas}, 'active',
      ${isSub ? null : new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString()},
      ${subId}
    )`;

  if (email) {
    await sendPurchaseEmail(email, {
      planLabel: PLAN_LABELS[planId] ?? planId,
      entradas,
      code,
      isSubscription: isSub,
    });
  }
}

// Monthly renewal → refill the code back to its full entry count.
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subId = typeof (invoice as unknown as { subscription: unknown }).subscription === "string"
    ? (invoice as unknown as { subscription: string }).subscription
    : null;
  // Only act on recurring renewals, not the first invoice (handled by checkout).
  if (!subId || invoice.billing_reason !== "subscription_cycle") return;
  await sql`
    update plan_codes
       set remaining_entries = total_entries, status = 'active'
     where stripe_subscription_id = ${subId}`;
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

  // Bono / membresía purchases (Stripe Checkout)
  if (event.type === "checkout.session.completed") {
    try {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    } catch (err) {
      console.error("Checkout completed error:", err);
    }
    return NextResponse.json({ received: true });
  }

  if (event.type === "invoice.paid") {
    try {
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
    } catch (err) {
      console.error("Invoice paid error:", err);
    }
    return NextResponse.json({ received: true });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    try {
      await sql`update plan_codes set status = 'cancelled' where stripe_subscription_id = ${sub.id}`;
    } catch (err) {
      console.error("Subscription delete error:", err);
    }
    return NextResponse.json({ received: true });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;

    // Only single-session bookings carry slotDate. Checkout payments (bonos/
    // membresías) also fire this event but must be ignored here.
    if (!intent.metadata.slotDate) {
      return NextResponse.json({ received: true });
    }

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
