// Lists your Nuki smartlocks (id + name) and the codes currently live on them.
// Run: node scripts/nuki-locks.mjs
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const token = (env.match(/^NUKI_API_TOKEN=(.+)$/m)?.[1] || "").trim();
if (!token) {
  console.error("✗ Set NUKI_API_TOKEN in .env.local first (web.nuki.io → API).");
  process.exit(1);
}

const call = async (path) => {
  const res = await fetch(`https://api.nuki.io${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.error(`✗ ${path} → ${res.status} ${await res.text().catch(() => "")}`);
    process.exit(1);
  }
  const t = await res.text();
  return t ? JSON.parse(t) : null;
};

const locks = await call("/smartlock");
console.log("\nSMARTLOCKS:");
for (const l of locks) {
  console.log(`  id=${l.smartlockId}  name="${l.name}"  state=${l.state?.stateName ?? "?"}`);
}

const auths = await call("/smartlock/auth");
const keypad = auths.filter((a) => a.type === 13);
console.log(`\nLIVE KEYPAD CODES: ${keypad.length} (limit 200)`);
for (const a of keypad.slice(0, 10)) {
  console.log(`  id=${a.id}  code=${a.code}  name="${a.name}"  until=${a.allowedUntilDate ?? "-"}`);
}
if (keypad.length > 10) console.log(`  …and ${keypad.length - 10} more`);
console.log("");
