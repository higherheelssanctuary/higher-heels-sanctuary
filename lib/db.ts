import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Lazily create the client on first use, not at import time — otherwise the
// production build (which imports route modules without runtime env) would call
// neon() with an undefined URL and fail.
let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}

// Same usage as before: await sql`select * from customers where email = ${email}`;
export const sql = new Proxy((() => {}) as unknown as NeonQueryFunction<false, false>, {
  apply: (_target, _thisArg, args: unknown[]) =>
    (getClient() as unknown as (...a: unknown[]) => unknown)(...args),
  get: (_target, prop) => (getClient() as unknown as Record<string | symbol, unknown>)[prop],
});
