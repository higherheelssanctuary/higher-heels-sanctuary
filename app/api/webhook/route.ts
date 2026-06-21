import Stripe from "stripe";
import { Resend } from "resend";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

function getPinForHour(date: string, time: string): string {
  const hour = time.split(":")[0].padStart(2, "0");
  const input = `${date}-${hour}`;
  const hmac = crypto.createHmac("sha256", process.env.PIN_SECRET ?? "fallback");
  hmac.update(input);
  const hex = hmac.digest("hex");
  const pin = (parseInt(hex.substring(0, 8), 16) % 9000) + 1000;
  return pin.toString();
}

function buildEmailHtml(booking: {
  room: string;
  date: string;
  time: string;
  duration: string;
  amount: number;
  pin: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#FF1E3C;padding:32px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.7);text-transform:uppercase;">Higher Heels Sanctuary</p>
          <h1 style="margin:8px 0 0;font-size:28px;font-weight:900;letter-spacing:2px;color:#fff;">PRENOTAZIONE CONFERMATA</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 28px;color:rgba(245,245,245,0.6);font-size:14px;line-height:1.6;">
            Grazie per la tua prenotazione. Ecco tutti i dettagli per la tua sessione.
          </p>

          <!-- Details -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;margin-bottom:28px;">
            ${[
              ["Sala", booking.room],
              ["Data", booking.date],
              ["Orario", booking.time],
              ["Durata", `${booking.duration} ora`],
              ["Importo pagato", `${booking.amount}€`],
            ].map(([label, value], i) => `
            <tr style="background:${i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}">
              <td style="padding:14px 20px;font-size:12px;letter-spacing:1px;color:rgba(245,245,245,0.4);text-transform:uppercase;width:40%;">${label}</td>
              <td style="padding:14px 20px;font-size:15px;font-weight:600;color:#f5f5f5;">${value}</td>
            </tr>`).join("")}
          </table>

          <!-- PIN -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,30,60,0.08);border:1px solid rgba(255,30,60,0.3);border-radius:8px;margin-bottom:28px;">
            <tr><td style="padding:24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;color:#FF1E3C;text-transform:uppercase;">Codice accesso ingresso</p>
              <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:12px;color:#fff;">${booking.pin}</p>
              <p style="margin:8px 0 0;font-size:11px;color:rgba(245,245,245,0.4);">Valido solo per l'orario prenotato · Cambia ogni ora</p>
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;color:rgba(245,245,245,0.5);line-height:1.7;">
            📍 <strong style="color:#f5f5f5;">Higher Heels Sanctuary</strong> — Madrid<br>
            Inserisci il codice al pannello dell'ingresso principale. La tua sala sarà libera ad aspettarti.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;font-size:11px;color:rgba(245,245,245,0.25);">Higher Heels Sanctuary · higherheels.es</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
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

    // Google Sheets
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      }).catch(err => console.error("Sheets error:", err));
    }

    // Email di conferma
    if (booking.customer_email && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Higher Heels Sanctuary <prenotazioni@higherheels.es>",
        to: booking.customer_email,
        subject: `Prenotazione confermata – ${booking.date} alle ${booking.time}`,
        html: buildEmailHtml(booking),
      }).catch(err => console.error("Email error:", err));
    }
  }

  return NextResponse.json({ received: true });
}
