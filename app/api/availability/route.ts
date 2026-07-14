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
    // Sessions are fixed, non-overlapping 1.5h blocks aligned to the grid,
    // so a booking occupies exactly its own start slot.
    const rows = await sql`
      select to_char(slot_start at time zone 'Europe/Madrid', 'HH24:MI') as time
      from bookings
      where room_id = ${room}
        and (slot_start at time zone 'Europe/Madrid')::date = ${date}::date
        and status = 'confirmed'
    `;
    const occupied = rows.map((r) => r.time as string);
    return NextResponse.json({ occupied });
  } catch (err) {
    console.error("Availability error:", err);
    // Fail open: never block the calendar if the DB hiccups.
    return NextResponse.json({ occupied: [] });
  }
}
