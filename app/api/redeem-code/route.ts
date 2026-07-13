import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getPinForHour } from "@/lib/pin";
import { sendConfirmationEmail, sendAccessCodeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

type CodeRow = {
  code: string;
  plan_name: string;
  kind: string;
  remaining_entries: number;
  status: string;
  expires_at: string | null;
};

// Check a code and explain why it can or cannot be used.
async function validateCode(code: string) {
  const rows = (await sql`
    select code, plan_name, kind, remaining_entries, status, expires_at
    from plan_codes where code = ${code}
  `) as CodeRow[];

  if (rows.length === 0) return { valid: false, reason: "not_found" as const };
  const c = rows[0];
  if (c.status !== "active") return { valid: false, reason: "inactive" as const };
  if (c.expires_at && new Date(c.expires_at) <= new Date())
    return { valid: false, reason: "expired" as const };
  if (c.remaining_entries <= 0) return { valid: false, reason: "empty" as const };
  return {
    valid: true as const,
    plan_name: c.plan_name,
    kind: c.kind,
    remaining: c.remaining_entries,
  };
}

// GET /api/redeem-code?code=HHS-XXXX  → preview validity for the "Aplicar" step
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ valid: false, reason: "missing" }, { status: 400 });
  try {
    return NextResponse.json(await validateCode(code));
  } catch (err) {
    console.error("Validate code error:", err);
    return NextResponse.json({ valid: false, reason: "error" }, { status: 500 });
  }
}

// POST /api/redeem-code  → atomically consume 1 entry + create the booking (no card)
export async function POST(request: Request) {
  const { code, room, slotDate, time, date, duration } = await request.json();
  const normCode = (code ?? "").trim().toUpperCase();

  if (!normCode || !room || !slotDate || !time) {
    return NextResponse.json({ ok: false, reason: "missing" }, { status: 400 });
  }

  const naive = `${slotDate} ${time}:00`;
  const durHours = Number(duration) || 1;
  const pin = getPinForHour(date ?? slotDate, time);

  try {
    // One atomic statement: decrement only if valid+has balance, then insert the
    // booking from that same row. If the code is invalid the insert affects nothing;
    // if the slot is taken the unique constraint rolls the decrement back too.
    const rows = (await sql`
      with dec as (
        update plan_codes
           set remaining_entries = remaining_entries - 1
         where code = ${normCode}
           and status = 'active'
           and remaining_entries > 0
           and (expires_at is null or expires_at > now())
        returning code, remaining_entries, customer_id, plan_name
      ), ins as (
        insert into bookings
          (customer_id, room_id, slot_start, slot_end, source, plan_code, door_pin, status)
        select customer_id, ${room},
               (${naive})::timestamp at time zone 'Europe/Madrid',
               ((${naive})::timestamp at time zone 'Europe/Madrid') + (${durHours} || ' hours')::interval,
               'code', code, ${pin}, 'confirmed'
        from dec
        returning id, customer_id
      )
      select ins.id as booking_id, dec.remaining_entries, dec.plan_name, ins.customer_id
      from dec left join ins on true
    `) as { booking_id: number | null; remaining_entries: number; plan_name: string; customer_id: number | null }[];

    if (rows.length === 0 || rows[0].booking_id === null) {
      // Nothing consumed → tell the customer why.
      const v = await validateCode(normCode);
      return NextResponse.json({ ok: false, reason: v.valid ? "unknown" : v.reason }, { status: 409 });
    }

    const { remaining_entries, plan_name, customer_id } = rows[0];

    // Confirmation email (best-effort) to the code owner.
    if (customer_id) {
      const cust = (await sql`select email from customers where id = ${customer_id}`) as { email: string }[];
      const email = cust[0]?.email;
      if (email) {
        // 1) Confirmation email (no PIN) — shows the plan + remaining entries
        await sendConfirmationEmail(email, {
          room,
          date: date ?? slotDate,
          time,
          duration: String(durHours),
          paymentLabel: "Reservado con",
          paymentValue: `${plan_name} · te quedan ${remaining_entries} entradas`,
        });
        // 2) Access-code email — TODO: move to the Nuki cron (~10 min before the slot)
        await sendAccessCodeEmail(email, {
          room,
          date: date ?? slotDate,
          time,
          pin,
        });
      }
    }

    return NextResponse.json({ ok: true, remaining: remaining_entries, pin });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("bookings_room_id_slot_start_key") || msg.includes("23505")) {
      return NextResponse.json({ ok: false, reason: "slot_taken" }, { status: 409 });
    }
    console.error("Redeem code error:", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
