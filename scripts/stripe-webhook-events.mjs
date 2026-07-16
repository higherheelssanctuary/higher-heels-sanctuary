// Ensures the LIVE Stripe webhook endpoint for higherheels.es is subscribed to
// the events the app needs. Non-destructive: it unions with existing events.
//   node scripts/stripe-webhook-events.mjs           → TEST endpoint
//   node scripts/stripe-webhook-events.mjs --live     → LIVE endpoint (STRIPE_SECRET_KEY_LIVE)
import { readFileSync } from "node:fs";
import Stripe from "stripe";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const live = process.argv.includes("--live");
const key = live
  ? (env.match(/^STRIPE_SECRET_KEY_LIVE=(.+)$/m)?.[1] || "").trim()
  : (env.match(/^STRIPE_SECRET_KEY=(.+)$/m)?.[1] || "").trim();
if (!key) { console.error("✗ key missing"); process.exit(1); }
if (live && !key.startsWith("sk_live")) { console.error("✗ not an sk_live key"); process.exit(1); }

const stripe = new Stripe(key);
const REQUIRED = [
  "payment_intent.succeeded",
  "checkout.session.completed",
  "invoice.paid",
  "customer.subscription.deleted",
];

const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
const ep = endpoints.data.find((e) => /higherheels\.es\/api\/webhook/.test(e.url));
if (!ep) {
  console.error(`✗ No webhook endpoint pointing to higherheels.es/api/webhook found (${live ? "LIVE" : "TEST"}).`);
  console.error("  Existing endpoints:", endpoints.data.map((e) => e.url).join(", ") || "(none)");
  process.exit(1);
}

const current = ep.enabled_events.includes("*") ? ["*"] : ep.enabled_events;
const merged = current.includes("*") ? ["*"] : [...new Set([...current, ...REQUIRED])];
console.log("Endpoint:", ep.url, `(${ep.id})`);
console.log("Before:", current.join(", "));

if (merged.length === current.length && REQUIRED.every((e) => current.includes(e))) {
  console.log("✓ Already has all required events. Nothing to do.");
} else {
  const updated = await stripe.webhookEndpoints.update(ep.id, { enabled_events: merged });
  console.log("After :", updated.enabled_events.join(", "));
  console.log("✓ Updated.");
}
