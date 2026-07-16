import { sql } from "@/lib/db";

// No ambiguous chars (no 0/O, 1/I).
const ALPHABET = "ACDEFGHJKLMNPQRSTUVWXYZ2345679";

function randomCode(): string {
  let s = "";
  for (let i = 0; i < 5; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `HHS-${s}`;
}

// Generate a plan code that doesn't already exist in plan_codes.
export async function generatePlanCode(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = randomCode();
    const hit = (await sql`select 1 from plan_codes where code = ${code}`) as unknown[];
    if (hit.length === 0) return code;
  }
  throw new Error("Could not generate a unique plan code");
}
