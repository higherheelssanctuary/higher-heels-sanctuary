import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Always read fresh from the database, never cache.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room");
  const date = searchParams.get("date"); // YYYY-MM-DD, Madrid local date

  if (!room || !date) {
    return NextResponse.json({ error: "Missing room or date" }, { status: 400 });
  }

  try {
    // Expand each booking to every hour it covers, so a multi-hour
    // session (e.g. 15:00 for 2h) blocks both 15:00 and 16:00.
    const rows = await sql`
      select distinct to_char(gs at time zone 'Europe/Madrid', 'HH24:MI') as time
      from bookings b
      cross join lateral generate_series(
        b.slot_start,
        b.slot_end - interval '1 minute',
        interval '1 hour'
      ) gs
      where b.room_id = ${room}
        and b.status = 'confirmed'
        and (gs at time zone 'Europe/Madrid')::date = ${date}::date
    `;
    const occupied = rows.map((r) => r.time as string);
    return NextResponse.json({ occupied });
  } catch (err) {
    console.error("Availability error:", err);
    // Fail open: never block the calendar if the DB hiccups.
    return NextResponse.json({ occupied: [] });
  }
}
