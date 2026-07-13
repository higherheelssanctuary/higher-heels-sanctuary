import crypto from "crypto";

// Deterministic 4-digit door PIN for a given date + hour.
// Same slot always yields the same PIN (single booking or code redemption).
export function getPinForHour(date: string, time: string): string {
  const hour = time.split(":")[0].padStart(2, "0");
  const input = `${date}-${hour}`;
  const secret = Buffer.from((process.env.PIN_SECRET ?? "fallback").trim().replace(/^﻿/, ""), "utf8");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(input);
  const hex = hmac.digest("hex");
  const pin = (parseInt(hex.substring(0, 8), 16) % 9000) + 1000;
  return pin.toString();
}
