import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { listAuths, createKeypadCode, findAuthByCode, deleteAuths, generateCode } from "@/lib/nuki";
import { sendAccessCodeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Codes are created this long before the slot. The margin lets us retry on the
// next run if the lock is briefly offline.
const LEAD_HOURS = 3;

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const dateLabel = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${d} ${MONTHS_ES[m - 1]} ${y}`;
};

type Pending = {
  id: number;
  room_id: string;
  email: string | null;
  ymd: string;
  hhmm: string;
  slot_start: string;
  slot_end: string;
};

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("secret");
  const fromHeader = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return fromQuery === secret || fromHeader === secret;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const created: string[] = [];
  const retry: number[] = [];
  const revoked: string[] = [];
  const errors: string[] = [];

  try {
    // ── 1) Cleanup: revoke codes of finished sessions ────────────────────────
    const expired = (await sql`
      select id, nuki_auth_id from bookings
      where nuki_auth_id is not null and slot_end < now()
    `) as { id: number; nuki_auth_id: string }[];

    if (expired.length > 0) {
      try {
        await deleteAuths(expired.map((e) => e.nuki_auth_id));
        for (const e of expired) {
          await sql`update bookings set nuki_auth_id = null where id = ${e.id}`;
          revoked.push(e.nuki_auth_id);
        }
      } catch (err) {
        errors.push(`cleanup: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // ── 2) Create codes for sessions starting within LEAD_HOURS ──────────────
    const pending = (await sql`
      select b.id,
             b.room_id,
             c.email,
             to_char(b.slot_start at time zone 'Europe/Madrid', 'YYYY-MM-DD') as ymd,
             to_char(b.slot_start at time zone 'Europe/Madrid', 'HH24:MI')    as hhmm,
             b.slot_start,
             b.slot_end
      from bookings b
      left join customers c on c.id = b.customer_id
      where b.status = 'confirmed'
        and b.nuki_auth_id is null
        and b.slot_start > now()
        and b.slot_start <= now() + (${LEAD_HOURS} || ' hours')::interval
      order by b.slot_start
    `) as Pending[];

    if (pending.length > 0) {
      const smartlockId = Number(process.env.NUKI_SMARTLOCK_ID);
      if (!smartlockId) throw new Error("NUKI_SMARTLOCK_ID is not set");

      // Codes must be unique among those currently live on the lock.
      const live = await listAuths();
      const taken = new Set(live.map((a) => String(a.code)).filter(Boolean));

      for (const b of pending) {
        try {
          const code = generateCode(taken);
          taken.add(code); // reserve within this run too

          await createKeypadCode({
            smartlockId,
            code,
            name: `HHS ${b.ymd} ${b.hhmm}`.slice(0, 20),
            from: new Date(b.slot_start),
            until: new Date(b.slot_end),
          });

          // The API returns immediately; the device syncs a few seconds later.
          await new Promise((r) => setTimeout(r, 4000));
          const auth = await findAuthByCode(code);
          if (!auth) {
            // Lock probably offline — leave it for the next run (we have margin).
            retry.push(b.id);
            continue;
          }

          await sql`
            update bookings set door_pin = ${code}, nuki_auth_id = ${auth.id}
            where id = ${b.id}
          `;
          created.push(`${b.id}:${b.hhmm}`);

          if (b.email) {
            await sendAccessCodeEmail(b.email, {
              room: b.room_id,
              date: dateLabel(b.ymd),
              time: b.hhmm,
              pin: code,
            });
          }
        } catch (err) {
          errors.push(`booking ${b.id}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    return NextResponse.json({ ok: true, created, retry, revoked, errors });
  } catch (err) {
    console.error("Nuki cron error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err), created, revoked, errors },
      { status: 500 }
    );
  }
}
