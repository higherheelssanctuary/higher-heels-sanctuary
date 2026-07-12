import { neon } from "@neondatabase/serverless";

// Simple SQL client for Neon Postgres.
// Usage: const rows = await sql`select * from customers where email = ${email}`;
export const sql = neon(process.env.DATABASE_URL!);
