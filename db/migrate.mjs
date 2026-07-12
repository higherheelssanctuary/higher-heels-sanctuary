// Applies db/schema.sql to the Neon database in DATABASE_URL (.env.local).
// Run: node db/migrate.mjs
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = (env.match(/^DATABASE_URL=(.+)$/m)?.[1] || "").trim();
if (!url) {
  console.error("✗ Set DATABASE_URL in .env.local first.");
  process.exit(1);
}

const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
const statements = schema
  .replace(/--.*$/gm, "")        // strip line comments
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

const sql = neon(url);
for (const stmt of statements) {
  await sql.query(stmt);
}
console.log(`✓ Applied ${statements.length} statements to the database.`);
