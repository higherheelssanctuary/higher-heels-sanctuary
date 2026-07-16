// Nuki Web API client (https://api.nuki.io)
// Auth: API token (Bearer). Later this can move to OAuth2 + webhooks.

const BASE = "https://api.nuki.io";
const KEYPAD_CODE = 13; // auth type 13 = keypad code

function token(): string {
  const t = process.env.NUKI_API_TOKEN?.trim();
  if (!t) throw new Error("NUKI_API_TOKEN is not set");
  return t;
}

async function nuki<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Nuki ${init?.method ?? "GET"} ${path} → ${res.status} ${body}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export type SmartlockAuth = {
  id: string;
  smartlockId: number;
  name?: string;
  type?: number;
  code?: number;
  allowedFromDate?: string;
  allowedUntilDate?: string;
};

export type Smartlock = { smartlockId: number; name: string };

export async function listSmartlocks(): Promise<Smartlock[]> {
  return nuki<Smartlock[]>("/smartlock");
}

export async function listAuths(): Promise<SmartlockAuth[]> {
  return nuki<SmartlockAuth[]>("/smartlock/auth");
}

/**
 * Code rules: 6 digits, no "0" anywhere, must not start with "12",
 * and must not collide with a code currently live on the lock.
 */
export function generateCode(taken: Set<string>): string {
  for (let i = 0; i < 500; i++) {
    let code = "";
    for (let d = 0; d < 6; d++) code += String(1 + Math.floor(Math.random() * 9)); // 1-9, never 0
    if (code.startsWith("12")) continue;
    if (taken.has(code)) continue;
    return code;
  }
  throw new Error("Could not generate a free keypad code");
}

/**
 * Create a keypad code valid only for the given window.
 * Nuki expects UTC instants; `from`/`until` must already be real Date objects.
 * The API replies 200 immediately — the device syncs a few seconds later,
 * so callers should verify with `findAuthByCode` before trusting it.
 */
export async function createKeypadCode(opts: {
  smartlockId: number;
  code: string;
  name: string;
  from: Date;
  until: Date;
}): Promise<void> {
  await nuki<null>("/smartlock/auth", {
    method: "PUT",
    body: JSON.stringify({
      name: opts.name,
      type: KEYPAD_CODE,
      code: Number(opts.code),
      smartlockIds: [opts.smartlockId],
      allowedFromDate: opts.from.toISOString(),
      allowedUntilDate: opts.until.toISOString(),
      allowedWeekDays: 127, // every day
    }),
  });
}

/** Verify the code actually landed on the device (auth list is the source of truth). */
export async function findAuthByCode(code: string): Promise<SmartlockAuth | null> {
  const auths = await listAuths();
  return auths.find((a) => String(a.code) === code) ?? null;
}

/** Cleanup after the session — keeps us well under the 200 live-code limit. */
export async function deleteAuths(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await nuki<null>("/smartlock/auth", {
    method: "DELETE",
    body: JSON.stringify(ids),
  });
}
