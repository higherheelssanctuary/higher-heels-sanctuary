// Creates/updates the Higher Heels products + prices in Stripe.
// Idempotent: re-running does not duplicate anything.
//
//   node scripts/stripe-products.mjs           → uses STRIPE_SECRET_KEY from .env.local
//   node scripts/stripe-products.mjs --live    → required flag if that key is a live key
import { readFileSync } from "node:fs";
import Stripe from "stripe";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const key = (env.match(/^STRIPE_SECRET_KEY=(.+)$/m)?.[1] || "").trim();
if (!key) {
  console.error("✗ STRIPE_SECRET_KEY missing in .env.local");
  process.exit(1);
}
const isLive = key.startsWith("sk_live");
if (isLive && !process.argv.includes("--live")) {
  console.error("✗ That is a LIVE key. Re-run with --live if you really mean it.");
  process.exit(1);
}
console.log(`Mode: ${isLive ? "LIVE" : "TEST"}\n`);

const stripe = new Stripe(key);

const PLANS = [
  { plan_id: "esencia", name: "Bono Esencia · 4 entradas",  kind: "bono",       entradas: 4,  amount: 7199 },
  { plan_id: "ritual",  name: "Bono Ritual · 8 entradas",   kind: "bono",       entradas: 8,  amount: 13499 },
  { plan_id: "elite",   name: "Bono Élite · 16 entradas",   kind: "bono",       entradas: 16, amount: 24799 },
  { plan_id: "plata",   name: "Membresía Plata · 4 al mes", kind: "membership", entradas: 4,  amount: 5699, recurring: true },
  { plan_id: "oro",     name: "Membresía Oro · 6 al mes",   kind: "membership", entradas: 6,  amount: 7599, recurring: true },
  { plan_id: "platino", name: "Membresía Platino · 8 al mes", kind: "membership", entradas: 8, amount: 8099, recurring: true },
];

const eur = (c) => (c / 100).toFixed(2).replace(".", ",") + "€";
const results = [];

for (const p of PLANS) {
  // 1) Product — find by metadata.plan_id so re-runs reuse it
  const found = await stripe.products.search({ query: `metadata['plan_id']:'${p.plan_id}'` });
  let product = found.data[0];
  const metadata = {
    plan_id: p.plan_id,
    kind: p.kind,
    entradas: String(p.entradas),
    app: "higher-heels",
  };

  if (!product) {
    product = await stripe.products.create({ name: p.name, metadata });
    console.log(`+ created product  ${p.plan_id.padEnd(8)} ${product.id}`);
  } else {
    await stripe.products.update(product.id, { name: p.name, metadata });
    console.log(`= product exists   ${p.plan_id.padEnd(8)} ${product.id}`);
  }

  // 2) Price — reuse if an active one already matches amount + interval
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  let price = prices.data.find(
    (pr) =>
      pr.unit_amount === p.amount &&
      pr.currency === "eur" &&
      (p.recurring ? pr.recurring?.interval === "month" : !pr.recurring)
  );

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.amount,
      currency: "eur",
      ...(p.recurring ? { recurring: { interval: "month" } } : {}),
      metadata,
    });
    console.log(`+ created price    ${p.plan_id.padEnd(8)} ${price.id}  ${eur(p.amount)}${p.recurring ? "/mes" : ""}`);
    // Deactivate any other stale prices so only the current one is sellable
    for (const old of prices.data) {
      await stripe.prices.update(old.id, { active: false });
      console.log(`  - deactivated stale price ${old.id} (${eur(old.unit_amount)})`);
    }
  } else {
    console.log(`= price exists     ${p.plan_id.padEnd(8)} ${price.id}  ${eur(p.amount)}${p.recurring ? "/mes" : ""}`);
  }

  results.push({ plan: p.plan_id, kind: p.kind, entradas: p.entradas, amount: eur(p.amount), priceId: price.id });
}

console.log("\n─── SUMMARY ───");
console.table(results);
